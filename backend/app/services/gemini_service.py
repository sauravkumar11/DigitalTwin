"""
Thin wrapper around the Google Gemini API (Flash model).

If GEMINI_API_KEY is not configured, falls back to a deterministic
rule-based summary so the app remains fully runnable/demoable without
a key.
"""
import json
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

_client_ready = False
try:
    import google.generativeai as genai

    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _client_ready = True
except ImportError:  # library not installed in some minimal envs
    genai = None  # type: ignore


ORGAN_INSIGHT_PROMPT = """You are a clinical AI assistant generating an organ-specific
health summary for a digital patient twin application. This is for a synthetic/demo
patient (not real PHI). Given the structured patient context below for the organ
"{organ}", return STRICT JSON only, no markdown, no commentary, matching exactly:

{{
  "health_score": <integer 0-100>,
  "risk_level": "healthy" | "monitor" | "critical",
  "confidence": <float 0-1>,
  "trend": "improving" | "stable" | "declining",
  "ai_summary": "<2-4 sentence plain-language summary>",
  "suggested_followup": "<1-2 sentence recommendation>"
}}

Patient context:
{context}
"""


def _fallback_insight(organ: str, context: dict) -> dict:
    """Deterministic rule-based fallback when no Gemini API key is set."""
    flagged_labs = [l for l in context.get("lab_results", []) if l.get("flagged")]
    active_conditions = [d for d in context.get("diagnoses", []) if d.get("status") == "active"]

    score = 90 - (len(flagged_labs) * 12) - (len(active_conditions) * 8)
    score = max(10, min(100, score))

    if score >= 75:
        risk = "healthy"
    elif score >= 45:
        risk = "monitor"
    else:
        risk = "critical"

    return {
        "health_score": score,
        "risk_level": risk,
        "confidence": 0.6,
        "trend": "declining" if len(flagged_labs) > 1 else "stable",
        "ai_summary": (
            f"Rule-based summary for {organ.replace('_', ' ')}: "
            f"{len(active_conditions)} active related condition(s) and "
            f"{len(flagged_labs)} flagged lab result(s) found. "
            "Configure GEMINI_API_KEY for full AI-generated narrative summaries."
        ),
        "suggested_followup": (
            "Schedule a routine follow-up." if risk == "healthy"
            else "Recommend specialist review and repeat labs within 4-6 weeks."
        ),
    }


def generate_organ_insight(organ: str, context: dict) -> dict:
    """Returns dict with health_score, risk_level, confidence, trend, ai_summary, suggested_followup."""
    if not _client_ready or genai is None:
        return _fallback_insight(organ, context)

    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = ORGAN_INSIGHT_PROMPT.format(organ=organ, context=json.dumps(context, default=str))
        response = model.generate_content(prompt)
        text = response.text.strip()
        # strip potential markdown fences
        if text.startswith("```"):
            text = text.strip("`")
            text = text.split("\n", 1)[-1] if "\n" in text else text
            if text.lower().startswith("json"):
                text = text[4:]
        data = json.loads(text)
        return data
    except Exception as e:  # noqa: BLE001
        logger.warning("Gemini organ insight generation failed, using fallback: %s", e)
        return _fallback_insight(organ, context)


def summarize_report_text(extracted_text: str) -> dict:
    """Summarize + classify an uploaded medical report's extracted text."""
    if not _client_ready or genai is None:
        return {
            "summary": extracted_text[:280] + ("..." if len(extracted_text) > 280 else ""),
            "diagnosis": [],
            "medication": [],
            "tests": [],
            "procedures": [],
            "organs": [],
        }
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = f"""Extract and classify the following medical report text. Return STRICT JSON only:
{{"summary": "...", "diagnosis": [...], "medication": [...], "tests": [...], "procedures": [...], "organs": [...]}}

Report text:
{extracted_text[:6000]}
"""
        response = model.generate_content(prompt)
        text = response.text.strip().strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        return json.loads(text)
    except Exception as e:  # noqa: BLE001
        logger.warning("Gemini report summarization failed, using fallback: %s", e)
        return {
            "summary": extracted_text[:280],
            "diagnosis": [], "medication": [], "tests": [], "procedures": [], "organs": [],
        }


def analyze_meal_image(image_path: str) -> dict:
    """Analyze a meal photo via Gemini Vision. Falls back to a stub estimate."""
    if not _client_ready or genai is None:
        return {
            "food_items": ["unidentified meal (configure GEMINI_API_KEY for vision analysis)"],
            "calories": 500, "protein_g": 20, "carbs_g": 60, "fat_g": 15,
        }
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        image_file = genai.upload_file(image_path)
        prompt = """Analyze this meal photo. Return STRICT JSON only:
{"food_items": ["..."], "calories": <number>, "protein_g": <number>, "carbs_g": <number>, "fat_g": <number>}"""
        response = model.generate_content([image_file, prompt])
        text = response.text.strip().strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        return json.loads(text)
    except Exception as e:  # noqa: BLE001
        logger.warning("Gemini vision meal analysis failed, using fallback: %s", e)
        return {
            "food_items": ["unidentified meal"], "calories": 500,
            "protein_g": 20, "carbs_g": 60, "fat_g": 15,
        }
