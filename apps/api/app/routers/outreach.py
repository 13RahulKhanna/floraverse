from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import NgoProfile, Opportunity, OutreachMessage, User
from app.schemas import OutreachCreate, OutreachOut
from app.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/v1/outreach", tags=["outreach"])


@router.post("", response_model=OutreachOut, status_code=status.HTTP_201_CREATED)
def send_outreach(
    payload: OutreachCreate,
    user: User | None = Depends(get_current_user_optional),
    session: Session = Depends(get_session),
) -> OutreachOut:
    ngo = session.get(NgoProfile, payload.ngo_id)
    if not ngo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO not found")

    if payload.opportunity_id is not None:
        opportunity = session.get(Opportunity, payload.opportunity_id)
        if not opportunity or opportunity.ngo_id != ngo.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found for this NGO")

    message = OutreachMessage(
        ngo_id=ngo.id,  # type: ignore[arg-type]
        opportunity_id=payload.opportunity_id,
        sender_user_id=user.id if user else None,
        sender_name=payload.sender_name,
        sender_email=payload.sender_email,
        message=payload.message,
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return OutreachOut(
        id=message.id,  # type: ignore[arg-type]
        opportunity_id=message.opportunity_id,
        sender_name=message.sender_name,
        sender_email=message.sender_email,
        message=message.message,
        created_at=message.created_at,
    )


@router.get("/inbox", response_model=list[OutreachOut])
def get_inbox(user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> list[OutreachOut]:
    ngo = session.exec(select(NgoProfile).where(NgoProfile.owner_user_id == user.id)).first()
    if not ngo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You haven't registered an NGO profile yet")

    messages = session.exec(
        select(OutreachMessage).where(OutreachMessage.ngo_id == ngo.id).order_by(OutreachMessage.created_at.desc())  # type: ignore[attr-defined]
    ).all()
    return [
        OutreachOut(
            id=m.id,  # type: ignore[arg-type]
            opportunity_id=m.opportunity_id,
            sender_name=m.sender_name,
            sender_email=m.sender_email,
            message=m.message,
            created_at=m.created_at,
        )
        for m in messages
    ]
