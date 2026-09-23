from datetime import datetime
from pydantic import BaseModel


class NavigationEvent(BaseModel):
    from_url: str | None = None
    to_url: str
    title: str | None = None
    timestamp: datetime