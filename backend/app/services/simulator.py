"""Simulation wrappers for DFA and NFA with enriched output."""

from __future__ import annotations

from typing import Any, Dict, List

from app.services.dfa import DFA
from app.services.nfa import NFA


def simulate_dfa(dfa: DFA, input_string: str) -> Dict[str, Any]:
    """Full DFA simulation with step-by-step trace conforming to Spec Section 9.3."""
    result = dfa.simulate(input_string)

    accepted: bool = result["accepted"]
    raw_steps = result["steps"]
    final_state = result["final_state"]
    total_steps = len(raw_steps)

    formatted_steps = []
    for idx, step in enumerate(raw_steps):
        formatted_steps.append({
            "index": idx,
            "symbol": step["symbol"],
            "from_state": step["from_state"],
            "to_state": step["to_state"],
        })

    display_string = repr(input_string) if input_string else "ε (empty string)"

    if accepted:
        message = (
            f"Accepted: final state '{final_state}' is an accepting state "
            f"after processing {display_string}."
        )
    else:
        if final_state is None:
            message = (
                f"Rejected: no valid transition defined for current state and symbol "
                f"while processing {display_string}."
            )
        else:
            message = (
                f"Rejected: final state '{final_state}' is not an accepting state "
                f"after processing {display_string}."
            )

    return {
        "type": "DFA",
        "input": input_string,
        "input_string": input_string,
        "accepted": accepted,
        "start_state": dfa.start_state,
        "final_state": final_state,
        "steps": formatted_steps,
        "total_steps": total_steps,
        "message": message,
    }


def simulate_nfa(nfa: NFA, input_string: str) -> Dict[str, Any]:
    """Full NFA simulation with active state tracking conforming to Spec Section 9.3."""
    result = nfa.simulate(input_string)

    accepted: bool = result["accepted"]
    raw_steps = result["steps"]
    final_active_states = result["final_active_states"]
    total_steps = len(raw_steps)

    formatted_steps = []
    for idx, step in enumerate(raw_steps):
        formatted_steps.append({
            "index": idx,
            "symbol": step["symbol"],
            "from_states": step.get("from_states", step.get("active_states_before", [])),
            "to_states": step.get("to_states", step.get("active_states_after", [])),
            "active_states": step.get("to_states", step.get("active_states_after", [])),
        })

    display_string = repr(input_string) if input_string else "ε (empty string)"

    if accepted:
        active_accepting = sorted(set(final_active_states) & nfa.accept_states)
        message = (
            f"Accepted: active state set {final_active_states} contains "
            f"accepting state(s) {active_accepting} after processing {display_string}."
        )
    else:
        message = (
            f"Rejected: none of the reachable states {final_active_states} "
            f"are accepting after processing {display_string}."
        )

    return {
        "type": "NFA",
        "input": input_string,
        "input_string": input_string,
        "accepted": accepted,
        "start_state": nfa.start_state,
        "final_active_states": final_active_states,
        "steps": formatted_steps,
        "total_steps": total_steps,
        "message": message,
    }
