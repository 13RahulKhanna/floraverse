from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.db import get_session
from app.models import NgoProfile, Opportunity, User, WaveScale
from app.schemas import OpportunityCard, OpportunityCreate, OpportunityListResponse
from app.security import get_current_user
from app.serializers import to_ngo_card, to_opportunity_card

router = APIRouter(prefix="/api/v1/opportunities", tags=["opportunities"])


def _active_count(session: Session, ngo_id: int) -> int:
    return session.exec(
        select(func.count(Opportunity.id)).where(Opportunity.ngo_id == ngo_id, Opportunity.is_active == True)  # noqa: E712
    ).one()


@router.get("", response_model=OpportunityListResponse)
def list_opportunities(
    wave_scale: WaveScale | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_session),
) -> OpportunityListResponse:
    statement = select(Opportunity).where(Opportunity.is_active == True)  # noqa: E712
    if wave_scale:
        statement = statement.where(Opportunity.wave_scale == wave_scale)

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    statement = statement.order_by(Opportunity.created_at.desc()).offset((page - 1) * page_size).limit(page_size)  # type: ignore[attr-defined]
    opportunities = session.exec(statement).all()

    items = []
    for o in opportunities:
        ngo = session.get(NgoProfile, o.ngo_id)
        items.append(to_opportunity_card(o, to_ngo_card(ngo, _active_count(session, ngo.id))))  # type: ignore[arg-type]

    return OpportunityListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=OpportunityCard, status_code=status.HTTP_201_CREATED)
def create_opportunity(payload: OpportunityCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> OpportunityCard:
    ngo = session.exec(select(NgoProfile).where(NgoProfile.owner_user_id == user.id)).first()
    if not ngo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Register an NGO profile before posting an opportunity")

    opportunity = Opportunity(
        ngo_id=ngo.id,  # type: ignore[arg-type]
        title=payload.title,
        description=payload.description,
        wave_scale=payload.wave_scale,
        location=payload.location,
        event_date=payload.event_date,
    )
    session.add(opportunity)
    session.commit()
    session.refresh(opportunity)
    return to_opportunity_card(opportunity, to_ngo_card(ngo, _active_count(session, ngo.id)))


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(opportunity_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> None:
    opportunity = session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    ngo = session.get(NgoProfile, opportunity.ngo_id)
    if not ngo or ngo.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    session.delete(opportunity)
    session.commit()
