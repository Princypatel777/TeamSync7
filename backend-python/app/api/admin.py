from app.core.schemas import CamelModel
from datetime import datetime, timezone
from typing import List, Optional
import math
import re

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from pydantic import field_validator

from app.core.security import get_current_user, hash_password, require_roles
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.faculty_profile import FacultyProfile
from app.models.department import Department
from app.models.academic_year import AcademicYear
from app.models.sgp_cycle import SGPCycle
from app.models.notification import Notification
from app.models.project_group import ProjectGroup
from app.models.group_member import GroupMember
from app.models.project import Project
from app.models.audit_log import AuditLog
from app.utils.audit_logger import log_audit_event

router = APIRouter(prefix="/api/admin", tags=["admin"])

admin_only = require_roles("ADMIN")
admin_or_coord = require_roles("ADMIN", "COORDINATOR")
staff_roles = require_roles("ADMIN", "COORDINATOR", "FACULTY")


# ─── Request Schemas ─────────────────────────────────────────────────────────


class CreateUserRequest(CamelModel):
    name: str
    role: UserRole
    password: str
    email: Optional[str] = None
    enrollment_number: Optional[str] = None
    department_id: Optional[str] = None
    semester: Optional[int] = 1
    designation: Optional[str] = None
    expertise: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    bio: Optional[str] = ""


class UpdateUserRequest(CamelModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department_id: Optional[str] = None
    semester: Optional[int] = None
    designation: Optional[str] = None
    expertise: Optional[List[str]] = None


class ResetPasswordRequest(CamelModel):
    new_password: str


class CreateDepartmentRequest(CamelModel):
    name: str
    code: str
    description: Optional[str] = ""
    is_active: Optional[bool] = True


class UpdateDepartmentRequest(CamelModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CreateAcademicYearRequest(CamelModel):
    year_label: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = True


class CreateSGPCycleRequest(CamelModel):
    name: str
    department_id: Optional[str] = None
    academic_year_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = True


class SendNotificationRequest(CamelModel):
    title: str
    message: str
    type: Optional[str] = "ANNOUNCEMENT"  # ANNOUNCEMENT, GENERAL, ALERT, TASK, REVIEW, SYSTEM
    target_mode: str  # "ALL", "ROLES", "SPECIFIC_USERS", "GROUP"
    roles: Optional[List[str]] = None  # ["STUDENT", "FACULTY", "COORDINATOR", "ADMIN"]
    user_ids: Optional[List[str]] = None  # List of string user IDs
    group_id: Optional[str] = None  # Selected project group ID
    group_target: Optional[str] = "ALL"  # "ALL", "MEMBERS_ONLY", "GUIDE_ONLY"


# ─── Helper ───────────────────────────────────────────────────────────────────


async def _user_with_profile(user: User) -> dict:
    u_dict = user.dict_safe()
    profile = None
    if user.role == UserRole.STUDENT:
        p = await StudentProfile.find_one(StudentProfile.user_id == user.id)
        if p:
            profile = p.model_dump(mode="json")
    elif user.role in (UserRole.FACULTY, UserRole.COORDINATOR):
        p = await FacultyProfile.find_one(FacultyProfile.user_id == user.id)
        if p:
            profile = p.model_dump(mode="json")
    u_dict["profile"] = profile
    return u_dict


# ─── User Management ─────────────────────────────────────────────────────────


@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(staff_roles),
):
    query: dict = {}

    if role:
        query["role"] = role
    if status is not None:
        query["is_active"] = status.lower() == "true"
    if search:
        regex = {"$regex": search, "$options": "i"}
        query["$or"] = [{"name": regex}, {"email": regex}, {"enrollmentNumber": regex}, {"enrollment_number": regex}]

    skip = (page - 1) * limit
    users = await User.find(query).sort(-User.created_at).skip(skip).limit(limit).to_list()
    total = await User.find(query).count()

    users_with_profiles = [await _user_with_profile(u) for u in users]

    return {
        "success": True,
        "users": users_with_profiles,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": math.ceil(total / limit),
        },
    }


