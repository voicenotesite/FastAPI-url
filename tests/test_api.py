import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200

def test_register_login():
    r = client.post("/auth/register", json={"email": "x@x.pl", "password": "test123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_shorten():
    r = client.post("/auth/register", json={"email": "y@y.pl", "password": "test123"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = client.post("/urls/shorten", params={"target_url": "https://example.com"}, headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["short_code"]
    short_code = data["short_code"]

    r = client.get(f"/urls/{short_code}/stats")
    assert r.status_code == 200

    r = client.get(f"/urls/r/{short_code}", follow_redirects=False)
    assert r.status_code in (302, 307)
