from fastapi import FastAPI, HTTPException

from app.models.session import Session
from app.services.session_service import create_session, stop_session

from app.models.navigation_event import NavigationEvent
from app.services.event_service import add_event


app = FastAPI(
    title="RabbitHole API",
    description="Backend engine for RabbitHole browsing sessions.",
    version="0.1.0"
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/sessions", response_model=Session)
def start_session():
    return create_session()

@app.post("/sessions/{session_id}/stop", response_model=Session)
def end_session(session_id: str):
    session = stop_session(session_id)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return session

@app.post("/sessions/{session_id}/events", response_model=NavigationEvent)
def record_event(session_id: str, event: NavigationEvent):
    recorded_event = add_event(session_id, event)

    if recorded_event is None:
        raise HTTPException(
            status_code=400,
            detail="Session does not exist or is not active"
        )

    return recorded_event
