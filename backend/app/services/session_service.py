from datetime import datetime, timezone
from uuid import uuid4

from app.models.session import Session


def create_session() -> Session:
    return Session(
        id=str(uuid4()),
        started_at=datetime.now(timezone.utc),
    )