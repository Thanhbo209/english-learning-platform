from collections.abc import Callable

from fastapi.testclient import TestClient

# Real auth.users rows seeded earlier in this project (see AGENTS.md/session
# history) - classrooms.teacher_id and classroom_enrollments.student_id have
# FK constraints against auth.users, so writes need real, existing ids.
TEACHER_ID = "ea25ad4e-6339-43a7-b149-4fd76b4e637e"
STUDENT_ID = "82df17e2-9b55-4edd-8074-17dc95427ae0"


def _teacher_token(make_token: Callable[..., str]) -> str:
    return make_token(sub=TEACHER_ID, app_metadata={"role": "teacher"})


def _student_token(make_token: Callable[..., str]) -> str:
    return make_token(sub=STUDENT_ID, app_metadata={"role": "student"})


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _create_classroom(
    db_client: TestClient, make_token: Callable[..., str], name: str = "English A1"
) -> dict:
    response = db_client.post(
        "/classrooms",
        json={"name": name, "description": "A classroom"},
        headers=_auth(_teacher_token(make_token)),
    )
    assert response.status_code == 201
    return response.json()


def test_create_classroom_requires_teacher_role(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    response = db_client.post(
        "/classrooms",
        json={"name": "English A1"},
        headers=_auth(_student_token(make_token)),
    )

    assert response.status_code == 403


def test_create_classroom_succeeds_for_teacher(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)

    assert classroom["name"] == "English A1"
    assert classroom["is_archived"] is False
    assert len(classroom["join_token"]) > 20


def test_list_mine_returns_only_own_classrooms(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token, name="Class One")
    db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_student_token(make_token)),
    )

    response = db_client.get("/classrooms/mine", headers=_auth(_teacher_token(make_token)))

    assert response.status_code == 200
    body = response.json()
    names = [c["name"] for c in body]
    assert "Class One" in names
    listed = next(c for c in body if c["id"] == classroom["id"])
    assert listed["students_count"] == 1


def test_get_classroom_rejects_non_owner(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)
    other_teacher = make_token(
        sub="11111111-1111-1111-1111-111111111111", app_metadata={"role": "teacher"}
    )

    response = db_client.get(f"/classrooms/{classroom['id']}", headers=_auth(other_teacher))

    assert response.status_code == 403


def test_get_classroom_includes_students(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)
    db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_student_token(make_token)),
    )

    response = db_client.get(
        f"/classrooms/{classroom['id']}", headers=_auth(_teacher_token(make_token))
    )

    assert response.status_code == 200
    students = response.json()["students"]
    assert len(students) == 1
    assert students[0]["student_id"] == STUDENT_ID


def test_update_classroom(db_client: TestClient, make_token: Callable[..., str]) -> None:
    classroom = _create_classroom(db_client, make_token)

    response = db_client.patch(
        f"/classrooms/{classroom['id']}",
        json={"name": "Renamed"},
        headers=_auth(_teacher_token(make_token)),
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Renamed"


def test_archive_and_unarchive(db_client: TestClient, make_token: Callable[..., str]) -> None:
    classroom = _create_classroom(db_client, make_token)
    headers = _auth(_teacher_token(make_token))

    archived = db_client.post(f"/classrooms/{classroom['id']}/archive", headers=headers)
    assert archived.status_code == 200
    assert archived.json()["is_archived"] is True

    unarchived = db_client.post(f"/classrooms/{classroom['id']}/unarchive", headers=headers)
    assert unarchived.status_code == 200
    assert unarchived.json()["is_archived"] is False


def test_archived_classroom_rejects_new_joins(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)
    db_client.post(
        f"/classrooms/{classroom['id']}/archive", headers=_auth(_teacher_token(make_token))
    )

    response = db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_student_token(make_token)),
    )

    assert response.status_code == 404


def test_delete_classroom_cascades_enrollments(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)
    db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_student_token(make_token)),
    )

    response = db_client.delete(
        f"/classrooms/{classroom['id']}", headers=_auth(_teacher_token(make_token))
    )
    assert response.status_code == 204

    enrolled = db_client.get("/classrooms/enrolled", headers=_auth(_student_token(make_token)))
    assert classroom["id"] not in [c["id"] for c in enrolled.json()]


def test_rotate_token_invalidates_old_link(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)
    old_token = classroom["join_token"]

    response = db_client.post(
        f"/classrooms/{classroom['id']}/rotate-token", headers=_auth(_teacher_token(make_token))
    )
    assert response.status_code == 200
    new_token = response.json()["join_token"]
    assert new_token != old_token

    stale = db_client.get(f"/classrooms/invite/{old_token}")
    assert stale.status_code == 404

    fresh = db_client.get(f"/classrooms/invite/{new_token}")
    assert fresh.status_code == 200


def test_invite_preview_returns_name_and_teacher(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token, name="Preview Class")

    response = db_client.get(f"/classrooms/invite/{classroom['join_token']}")

    assert response.status_code == 200
    body = response.json()
    assert body["classroom_name"] == "Preview Class"
    assert body["teacher_email"] == "teacher@englisheveryday.test"


def test_invite_preview_rejects_unknown_token(db_client: TestClient) -> None:
    response = db_client.get("/classrooms/invite/not-a-real-token")

    assert response.status_code == 404


def test_join_creates_enrollment(db_client: TestClient, make_token: Callable[..., str]) -> None:
    classroom = _create_classroom(db_client, make_token)

    response = db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_student_token(make_token)),
    )

    assert response.status_code == 200
    enrolled = db_client.get("/classrooms/enrolled", headers=_auth(_student_token(make_token)))
    assert classroom["id"] in [c["id"] for c in enrolled.json()]


def test_join_twice_is_rejected(db_client: TestClient, make_token: Callable[..., str]) -> None:
    classroom = _create_classroom(db_client, make_token)
    headers = _auth(_student_token(make_token))
    db_client.post(f"/classrooms/invite/{classroom['join_token']}/join", headers=headers)

    response = db_client.post(f"/classrooms/invite/{classroom['join_token']}/join", headers=headers)

    assert response.status_code == 409


def test_join_rejects_non_student_role(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)

    response = db_client.post(
        f"/classrooms/invite/{classroom['join_token']}/join",
        headers=_auth(_teacher_token(make_token)),
    )

    assert response.status_code == 403


def test_join_rejects_invalid_token(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    response = db_client.post(
        "/classrooms/invite/not-a-real-token/join", headers=_auth(_student_token(make_token))
    )

    assert response.status_code == 404


def test_leave_removes_enrollment(db_client: TestClient, make_token: Callable[..., str]) -> None:
    classroom = _create_classroom(db_client, make_token)
    student_headers = _auth(_student_token(make_token))
    db_client.post(f"/classrooms/invite/{classroom['join_token']}/join", headers=student_headers)

    response = db_client.post(f"/classrooms/{classroom['id']}/leave", headers=student_headers)

    assert response.status_code == 204
    enrolled = db_client.get("/classrooms/enrolled", headers=student_headers)
    assert classroom["id"] not in [c["id"] for c in enrolled.json()]


def test_leave_when_not_enrolled_returns_404(
    db_client: TestClient, make_token: Callable[..., str]
) -> None:
    classroom = _create_classroom(db_client, make_token)

    response = db_client.post(
        f"/classrooms/{classroom['id']}/leave", headers=_auth(_student_token(make_token))
    )

    assert response.status_code == 404
