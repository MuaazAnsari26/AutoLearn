"""Dataset generation and validation routes."""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException

from app.schemas.dataset import GenerateDatasetRequest, ValidateDatasetRequest
from app.services.dataset_generator import generate_dataset, list_languages

router = APIRouter(tags=["Datasets"])


@router.get("/languages")
def get_languages() -> List[Dict[str, Any]]:
    """List all supported built-in regular languages."""
    return list_languages()


@router.post("/datasets/generate")
def api_generate_dataset(req: GenerateDatasetRequest) -> Dict[str, Any]:
    """Generate a reproducible dataset for a regular language."""
    try:
        data = generate_dataset(
            language_id=req.language_id,
            sample_count=req.sample_count,
            min_length=req.min_length,
            max_length=req.max_length,
            positive_ratio=req.positive_ratio,
            noise_rate=req.noise_rate,
            seed=req.seed,
        )
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/datasets/validate")
def api_validate_dataset(req: ValidateDatasetRequest) -> Dict[str, Any]:
    """Validate a dataset for conflicting labels, alphabet compliance, and duplicates."""
    alphabet_set = set(req.alphabet) if req.alphabet else {"0", "1"}

    errors: List[str] = []
    warnings: List[str] = []

    pos_strings: Dict[str, List[str]] = {}
    neg_strings: Dict[str, List[str]] = {}

    invalid_chars_found: set[str] = set()

    for sample in req.samples:
        s = sample.string
        # Check alphabet
        for char in s:
            if char not in alphabet_set:
                invalid_chars_found.add(char)

        if sample.label == 1:
            pos_strings.setdefault(s, []).append(sample.id)
        else:
            neg_strings.setdefault(s, []).append(sample.id)

    if invalid_chars_found:
        errors.append(
            f"Samples contain symbols outside the declared alphabet {sorted(alphabet_set)}: {sorted(invalid_chars_found)}"
        )

    # Check conflicts
    conflicts = set(pos_strings.keys()) & set(neg_strings.keys())
    if conflicts:
        errors.append(
            f"Conflicting labels detected for {len(conflicts)} string(s): {sorted(list(conflicts)[:5])}"
        )

    # Check duplicates within same class
    duplicate_count = 0
    for ids in pos_strings.values():
        if len(ids) > 1:
            duplicate_count += len(ids) - 1
    for ids in neg_strings.values():
        if len(ids) > 1:
            duplicate_count += len(ids) - 1

    if duplicate_count > 0:
        warnings.append(f"Dataset contains {duplicate_count} duplicate example(s) with identical labels.")

    pos_count = len(pos_strings)
    neg_count = len(neg_strings)
    total_samples = len(req.samples)

    if pos_count == 0:
        errors.append("Dataset contains 0 positive examples. RPNI cannot learn without positive examples.")
    if neg_count == 0:
        warnings.append("Dataset contains 0 negative examples. Learner will have no negative constraints.")

    is_valid = len(errors) == 0

    return {
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "total_samples": total_samples,
            "unique_positive": pos_count,
            "unique_negative": neg_count,
            "conflict_count": len(conflicts),
            "duplicate_count": duplicate_count,
        },
    }

