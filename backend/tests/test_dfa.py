"""Unit tests for DFA implementation."""

import pytest
from app.services.dfa import DFA


@pytest.fixture
def sample_dfa():
    """A DFA recognizing binary strings that contain '01'."""
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


def test_dfa_acceptance(sample_dfa):
    assert sample_dfa.accepts("01") is True
    assert sample_dfa.accepts("101") is True
    assert sample_dfa.accepts("0011") is True
    assert sample_dfa.accepts("00") is False
    assert sample_dfa.accepts("111") is False
    assert sample_dfa.accepts("") is False


def test_dfa_empty_string():
    # DFA that accepts only empty string or starts with 0
    dfa = DFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={("q0", "0"): "q0", ("q0", "1"): "q1", ("q1", "0"): "q1", ("q1", "1"): "q1"},
        start_state="q0",
        accept_states={"q0"},
    )
    assert dfa.accepts("") is True
    assert dfa.accepts("000") is True
    assert dfa.accepts("1") is False


def test_dfa_invalid_symbol(sample_dfa):
    with pytest.raises(ValueError, match="is not in the alphabet"):
        sample_dfa.accepts("012")


def test_dfa_simulation(sample_dfa):
    sim = sample_dfa.simulate("101")
    assert sim["accepted"] is True
    assert sim["final_state"] == "q2"
    assert len(sim["steps"]) == 3
    assert sim["steps"][0] == {"from_state": "q0", "symbol": "1", "to_state": "q0"}
    assert sim["steps"][1] == {"from_state": "q0", "symbol": "0", "to_state": "q1"}
    assert sim["steps"][2] == {"from_state": "q1", "symbol": "1", "to_state": "q2"}


def test_dfa_complete():
    # Partial DFA
    dfa = DFA(
        states={"q0", "q1"},
        alphabet={"0", "1"},
        transitions={("q0", "0"): "q1"},
        start_state="q0",
        accept_states={"q1"},
    )
    assert dfa.is_complete is False
    completed = dfa.complete()
    assert completed.is_complete is True
    assert "sink" in completed.states or any("sink" in s for s in completed.states)
    assert completed.accepts("0") is True
    assert completed.accepts("1") is False


def test_dfa_serialization(sample_dfa):
    data = sample_dfa.to_dict()
    assert data["type"] == "DFA"
    assert "q0" in data["states"]
    assert "q2" in data["accept_states"]
    deserialized = DFA.from_dict(data)
    assert deserialized == sample_dfa
    assert deserialized.accepts("101") is True
