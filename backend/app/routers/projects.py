from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Project, ProjectInterest
from app.schemas import ProjectInterestRequest

router = APIRouter(tags=["projects"])


@router.get("/projects")
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project).order_by(Project.interest_count.desc())).all()
    return {"projects": [p.model_dump() for p in projects]}


@router.post("/projects/{project_id}/interest")
def mark_interest(project_id: int, payload: ProjectInterestRequest, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.user_id:
        existing = session.exec(
            select(ProjectInterest).where(
                ProjectInterest.project_id == project_id, ProjectInterest.user_id == payload.user_id
            )
        ).first()
        if existing:
            return {"interest_count": project.interest_count, "already_interested": True}
        session.add(ProjectInterest(project_id=project_id, user_id=payload.user_id))

    project.interest_count += 1
    session.add(project)
    session.commit()
    session.refresh(project)
    return {"interest_count": project.interest_count, "already_interested": False}
