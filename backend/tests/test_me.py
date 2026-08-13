from datetime import UTC, datetime, timedelta

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.deps import require_role
from app.core import security


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


def _make_token(signing_key: ec.EllipticCurvePrivateKey, **overrides: object) -> str:
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


def test_me_requires_authorization_header(client: TestClient) -> None:
    response = client.get("/me")

    assert response.status_code == 401


def test_me_rejects_invalid_token(client: TestClient) -> None:
    response = client.get("/me", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_me_rejects_expired_token(
    client: TestClient, signing_key: ec.EllipticCurvePrivateKey
) -> None:
    now = datetime.now(UTC)
    token = _make_token(signing_key, iat=now - timedelta(hours=2), exp=now - timedelta(hours=1))

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_rejects_wrong_audience(
    client: TestClient, signing_key: ec.EllipticCurvePrivateKey
) -> None:
    token = _make_token(signing_key, aud="not-authenticated")

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_returns_claims_for_valid_token(
    client: TestClient, signing_key: ec.EllipticCurvePrivateKey
) -> None:
    token = _make_token(signing_key)

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {"id": "user-123", "email": "student@example.com", "role": None}


def test_me_returns_role_from_app_metadata(
    client: TestClient, signing_key: ec.EllipticCurvePrivateKey
) -> None:
    token = _make_token(signing_key, app_metadata={"role": "teacher"})

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["role"] == "teacher"


def test_require_role_allows_matching_role() -> None:
    check_role = require_role("teacher", "admin")

    result = check_role(user={"app_metadata": {"role": "teacher"}})

    assert result == {"app_metadata": {"role": "teacher"}}


def test_require_role_rejects_non_matching_role() -> None:
    check_role = require_role("admin")

    with pytest.raises(HTTPException) as exc_info:
        check_role(user={"app_metadata": {"role": "student"}})

    assert exc_info.value.status_code == 403


def test_require_role_rejects_missing_role() -> None:
    check_role = require_role("admin")

    with pytest.raises(HTTPException) as exc_info:
        check_role(user={"app_metadata": {}})

    assert exc_info.value.status_code == 403
