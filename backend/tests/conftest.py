from collections.abc import Callable, Generator
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.orm import Session

from app.core import security
from app.db.session import engine, get_db
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class _FakeSigningKey:
    def __init__(self, key: object) -> None:
        self.key = key


class _FakeJWKClient:
    def __init__(self, key: object) -> None:
        self._key = key

    def get_signing_key_from_jwt(self, token: str) -> _FakeSigningKey:
        return _FakeSigningKey(self._key)


@pytest.fixture
def signing_key() -> ec.EllipticCurvePrivateKey:
    return ec.generate_private_key(ec.SECP256R1())


@pytest.fixture(autouse=True)
def patch_jwks(monkeypatch: pytest.MonkeyPatch, signing_key: ec.EllipticCurvePrivateKey) -> None:
    monkeypatch.setattr(
        security,
        "get_jwks_client",
        lambda: _FakeJWKClient(signing_key.public_key()),
    )


@pytest.fixture
def make_token(signing_key: ec.EllipticCurvePrivateKey) -> Callable[..., str]:
    def _make(**overrides: object) -> str:
        now = datetime.now(UTC)
        payload = {
            "sub": "user-123",
            "email": "student@example.com",
            "aud": "authenticated",
            "iat": now,
            "exp": now + timedelta(hours=1),
            **overrides,
        }
        return jwt.encode(payload, signing_key, algorithm="ES256")

    return _make


@pytest.fixture
def db_session() -> Generator[Session]:
    """A session bound to a transaction that's rolled back after the test.

    Runs against the real Supabase Postgres (backend/.env's DATABASE_URL) -
    no local test database. Service-layer db.commit() calls only close
    savepoints, not the outer transaction, so nothing persists.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(session: Session, trans: object) -> None:
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def db_client(db_session: Session) -> Generator[TestClient]:
    def override_get_db() -> Generator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
