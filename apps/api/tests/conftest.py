import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db import get_session
from app.main import app
from app.models import Article, Plant
from app.seed_data import ARTICLES, PLANTS


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        for data in PLANTS:
            session.add(Plant(**data))
        for data in ARTICLES:
            session.add(Article(**data))
        session.commit()
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "pytest-user@example.com", "password": "testpassword123", "display_name": "Pytest User"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
