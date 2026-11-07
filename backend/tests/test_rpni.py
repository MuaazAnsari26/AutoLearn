"""Unit tests for the RPNI automata inference algorithm."""

import pytest
from app.services.dataset_generator import get_language
from app.services.dfa import DFA
from app.services.equivalence import check_equivalence
from app.services.rpni import rpni


def test_rpni_learn_simple_language():
    # Target: ends with 1
    pos = ["1", "01", "11", "001", "101", "011", "111"]
    neg = ["", "0", "00", "10", "010", "110", "000"]

    res = rpni(positive_examples=pos, negative_examples=neg, alphabet={"0", "1"})
    learned: DFA = res["inferred_dfa"]

    # All positive must be accepted
    for p in pos:
        assert learned.accepts(p) is True

    # All negative must be rejected
    for n in neg:
        assert learned.accepts(n) is False

    assert res["training_consistency"] == 1.0


def test_rpni_contains_01():
    pos = ["01", "001", "101", "010", "011", "1010", "1101", "0001", "0011"]
    neg = ["", "0", "1", "00", "10", "11", "000", "100", "110", "111", "0000"]

    res = rpni(positive_examples=pos, negative_examples=neg, alphabet={"0", "1"})
    learned: DFA = res["inferred_dfa"]

    for p in pos:
        assert learned.accepts(p) is True
    for n in neg:
        assert learned.accepts(n) is False

    ref_dfa = get_language("contains_01").get_reference_dfa()
    equiv = check_equivalence(learned, ref_dfa)
    assert equiv["equivalent"] is True


def test_rpni_conflicting_labels():
    pos = ["01", "10"]
    neg = ["01", "11"]
    with pytest.raises(ValueError, match="conflicting labels"):
        rpni(positive_examples=pos, negative_examples=neg)


def test_rpni_empty_positive():
    with pytest.raises(ValueError, match="requires at least one positive example"):
        rpni(positive_examples=[], negative_examples=["0", "1"])


def test_rpni_empty_string_positive():
    # Language with empty string accepted
    pos = ["", "00", "11"]
    neg = ["0", "1", "01"]
    res = rpni(positive_examples=pos, negative_examples=neg, alphabet={"0", "1"})
    learned: DFA = res["inferred_dfa"]
    assert learned.accepts("") is True
    assert learned.accepts("0") is False
