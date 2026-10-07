from pydantic import ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)

"""
Evaluation Criteria model defining the rubric used during project reviews.
"""

from datetime import datetime, timezone

from beanie import Document
from beanie import Indexed
from pydantic import Field, ConfigDict
from pydantic.alias_generators import to_camel

def my_alias_generator(s: str) -> str:
    if s == 'id':
        return '_id'
    return to_camel(s)



class EvaluationCriteria(Document):
    model_config = ConfigDict(alias_generator=my_alias_generator, populate_by_name=True)

    """
    Defines a single evaluation criterion that reviewers use when assessing projects.
    Maps to the 'evaluationcriteria' MongoDB collection.
    """

    name: str = Field(
        ...,
        description="Name of the evaluation criterion, e.g. 'Code Quality'.",
    )
    description: str = Field(
        default="",
        description="Detailed explanation of what this criterion assesses.",
    )
    weightage_percentage: float = Field(
        default=25.0,
        description="Weightage percentage of this criterion.",
    )
    max_marks: float = Field(
        default=100,
        description="Maximum marks that can be awarded for this criterion.",
    )
    review_number: int = Field(
        default=1,
        description="Which review number this criterion applies to.",
    )
    is_active: bool = Field(
        default=True,
        description="Whether this criterion is currently in use.",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of when the criterion was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the last update to the criterion.",
    )

    class Settings:
        name = "evaluationcriteria"
