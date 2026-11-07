"""Unit tests for built-in regular languages and dataset generation."""

import pytest
from app.services.dataset_generator import (
    BUILTIN_LANGUAGES,
    generate_dataset,
    get_language,
    list_languages,
)
from app.services.equivalence import check_equivalence


def test_list_languages():
    langs = list_languages()
    assert len(langs) == 5
    ids = {l["id"] for l in langs}
    assert ids == {"contains_01", "even_ones", "ends_with_01", "starts_with_1", "even_zeros"}


@pytest.mark.parametrize(
    "lang_id,pos_examples,neg_examples",
    [
        ("contains_01", ["01", "101", "0011"], ["00", "111", "0", "1", ""]),
        ("even_ones", ["", "0", "11", "101", "00"], ["1", "111", "10", "0100"]),
        ("ends_with_01", ["01", "101", "1101"], ["10", "100", "0", "1", ""]),
        ("starts_with_1", ["1", "10", "111", "1001"], ["", "0", "001", "01"]),
        ("even_zeros", ["", "1", "11", "00", "1010"], ["0", "000", "01", "10"]),
    ],
)
def test_all_builtin_predicates_and_reference_dfas(lang_id, pos_examples, neg_examples):
    lang = get_language(lang_id)
    ref_dfa = lang.get_reference_dfa()

    for pos in pos_examples:
        assert lang.label(pos) is True, f"Expected {pos} to be positive for {lang_id}"
        assert ref_dfa.accepts(pos) is True, f"Expected ref_dfa to accept {pos} for {lang_id}"

    for neg in neg_examples:
        assert lang.label(neg) is False, f"Expected {neg} to be negative for {lang_id}"
        assert ref_dfa.accepts(neg) is False, f"Expected ref_dfa to reject {neg} for {lang_id}"


def test_dataset_generation_reproducibility():
    d1 = generate_dataset("contains_01", sample_count=50, seed=123)
    d2 = generate_dataset("contains_01", sample_count=50, seed=123)
    strings1 = [s["string"] for s in d1["samples"]]
    strings2 = [s["string"] for s in d2["samples"]]
    assert strings1 == strings2


def test_dataset_generation_noise():
    gen = generate_dataset("contains_01", sample_count=100, noise_rate=0.20, seed=42)
    samples = gen["samples"]
    noisy_samples = [s for s in samples if s["is_noisy"]]
    assert len(noisy_samples) > 0
    for s in noisy_samples:
        assert s["label"] != s["true_label"]
