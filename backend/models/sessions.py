from datetime import datetime
from pydantic import BaseModel


class Session(BaseModel):
    id: str
    started_at: datetime
    ended_at: datetime | None = None
    active: bool = True