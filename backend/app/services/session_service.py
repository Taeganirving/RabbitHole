
from datetime import datetime, timezone
from uuid import uuid4

from app.models.session import Session
from app.database.connection import SessionLocal
from app.database.tables import BrowsingSession


def to_session(db_session: BrowsingSession) -> Session:
    """Convert a database record into an API session."""

    return Session(
        id=db_session.id,
        started_at=db_session.started_at,
        ended_at=db_session.ended_at,
        active=db_session.active,
    )


def get_session(session_id: str) -> Session | None:
    """Retrieve a session from SQLite."""

    with SessionLocal() as db:
        record = db.get(BrowsingSession, session_id)

        if record is None:
            return None

        return to_session(record)


def create_session() -> Session:
    """Create a session and save it permanently."""

    with SessionLocal() as db:
        record = BrowsingSession(
            id=str(uuid4()),
            started_at=datetime.now(timezone.utc),
            active=True,
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return to_session(record)


def stop_session(session_id: str) -> Session | None:
    """Stop an existing session."""

    with SessionLocal() as db:
        record = db.get(BrowsingSession, session_id)

        if record is None:
            return None

        record.active = False
        record.ended_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(record)

        return to_session(record)
