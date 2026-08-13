import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_owned_classroom, require_student_or_admin, require_teacher_or_admin
from app.db.session import get_db
from app.models.classroom import Classroom
from app.schemas.classroom import (
    ClassroomCreate,
    ClassroomInvitePreview,
    ClassroomListItem,
    ClassroomRead,
    ClassroomUpdate,
    ClassroomWithStudents,
    EnrolledStudent,
)
from app.services import classroom_service

router = APIRouter(prefix="/classrooms", tags=["classrooms"])


def _with_students(db: Session, classroom: Classroom) -> ClassroomWithStudents:
    rows = classroom_service.list_students(db, classroom.id)
    students = [
        EnrolledStudent(
            student_id=student_id, email=email, full_name=full_name, joined_at=joined_at
        )
        for student_id, email, full_name, joined_at in rows
    ]
    return ClassroomWithStudents(
        **ClassroomRead.model_validate(classroom).model_dump(),
        students=students,
    )


@router.post("", response_model=ClassroomRead, status_code=status.HTTP_201_CREATED)
def create_classroom(
    payload: ClassroomCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_teacher_or_admin),
) -> Classroom:
    return classroom_service.create_classroom(
        db, uuid.UUID(user["sub"]), payload.name, payload.description
    )


@router.get("/mine", response_model=list[ClassroomListItem])
def list_my_classrooms(
    db: Session = Depends(get_db),
    user: dict = Depends(require_teacher_or_admin),
) -> list[ClassroomListItem]:
    rows = classroom_service.list_owned_with_counts(db, uuid.UUID(user["sub"]))
    return [
        ClassroomListItem(
            **ClassroomRead.model_validate(classroom).model_dump(), students_count=count
        )
        for classroom, count in rows
    ]


@router.get("/enrolled", response_model=list[ClassroomRead])
def list_enrolled_classrooms(
    db: Session = Depends(get_db),
    user: dict = Depends(require_student_or_admin),
) -> list[Classroom]:
    return classroom_service.list_enrolled(db, uuid.UUID(user["sub"]))


@router.get("/invite/{token}", response_model=ClassroomInvitePreview)
def preview_invite(token: str, db: Session = Depends(get_db)) -> ClassroomInvitePreview:
    try:
        classroom = classroom_service.get_classroom_by_token(db, token)
    except classroom_service.ClassroomNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found"
        ) from exc

    teacher_email, teacher_full_name = classroom_service.get_teacher_info(db, classroom.teacher_id)
    return ClassroomInvitePreview(
        classroom_name=classroom.name,
        teacher_email=teacher_email,
        teacher_full_name=teacher_full_name,
    )


@router.post("/invite/{token}/join", response_model=ClassroomRead)
def join_classroom(
    token: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_student_or_admin),
) -> Classroom:
    try:
        return classroom_service.join_by_token(db, token, uuid.UUID(user["sub"]))
    except classroom_service.ClassroomNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found"
        ) from exc
    except classroom_service.AlreadyEnrolledError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already joined this classroom"
        ) from exc


@router.get("/{classroom_id}", response_model=ClassroomWithStudents)
def get_classroom(
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> ClassroomWithStudents:
    return _with_students(db, classroom)


@router.patch("/{classroom_id}", response_model=ClassroomRead)
def update_classroom(
    payload: ClassroomUpdate,
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> Classroom:
    return classroom_service.update_classroom(db, classroom, payload.name, payload.description)


@router.delete("/{classroom_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_classroom(
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> None:
    classroom_service.delete_classroom(db, classroom)


@router.post("/{classroom_id}/archive", response_model=ClassroomRead)
def archive_classroom(
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> Classroom:
    return classroom_service.set_archived(db, classroom, True)


@router.post("/{classroom_id}/unarchive", response_model=ClassroomRead)
def unarchive_classroom(
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> Classroom:
    return classroom_service.set_archived(db, classroom, False)


@router.post("/{classroom_id}/rotate-token", response_model=ClassroomRead)
def rotate_join_token(
    db: Session = Depends(get_db),
    classroom: Classroom = Depends(get_owned_classroom),
) -> Classroom:
    return classroom_service.rotate_join_token(db, classroom)


@router.post("/{classroom_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_classroom(
    classroom_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_student_or_admin),
) -> None:
    try:
        classroom_service.leave_classroom(db, classroom_id, uuid.UUID(user["sub"]))
    except classroom_service.NotEnrolledError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled in this classroom"
        ) from exc
