from fastapi import FastAPI, HTTPException

from app.models.session import Session
from app.services.session_service import create_session, stop_session
from app.services.session_service import update_session_title
from app.models.navigation_event import NavigationEvent
from app.services.event_service import add_event
from app.services.session_service import update_session_category
from app.services.session_service import list_sessions
from app.services.graph_service import build_graph
from app.services.session_service import get_session

from pydantic import BaseModel, Field

from app.services.category_service import (
    create_category,
    get_categories,
    update_category,
    delete_category
)
class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(
        default="#6366f1",
        pattern=r"^#[0-9a-fA-F]{6}$"
    )


class CategoryUpdate(BaseModel):
    name: str | None = Field(
        default=None, min_length=1, max_length=100
    )
    color: str | None = Field(
        default=None,
        pattern=r"^#[0-9a-fA-F]{6}$"
    )


class SessionCategoryUpdate(BaseModel):
    category_id: str | None


class SessionTitleUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=150)


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


@app.get("/sessions/{session_id}/graph")
def get_session_graph(session_id: str):
    session = get_session(session_id)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return build_graph(session_id)

@app.post("/categories", status_code=201)
def add_category(category: CategoryCreate):
    return create_category(category.name, category.color)


@app.get("/categories")
def list_categories():
    return get_categories()


@app.patch("/categories/{category_id}")
def edit_category(category_id: str, category: CategoryUpdate):
    result = update_category(
        category_id,
        name=category.name,
        color=category.color
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return result


@app.delete("/categories/{category_id}")
def remove_category(category_id: str):
    deleted = delete_category(category_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return {"message": "Category deleted successfully"}


@app.patch("/sessions/{session_id}/category")
def change_session_category(
    session_id: str,
    update: SessionCategoryUpdate
):
    try:
        session = update_session_category(
            session_id,
            update.category_id
        )
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return {
        "session": session,
        "category_id": update.category_id
    }

@app.patch("/sessions/{session_id}/title")
def change_session_title(
    session_id: str,
    update: SessionTitleUpdate
):
    session = update_session_title(
        session_id,
        update.title
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return {
        "message": "Session title updated",
        "session_id": session_id,
        "title": update.title
    }

@app.get("/sessions")
def get_saved_sessions(category_id: str | None = None):
    return list_sessions(category_id)

