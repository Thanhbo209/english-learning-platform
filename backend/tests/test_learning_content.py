from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app.services import storage_service

# Same real seeded accounts used in test_classrooms.py - FK constraints
# against auth.users require real, existing ids.
TEACHER_ID = "ea25ad4e-6339-43a7-b149-4fd76b4e637e"
STUDENT_ID = "82df17e2-9b55-4edd-8074-17dc95427ae0"

VALID_VOCAB_CSV = b"word,definition,translation\nhello,a greeting,xin chao\n"
EMPTY_CSV = b"word,definition\n"


@pytest.fixture(autouse=True)
def patch_storage(monkeypatch: pytest.MonkeyPatch) -> None:
    # Uploading to real Supabase Storage needs a real session token, which
    # test tokens (self-signed against a fake JWKS) aren't. Import success
    # shouldn't depend on storage succeeding - see learning_content_service's
    # "non-fatal" handling - so tests patch it out rather than hit the network.
    monkeypatch.setattr(storage_service, "upload_object", lambda *args, **kwargs: None)


def _teacher_token(make_token: Callable[..., str]) -> str:
    return make_token(sub=TEACHER_ID, app_metadata={"role": "teacher"})


def _student_token(make_token: Callable[..., str]) -> str:
    return make_token(sub=STUDENT_ID, app_metadata={"role": "student"})


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _import(
    db_client: TestClient,
    make_token: Callable[..., str],
    *,
    content_type: str = "vocabulary",
    filename: str = "vocab.csv",
    file_bytes: bytes = VALID_VOCAB_CSV,
    title: str = "Test Vocabulary",
    mime: str = "text/csv",
) -> dict:
    response = db_client.post(
        "/learning-content/import",
        headers=_auth(_teacher_token(make_token)),
        data={"content_type": content_type, "title": title},
        files={"file": (filename, file_bytes, mime)},
    )
    assert response.status_code == 201
    return response.json()


def _create_classroom(db_client: TestClient, make_token: Callable[..., str]) -> dict:
    response = db_client.post(
        "/classrooms",
        json={"name": "English A1"},
        headers=_auth(_teacher_token(make_token)),
    )
    assert response.status_code == 201
    return response.json()


# --- Import ---


