from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.db import get_session
from app.models import NgoProfile, Opportunity, User
from app.schemas import NgoCard, NgoDetail, NgoRegisterRequest
from app.security import get_current_user, get_current_user_optional
from app.serializers import to_ngo_card, to_opportunity_card

router = APIRouter(prefix="/api/v1/ngos", tags=["ngos"])


def _active_opportunity_count(session: Session, ngo_id: int) -> int:
    return session.exec(
        select(func.count(Opportunity.id)).where(Opportunity.ngo_id == ngo_id, Opportunity.is_active == True)  # noqa: E712
    ).one()


def _to_detail(ngo: NgoProfile, session: Session, is_mine: bool) -> NgoDetail:
    opportunities = session.exec(
        select(Opportunity)
        .where(Opportunity.ngo_id == ngo.id, Opportunity.is_active == True)  # noqa: E712
        .order_by(Opportunity.created_at.desc())  # type: ignore[attr-defined]
    ).all()
    ngo_card = to_ngo_card(ngo, len(opportunities))
    return NgoDetail(
        id=ngo.id,  # type: ignore[arg-type]
        org_name=ngo.org_name,
        mission=ngo.mission,
        focus_area=ngo.focus_area,
        contact_email=ngo.contact_email,
        website=ngo.website,
        location=ngo.location,
        is_mine=is_mine,
        opportunities=[to_opportunity_card(o, ngo_card) for o in opportunities],
    )


@router.get("", response_model=list[NgoCard])
def list_ngos(
    q: str | None = Query(default=None, description="Search by organization name or focus area"),
    session: Session = Depends(get_session),
) -> list[NgoCard]:
    statement = select(NgoProfile)
    if q:
        like = f"%{q}%"
        statement = statement.where(NgoProfile.org_name.ilike(like) | NgoProfile.focus_area.ilike(like))  # type: ignore[attr-defined]
    ngos = session.exec(statement.order_by(NgoProfile.org_name)).all()  # type: ignore[attr-defined]
    return [to_ngo_card(n, _active_opportunity_count(session, n.id)) for n in ngos]  # type: ignore[arg-type]


@router.get("/me", response_model=NgoDetail)
def get_my_ngo(user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> NgoDetail:
    ngo = session.exec(select(NgoProfile).where(NgoProfile.owner_user_id == user.id)).first()
    if not ngo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't registered an NGO profile yet")
    return _to_detail(ngo, session, is_mine=True)


@router.post("/register", response_model=NgoDetail, status_code=status.HTTP_201_CREATED)
def register_ngo(payload: NgoRegisterRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> NgoDetail:
    existing = session.exec(select(NgoProfile).where(NgoProfile.owner_user_id == user.id)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This account already has a registered NGO profile")

    ngo = NgoProfile(
        owner_user_id=user.id,  # type: ignore[arg-type]
        org_name=payload.org_name,
        mission=payload.mission,
        focus_area=payload.focus_area,
        contact_email=payload.contact_email,
        website=payload.website,
        location=payload.location,
    )
    session.add(ngo)
    session.commit()
    session.refresh(ngo)
    return _to_detail(ngo, session, is_mine=True)


@router.get("/{ngo_id}", response_model=NgoDetail)
def get_ngo(ngo_id: int, user: User | None = Depends(get_current_user_optional), session: Session = Depends(get_session)) -> NgoDetail:
    ngo = session.get(NgoProfile, ngo_id)
    if not ngo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO not found")
    is_mine = bool(user and user.id == ngo.owner_user_id)
    return _to_detail(ngo, session, is_mine)
