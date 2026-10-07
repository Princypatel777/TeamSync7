from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class GroupStatus(str, Enum):
    FORMING = "FORMING"
    READY_FOR_PROPOSAL = "READY_FOR_PROPOSAL"
    ACTIVE = "ACTIVE"
    LOCKED = "LOCKED"
    DISBANDED = "DISBANDED"


class ProjectGroup(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    name: str
    code: Indexed(str, unique=True)  # type: ignore[valid-type]
    sgp_cycle_id: Optional[PydanticObjectId] = None
    department_id: Optional[PydanticObjectId] = None
    leader_id: PydanticObjectId
    status: GroupStatus = GroupStatus.FORMING
    guide_id: Optional[PydanticObjectId] = None
    co_guide_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projectgroups"
