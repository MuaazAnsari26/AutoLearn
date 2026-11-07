"""Dataset generation and reference regular languages for AutoLearn."""

from __future__ import annotations

import random
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

from app.services.dfa import DFA


class RegularLanguage:
    """Represents a regular language with a reference predicate and minimal reference DFA."""

    def __init__(
        self,
        language_id: str,
        name: str,
        description: str,
        alphabet: Set[str],
        predicate: Callable[[str], bool],
        reference_dfa_builder: Callable[[], DFA],
    ) -> None:
        self.language_id = language_id
        self.name = name
        self.description = description
        self.alphabet = set(alphabet)
        self.predicate = predicate
        self.reference_dfa_builder = reference_dfa_builder

    def get_reference_dfa(self) -> DFA:
        """Build and return a fresh copy of the reference DFA."""
        return self.reference_dfa_builder()

    def label(self, s: str) -> bool:
        """Return True if string belongs to the language, False otherwise."""
        return self.predicate(s)


# ============================================================================
# Five Built-in Regular Languages Definitions
# ============================================================================

# 1. Contains substring "01"
def _pred_contains_01(s: str) -> bool:
    return "01" in s


def _dfa_contains_01() -> DFA:
    # States:
    # q0: start, have not seen '0'
    # q1: have seen '0' (candidate start of "01")
    # q2: accepting, substring "01" seen
    return DFA(
        states={"q0", "q1", "q2"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q1",
            ("q0", "1"): "q0",
            ("q1", "0"): "q1",
            ("q1", "1"): "q2",
            ("q2", "0"): "q2",
            ("q2", "1"): "q2",
        },
        start_state="q0",
        accept_states={"q2"},
    )


# 2. Even number of '1's
def _pred_even_ones(s: str) -> bool:
    return s.count("1") % 2 == 0


def _dfa_even_ones() -> DFA:
    # States:
    # q0: even number of '1's (start, accept)
    # q1: odd number of '1's
    return DFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q0",
            ("q0", "1"): "q1",
            ("q1", "0"): "q1",
            ("q1", "1"): "q0",
        },
        start_state="q0",
        accept_states={"q0"},
    )


# 3. Ends with "01"
def _pred_ends_with_01(s: str) -> bool:
    return s.endswith("01")


def _dfa_ends_with_01() -> DFA:
    # States:
    # q0: start, last char not '0'
    # q1: last char '0'
    # q2: ends with "01" (accepting)
    return DFA(
        states={"q0", "q1", "q2"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q1",
            ("q0", "1"): "q0",
            ("q1", "0"): "q1",
            ("q1", "1"): "q2",
            ("q2", "0"): "q1",
            ("q2", "1"): "q0",
        },
        start_state="q0",
        accept_states={"q2"},
    )


# 4. Starts with '1'
def _pred_starts_with_1(s: str) -> bool:
    return len(s) > 0 and s[0] == "1"


def _dfa_starts_with_1() -> DFA:
    # States:
    # q0: start (empty string, reject)
    # q1: started with '1' (accepting, self loops on 0 and 1)
    # q2: started with '0' (dead/sink state, reject)
    return DFA(
        states={"q0", "q1", "q2"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "1"): "q1",
            ("q0", "0"): "q2",
            ("q1", "0"): "q1",
            ("q1", "1"): "q1",
            ("q2", "0"): "q2",
            ("q2", "1"): "q2",
        },
        start_state="q0",
        accept_states={"q1"},
    )


# 5. Even number of '0's
def _pred_even_zeros(s: str) -> bool:
    return s.count("0") % 2 == 0


def _dfa_even_zeros() -> DFA:
    # States:
    # q0: even number of '0's (start, accept)
    # q1: odd number of '0's
    return DFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q1",
            ("q0", "1"): "q0",
            ("q1", "0"): "q0",
            ("q1", "1"): "q1",
        },
        start_state="q0",
        accept_states={"q0"},
    )


