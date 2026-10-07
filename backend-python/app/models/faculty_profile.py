from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

from typing import Optional, List
from datetime import datetime, timezone
from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class FacultyProfile(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    user_id: PydanticObjectId
    department_id: Optional[PydanticObjectId] = None
    designation: str = "Assistant Professor"
    expertise: List[str] = []
    phone: str = ""
    office_location: str = ""
    bio: str = ""
    is_profile_complete: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "facultyprofiles"
