"""Unit tests for DFA minimization."""

import pytest
from app.services.dfa import DFA
from app.services.equivalence import check_equivalence
from app.services.minimization import minimize_dfa


def test_minimize_already_minimal():
    # Contains "01" is already 3 states
    dfa = DFA(
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
    res = minimize_dfa(dfa)
    assert res["minimized_state_count"] == 3
    # Check language preservation
    equiv = check_equivalence(dfa, res["minimized_dfa"])
    assert equiv["equivalent"] is True


def test_minimize_redundant_states():
    # DFA with two equivalent accepting states q1 and q2
    dfa = DFA(
        states={"q0", "q1", "q2"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q1",
            ("q0", "1"): "q2",
            ("q1", "0"): "q1",
            ("q1", "1"): "q1",
            ("q2", "0"): "q2",
            ("q2", "1"): "q2",
        },
        start_state="q0",
        accept_states={"q1", "q2"},
    )
    res = minimize_dfa(dfa)
    # q1 and q2 are equivalent (both accept anything thereafter)
    assert res["minimized_state_count"] < len(dfa.states)
    equiv = check_equivalence(dfa, res["minimized_dfa"])
    assert equiv["equivalent"] is True


def test_minimize_removes_unreachable_states():
    # DFA with unreachable state q_dead
    dfa = DFA(
        states={"q0", "q1", "q_dead"},
        alphabet={"0", "1"},
        transitions={
            ("q0", "0"): "q0",
            ("q0", "1"): "q1",
            ("q1", "0"): "q0",
            ("q1", "1"): "q1",
            ("q_dead", "0"): "q_dead",
            ("q_dead", "1"): "q_dead",
        },
        start_state="q0",
        accept_states={"q1"},
    )
    res = minimize_dfa(dfa)
    assert res["minimized_state_count"] == 2
    equiv = check_equivalence(dfa, res["minimized_dfa"])
    assert equiv["equivalent"] is True

