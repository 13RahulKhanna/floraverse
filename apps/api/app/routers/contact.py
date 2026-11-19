from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db import get_session
from app.models import ContactMessage
from app.schemas import ContactRequest

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_contact_message(payload: ContactRequest, session: Session = Depends(get_session)) -> dict:
    # Stored for an admin to review — no email provider is configured, so nothing is
    # actually emailed yet. See docs/README for how to wire a real mail sender in.
    message = ContactMessage(name=payload.name, email=payload.email, subject=payload.subject, message=payload.message)
    session.add(message)
    session.commit()
    return {"ok": True}
