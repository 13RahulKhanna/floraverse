from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from app.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, session: Session = Depends(get_session)) -> AuthResponse:
    existing = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user.id)  # type: ignore[arg-type]
    return AuthResponse(access_token=token, user=UserPublic(id=user.id, email=user.email, display_name=user.display_name))  # type: ignore[arg-type]


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)) -> AuthResponse:
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id)  # type: ignore[arg-type]
    return AuthResponse(access_token=token, user=UserPublic(id=user.id, email=user.email, display_name=user.display_name))  # type: ignore[arg-type]


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, display_name=user.display_name)  # type: ignore[arg-type]
