from collections.abc import Callable
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.deps import require_role


def test_me_requires_authorization_header(client: TestClient) -> None:
    response = client.get("/me")

    assert response.status_code == 401


def test_me_rejects_invalid_token(client: TestClient) -> None:
    response = client.get("/me", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_me_rejects_expired_token(client: TestClient, make_token: Callable[..., str]) -> None:
    now = datetime.now(UTC)
    token = make_token(iat=now - timedelta(hours=2), exp=now - timedelta(hours=1))

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_rejects_wrong_audience(client: TestClient, make_token: Callable[..., str]) -> None:
    token = make_token(aud="not-authenticated")

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_returns_claims_for_valid_token(
    client: TestClient, make_token: Callable[..., str]
) -> None:
    token = make_token()

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {
        "id": "user-123",
        "email": "student@example.com",
        "role": None,
        "full_name": None,
    }


def test_me_returns_role_from_app_metadata(
    client: TestClient, make_token: Callable[..., str]
) -> None:
    token = make_token(app_metadata={"role": "teacher"})

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["role"] == "teacher"


def test_me_returns_full_name_from_user_metadata(
    client: TestClient, make_token: Callable[..., str]
) -> None:
    token = make_token(user_metadata={"full_name": "Nguyen Van A"})

    response = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["full_name"] == "Nguyen Van A"


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
