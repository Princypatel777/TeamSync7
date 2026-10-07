from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

"""
Notification model for delivering in-app messages to users.
"""

from datetime import datetime, timezone

from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class Notification(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    """
    Represents an in-app notification directed at a specific user.
    Maps to the 'notifications' MongoDB collection.
    """

    user_id: PydanticObjectId = Field(
        ...,
        description="ID of the user who should receive this notification.",
    )
    title: str = Field(
        ...,
        description="Short heading of the notification.",
    )
    message: str = Field(
        ...,
        description="Full notification message body.",
    )
    type: str = Field(
        default="GENERAL",
        description="Category of the notification, e.g. 'GENERAL', 'TASK', 'REVIEW'.",
    )
    is_read: bool = Field(
        default=False,
        description="Whether the user has read this notification.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the notification was created.",
    )

    class Settings:
        name = "notifications"
