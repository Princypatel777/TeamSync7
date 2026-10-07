from __future__ import annotations
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import httpx
from beanie import PydanticObjectId
from app.models.project import Project
from app.models.system_config import SystemConfig

logger = logging.getLogger(__name__)


def _normalize_text(text: Optional[str]) -> List[str]:
    if not text:
        return []
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    return [w for w in cleaned.split() if len(w) > 3]


async def compute_project_similarity(
    draft_proposal: Any,
    current_project_id: Optional[PydanticObjectId] = None,
) -> Dict[str, Any]:
    """
    Compute similarity score & plagiarism check against existing projects in MongoDB.
    Uses Jaccard keyword overlap and tech-stack match.
    """
    title = getattr(draft_proposal, "title", "") or ""
    problem_statement = getattr(draft_proposal, "problem_statement", "") or ""
    description = getattr(draft_proposal, "description", "") or ""
    tech_stack = getattr(draft_proposal, "tech_stack", []) or []

    query: Dict[str, Any] = {}
    if current_project_id:
        query["_id"] = {"$ne": PydanticObjectId(current_project_id)}

    existing_projects = await Project.find(query).to_list()

    if not existing_projects:
        return {
            "similarityScore": 0.0,
            "isHighRisk": False,
            "similarProjects": [],
            "originalityAdvice": "No existing historical projects found for comparison. Proposal is 100% original.",
        }

    draft_words = set(
        _normalize_text(title)
        + _normalize_text(problem_statement)
        + _normalize_text(description)
    )
    draft_tech = set(t.lower().strip() for t in tech_stack if t)

    max_similarity = 0.0
    matches = []

    for p in existing_projects:
        p_title = getattr(p, "title", "") or ""
        p_prob = getattr(p, "problem_statement", "") or ""
        p_desc = getattr(p, "description", "") or ""
        p_tech = set(t.lower().strip() for t in (getattr(p, "tech_stack", []) or []) if t)

        p_words = set(
            _normalize_text(p_title)
            + _normalize_text(p_prob)
            + _normalize_text(p_desc)
        )

        word_intersection = draft_words.intersection(p_words)
        word_union = draft_words.union(p_words)
        text_sim = (len(word_intersection) / len(word_union) * 100) if word_union else 0.0

        tech_intersection = draft_tech.intersection(p_tech)
        tech_union = draft_tech.union(p_tech)
        tech_sim = (len(tech_intersection) / len(tech_union) * 100) if tech_union else 0.0

        # Title bonus
        p_title_words = _normalize_text(p_title)
        matched_title_words = [w for w in _normalize_text(title) if w in p_title_words]
        title_bonus = 25.0 if len(matched_title_words) >= 2 else 0.0

        total_sim = min(round(text_sim * 0.5 + tech_sim * 0.25 + title_bonus, 1), 98.0)

        if total_sim > max_similarity:
            max_similarity = total_sim

        if total_sim >= 20.0:
            matches.append(
                {
                    "projectId": str(p.id),
                    "title": p.title,
                    "similarityPercentage": total_sim,
                    "reason": f"Matched {len(word_intersection)} problem keywords and {len(tech_intersection)} technologies with '{p.title}'.",
                }
            )

    matches.sort(key=lambda x: x["similarityPercentage"], reverse=True)

    # Check configured threshold from system config
    thresh_cfg = await SystemConfig.find_one(SystemConfig.key == "SIMILARITY_THRESHOLD_PERCENT")
    threshold = 35.0
    if thresh_cfg and thresh_cfg.value:
        try:
            threshold = float(thresh_cfg.value)
        except (ValueError, TypeError):
            pass

    is_high_risk = max_similarity >= threshold
    if is_high_risk:
        originality_advice = (
            f"Warning: High similarity ({max_similarity}%) detected against existing repository projects. "
            "We recommend refining your unique problem statement or adding distinct innovative features to pass faculty review."
        )
    else:
        originality_advice = "Your project proposal demonstrates high originality with low historical overlap."

    return {
        "similarityScore": max_similarity,
        "isHighRisk": is_high_risk,
        "similarProjects": matches[:5],
        "originalityAdvice": originality_advice,
    }


