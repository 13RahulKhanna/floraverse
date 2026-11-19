"""
One-off migration: adds the three new Plant columns (sunlight_level, climate_preference,
is_air_purifying) to an already-existing `plant` table. SQLModel's create_all() only
creates missing tables, not missing columns on existing ones, so a table that predates
these model fields needs this run once.

Builds the ALTER TABLE DDL from the actual SQLModel column definitions (not hand-written
SQL) so the native Postgres enum types it creates exactly match what create_all() would
have produced on a fresh database.

Usage: python -m app.migrate_add_plant_columns
"""

from sqlalchemy import inspect, text

from app.db import engine
from app.models import Plant

NEW_COLUMNS = ["sunlight_level", "climate_preference", "is_air_purifying"]


def run() -> None:
    table = Plant.__table__
    inspector = inspect(engine)
    existing_columns = {col["name"] for col in inspector.get_columns("plant")}

    with engine.begin() as conn:
        for col_name in NEW_COLUMNS:
            if col_name in existing_columns:
                print(f"  - {col_name}: already exists, skipping")
                continue

            column = table.columns[col_name]
            if hasattr(column.type, "create"):
                column.type.create(conn, checkfirst=True)

            col_type_sql = column.type.compile(dialect=engine.dialect)
            nullable_sql = "" if column.nullable else " NOT NULL"
            default_sql = ""
            if not column.nullable and column.type.python_type is bool:
                default_sql = " DEFAULT false"

            ddl = f'ALTER TABLE plant ADD COLUMN "{col_name}" {col_type_sql}{default_sql}{nullable_sql}'
            conn.execute(text(ddl))
            print(f"  + {col_name}: added ({col_type_sql})")

        if "is_air_purifying" not in existing_columns:
            conn.execute(text('CREATE INDEX IF NOT EXISTS ix_plant_is_air_purifying ON plant ("is_air_purifying")'))
        if "sunlight_level" not in existing_columns:
            conn.execute(text('CREATE INDEX IF NOT EXISTS ix_plant_sunlight_level ON plant ("sunlight_level")'))
        if "climate_preference" not in existing_columns:
            conn.execute(text('CREATE INDEX IF NOT EXISTS ix_plant_climate_preference ON plant ("climate_preference")'))

    print("Migration complete.")


if __name__ == "__main__":
    run()
