from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from beanie import Document, PydanticObjectId
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)


class StudentMark(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True, extra="allow")

    """
    Stores mark entries for a student, either rubric-based criteria or review session.
    Maps to the 'studentmarks' MongoDB collection.
    """

    student_id: PydanticObjectId = Field(
        ...,
        description="Reference to the student receiving the mark.",
    )
    project_id: PydanticObjectId = Field(
        ...,
        description="Reference to the project context in which the mark was awarded.",
    )
    evaluator_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="ID of the faculty evaluator who recorded the marks.",
    )
    given_by: Optional[PydanticObjectId] = Field(
        default=None,
        description="Legacy evaluator ID.",
    )
    review_stage: Optional[str] = Field(
        default="REVIEW_1",
        description="Review stage or milestone key (e.g. REVIEW_1, REVIEW_2, FINAL_DEFENSE).",
    )
    criteria_scores: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of criteria breakdowns with weights and scores.",
    )
    total_marks_obtained: float = Field(
        default=0.0,
        description="Total weighted marks obtained (0-100).",
    )
    grade: str = Field(
        default="A",
        description="Computed letter grade (e.g. A+, A, B+, B, C, F).",
    )
    feedback: str = Field(
        default="",
        description="Evaluator written feedback.",
    )

    # Legacy rubric fields supported
    review_id: Optional[PydanticObjectId] = Field(
        default=None,
        description="Reference to review session if applicable.",
    )
    criteria: Optional[str] = Field(
        default="",
        description="Name or description of single criteria if legacy.",
    )
    marks_obtained: Optional[float] = Field(
        default=0.0,
        description="Marks scored.",
    )
    max_marks: Optional[float] = Field(
        default=100.0,
        description="Maximum possible marks.",
    )
    remarks: Optional[str] = Field(
        default="",
        description="Optional remarks.",
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
        name = "studentmarks"
