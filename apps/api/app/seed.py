from sqlmodel import Session, select

from app.db import engine, init_db
from app.models import Article, Plant
from app.seed_data import ARTICLES, PLANTS


def run() -> None:
    init_db()
    with Session(engine) as session:
        plant_count = 0
        for data in PLANTS:
            existing = session.exec(select(Plant).where(Plant.slug == data["slug"])).first()
            if existing:
                continue
            session.add(Plant(**data))
            plant_count += 1

        article_count = 0
        for data in ARTICLES:
            existing = session.exec(select(Article).where(Article.slug == data["slug"])).first()
            if existing:
                continue
            session.add(Article(**data))
            article_count += 1

        session.commit()
        print(f"Seeded {plant_count} new plants (of {len(PLANTS)} total) and {article_count} new articles (of {len(ARTICLES)} total).")


if __name__ == "__main__":
    run()
