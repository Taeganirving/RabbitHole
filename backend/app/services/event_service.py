
from app.models.navigation_event import NavigationEvent
from app.services.session_service import get_session
from app.database.connection import SessionLocal
from app.database.tables import Page, NavigationRecord

from sqlalchemy import select


def add_event(session_id: str, event: NavigationEvent) -> NavigationEvent | None:
    # Check that the session exists and is active.
    session = get_session(session_id)

    if session is None or not session.active:
        return None

    with SessionLocal() as db:

        # Find or create a webpage.
        def get_or_create_page(url: str, title: str | None = None):
            page = db.scalar(
                select(Page).where(Page.url == url)
            )

            if page is None:
                page = Page(
                    url=url,
                    title=title
                )
                db.add(page)
                db.flush()

            elif title and not page.title:
                page.title = title

            return page

        # Find the starting webpage, if provided.
        from_page = None

        if event.from_url:
            from_page = get_or_create_page(event.from_url)

        # Find the destination webpage.
        to_page = get_or_create_page(
            event.to_url,
            event.title
        )

        # Create the navigation record.
        record = NavigationRecord(
            session_id=session_id,
            from_page_id=from_page.id if from_page else None,
            to_page_id=to_page.id,
            timestamp=event.timestamp
        )

        db.add(record)
        db.commit()

    return event
