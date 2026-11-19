from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import GardenEntry, GardenLog, Plant, User
from app.schemas import AddToGardenRequest, GardenEntryOut, GardenLogCreate, GardenLogOut
from app.security import get_current_user
from app.serializers import to_plant_card

router = APIRouter(prefix="/api/v1/garden", tags=["garden"])


def _to_entry_out(entry: GardenEntry, session: Session) -> GardenEntryOut:
    plant = session.get(Plant, entry.plant_id)
    logs = session.exec(
        select(GardenLog).where(GardenLog.garden_entry_id == entry.id).order_by(GardenLog.logged_at.desc())  # type: ignore[attr-defined]
    ).all()
    return GardenEntryOut(
        id=entry.id,  # type: ignore[arg-type]
        plant=to_plant_card(plant),  # type: ignore[arg-type]
        added_at=entry.added_at,
        notes=entry.notes,
        logs=[GardenLogOut(id=lg.id, log_type=lg.log_type, note=lg.note, measurement=lg.measurement, logged_at=lg.logged_at) for lg in logs],  # type: ignore[arg-type]
    )


@router.get("", response_model=list[GardenEntryOut])
def list_my_garden(user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> list[GardenEntryOut]:
    entries = session.exec(select(GardenEntry).where(GardenEntry.user_id == user.id).order_by(GardenEntry.added_at.desc())).all()  # type: ignore[attr-defined]
    return [_to_entry_out(e, session) for e in entries]


@router.post("", response_model=GardenEntryOut, status_code=status.HTTP_201_CREATED)
def add_to_garden(
    payload: AddToGardenRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)
) -> GardenEntryOut:
    plant = session.get(Plant, payload.plant_id)
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    existing = session.exec(
        select(GardenEntry).where(GardenEntry.user_id == user.id, GardenEntry.plant_id == payload.plant_id)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This plant is already in your garden")

    entry = GardenEntry(user_id=user.id, plant_id=payload.plant_id, notes=payload.notes)  # type: ignore[arg-type]
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return _to_entry_out(entry, session)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_garden(entry_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> None:
    entry = session.get(GardenEntry, entry_id)
    if not entry or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garden entry not found")
    for log in session.exec(select(GardenLog).where(GardenLog.garden_entry_id == entry.id)).all():
        session.delete(log)
    session.delete(entry)
    session.commit()


@router.post("/{entry_id}/logs", response_model=GardenEntryOut, status_code=status.HTTP_201_CREATED)
def add_garden_log(
    entry_id: int,
    payload: GardenLogCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> GardenEntryOut:
    entry = session.get(GardenEntry, entry_id)
    if not entry or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garden entry not found")

    log = GardenLog(
        garden_entry_id=entry.id,  # type: ignore[arg-type]
        log_type=payload.log_type,
        note=payload.note,
        measurement=payload.measurement,
    )
    session.add(log)
    session.commit()
    session.refresh(entry)
    return _to_entry_out(entry, session)
