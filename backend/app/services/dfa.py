"""Deterministic Finite Automaton (DFA) implementation."""

from __future__ import annotations

import copy
from typing import Any, Dict, List, Optional, Set, Tuple

from app.utils.validation import validate_alphabet, validate_input_string, validate_states


class DFA:
    """A Deterministic Finite Automaton.

    Attributes:
        states: The finite set of states.
        alphabet: The finite input alphabet (each symbol is a single character).
        transitions: Mapping from (state, symbol) to a single next state.
        start_state: The designated start state.
        accept_states: The set of accepting (final) states.
    """

    def __init__(
        self,
        states: Set[str],
        alphabet: Set[str],
        transitions: Dict[Tuple[str, str], str],
        start_state: str,
        accept_states: Set[str],
    ) -> None:
        """Initialize and validate a DFA.

        Args:
            states: Set of state names.
            alphabet: Set of input symbols (single characters).
            transitions: Dict mapping (state, symbol) -> target state.
            start_state: The initial state.
            accept_states: Set of accepting states.

        Raises:
            ValueError: If any validation check fails.
        """
        # Store copies to prevent external mutation
        self.states: Set[str] = set(states)
        self.alphabet: Set[str] = set(alphabet)
        self.transitions: Dict[Tuple[str, str], str] = dict(transitions)
        self.start_state: str = start_state
        self.accept_states: Set[str] = set(accept_states)

        self._validate()

    def _validate(self) -> None:
        """Run all validation checks on the DFA components.

        Raises:
            ValueError: If any validation fails.
        """
        validate_states(self.states)
        validate_alphabet(self.alphabet)

        # Start state must be in states
        if self.start_state not in self.states:
            raise ValueError(
                f"Start state '{self.start_state}' is not in the set of states {sorted(self.states)}."
            )

        # Accept states must be a subset of states
        invalid_accept = self.accept_states - self.states
        if invalid_accept:
            raise ValueError(
                f"Accept states {sorted(invalid_accept)} are not in the set of states {sorted(self.states)}."
            )

        # Validate transitions
        for (state, symbol), target in self.transitions.items():
            if state not in self.states:
                raise ValueError(
                    f"Transition source state '{state}' is not in the set of states {sorted(self.states)}."
                )
            if symbol not in self.alphabet:
                raise ValueError(
                    f"Transition symbol '{symbol}' is not in the alphabet {sorted(self.alphabet)}."
                )
            if target not in self.states:
                raise ValueError(
                    f"Transition target state '{target}' is not in the set of states {sorted(self.states)}."
                )

        # Check determinism: each (state, symbol) pair should map to exactly one state.
        # Since we use a dict, duplicate keys are impossible; this is inherently satisfied.
        # But we explicitly check that no key appears with conflicting values
        # (this is guaranteed by dict, so this is a no-op, kept for clarity).

    def accepts(self, input_string: str) -> bool:
        """Determine whether the DFA accepts the given input string.

        Args:
            input_string: The string to test.

        Returns:
            True if the DFA accepts the string, False otherwise.

        Raises:
            ValueError: If any symbol in the string is not in the alphabet.
        """
        validate_input_string(input_string, self.alphabet)

        current_state: str = self.start_state
        for symbol in input_string:
            key = (current_state, symbol)
            if key not in self.transitions:
                # Incomplete DFA — no transition means reject
                return False
            current_state = self.transitions[key]

        return current_state in self.accept_states

    def simulate(self, input_string: str) -> Dict[str, Any]:
        """Simulate the DFA on the given input string with a step-by-step trace.

        Args:
            input_string: The string to simulate.

        Returns:
            A dict with keys:
                accepted (bool): Whether the string is accepted.
                steps (list): List of step dicts with from_state, symbol, to_state.
                final_state (str | None): The final state reached, or None if
                    simulation stopped early due to a missing transition.
                input_string (str): The original input string.

        Raises:
            ValueError: If any symbol is not in the alphabet.
        """
        validate_input_string(input_string, self.alphabet)

        steps: List[Dict[str, str]] = []
        current_state: str = self.start_state

        for symbol in input_string:
            key = (current_state, symbol)
            if key not in self.transitions:
                # No transition — stop, reject
                return {
                    "accepted": False,
                    "steps": steps,
                    "final_state": None,
                    "input_string": input_string,
                }
            next_state = self.transitions[key]
            steps.append({
                "from_state": current_state,
                "symbol": symbol,
                "to_state": next_state,
            })
            current_state = next_state

        return {
            "accepted": current_state in self.accept_states,
            "steps": steps,
            "final_state": current_state,
            "input_string": input_string,
        }

    def complete(self) -> DFA:
        """Return a new completed DFA with a sink state for missing transitions.

        If the DFA is already complete (every (state, symbol) pair has a
        transition), returns a copy of this DFA.

        Returns:
            A new DFA that is complete (total transition function).
        """
        # Check if already complete
        missing: List[Tuple[str, str]] = []
        for state in self.states:
            for symbol in self.alphabet:
                if (state, symbol) not in self.transitions:
                    missing.append((state, symbol))

        if not missing:
            # Already complete — return a copy
            return DFA(
                states=set(self.states),
                alphabet=set(self.alphabet),
                transitions=dict(self.transitions),
                start_state=self.start_state,
                accept_states=set(self.accept_states),
            )

        # Find a unique sink state name
        sink_name = "sink"
        counter = 0
        while sink_name in self.states:
            sink_name = f"sink_{counter}"
            counter += 1

        new_states = self.states | {sink_name}
        new_transitions = dict(self.transitions)

        # Add missing transitions pointing to sink
        for state, symbol in missing:
            new_transitions[(state, symbol)] = sink_name

        # Sink state transitions to itself on every symbol
        for symbol in self.alphabet:
            new_transitions[(sink_name, symbol)] = sink_name

        return DFA(
            states=new_states,
            alphabet=set(self.alphabet),
            transitions=new_transitions,
            start_state=self.start_state,
            accept_states=set(self.accept_states),
        )

    @property
    def is_complete(self) -> bool:
        """Check whether every (state, symbol) pair has a defined transition."""
        for state in self.states:
            for symbol in self.alphabet:
                if (state, symbol) not in self.transitions:
                    return False
        return True

    def to_dict(self) -> Dict[str, Any]:
        """Serialize the DFA to a JSON-compatible dictionary conforming to Spec Section 9.1.

        Transitions are formatted as nested mappings: state -> symbol -> target.
        """
        nested_transitions: Dict[str, Dict[str, str]] = {s: {} for s in sorted(self.states)}
        for (state, symbol), target in self.transitions.items():
            if state in nested_transitions:
                nested_transitions[state][symbol] = target

        return {
            "type": "DFA",
            "states": sorted(self.states),
            "alphabet": sorted(self.alphabet),
            "transitions": nested_transitions,
            "start_state": self.start_state,
            "accept_states": sorted(self.accept_states),
            "is_complete": self.is_complete,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> DFA:
        """Deserialize a DFA from a dictionary supporting both nested and flat transition formats."""
        states: Set[str] = set(data["states"])
        alphabet: Set[str] = set(data["alphabet"])
        start_state: str = data["start_state"]
        accept_states: Set[str] = set(data["accept_states"])

        raw_transitions = data.get("transitions", {})
        transitions: Dict[Tuple[str, str], str] = {}

        for key, val in raw_transitions.items():
            if isinstance(val, dict):
                # Nested format: key is state, val is {symbol: target}
                state = str(key)
                for sym, target in val.items():
                    transitions[(state, str(sym))] = str(target)
            else:
                # Flat format: key is "state,symbol", val is target
                parts = key.rsplit(",", 1)
                state = parts[0]
                symbol = parts[1]
                transitions[(state, symbol)] = str(val)

        return cls(
            states=states,
            alphabet=alphabet,
            transitions=transitions,
            start_state=start_state,
            accept_states=accept_states,
        )

    def __eq__(self, other: object) -> bool:
        """Check structural equality of two DFAs."""
        if not isinstance(other, DFA):
            return NotImplemented
        return (
            self.states == other.states
            and self.alphabet == other.alphabet
            and self.transitions == other.transitions
            and self.start_state == other.start_state
            and self.accept_states == other.accept_states
        )

    def __repr__(self) -> str:
        """Return a string representation of the DFA."""
        return (
            f"DFA(states={sorted(self.states)}, "
            f"alphabet={sorted(self.alphabet)}, "
            f"transitions={self.transitions}, "
            f"start_state='{self.start_state}', "
            f"accept_states={sorted(self.accept_states)})"
        )
