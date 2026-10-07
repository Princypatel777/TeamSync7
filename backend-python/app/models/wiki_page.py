from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

"""
Wiki Page model for project documentation stored as structured pages.
"""

from datetime import datetime, timezone
from typing import Optional

from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class WikiPage(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    """
    Represents a single wiki/documentation page associated with a project.
    Maps to the 'wikipages' MongoDB collection.
    """

    project_id: PydanticObjectId = Field(
        ...,
        description="Reference to the parent project.",
    )
    title: str = Field(
        ...,
        description="Title of the wiki page.",
    )
    slug: str = Field(
        ...,
        description="URL-friendly unique identifier derived from the title.",
    )
    content: str = Field(
        default="",
        description="Markdown or plain-text body of the wiki page.",
    )
    created_by: PydanticObjectId = Field(
        ...,
        description="ID of the user who originally created the page.",
    )
    last_edited_by: Optional[PydanticObjectId] = Field(
        default=None,
        description="ID of the user who last edited the page.",
    )
    is_pinned: bool = Field(
        default=False,
        description="Whether this page is pinned to the top of the wiki.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the page was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last edit to the page.",
    )

    class Settings:
        name = "wikipages"
