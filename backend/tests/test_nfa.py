"""Unit tests for NFA implementation."""

import pytest
from app.services.nfa import NFA


@pytest.fixture
def sample_nfa():
    """An NFA recognizing strings ending with '01'."""
    return NFA(
        states={"q0", "q1", "q2"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): {"q0", "q1"},
            ("q0", "1"): {"q0"},
            ("q1", "1"): {"q2"},
        },
        start_state="q0",
        accept_states={"q2"},
    )


def test_nfa_acceptance(sample_nfa):
    assert sample_nfa.accepts("01") is True
    assert sample_nfa.accepts("1101") is True
    assert sample_nfa.accepts("0001") is True
    assert sample_nfa.accepts("00") is False
    assert sample_nfa.accepts("10") is False
    assert sample_nfa.accepts("") is False


def test_nfa_simulation(sample_nfa):
    sim = sample_nfa.simulate("01")
    assert sim["accepted"] is True
    assert "q2" in sim["final_active_states"]
    assert len(sim["steps"]) == 2
    # First step on '0': from q0 -> {q0, q1}
    assert set(sim["steps"][0]["to_states"]) == {"q0", "q1"}
    # Second step on '1': from {q0, q1} -> {q0, q2}
    assert set(sim["steps"][1]["to_states"]) == {"q0", "q2"}


def test_nfa_dead_end():
    nfa = NFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={("q0", "0"): {"q1"}},
        start_state="q0",
        accept_states={"q1"},
    )
    # Reading '1' leads to empty set of active states
    assert nfa.accepts("1") is False
    sim = nfa.simulate("1")
    assert sim["final_active_states"] == []
    assert sim["accepted"] is False


def test_nfa_serialization(sample_nfa):
    data = sample_nfa.to_dict()
    assert data["type"] == "NFA"
    deserialized = NFA.from_dict(data)
    assert deserialized == sample_nfa
    assert deserialized.accepts("1101") is True