@router.post("/users", status_code=201)
async def create_user(body: CreateUserRequest, request: Request, current_user: User = Depends(admin_only)):
    if body.role == UserRole.STUDENT:
        if not body.enrollment_number:
            raise HTTPException(status_code=400, detail="Enrollment number is required for student accounts.")
        
        # Check both camelCase and snake_case
        existing = await User.find_one({
            "$or": [
                {"enrollmentNumber": body.enrollment_number.upper()},
                {"enrollment_number": body.enrollment_number.upper()}
            ]
        })
        if existing:
            raise HTTPException(status_code=400, detail=f"Student with enrollment number '{body.enrollment_number}' already exists.")
    else:
        if not body.email:
            raise HTTPException(status_code=400, detail="Email is required for non-student accounts.")
        existing = await User.find_one({"email": body.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail=f"User with email '{body.email}' already exists.")

    new_user = User(
        name=body.name,
        role=body.role,
        password_hash=hash_password(body.password),
        email=body.email.lower() if body.email else None,
        enrollment_number=body.enrollment_number.upper() if body.enrollment_number else None,
        is_active=True,
    )
    await new_user.insert()

    profile = None
    dept_id = PydanticObjectId(body.department_id) if body.department_id else None

    if body.role == UserRole.STUDENT:
        sp = StudentProfile(
            user_id=new_user.id,
            enrollment_number=new_user.enrollment_number or "",
            department_id=dept_id,
            semester=body.semester or 1,
            skills=body.skills or [],
            interests=body.interests or [],
            bio=body.bio or "",
        )
        await sp.insert()
        profile = sp.model_dump(mode="json")
    elif body.role in (UserRole.FACULTY, UserRole.COORDINATOR):
        fp = FacultyProfile(
            user_id=new_user.id,
            department_id=dept_id,
            designation=body.designation or "Assistant Professor",
            expertise=body.expertise or [],
        )
        await fp.insert()
        profile = fp.model_dump(mode="json")

    await log_audit_event(
        action="USER_CREATED",
        actor=current_user,
        target_entity="User",
        target_id=str(new_user.id),
        details={"role": new_user.role, "name": new_user.name},
        request=request,
    )

    u_dict = new_user.dict_safe()
    u_dict["profile"] = profile
    return {"success": True, "message": f"{body.role} account created successfully.", "user": u_dict}


@router.put("/users/{user_id}")
async def update_user(user_id: str, body: UpdateUserRequest, request: Request, current_user: User = Depends(admin_only)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.name:
        user.name = body.name
    if body.email and user.role != UserRole.STUDENT:
        user.email = body.email.lower()
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    dept_id = PydanticObjectId(body.department_id) if body.department_id else None
    profile = None
    if user.role == UserRole.STUDENT:
        update_data = {}
        if dept_id is not None:
            update_data["department_id"] = dept_id
        if body.semester is not None:
            update_data["semester"] = body.semester
        if update_data:
            p = await StudentProfile.find_one(StudentProfile.user_id == user.id)
            if p:
                for k, v in update_data.items():
                    setattr(p, k, v)
                await p.save()
                profile = p.model_dump(mode="json")
    elif user.role in (UserRole.FACULTY, UserRole.COORDINATOR):
        update_data = {}
        if dept_id is not None:
            update_data["department_id"] = dept_id
        if body.designation:
            update_data["designation"] = body.designation
        if body.expertise:
            update_data["expertise"] = body.expertise
        if update_data:
            p = await FacultyProfile.find_one(FacultyProfile.user_id == user.id)
            if p:
                for k, v in update_data.items():
                    setattr(p, k, v)
                await p.save()
                profile = p.model_dump(mode="json")

    await log_audit_event(action="USER_UPDATED", actor=current_user, target_entity="User", target_id=user_id, request=request)
    u_dict = user.dict_safe()
    u_dict["profile"] = profile
    return {"success": True, "message": "User updated successfully.", "user": u_dict}


@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, request: Request, current_user: User = Depends(admin_only)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    action = "USER_ACTIVATED" if user.is_active else "USER_DEACTIVATED"
    await log_audit_event(action=action, actor=current_user, target_entity="User", target_id=user_id, details={"newStatus": user.is_active}, request=request)

    return {"success": True, "message": f"User {'activated' if user.is_active else 'deactivated'} successfully.", "is_active": user.is_active}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, body: ResetPasswordRequest, request: Request, current_user: User = Depends(admin_only)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(body.new_password)
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    await log_audit_event(action="USER_PASSWORD_RESET", actor=current_user, target_entity="User", target_id=user_id, request=request)
    return {"success": True, "message": f"Password reset successfully for {user.name}."}


# ─── Department Management ────────────────────────────────────────────────────


@router.get("/departments")
async def get_departments(current_user: User = Depends(admin_or_coord)):
    depts = await Department.find_all().sort(+Department.name).to_list()
    return {"success": True, "departments": [d.model_dump(mode="json") for d in depts]}


@router.post("/departments", status_code=201)
async def create_department(body: CreateDepartmentRequest, request: Request, current_user: User = Depends(admin_only)):
    dept = Department(
        name=body.name,
        code=body.code.upper(),
        description=body.description or "",
        is_active=body.is_active if body.is_active is not None else True,
    )
    await dept.insert()
    await log_audit_event(action="DEPARTMENT_CREATED", actor=current_user, target_entity="Department", target_id=str(dept.id), details={"code": dept.code}, request=request)
    return {"success": True, "message": "Department created.", "department": dept.model_dump(mode="json")}


@router.put("/departments/{dept_id}")
async def update_department(dept_id: str, body: UpdateDepartmentRequest, current_user: User = Depends(admin_only)):
    dept = await Department.get(PydanticObjectId(dept_id))
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(dept, field, val)
    dept.updated_at = datetime.now(timezone.utc)
    await dept.save()
    return {"success": True, "message": "Department updated.", "department": dept.model_dump(mode="json")}


# ─── Academic Year Management ─────────────────────────────────────────────────


@router.get("/academic-years")
async def get_academic_years(current_user: User = Depends(admin_or_coord)):
    years = await AcademicYear.find_all().sort(-AcademicYear.year_label).to_list()
    return {"success": True, "academicYears": [y.model_dump(mode="json") for y in years]}


@router.post("/academic-years", status_code=201)
async def create_academic_year(body: CreateAcademicYearRequest, request: Request, current_user: User = Depends(admin_only)):
    now = datetime.now(timezone.utc)
    ay = AcademicYear(
        year_label=body.year_label,
        start_date=body.start_date or now,
        end_date=body.end_date or (now.replace(year=now.year + 1)),
        is_active=body.is_active if body.is_active is not None else True,
    )
    await ay.insert()
    await log_audit_event(action="ACADEMIC_YEAR_CREATED", actor=current_user, target_entity="AcademicYear", target_id=str(ay.id), details={"yearLabel": ay.year_label}, request=request)
    return {"success": True, "message": "Academic Year created.", "academicYear": ay.model_dump(mode="json")}


@router.put("/academic-years/{ay_id}")
async def update_academic_year(ay_id: str, body: dict, current_user: User = Depends(admin_only)):
    ay = await AcademicYear.get(PydanticObjectId(ay_id))
    if not ay:
        raise HTTPException(status_code=404, detail="Academic Year not found")
    for k, v in body.items():
        if hasattr(ay, k):
            setattr(ay, k, v)
    ay.updated_at = datetime.now(timezone.utc)
    await ay.save()
    return {"success": True, "message": "Academic Year updated.", "academicYear": ay.model_dump(mode="json")}


# ─── SGP Cycle Management ─────────────────────────────────────────────────────


@router.get("/sgp-cycles")
async def get_sgp_cycles(current_user: User = Depends(admin_or_coord)):
    cycles = await SGPCycle.find_all().sort(-SGPCycle.created_at).to_list()
    return {"success": True, "sgpCycles": [c.model_dump(mode="json") for c in cycles]}


@router.post("/sgp-cycles", status_code=201)
async def create_sgp_cycle(body: CreateSGPCycleRequest, request: Request, current_user: User = Depends(admin_only)):
    now = datetime.now(timezone.utc)
    dept_oid = PydanticObjectId(body.department_id) if body.department_id else None
    ay_oid = PydanticObjectId(body.academic_year_id) if body.academic_year_id else None
    cycle = SGPCycle(
        name=body.name,
        department_id=dept_oid,
        academic_year_id=ay_oid,
        start_date=body.start_date or now,
        end_date=body.end_date or (now.replace(month=min(12, now.month + 6))),
        is_active=body.is_active if body.is_active is not None else True,
    )
    await cycle.insert()
    await log_audit_event(action="SGP_CYCLE_CREATED", actor=current_user, target_entity="SGPCycle", target_id=str(cycle.id), details={"name": cycle.name}, request=request)
    return {"success": True, "message": "SGP Cycle created.", "sgpCycle": cycle.model_dump(mode="json")}


@router.put("/sgp-cycles/{cycle_id}")
async def update_sgp_cycle(cycle_id: str, body: dict, current_user: User = Depends(admin_only)):
    cycle = await SGPCycle.get(PydanticObjectId(cycle_id))
    if not cycle:
        raise HTTPException(status_code=404, detail="SGP Cycle not found")
    for k, v in body.items():
        if hasattr(cycle, k):
            setattr(cycle, k, v)
    cycle.updated_at = datetime.now(timezone.utc)
    await cycle.save()
    return {"success": True, "message": "SGP Cycle updated.", "sgpCycle": cycle.model_dump(mode="json")}


# ─── Delete Operations ────────────────────────────────────────────────────────


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, request: Request, current_user: User = Depends(admin_only)):
    try:
        oid = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = await User.get(oid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    if user.role == UserRole.STUDENT:
        await StudentProfile.find(StudentProfile.user_id == user.id).delete()
    else:
        await FacultyProfile.find(FacultyProfile.user_id == user.id).delete()
    await log_audit_event(action="USER_DELETED", actor=current_user, target_entity="User", target_id=user_id, request=request)
    return {"success": True, "message": "User deleted successfully."}


@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, request: Request, current_user: User = Depends(admin_only)):
    try:
        oid = PydanticObjectId(dept_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid department ID")
    dept = await Department.get(oid)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    await dept.delete()
    await log_audit_event(action="DEPARTMENT_DELETED", actor=current_user, target_entity="Department", target_id=dept_id, request=request)
    return {"success": True, "message": "Department deleted successfully."}


@router.delete("/academic-years/{ay_id}")
async def delete_academic_year(ay_id: str, request: Request, current_user: User = Depends(admin_only)):
    try:
        oid = PydanticObjectId(ay_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid academic year ID")
    ay = await AcademicYear.get(oid)
    if not ay:
        raise HTTPException(status_code=404, detail="Academic Year not found")
    await ay.delete()
    await log_audit_event(action="ACADEMIC_YEAR_DELETED", actor=current_user, target_entity="AcademicYear", target_id=ay_id, request=request)
    return {"success": True, "message": "Academic Year deleted successfully."}


@router.delete("/sgp-cycles/{cycle_id}")
async def delete_sgp_cycle(cycle_id: str, request: Request, current_user: User = Depends(admin_only)):
    try:
        oid = PydanticObjectId(cycle_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid SGP cycle ID")
    cycle = await SGPCycle.get(oid)
    if not cycle:
        raise HTTPException(status_code=404, detail="SGP Cycle not found")
    await cycle.delete()
    await log_audit_event(action="SGP_CYCLE_DELETED", actor=current_user, target_entity="SGPCycle", target_id=cycle_id, request=request)
    return {"success": True, "message": "SGP Cycle deleted successfully."}


# ─── Targeted Notification Broadcast ──────────────────────────────────────────


@router.post("/notifications/send")
async def send_targeted_notification(
    body: SendNotificationRequest,
    request: Request,
    current_user: User = Depends(staff_roles),
):
    """
    Send targeted notifications with full combinatorial targeting:
    - ALL: Every active user
    - ROLES: Specific role combinations (only coordinator, only faculty, both, only student, etc.)
    - SPECIFIC_USERS: Single or multiple selected users
    - GROUP: Group-wise targeting (all members, members only, or only faculty guide)
    """
    if not body.title.strip() or not body.message.strip():
        raise HTTPException(status_code=400, detail="Title and message cannot be empty.")

    recipient_ids = set()

    if body.target_mode == "ALL":
        users = await User.find(User.is_active == True).to_list()
        for u in users:
            recipient_ids.add(u.id)

    elif body.target_mode == "ROLES":
        if not body.roles:
            raise HTTPException(status_code=400, detail="Please select at least one target role.")
        users = await User.find({"role": {"$in": body.roles}, "is_active": True}).to_list()
        for u in users:
            recipient_ids.add(u.id)

    elif body.target_mode == "SPECIFIC_USERS":
        if not body.user_ids:
            raise HTTPException(status_code=400, detail="Please select at least one user.")
        for uid_str in body.user_ids:
            try:
                recipient_ids.add(PydanticObjectId(uid_str))
            except Exception:
                continue

    elif body.target_mode == "GROUP":
        if not body.group_id:
            raise HTTPException(status_code=400, detail="Please select a project group.")
        try:
            grp_oid = PydanticObjectId(body.group_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid project group ID.")

        group = await ProjectGroup.get(grp_oid)
        if not group:
            raise HTTPException(status_code=404, detail="Project group not found.")

        target = body.group_target or "ALL"

        # 1. Members / Leader
        if target in ("ALL", "MEMBERS_ONLY"):
            if group.leader_id:
                recipient_ids.add(group.leader_id)
            members = await GroupMember.find(GroupMember.group_id == group.id).to_list()
            for m in members:
                if m.user_id:
                    recipient_ids.add(m.user_id)

        # 2. Guide only or All
        if target in ("ALL", "GUIDE_ONLY"):
            if group.guide_id:
                recipient_ids.add(group.guide_id)
            # Also check project proposal if attached
            project = await Project.find_one(Project.group_id == group.id)
            if project and project.faculty_guide_id:
                recipient_ids.add(project.faculty_guide_id)

    if not recipient_ids:
        raise HTTPException(
            status_code=400,
            detail="No active recipients found for the selected targeting criteria.",
        )

    notif_type = (body.type or "ANNOUNCEMENT").upper()
    notifications = [
        Notification(
            user_id=uid,
            title=body.title.strip(),
            message=body.message.strip(),
            type=notif_type,
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )
        for uid in recipient_ids
    ]
    await Notification.insert_many(notifications)

    await log_audit_event(
        action="NOTIFICATION_BROADCAST",
        actor=current_user,
        target_entity="Notification",
        details={
            "targetMode": body.target_mode,
            "roles": body.roles,
            "groupId": body.group_id,
            "groupTarget": body.group_target,
            "recipientsCount": len(notifications),
            "title": body.title.strip(),
            "type": notif_type,
        },
        request=request,
    )

    return {
        "success": True,
        "message": f"Successfully sent notification to {len(notifications)} user(s).",
        "recipientsCount": len(notifications),
    }


@router.get("/notifications/broadcasts")
async def get_broadcast_history(
    current_user: User = Depends(staff_roles),
):
    """Fetch broadcast notification logs for history view."""
    logs = (
        await AuditLog.find(AuditLog.action == "NOTIFICATION_BROADCAST")
        .sort(-AuditLog.created_at)
        .limit(50)
        .to_list()
    )
    return {
        "success": True,
        "broadcasts": [l.model_dump(mode="json") for l in logs],
    }

