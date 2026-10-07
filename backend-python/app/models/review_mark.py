from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)


class ReviewMark(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True, extra="allow")

    """
    Stores marks and feedback awarded to a student in a group for a review session by a faculty member.
    Maps to the 'reviewmarks' MongoDB collection.
    """

    review_id: PydanticObjectId = Field(
        ...,
        description="Reference to the review session in which the marks were awarded.",
    )
    student_id: PydanticObjectId = Field(
        ...,
        description="Reference to the student who received these marks.",
    )
    group_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Reference to the project group being evaluated.",
    )
    faculty_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="ID of the faculty member who awarded the marks.",
    )
    marks: float = Field(
        default=0.0,
        description="Numeric marks scored by the student in this review.",
    )
    feedback: str = Field(
        default="",
        description="Evaluator written feedback/remarks for this student.",
    )
    status: str = Field(
        default="DRAFT",
        description="Status of the marks entry: DRAFT or SUBMITTED.",
    )

    # Legacy fields supported optionally
    project_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Reference to the project being evaluated.",
    )
    criteria_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Reference to the evaluation criteria used, if any.",
    )
    marks_obtained: Optional[float] = Field(
        default=None,
        description="Legacy marks obtained.",
    )
    max_marks: Optional[float] = Field(
        default=100.0,
        description="Maximum possible marks.",
    )
    remarks: Optional[str] = Field(
        default="",
        description="Legacy remarks.",
    )
    given_by: Optional[PydanticObjectId] = Field(
        default=None,
        description="Legacy faculty ID.",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the mark was recorded.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last update to this mark entry.",
    )

    class Settings:
        name = "reviewmarks"
