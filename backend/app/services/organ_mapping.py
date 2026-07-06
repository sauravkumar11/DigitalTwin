"""
Maps clinical concepts (conditions, lab tests) to organs, and computes a
stable hash of a patient's contributing records so organ summaries are only
regenerated when new data actually arrives (per spec: "Only regenerate
summaries when new records are uploaded").
"""
import hashlib

ORGANS = [
    "brain", "heart", "lungs", "liver", "kidneys",
    "pancreas", "stomach", "blood_vessels",
]

# Condition name (lowercase, substring match) -> organ
CONDITION_ORGAN_MAP: dict[str, str] = {
    "asthma": "lungs",
    "copd": "lungs",
    "bronchitis": "lungs",
    "pneumonia": "lungs",
    "hypertension": "blood_vessels",
    "atherosclerosis": "blood_vessels",
    "coronary artery disease": "heart",
    "heart failure": "heart",
    "myocardial infarction": "heart",
    "arrhythmia": "heart",
    "chronic kidney disease": "kidneys",
    "kidney disease": "kidneys",
    "renal failure": "kidneys",
    "diabetes": "pancreas",
    "hba1c": "pancreas",
    "hepatitis": "liver",
    "cirrhosis": "liver",
    "fatty liver": "liver",
    "gastritis": "stomach",
    "peptic ulcer": "stomach",
    "gerd": "stomach",
    "stroke": "brain",
    "migraine": "brain",
    "alzheimer": "brain",
    "epilepsy": "brain",
}

# Lab test name -> organ
LAB_ORGAN_MAP: dict[str, str] = {
    "creatinine": "kidneys",
    "egfr": "kidneys",
    "bun": "kidneys",
    "troponin": "heart",
    "bnp": "heart",
    "ldl": "blood_vessels",
    "hdl": "blood_vessels",
    "blood pressure": "blood_vessels",
    "alt": "liver",
    "ast": "liver",
    "bilirubin": "liver",
    "hba1c": "pancreas",
    "glucose": "pancreas",
    "amylase": "pancreas",
    "lipase": "pancreas",
    "h. pylori": "stomach",
}


def map_condition_to_organ(condition_name: str) -> str | None:
    name = condition_name.lower()
    for key, organ in CONDITION_ORGAN_MAP.items():
        if key in name:
            return organ
    return None


def map_lab_to_organ(test_name: str) -> str | None:
    name = test_name.lower()
    for key, organ in LAB_ORGAN_MAP.items():
        if key in name:
            return organ
    return None


def compute_source_hash(*record_ids_and_timestamps: str) -> str:
    """Stable hash used to decide whether an organ summary is stale."""
    joined = "|".join(sorted(record_ids_and_timestamps))
    return hashlib.sha256(joined.encode()).hexdigest()
