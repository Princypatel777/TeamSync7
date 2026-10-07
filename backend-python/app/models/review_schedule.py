from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

"""
Review Schedule model for planning upcoming review sessions across projects.
"""

from datetime import datetime, timezone
from typing import List

from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class ReviewSchedule(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    """
    Defines the scheduled date, venue, and panel for a review session.
    Maps to the 'reviewschedules' MongoDB collection.
    """

    project_id: PydanticObjectId = Field(
        ...,
        description="Reference to the project for which this review is scheduled.",
    )
    review_number: int = Field(
        ...,
        description="Sequential review number this schedule corresponds to.",
    )
    scheduled_date: datetime = Field(
        ...,
        description="Planned date and time for the review session (UTC).",
    )
    venue: str = Field(
        default="",
        description="Physical or virtual venue for the review session.",
    )
    panel_members: List[PydanticObjectId] = Field(
        default_factory=list,
        description="IDs of faculty or staff members constituting the review panel.",
    )
    status: str = Field(
        default="SCHEDULED",
        description="Current status of the schedule, e.g. 'SCHEDULED', 'COMPLETED', 'CANCELLED'.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the review schedule was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last update to the review schedule.",
    )

    class Settings:
        name = "reviewschedules"