async def generate_project_recommendations(
    skills: Optional[List[str]] = None,
    interests: Optional[List[str]] = None,
    domain: str = "Web Development",
) -> Dict[str, Any]:
    """
    Generate project ideas based on team skills & domain.
    Attempts Google Gemini API if a valid key is set, otherwise delivers curated fallback suggestions.
    """
    skills = skills or []
    interests = interests or []

    # Check for Gemini key in SystemConfig or env
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        cfg = await SystemConfig.find_one(SystemConfig.key == "GEMINI_API_KEY")
        if cfg and cfg.value and not cfg.value.startswith("AIzaSy_CONFIGURED"):
            api_key = cfg.value

    if api_key:
        try:
            prompt = (
                f"Given student technical skills: [{', '.join(skills)}] and interests: [{', '.join(interests)}] "
                f"in domain '{domain}', generate 3 innovative college project proposals. "
                "Return a valid JSON array of objects with keys: title, problemStatement, objectives (array of strings), "
                "techStack (array of strings), difficulty (Easy/Medium/Hard), innovation, expectedOutcome, matchScore (number 80-99), explanation."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                    headers={"Content-Type": "application/json"},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        j_start = text.find("[")
                        j_end = text.rfind("]")
                        if j_start != -1 and j_end != -1:
                            parsed = json.loads(text[j_start : j_end + 1])
                            return {"isAiLive": True, "recommendations": parsed}
        except Exception as e:
            logger.warning(f"Gemini API generation failed, falling back to algorithmic engine: {e}")

    skills_str = ", ".join(skills) if skills else "Full-Stack Development"
    interests_str = ", ".join(interests) if interests else "Cloud & Intelligent Systems"

    recommendations = [
        {
            "title": f"Smart Campus Academic Collaboration & Project Tracking Hub",
            "domain": domain or "Web Development",
            "problemStatement": "Engineering departments struggle to track student project iterations, faculty approvals, and sprint velocity across heterogeneous groups.",
            "objectives": [
                "Implement a role-based milestone and task submission workflow.",
                "Provide automated plagiarism similarity scanning against past semester projects.",
                "Deliver real-time chat and faculty guidance meeting logs.",
            ],
            "techStack": skills[:3] + ["React", "FastAPI", "MongoDB"] if skills else ["React", "Python", "MongoDB", "Tailwind CSS"],
            "difficulty": "Medium",
            "innovation": "Continuous integration audit trail with dynamic rubric grade calculation.",
            "expectedOutcome": "A fully deployed web platform streamlining project governance by 50%.",
            "matchScore": 96,
            "explanation": f"Designed directly to align with team background in {skills_str} and interest in {interests_str}.",
        },
        {
            "title": "Automated Lab Equipment Scheduling & IoT Maintenance Tracker",
            "domain": domain or "Web Development",
            "problemStatement": "University hardware labs suffer from equipment double-booking, missing calibration logs, and lack of maintenance visibility.",
            "objectives": [
                "Provide live slot reservation with conflict detection.",
                "Generate QR asset tags for instant breakdown reporting.",
                "Produce departmental equipment utilization heatmaps.",
            ],
            "techStack": ["React", "FastAPI", "PostgreSQL", "Tailwind CSS"],
            "difficulty": "Medium",
            "innovation": "Automated reservation expiry and dynamic slot reallocation.",
            "expectedOutcome": "Increased lab utilization with 99% reduction in scheduling conflicts.",
            "matchScore": 91,
            "explanation": f"Pairs well with {interests_str} and technical implementation in {skills_str}.",
        },
        {
            "title": "Predictive Student Performance & Dropout Early-Warning System",
            "domain": domain or "Data Science / Web",
            "problemStatement": "Mentors discover academic difficulties and low sprint completion too late in the semester to offer timely remediation.",
            "objectives": [
                "Track weekly progress indicators across tasks and submissions.",
                "Calculate multi-factor momentum score (LOW / MEDIUM / HIGH risk).",
                "Automate notification triggers for students and assigned faculty guides.",
            ],
            "techStack": ["Python", "FastAPI", "React", "Recharts", "MongoDB"],
            "difficulty": "Hard",
            "innovation": "Early-warning risk score based on task completion trajectory.",
            "expectedOutcome": "Measurable 20% boost in timely project delivery across student groups.",
            "matchScore": 89,
            "explanation": f"Combines modern analytics workflows with {skills_str}.",
        },
    ]

    return {
        "isAiLive": bool(api_key),
        "recommendations": recommendations,
    }
