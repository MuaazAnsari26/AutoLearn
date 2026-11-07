"""Classification and dataset metrics for automata learning evaluation."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.services.dfa import DFA


def compute_metrics(predictions: List[bool], actuals: List[bool]) -> Dict[str, Any]:
    """Compute classification metrics from prediction and ground-truth labels.

    Args:
        predictions: List of predicted boolean labels.
        actuals: List of actual (ground-truth) boolean labels.

    Returns:
        A dict with keys:
            total (int): Total number of samples.
            true_positives (int): Count of TP.
            true_negatives (int): Count of TN.
            false_positives (int): Count of FP.
            false_negatives (int): Count of FN.
            accuracy (float): (TP + TN) / total.
            precision (float | None): TP / (TP + FP), or None if undefined.
            recall (float | None): TP / (TP + FN), or None if undefined.
            f1_score (float | None): Harmonic mean of precision and recall,
                or None if either is undefined.

    Raises:
        ValueError: If the lists have different lengths or are empty.
    """
    if len(predictions) != len(actuals):
        raise ValueError(
            f"Length mismatch: predictions has {len(predictions)} elements, "
            f"actuals has {len(actuals)} elements."
        )
    if len(predictions) == 0:
        raise ValueError("Cannot compute metrics on empty lists.")

    tp = 0
    tn = 0
    fp = 0
    fn = 0

    for pred, actual in zip(predictions, actuals):
        if pred and actual:
            tp += 1
        elif not pred and not actual:
            tn += 1
        elif pred and not actual:
            fp += 1
        else:  # not pred and actual
            fn += 1

    total = len(predictions)
    accuracy = (tp + tn) / total

    precision: Optional[float] = None
    if (tp + fp) > 0:
        precision = tp / (tp + fp)

    recall: Optional[float] = None
    if (tp + fn) > 0:
        recall = tp / (tp + fn)

    f1_score: Optional[float] = None
    if precision is not None and recall is not None and (precision + recall) > 0:
        f1_score = 2 * precision * recall / (precision + recall)

    return {
        "total": total,
        "true_positives": tp,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
    }


def compute_training_consistency(
    dfa: DFA,
    positive_examples: List[str],
    negative_examples: List[str],
) -> Dict[str, Any]:
    """Check if a DFA is consistent with a set of labeled training examples.

    For each positive example, the DFA should accept it.
    For each negative example, the DFA should reject it.

    Args:
        dfa: The DFA to evaluate.
        positive_examples: Strings that should be accepted.
        negative_examples: Strings that should be rejected.

    Returns:
        A dict with keys:
            total_examples (int): Total examples checked.
            consistent (int): Number of correctly classified examples.
            inconsistent (int): Number of incorrectly classified examples.
            consistency_rate (float): consistent / total_examples.
            errors (list): List of error dicts with keys:
                string (str), expected (bool), got (bool).
    """
    errors: List[Dict[str, Any]] = []
    consistent = 0
    inconsistent = 0

    for s in positive_examples:
        result = dfa.accepts(s)
        if result:
            consistent += 1
        else:
            inconsistent += 1
            errors.append({"string": s, "expected": True, "got": False})

    for s in negative_examples:
        result = dfa.accepts(s)
        if not result:
            consistent += 1
        else:
            inconsistent += 1
            errors.append({"string": s, "expected": False, "got": True})

    total_examples = len(positive_examples) + len(negative_examples)
    consistency_rate = consistent / total_examples if total_examples > 0 else 1.0

    return {
        "total_examples": total_examples,
        "consistent": consistent,
        "inconsistent": inconsistent,
        "consistency_rate": consistency_rate,
        "errors": errors,
    }


def compute_diversity_metrics(samples: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute diversity metrics for a dataset of labeled strings.

    Each sample is expected to be a dict with at least:
        - "string" (str): The input string.
        - "label" (bool): True for positive, False for negative.

    Args:
        samples: List of sample dicts.

    Returns:
        A dict with keys:
            total_samples (int): Total number of samples.
            unique_strings (int): Number of unique strings.
            unique_ratio (float): unique_strings / total_samples.
            length_distribution (dict): Maps string length (int) to count.
            positive_count (int): Number of positive samples.
            negative_count (int): Number of negative samples.
            balance_ratio (float): min(pos, neg) / max(pos, neg),
                or 0.0 if one class is empty, or 1.0 if both are empty.
    """
    if not samples:
        return {
            "total_samples": 0,
            "unique_strings": 0,
            "unique_ratio": 0.0,
            "length_distribution": {},
            "positive_count": 0,
            "negative_count": 0,
            "balance_ratio": 1.0,
        }

    total_samples = len(samples)
    strings = [s["string"] for s in samples]
    labels = [s["label"] for s in samples]

    unique_strings = len(set(strings))
    unique_ratio = unique_strings / total_samples

    length_distribution: Dict[int, int] = {}
    for s in strings:
        length = len(s)
        length_distribution[length] = length_distribution.get(length, 0) + 1

    positive_count = sum(1 for label in labels if label)
    negative_count = total_samples - positive_count

    if positive_count == 0 or negative_count == 0:
        balance_ratio = 0.0
    else:
        balance_ratio = min(positive_count, negative_count) / max(positive_count, negative_count)

    return {
        "total_samples": total_samples,
        "unique_strings": unique_strings,
        "unique_ratio": unique_ratio,
        "length_distribution": length_distribution,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "balance_ratio": balance_ratio,
    }
