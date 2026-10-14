
from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import select
from app.models.session import Session
from app.database.connection import SessionLocal
from app.database.tables import BrowsingSession
from app.database.tables import BrowsingSession, Category


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
    

def update_session_category(
    session_id: str,
    category_id: str | None
) -> Session | None:
    """Assign or remove a category from a browsing session."""

    with SessionLocal() as db:
        record = db.get(BrowsingSession, session_id)

        if record is None:
            return None

        if category_id is not None:
            category = db.get(Category, category_id)

            if category is None:
                raise ValueError("Category not found")

        record.category_id = category_id

        db.commit()
        db.refresh(record)

        return to_session(record)


def update_session_title(
    session_id: str,
    title: str
) -> Session | None:
    """Update a browsing session's title."""

    with SessionLocal() as db:
        record = db.get(BrowsingSession, session_id)

        if record is None:
            return None

        record.title = title

        db.commit()
        db.refresh(record)

        return to_session(record)
    
def list_sessions(category_id: str | None = None):
    """Retrieve saved sessions, optionally filtered by category."""

    with SessionLocal() as db:
        query = select(BrowsingSession)

        if category_id is not None:
            query = query.where(
                BrowsingSession.category_id == category_id
            )

        query = query.order_by(
            BrowsingSession.started_at.desc()
        )

        records = db.scalars(query).all()

        return [
            {
                "id": record.id,
                "title": record.title,
                "category_id": record.category_id,
                "started_at": record.started_at,
                "ended_at": record.ended_at,
                "active": record.active
            }
            for record in records
        ]

