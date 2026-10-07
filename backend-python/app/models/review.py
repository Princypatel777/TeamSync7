from datetime import datetime, timezone
from typing import List, Optional, Union
from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)


class Review(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True, extra="allow")

    """
    Represents a review session (e.g. proposal, mid-term, or final review event) for groups and panels.
    Maps to the 'reviews' MongoDB collection.
    """

    title: str = Field(
        default="Project Review",
        description="Title of the review event.",
    )
    type: str = Field(
        default="Proposal Review",
        description="Type of the review, e.g. Proposal Review, SRS Review, Mid-Term Review.",
    )
    description: Optional[str] = Field(
        default="",
        description="Description or instructions for the review.",
    )
    department: Optional[str] = Field(
        default="Computer Engineering",
        description="Department organizing the review.",
    )
    review_date: Optional[Union[datetime, str]] = Field(
        default=None,
        description="Date of the review event.",
    )
    start_time: Optional[str] = Field(
        default="",
        description="Start time, e.g. 10:00 AM.",
    )
    end_time: Optional[str] = Field(
        default="",
        description="End time, e.g. 01:00 PM.",
    )
    max_marks: float = Field(
        default=20.0,
        description="Maximum score possible in this review.",
    )
    status: str = Field(
        default="DRAFT",
        description="Lifecycle status: DRAFT, PUBLISHED, SCHEDULED, COMPLETED, CANCELLED.",
    )
    marks_visibility: str = Field(
        default="HIDDEN",
        description="Visibility of marks to students: HIDDEN or VISIBLE.",
    )
    assigned_groups: List[PydanticObjectId] = Field(
        default_factory=list,
        description="List of ProjectGroup IDs assigned to this review.",
    )
    faculty_reviewers: List[PydanticObjectId] = Field(
        default_factory=list,
        description="List of Faculty User IDs evaluating this review.",
    )

    # Legacy fields supported optionally
    project_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Legacy reference to a specific project if any.",
    )
    schedule_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Legacy reference to a review schedule.",
    )
    review_number: Optional[int] = Field(
        default=1,
        description="Sequential review number.",
    )
    held_on: Optional[datetime] = Field(
        default=None,
        description="Date held.",
    )
    venue: Optional[str] = Field(
        default="",
        description="Physical or virtual venue.",
    )
    remarks: Optional[str] = Field(
        default="",
        description="General remarks.",
    )
    attachment_url: Optional[str] = Field(
        default="",
        description="URL to an attached notice photo or document.",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the review record was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last update to the review record.",
    )

    class Settings:
        name = "reviews"
