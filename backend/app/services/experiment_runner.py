"""Automata learning experiments runner with real RPNI inference and evaluations."""

from __future__ import annotations

import random
import time
from typing import Any, Dict, List, Optional, Set

from app.services.dataset_generator import (
    generate_all_strings_up_to_length,
    generate_dataset,
    get_language,
)
from app.services.dfa import DFA
from app.services.equivalence import check_equivalence
from app.services.metrics import compute_metrics
from app.services.minimization import minimize_dfa
from app.services.rpni import rpni


def _build_test_set(
    language_id: str,
    test_count: int,
    min_len: int,
    max_len: int,
    rng: random.Random,
    exclude: Set[str],
) -> List[Dict[str, Any]]:
    """Build a clean test set disjoint from training examples."""
    lang = get_language(language_id)
    alphabet_sorted = sorted(lang.alphabet)

    candidates: List[str] = []
    total_possible = sum(len(alphabet_sorted) ** l for l in range(min_len, max_len + 1))

    if total_possible <= 4096:
        all_s = generate_all_strings_up_to_length(alphabet_sorted, max_len, min_len)
        candidates = [s for s in all_s if s not in exclude]
    else:
        seen: Set[str] = set()
        attempts = 0
        while len(candidates) < test_count * 3 and attempts < test_count * 30:
            attempts += 1
            length = rng.randint(min_len, max_len)
            s = "".join(rng.choice(alphabet_sorted) for _ in range(length))
            if s not in seen and s not in exclude:
                seen.add(s)
                candidates.append(s)

    rng.shuffle(candidates)
    selected = candidates[:test_count]

    test_samples = []
    for s in selected:
        label = 1 if lang.label(s) else 0
        test_samples.append({"string": s, "label": label})

    return test_samples


