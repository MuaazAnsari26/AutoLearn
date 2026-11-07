"""Unit tests for DFA equivalence checking."""

import pytest
from app.services.dfa import DFA
from app.services.equivalence import check_equivalence


def test_equivalence_identical():
    dfa = DFA(
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
    res = check_equivalence(dfa, dfa)
    assert res["equivalent"] is True
    assert res["distinguishing_string"] is None


def test_inequivalent_with_distinguishing_string():
    # DFA1: accepts strings containing "0"
    dfa1 = DFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q1",
            ("q0", "1"): "q0",
            ("q1", "0"): "q1",
            ("q1", "1"): "q1",
        },
        start_state="q0",
        accept_states={"q1"},
    )

    # DFA2: accepts strings containing "1"
    dfa2 = DFA(
        states={"s0", "s1"},
        alphabet={"0", "1"},
        transitions={
            ("s0", "0"): "s0",
            ("s0", "1"): "s1",
            ("s1", "0"): "s1",
            ("s1", "1"): "s1",
        },
        start_state="s0",
        accept_states={"s1"},
    )

    res = check_equivalence(dfa1, dfa2)
    assert res["equivalent"] is False
    assert res["distinguishing_string"] is not None
    d_str = res["distinguishing_string"]
    # Verify that one accepts and one rejects the distinguishing string
    assert dfa1.accepts(d_str) != dfa2.accepts(d_str)


def test_mismatched_alphabets():
    dfa1 = DFA(states={"q0"}, alphabet={"0"}, transitions={("q0", "0"): "q0"}, start_state="q0", accept_states={"q0"})
    dfa2 = DFA(states={"s0"}, alphabet={"1"}, transitions={("s0", "1"): "s0"}, start_state="s0", accept_states={"s0"})
    with pytest.raises(ValueError, match="alphabets differ"):
        check_equivalence(dfa1, dfa2)

