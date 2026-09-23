from datetime import datetime, timezone
from uuid import uuid4

from app.models.session import Session


sessions: dict[str, Session] = {}


def create_session() -> Session:
    session = Session(
        id=str(uuid4()),
        started_at=datetime.now(timezone.utc),
    )

    sessions[session.id] = session

    return session