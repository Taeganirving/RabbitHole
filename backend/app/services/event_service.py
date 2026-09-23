from app.models.navigation_event import NavigationEvent
from app.services.session_service import sessions


events: dict[str, list[NavigationEvent]] = {}


def add_event(session_id: str, event: NavigationEvent) -> NavigationEvent | None:
    session = sessions.get(session_id)

    if session is None:
        return None

    if not session.active:
        return None

    if session_id not in events:
        events[session_id] = []

    events[session_id].append(event)

    return event