def test_import_requires_teacher_role(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    response = db_client.post(
        "/learning-content/import",
        headers=_auth(_student_token(make_token)),
        data={"content_type": "vocabulary", "title": "x"},
        files={"file": ("vocab.csv", VALID_VOCAB_CSV, "text/csv")},
    )
    assert response.status_code == 403


def test_import_rejects_unsupported_format(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    response = db_client.post(
        "/learning-content/import",
        headers=_auth(_teacher_token(make_token)),
        data={"content_type": "vocabulary", "title": "x"},
        files={"file": ("vocab.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 422


def test_import_valid_csv_vocabulary_is_ready_for_review(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    assert content["status"] == "ready_for_review"
    assert content["type"] == "vocabulary"
    assert content["validation_errors"] is None


def test_import_malformed_docx_is_failed(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(
        db_client,
        make_token,
        content_type="learning_document",
        filename="doc.docx",
        file_bytes=b"not a real docx",
        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    assert content["status"] == "failed"
    assert content["validation_errors"][0]["location"] == "file"


def test_import_empty_vocabulary_is_validation_failed(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token, file_bytes=EMPTY_CSV)
    assert content["status"] == "validation_failed"
    assert len(content["validation_errors"]) > 0


# --- CRUD ---


def test_list_mine_returns_only_own_content(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token, title="Mine")
    response = db_client.get("/learning-content/mine", headers=_auth(_teacher_token(make_token)))
    assert response.status_code == 200
    assert content["id"] in [c["id"] for c in response.json()]


def test_get_content_rejects_non_owner(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    other_teacher = make_token(
        sub="22222222-2222-2222-2222-222222222222", app_metadata={"role": "teacher"}
    )
    response = db_client.get(f"/learning-content/{content['id']}", headers=_auth(other_teacher))
    assert response.status_code == 403


def test_get_content_includes_vocabulary_items(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    response = db_client.get(
        f"/learning-content/{content['id']}", headers=_auth(_teacher_token(make_token))
    )
    body = response.json()
    assert len(body["vocabulary_items"]) == 1
    assert body["vocabulary_items"][0]["word"] == "hello"


def test_update_content_revalidates_and_can_fix_errors(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token, file_bytes=EMPTY_CSV)
    assert content["status"] == "validation_failed"

    response = db_client.patch(
        f"/learning-content/{content['id']}",
        json={"vocabulary_items": [{"word": "hello", "definition": "a greeting"}]},
        headers=_auth(_teacher_token(make_token)),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "ready_for_review"


def test_publish_requires_ready_for_review(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token, file_bytes=EMPTY_CSV)
    response = db_client.post(
        f"/learning-content/{content['id']}/publish", headers=_auth(_teacher_token(make_token))
    )
    assert response.status_code == 400


def test_publish_succeeds_from_ready_for_review(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    response = db_client.post(
        f"/learning-content/{content['id']}/publish", headers=_auth(_teacher_token(make_token))
    )
    assert response.status_code == 200
    assert response.json()["status"] == "published"


def test_delete_content(db_client: TestClient, make_token: Callable[..., str]) -> None:
    content = _import(db_client, make_token)
    response = db_client.delete(
        f"/learning-content/{content['id']}", headers=_auth(_teacher_token(make_token))
    )
    assert response.status_code == 204


# --- Assignments ---


def test_create_assignment_requires_owning_the_classroom(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    other_teacher_classroom_id = "33333333-3333-3333-3333-333333333333"
    response = db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": other_teacher_classroom_id},
        headers=_auth(_teacher_token(make_token)),
    )
    assert response.status_code == 403


def test_create_and_list_assignment(db_client: TestClient, make_token: Callable[..., str]) -> None:
    content = _import(db_client, make_token)
    classroom = _create_classroom(db_client, make_token)

    response = db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=_auth(_teacher_token(make_token)),
    )
    assert response.status_code == 201

    listed = db_client.get(
        f"/learning-content/{content['id']}/assignments", headers=_auth(_teacher_token(make_token))
    )
    assert len(listed.json()) == 1


def test_create_assignment_rejects_duplicate(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    classroom = _create_classroom(db_client, make_token)
    headers = _auth(_teacher_token(make_token))

    db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=headers,
    )
    response = db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=headers,
    )
    assert response.status_code == 409


def test_delete_assignment_requires_owner(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    classroom = _create_classroom(db_client, make_token)
    created = db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=_auth(_teacher_token(make_token)),
    ).json()

    other_teacher = make_token(
        sub="44444444-4444-4444-4444-444444444444", app_metadata={"role": "teacher"}
    )
    response = db_client.delete(
        f"/assignments/{created['id']}", headers=_auth(other_teacher)
    )
    assert response.status_code == 403


def test_student_sees_assignment_only_after_publish_and_join(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    classroom = _create_classroom(db_client, make_token)
    teacher_headers = _auth(_teacher_token(make_token))
    student_headers = _auth(_student_token(make_token))

    db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=teacher_headers,
    )

    # Not published yet and not enrolled: nothing visible.
    before = db_client.get("/assignments/mine", headers=student_headers)
    assert content["id"] not in [a["content"]["id"] for a in before.json()]

    db_client.post(f"/learning-content/{content['id']}/publish", headers=teacher_headers)
    db_client.post(f"/classrooms/invite/{classroom['join_token']}/join", headers=student_headers)

    after = db_client.get("/assignments/mine", headers=student_headers)
    assert content["id"] in [a["content"]["id"] for a in after.json()]


def test_student_assignment_detail_rejects_non_member(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    content = _import(db_client, make_token)
    classroom = _create_classroom(db_client, make_token)
    assignment = db_client.post(
        f"/learning-content/{content['id']}/assignments",
        json={"classroom_id": classroom["id"]},
        headers=_auth(_teacher_token(make_token)),
    ).json()
    teacher_headers = _auth(_teacher_token(make_token))
    db_client.post(f"/learning-content/{content['id']}/publish", headers=teacher_headers)

    response = db_client.get(
        f"/assignments/{assignment['id']}", headers=_auth(_student_token(make_token))
    )
    assert response.status_code == 403
