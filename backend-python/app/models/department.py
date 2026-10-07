from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class Department(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    name: Indexed(str, unique=True)  # type: ignore[valid-type]
    code: Indexed(str, unique=True)  # type: ignore[valid-type]
    description: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "departments"
