
from sqlalchemy import select
from app.database.connection import SessionLocal
from app.database.tables import Category


def create_category(name: str, color: str = "#6366f1"):
    with SessionLocal() as db:
        category = Category(name=name, color=color)

        db.add(category)
        db.commit()
        db.refresh(category)

        return {
            "id": category.id,
            "name": category.name,
            "color": category.color
        }


def get_categories():
    with SessionLocal() as db:
        categories = db.scalars(
            select(Category).order_by(Category.name)
        ).all()

        return [
            {
                "id": category.id,
                "name": category.name,
                "color": category.color
            }
            for category in categories
        ]


def update_category(category_id: str, name=None, color=None):
    with SessionLocal() as db:
        category = db.get(Category, category_id)

        if category is None:
            return None

        if name is not None:
            category.name = name

        if color is not None:
            category.color = color

        db.commit()
        db.refresh(category)

        return {
            "id": category.id,
            "name": category.name,
            "color": category.color
        }


def delete_category(category_id: str):
    with SessionLocal() as db:
        category = db.get(Category, category_id)

        if category is None:
            return False

        # Keep browsing sessions when deleting their category.
        for session in category.sessions:
            session.category_id = None

        db.delete(category)
        db.commit()

        return True