BUILTIN_LANGUAGES: Dict[str, RegularLanguage] = {
    "contains_01": RegularLanguage(
        language_id="contains_01",
        name="Contains Substring '01'",
        description="Binary strings that contain the substring '01' somewhere.",
        alphabet={"0", "1"},
        predicate=_pred_contains_01,
        reference_dfa_builder=_dfa_contains_01,
    ),
    "even_ones": RegularLanguage(
        language_id="even_ones",
        name="Even Number of '1's",
        description="Binary strings containing an even number of '1' symbols (including ε and 0).",
        alphabet={"0", "1"},
        predicate=_pred_even_ones,
        reference_dfa_builder=_dfa_even_ones,
    ),
    "ends_with_01": RegularLanguage(
        language_id="ends_with_01",
        name="Ends With '01'",
        description="Binary strings whose final two symbols are '01'.",
        alphabet={"0", "1"},
        predicate=_pred_ends_with_01,
        reference_dfa_builder=_dfa_ends_with_01,
    ),
    "starts_with_1": RegularLanguage(
        language_id="starts_with_1",
        name="Starts With '1'",
        description="Non-empty binary strings whose first symbol is '1'.",
        alphabet={"0", "1"},
        predicate=_pred_starts_with_1,
        reference_dfa_builder=_dfa_starts_with_1,
    ),
    "even_zeros": RegularLanguage(
        language_id="even_zeros",
        name="Even Number of '0's",
        description="Binary strings containing an even number of '0' symbols (including ε and 1).",
        alphabet={"0", "1"},
        predicate=_pred_even_zeros,
        reference_dfa_builder=_dfa_even_zeros,
    ),
}


def get_language(language_id: str) -> RegularLanguage:
    """Retrieve a built-in language by ID."""
    if language_id not in BUILTIN_LANGUAGES:
        raise ValueError(
            f"Unknown language '{language_id}'. Supported languages: {list(BUILTIN_LANGUAGES.keys())}"
        )
    return BUILTIN_LANGUAGES[language_id]


def list_languages() -> List[Dict[str, Any]]:
    """Return public summary for all built-in languages."""
    result = []
    for lang in BUILTIN_LANGUAGES.values():
        ref_dfa = lang.get_reference_dfa()
        result.append({
            "id": lang.language_id,
            "name": lang.name,
            "description": lang.description,
            "alphabet": sorted(lang.alphabet),
            "reference_state_count": len(ref_dfa.states),
        })
    return result


def generate_all_strings_up_to_length(
    alphabet: List[str], max_length: int, min_length: int = 0
) -> List[str]:
    """Deterministically generate all strings over alphabet from min_length to max_length in shortlex order."""
    res: List[str] = []
    current_level = [""]
    if min_length <= 0 <= max_length:
        res.append("")

    for length in range(1, max_length + 1):
        next_level = []
        for prefix in current_level:
            for char in alphabet:
                s = prefix + char
                next_level.append(s)
                if length >= min_length:
                    res.append(s)
        current_level = next_level
    return res


