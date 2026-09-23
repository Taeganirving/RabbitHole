from fastapi import FastAPI

from app.models.session import Session
from app.services.session_service import create_session


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
