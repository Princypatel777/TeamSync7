from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

"""
System Config model for storing application-wide configuration key-value pairs.
"""

from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class SystemConfig(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    """
    Stores a single application configuration setting as a key-value pair.
    The key field is unique and indexed for fast lookups.
    Maps to the 'systemconfigs' MongoDB collection.
    """

    key: Indexed(str, unique=True) = Field(  # type: ignore[valid-type]
        ...,
        description="Unique configuration key, e.g. 'MAX_TEAM_SIZE'.",
    )
    value: str = Field(
        ...,
        description="String value associated with the configuration key.",
    )
    description: str = Field(
        default="",
        description="Human-readable explanation of what this configuration controls.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the configuration entry was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last update to the configuration entry.",
    )

    class Settings:
        name = "systemconfigs"
