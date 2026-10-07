from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

from pymongo import IndexModel, ASCENDING


class MemberRole(str, Enum):
    LEADER = "LEADER"
    MEMBER = "MEMBER"


class InviteStatus(str, Enum):
    INVITED = "INVITED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class GroupMember(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    group_id: PydanticObjectId
    user_id: PydanticObjectId
    role: MemberRole = MemberRole.MEMBER
    status: InviteStatus = InviteStatus.ACCEPTED
    invited_by: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "groupmembers"
        indexes = [
            IndexModel([("groupId", ASCENDING), ("userId", ASCENDING)], unique=True),
        ]