def generate_dataset(
    language_id: str,
    sample_count: int = 100,
    min_length: int = 0,
    max_length: int = 10,
    positive_ratio: float = 0.5,
    noise_rate: float = 0.0,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """Generate a reproducible labeled dataset for a regular language.

    Args:
        language_id: Built-in regular language identifier.
        sample_count: Number of unique examples to generate.
        min_length: Minimum string length (>= 0).
        max_length: Maximum string length (>= min_length).
        positive_ratio: Target fraction of positive samples (0.0 to 1.0).
        noise_rate: Fraction of training labels to randomly flip (0.0 to 1.0).
        seed: Random seed for reproducibility. If None, a random seed is chosen.

    Returns:
        Dict containing:
            samples: list of sample dicts (id, string, label, true_label, source, is_noisy)
            metadata: generation configuration and seed
            summary: diversity and class balance metrics
    """
    if min_length < 0:
        raise ValueError(f"min_length must be >= 0, got {min_length}")
    if max_length < min_length:
        raise ValueError(f"max_length ({max_length}) cannot be less than min_length ({min_length})")
    if sample_count <= 0:
        raise ValueError(f"sample_count must be > 0, got {sample_count}")
    if not (0.0 <= positive_ratio <= 1.0):
        raise ValueError(f"positive_ratio must be between 0.0 and 1.0, got {positive_ratio}")
    if not (0.0 <= noise_rate <= 1.0):
        raise ValueError(f"noise_rate must be between 0.0 and 1.0, got {noise_rate}")

    lang = get_language(language_id)
    alphabet_sorted = sorted(lang.alphabet)

    if seed is None:
        seed = random.randint(1, 1000000)

    rng = random.Random(seed)

    # Strategy:
    # 1. If the total number of possible strings is small (<= 2048), generate the complete universe
    # 2. Otherwise, sample strings randomly with lengths distributed across [min_length, max_length]
    total_possible = sum(len(alphabet_sorted) ** l for l in range(min_length, max_length + 1))

    positive_pool: List[str] = []
    negative_pool: List[str] = []

    if total_possible <= 4096:
        all_strings = generate_all_strings_up_to_length(alphabet_sorted, max_length, min_length)
        for s in all_strings:
            if lang.label(s):
                positive_pool.append(s)
            else:
                negative_pool.append(s)
    else:
        # Sample candidates across length distribution
        seen: Set[str] = set()
        attempts = 0
        max_attempts = sample_count * 50

        # Include empty string if applicable
        if min_length == 0 and "" not in seen:
            seen.add("")
            if lang.label(""):
                positive_pool.append("")
            else:
                negative_pool.append("")

        while len(seen) < max(sample_count * 2, 200) and attempts < max_attempts:
            attempts += 1
            length = rng.randint(min_length, max_length)
            s = "".join(rng.choice(alphabet_sorted) for _ in range(length))
            if s not in seen:
                seen.add(s)
                if lang.label(s):
                    positive_pool.append(s)
                else:
                    negative_pool.append(s)

    # Shuffle pools with the seeded RNG
    rng.shuffle(positive_pool)
    rng.shuffle(negative_pool)

    # Target class counts
    target_pos = int(round(sample_count * positive_ratio))
    target_neg = sample_count - target_pos

    selected_pos = positive_pool[:target_pos]
    selected_neg = negative_pool[:target_neg]

    # If one pool did not have enough, backfill from the other
    if len(selected_pos) < target_pos:
        shortfall = target_pos - len(selected_pos)
        available_neg = negative_pool[target_neg : target_neg + shortfall]
        selected_neg.extend(available_neg)
    elif len(selected_neg) < target_neg:
        shortfall = target_neg - len(selected_neg)
        available_pos = positive_pool[target_pos : target_pos + shortfall]
        selected_pos.extend(available_pos)

    # Combine
    combined = [(s, 1) for s in selected_pos] + [(s, 0) for s in selected_neg]
    rng.shuffle(combined)

    # Apply label noise
    noisy_flips = 0
    if noise_rate > 0.0 and combined:
        num_to_flip = int(round(len(combined) * noise_rate))
        flip_indices = set(rng.sample(range(len(combined)), min(num_to_flip, len(combined))))
    else:
        flip_indices = set()

    samples = []
    symbol_counts: Dict[str, int] = {char: 0 for char in alphabet_sorted}
    lengths = []

    for idx, (s, true_label) in enumerate(combined):
        is_noisy = idx in flip_indices
        label = (1 - true_label) if is_noisy else true_label
        if is_noisy:
            noisy_flips += 1

        for char in s:
            if char in symbol_counts:
                symbol_counts[char] += 1
        lengths.append(len(s))

        samples.append({
            "id": f"sample-{idx + 1:04d}",
            "string": s,
            "label": label,
            "true_label": true_label,
            "source": "generated",
            "is_noisy": is_noisy,
        })

    # Summary statistics
    total_samples = len(samples)
    pos_count = sum(1 for item in samples if item["label"] == 1)
    neg_count = sum(1 for item in samples if item["label"] == 0)
    unique_strings_count = len({item["string"] for item in samples})

    diversity_summary = {
        "total_samples": total_samples,
        "positive_count": pos_count,
        "negative_count": neg_count,
        "positive_ratio": round(pos_count / total_samples, 4) if total_samples > 0 else 0.0,
        "unique_strings": unique_strings_count,
        "unique_ratio": round(unique_strings_count / total_samples, 4) if total_samples > 0 else 0.0,
        "distinct_lengths": len(set(lengths)),
        "min_length": min(lengths) if lengths else 0,
        "max_length": max(lengths) if lengths else 0,
        "symbol_frequencies": symbol_counts,
        "actual_noise_rate": round(noisy_flips / total_samples, 4) if total_samples > 0 else 0.0,
        "noisy_flips_count": noisy_flips,
    }

    return {
        "samples": samples,
        "metadata": {
            "language_id": language_id,
            "language_name": lang.name,
            "alphabet": alphabet_sorted,
            "sample_count": total_samples,
            "min_length": min_length,
            "max_length": max_length,
            "requested_positive_ratio": positive_ratio,
            "requested_noise_rate": noise_rate,
            "seed": seed,
        },
        "summary": diversity_summary,
    }

