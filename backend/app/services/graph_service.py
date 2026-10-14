
from sqlalchemy import select

from app.database.connection import SessionLocal
from app.database.tables import NavigationRecord, Page


def build_graph(session_id: str) -> dict:
    nodes = {}
    edges = []

    with SessionLocal() as db:
        records = db.scalars(
            select(NavigationRecord)
            .where(NavigationRecord.session_id == session_id)
            .order_by(NavigationRecord.timestamp, NavigationRecord.id)
        ).all()

        for record in records:
            from_page = (
                db.get(Page, record.from_page_id)
                if record.from_page_id else None
            )
            to_page = db.get(Page, record.to_page_id)

            if from_page:
                nodes[from_page.id] = {
                    "id": from_page.id,
                    "url": from_page.url,
                    "title": from_page.title or from_page.url
                }

            if to_page:
                nodes[to_page.id] = {
                    "id": to_page.id,
                    "url": to_page.url,
                    "title": to_page.title or to_page.url
                }

            if from_page and to_page:
                edges.append({
                    "source": from_page.id,
                    "target": to_page.id,
                    "timestamp": record.timestamp.isoformat()
                })

    return {
        "nodes": list(nodes.values()),
        "edges": edges
    }
