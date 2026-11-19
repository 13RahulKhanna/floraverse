"""
One-off tool: sources a real, freely-licensed photo for each seeded plant from Wikipedia
(backed by Wikimedia Commons) by scientific name, downloads it into uploads/plants/, and
updates that plant's image_url in the database.

Not invented, not stock-photo filler — these are genuine photographs of the actual
species, pulled from the same encyclopedia source the rest of the botanical data could be
cross-checked against. A plant whose Wikipedia page has no usable image is left with
image_url unset (the frontend already renders an honest category-tinted placeholder for
that case) rather than attaching a wrong or generic photo.

Usage: python -m app.fetch_plant_images [--force]
  --force  re-fetch and overwrite plants that already have an image_url set.
"""

import sys
import time
from pathlib import Path

import httpx
from sqlmodel import Session, select

from app.db import engine
from app.models import Plant

WIKI_API = "https://en.wikipedia.org/w/api.php"
# Required by Wikimedia's API etiquette: a descriptive User-Agent identifying the
# project, not a personal contact — see https://meta.wikimedia.org/wiki/User-Agent_policy
USER_AGENT = "FloraVerse-Educational-Project/1.0 (+https://github.com/13RahulKhanna/floraverse)"
PLANTS_DIR = Path("uploads/plants")


def _get(client: httpx.Client, params: dict) -> dict:
    res = client.get(WIKI_API, params={**params, "format": "json"})
    res.raise_for_status()
    return res.json()


def find_thumbnail_url(client: httpx.Client, scientific_name: str, common_name: str) -> str | None:
    """Look up a representative photo via Wikipedia's pageimages API, with a title search
    fallback when the scientific name doesn't resolve directly (redirects, synonyms)."""
    for query_title in (scientific_name, f"{common_name} ({scientific_name})", common_name):
        data = _get(
            client,
            {
                "action": "query",
                "titles": query_title,
                "prop": "pageimages",
                "pithumbsize": 900,
                "redirects": 1,
            },
        )
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            thumb = page.get("thumbnail", {}).get("source")
            if thumb:
                return thumb

    # Fallback: full-text search, then retry pageimages on the top hit.
    search = _get(client, {"action": "query", "list": "search", "srsearch": scientific_name, "srlimit": 1})
    hits = search.get("query", {}).get("search", [])
    if not hits:
        return None
    top_title = hits[0]["title"]
    data = _get(client, {"action": "query", "titles": top_title, "prop": "pageimages", "pithumbsize": 900})
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        thumb = page.get("thumbnail", {}).get("source")
        if thumb:
            return thumb
    return None


def run(force: bool = False) -> None:
    PLANTS_DIR.mkdir(parents=True, exist_ok=True)

    with Session(engine) as session, httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=20.0) as client:
        plants = session.exec(select(Plant)).all()
        found, skipped, missing = 0, 0, []

        for plant in plants:
            if plant.image_url and not force:
                skipped += 1
                continue

            try:
                thumb_url = find_thumbnail_url(client, plant.scientific_name, plant.common_name)
            except httpx.HTTPError as exc:
                print(f"  ! {plant.slug}: lookup failed ({exc})")
                missing.append(plant.slug)
                continue

            if not thumb_url:
                print(f"  - {plant.slug}: no Wikipedia image found, leaving unset")
                missing.append(plant.slug)
                continue

            ext = thumb_url.split("?")[0].rsplit(".", 1)[-1].lower()
            if ext not in {"jpg", "jpeg", "png", "webp"}:
                ext = "jpg"
            dest = PLANTS_DIR / f"{plant.slug}.{ext}"

            try:
                img_res = client.get(thumb_url)
                img_res.raise_for_status()
                content_type = img_res.headers.get("content-type", "")
                if not content_type.startswith("image/") or len(img_res.content) < 1024:
                    print(f"  ! {plant.slug}: response wasn't a usable image, skipping")
                    missing.append(plant.slug)
                    continue
                dest.write_bytes(img_res.content)
            except httpx.HTTPError as exc:
                print(f"  ! {plant.slug}: download failed ({exc})")
                missing.append(plant.slug)
                continue

            plant.image_url = f"uploads/plants/{plant.slug}.{ext}"
            session.add(plant)
            found += 1
            print(f"  + {plant.slug}: {dest.name} ({len(img_res.content) // 1024}KB)")

            time.sleep(0.3)  # be polite to the API

        session.commit()
        print(f"\nDone. {found} photos fetched, {skipped} already had one, {len(missing)} left unset: {missing}")


if __name__ == "__main__":
    run(force="--force" in sys.argv)
