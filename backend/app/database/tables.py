
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


def generate_id():
    return str(uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_id
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, default="#6366f1")

    sessions: Mapped[list["BrowsingSession"]] = relationship(
        back_populates="category"
    )


class BrowsingSession(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_id
    )
    title: Mapped[str] = mapped_column(
        String, default="Untitled RabbitHole"
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    category_id: Mapped[str | None] = mapped_column(
        ForeignKey("categories.id"), nullable=True
    )

    category: Mapped["Category | None"] = relationship(
        back_populates="sessions"
    )
    events: Mapped[list["NavigationRecord"]] = relationship(
        back_populates="session"
    )


class Page(Base):
    __tablename__ = "pages"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_id
    )
    url: Mapped[str] = mapped_column(
        Text, unique=True, nullable=False
    )
    title: Mapped[str | None] = mapped_column(
        String, nullable=True
    )


class NavigationRecord(Base):
    __tablename__ = "navigation_events"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_id
    )
    session_id: Mapped[str] = mapped_column(
        ForeignKey("sessions.id"), nullable=False
    )
    from_page_id: Mapped[str | None] = mapped_column(
        ForeignKey("pages.id"), nullable=True
    )
    to_page_id: Mapped[str] = mapped_column(
        ForeignKey("pages.id"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    session: Mapped["BrowsingSession"] = relationship(
        back_populates="events"
    )
    from_page: Mapped["Page | None"] = relationship(
        foreign_keys=[from_page_id]
    )
    to_page: Mapped["Page"] = relationship(
        foreign_keys=[to_page_id]
    )