def run_training_size_experiment(
    language_id: str = "contains_01",
    sample_sizes: Optional[List[int]] = None,
    test_size: int = 150,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Run Experiment A: Effect of training size on inferred model accuracy and complexity."""
    if sample_sizes is None:
        sample_sizes = [10, 25, 50, 100, 200]

    if seed is None:
        seed = 42

    rng = random.Random(seed)
    lang = get_language(language_id)
    ref_dfa = lang.get_reference_dfa()

    # Pre-generate max required training strings to ensure nested subsets
    max_train_size = max(sample_sizes)
    train_pool_gen = generate_dataset(
        language_id=language_id,
        sample_count=max_train_size,
        min_length=0,
        max_length=9,
        positive_ratio=0.5,
        noise_rate=0.0,
        seed=seed,
    )
    all_train_samples = train_pool_gen["samples"]
    train_strings_set = {s["string"] for s in all_train_samples}

    # Generate test set strictly disjoint from training pool
    test_samples = _build_test_set(
        language_id=language_id,
        test_count=test_size,
        min_len=0,
        max_len=10,
        rng=rng,
        exclude=train_strings_set,
    )

    test_actuals = [bool(s["label"]) for s in test_samples]

    results: List[Dict[str, Any]] = []

    for size in sample_sizes:
        sub_samples = all_train_samples[:size]
        pos_examples = [s["string"] for s in sub_samples if s["label"] == 1]
        neg_examples = [s["string"] for s in sub_samples if s["label"] == 0]

        start_time = time.perf_counter()
        try:
            rpni_res = rpni(
                positive_examples=pos_examples,
                negative_examples=neg_examples,
                alphabet=lang.alphabet,
                minimize_result=True,
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            learned_dfa: DFA = rpni_res["inferred_dfa"]

            # Evaluate on test set
            predictions = [learned_dfa.accepts(s["string"]) for s in test_samples]
            test_metrics = compute_metrics(predictions, test_actuals)

            # Equivalence check with reference DFA
            equiv_res = check_equivalence(learned_dfa, ref_dfa)

            results.append({
                "training_size": size,
                "positive_count": len(pos_examples),
                "negative_count": len(neg_examples),
                "training_consistency": rpni_res["training_consistency"],
                "test_accuracy": round(test_metrics["accuracy"], 4),
                "test_precision": round(test_metrics["precision"], 4) if test_metrics["precision"] is not None else None,
                "test_recall": round(test_metrics["recall"], 4) if test_metrics["recall"] is not None else None,
                "test_f1": round(test_metrics["f1_score"], 4) if test_metrics["f1_score"] is not None else None,
                "inferred_states": rpni_res["state_counts"]["inferred_states"],
                "minimized_states": rpni_res["state_counts"]["minimized_states"],
                "is_equivalent_to_reference": equiv_res["equivalent"],
                "runtime_ms": elapsed_ms,
            })
        except Exception as e:
            results.append({
                "training_size": size,
                "error": str(e),
                "training_consistency": 0.0,
                "test_accuracy": 0.0,
            })

    # Summary
    accuracies = [r["test_accuracy"] for r in results if "test_accuracy" in r]
    best_acc = max(accuracies) if accuracies else 0.0

    return {
        "experiment_type": "training_size",
        "language_id": language_id,
        "language_name": lang.name,
        "seed": seed,
        "test_sample_count": len(test_samples),
        "results": results,
        "summary": {
            "sizes_evaluated": sample_sizes,
            "best_accuracy": best_acc,
            "reference_states": len(ref_dfa.states),
            "convergence_observed": any(r.get("is_equivalent_to_reference") for r in results),
        },
    }


def run_diversity_experiment(
    language_id: str = "contains_01",
    sample_count: int = 60,
    test_size: int = 150,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Run Experiment B: Compare training data composition strategies."""
    if seed is None:
        seed = 42

    rng = random.Random(seed)
    lang = get_language(language_id)
    ref_dfa = lang.get_reference_dfa()

    # Define 4 distinct strategies
    strategies = [
        {
            "id": "narrow_short",
            "name": "Narrow Lengths (0–3)",
            "min_len": 0,
            "max_len": 3,
            "positive_ratio": 0.5,
        },
        {
            "id": "imbalanced_pos",
            "name": "Imbalanced (80% Pos)",
            "min_len": 0,
            "max_len": 8,
            "positive_ratio": 0.8,
        },
        {
            "id": "imbalanced_neg",
            "name": "Imbalanced (20% Pos)",
            "min_len": 0,
            "max_len": 8,
            "positive_ratio": 0.2,
        },
        {
            "id": "balanced_broad",
            "name": "Balanced & Broad (0–8)",
            "min_len": 0,
            "max_len": 8,
            "positive_ratio": 0.5,
        },
    ]

    # Independent broad test set
    test_samples = _build_test_set(
        language_id=language_id,
        test_count=test_size,
        min_len=0,
        max_len=10,
        rng=rng,
        exclude=set(),
    )
    test_actuals = [bool(s["label"]) for s in test_samples]

    results: List[Dict[str, Any]] = []

    for strat in strategies:
        strat_seed = seed + 10
        dataset = generate_dataset(
            language_id=language_id,
            sample_count=sample_count,
            min_length=strat["min_len"],
            max_length=strat["max_len"],
            positive_ratio=strat["positive_ratio"],
            noise_rate=0.0,
            seed=strat_seed,
        )

        samples = dataset["samples"]
        pos_examples = [s["string"] for s in samples if s["label"] == 1]
        neg_examples = [s["string"] for s in samples if s["label"] == 0]

        start_time = time.perf_counter()
        try:
            rpni_res = rpni(
                positive_examples=pos_examples,
                negative_examples=neg_examples,
                alphabet=lang.alphabet,
                minimize_result=True,
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            learned_dfa: DFA = rpni_res["inferred_dfa"]

            predictions = [learned_dfa.accepts(s["string"]) for s in test_samples]
            metrics = compute_metrics(predictions, test_actuals)
            equiv_res = check_equivalence(learned_dfa, ref_dfa)

            results.append({
                "strategy_id": strat["id"],
                "strategy_name": strat["name"],
                "sample_count": len(samples),
                "positive_count": len(pos_examples),
                "negative_count": len(neg_examples),
                "distinct_lengths": dataset["summary"]["distinct_lengths"],
                "unique_strings": dataset["summary"]["unique_strings"],
                "training_consistency": rpni_res["training_consistency"],
                "test_accuracy": round(metrics["accuracy"], 4),
                "test_f1": round(metrics["f1_score"], 4) if metrics["f1_score"] is not None else None,
                "inferred_states": rpni_res["state_counts"]["minimized_states"],
                "is_equivalent_to_reference": equiv_res["equivalent"],
                "runtime_ms": elapsed_ms,
            })
        except Exception as e:
            results.append({
                "strategy_id": strat["id"],
                "strategy_name": strat["name"],
                "error": str(e),
            })

    return {
        "experiment_type": "diversity",
        "language_id": language_id,
        "language_name": lang.name,
        "seed": seed,
        "test_sample_count": len(test_samples),
        "results": results,
    }


def run_noise_experiment(
    language_id: str = "contains_01",
    noise_rates: Optional[List[float]] = None,
    sample_count: int = 80,
    test_size: int = 150,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Run Experiment C: Impact of training label noise on inference."""
    if noise_rates is None:
        noise_rates = [0.0, 0.05, 0.10, 0.20, 0.30]

    if seed is None:
        seed = 42

    rng = random.Random(seed)
    lang = get_language(language_id)
    ref_dfa = lang.get_reference_dfa()

    # Pre-generate base clean dataset
    base_dataset = generate_dataset(
        language_id=language_id,
        sample_count=sample_count,
        min_length=0,
        max_length=8,
        positive_ratio=0.5,
        noise_rate=0.0,
        seed=seed,
    )
    base_samples = base_dataset["samples"]
    train_strings_set = {s["string"] for s in base_samples}

    test_samples = _build_test_set(
        language_id=language_id,
        test_count=test_size,
        min_len=0,
        max_len=9,
        rng=rng,
        exclude=train_strings_set,
    )
    test_actuals = [bool(s["label"]) for s in test_samples]

    results: List[Dict[str, Any]] = []

    for rate in noise_rates:
        # Create noisy copy with fixed rate
        num_flips = int(round(len(base_samples) * rate))
        flip_indices = set(rng.sample(range(len(base_samples)), min(num_flips, len(base_samples))))

        pos_examples = []
        neg_examples = []

        for idx, s in enumerate(base_samples):
            true_label = s["true_label"]
            label = (1 - true_label) if idx in flip_indices else true_label
            if label == 1:
                pos_examples.append(s["string"])
            else:
                neg_examples.append(s["string"])

        start_time = time.perf_counter()
        try:
            rpni_res = rpni(
                positive_examples=pos_examples,
                negative_examples=neg_examples,
                alphabet=lang.alphabet,
                minimize_result=True,
            )
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            learned_dfa: DFA = rpni_res["inferred_dfa"]

            predictions = [learned_dfa.accepts(s["string"]) for s in test_samples]
            metrics = compute_metrics(predictions, test_actuals)

            results.append({
                "noise_rate": rate,
                "noise_percentage": f"{int(rate * 100)}%",
                "flipped_count": len(flip_indices),
                "training_consistency": rpni_res["training_consistency"],
                "test_accuracy": round(metrics["accuracy"], 4),
                "test_f1": round(metrics["f1_score"], 4) if metrics["f1_score"] is not None else None,
                "inferred_states": rpni_res["state_counts"]["minimized_states"],
                "runtime_ms": elapsed_ms,
            })
        except Exception as e:
            results.append({
                "noise_rate": rate,
                "noise_percentage": f"{int(rate * 100)}%",
                "flipped_count": len(flip_indices),
                "error": str(e),
                "test_accuracy": None,
            })

    return {
        "experiment_type": "noise",
        "language_id": language_id,
        "language_name": lang.name,
        "seed": seed,
        "sample_count": sample_count,
        "test_sample_count": len(test_samples),
        "results": results,
    }


def run_insufficient_data_experiment(
    language_id: str = "contains_01",
    sample_count: int = 15,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Run Experiment D: Insufficient data and length generalization."""
    if seed is None:
        seed = 42

    rng = random.Random(seed)
    lang = get_language(language_id)
    ref_dfa = lang.get_reference_dfa()

    # Train on small sample with short strings (lengths 0-3)
    train_dataset = generate_dataset(
        language_id=language_id,
        sample_count=sample_count,
        min_length=0,
        max_length=3,
        positive_ratio=0.5,
        noise_rate=0.0,
        seed=seed,
    )
    train_samples = train_dataset["samples"]
    pos_examples = [s["string"] for s in train_samples if s["label"] == 1]
    neg_examples = [s["string"] for s in train_samples if s["label"] == 0]

    rpni_res = rpni(
        positive_examples=pos_examples,
        negative_examples=neg_examples,
        alphabet=lang.alphabet,
        minimize_result=True,
    )
    learned_dfa: DFA = rpni_res["inferred_dfa"]

    # Compare by length partitions
    length_buckets = [
        {"name": "Short (Lengths 0–3, Seen Range)", "min": 0, "max": 3},
        {"name": "Medium (Lengths 4–6, Moderate Extrapolation)", "min": 4, "max": 6},
        {"name": "Long (Lengths 7–10, Heavy Extrapolation)", "min": 7, "max": 10},
    ]

    bucket_results = []
    disagreements = []

    for bucket in length_buckets:
        test_samples = _build_test_set(
            language_id=language_id,
            test_count=50,
            min_len=bucket["min"],
            max_len=bucket["max"],
            rng=rng,
            exclude=set(),
        )
        test_actuals = [bool(s["label"]) for s in test_samples]
        predictions = [learned_dfa.accepts(s["string"]) for s in test_samples]
        metrics = compute_metrics(predictions, test_actuals)

        bucket_results.append({
            "bucket_name": bucket["name"],
            "sample_count": len(test_samples),
            "accuracy": round(metrics["accuracy"], 4),
            "f1": round(metrics["f1_score"], 4) if metrics["f1_score"] is not None else None,
            "false_positives": metrics["false_positives"],
            "false_negatives": metrics["false_negatives"],
        })

        for s, pred, actual in zip(test_samples, predictions, test_actuals):
            if pred != actual and len(disagreements) < 10:
                disagreements.append({
                    "string": s["string"] if s["string"] else "ε",
                    "length": len(s["string"]),
                    "learned_prediction": "Accepted" if pred else "Rejected",
                    "reference_label": "Accepted" if actual else "Rejected",
                })

    # Exact product-BFS equivalence
    equiv_res = check_equivalence(learned_dfa, ref_dfa)

    return {
        "experiment_type": "insufficient_data",
        "language_id": language_id,
        "language_name": lang.name,
        "seed": seed,
        "training_sample_count": sample_count,
        "training_lengths": "0–3",
        "inferred_state_count": len(learned_dfa.states),
        "reference_state_count": len(ref_dfa.states),
        "exact_equivalence": equiv_res["equivalent"],
        "distinguishing_string": equiv_res["distinguishing_string"],
        "equivalence_explanation": equiv_res["explanation"],
        "length_bucket_evaluations": bucket_results,
        "sample_disagreements": disagreements,
        "scientific_insight": (
            "Because the training set only contained short strings (lengths 0-3), "
            "the learned automaton had insufficient evidence to discover all periodic "
            "or multi-step transitions required for longer strings. Finite samples do not "
            "uniquely determine an infinite regular language."
        ),
    }

