"""Nondeterministic Finite Automaton (NFA) implementation."""

from __future__ import annotations

from typing import Any, Dict, List, Set, Tuple

from app.utils.validation import validate_alphabet, validate_input_string, validate_states


class NFA:
    """A Nondeterministic Finite Automaton (without epsilon-transitions).

    Attributes:
        states: The finite set of states.
        alphabet: The finite input alphabet (each symbol is a single character).
        transitions: Mapping from (state, symbol) to a *set* of next states.
        start_state: The designated start state.
        accept_states: The set of accepting (final) states.
    """

    def __init__(
        self,
        states: Set[str],
        alphabet: Set[str],
        transitions: Dict[Tuple[str, str], Set[str]],
        start_state: str,
        accept_states: Set[str],
    ) -> None:
        """Initialize and validate an NFA.

        Args:
            states: Set of state names.
            alphabet: Set of input symbols (single characters).
            transitions: Dict mapping (state, symbol) -> set of target states.
            start_state: The initial state.
            accept_states: Set of accepting states.

        Raises:
            ValueError: If any validation check fails.
        """
        self.states: Set[str] = set(states)
        self.alphabet: Set[str] = set(alphabet)
        self.transitions: Dict[Tuple[str, str], Set[str]] = {
            k: set(v) for k, v in transitions.items()
        }
        self.start_state: str = start_state
        self.accept_states: Set[str] = set(accept_states)

        self._validate()

    def _validate(self) -> None:
        """Run all validation checks on the NFA components.

        Raises:
            ValueError: If any validation fails.
        """
        validate_states(self.states)
        validate_alphabet(self.alphabet)

        if self.start_state not in self.states:
            raise ValueError(
                f"Start state '{self.start_state}' is not in the set of states {sorted(self.states)}."
            )

        invalid_accept = self.accept_states - self.states
        if invalid_accept:
            raise ValueError(
                f"Accept states {sorted(invalid_accept)} are not in the set of states {sorted(self.states)}."
            )

        for (state, symbol), targets in self.transitions.items():
            if state not in self.states:
                raise ValueError(
                    f"Transition source state '{state}' is not in the set of states {sorted(self.states)}."
                )
            if symbol not in self.alphabet:
                raise ValueError(
                    f"Transition symbol '{symbol}' is not in the alphabet {sorted(self.alphabet)}."
                )
            for target in targets:
                if target not in self.states:
                    raise ValueError(
                        f"Transition target state '{target}' is not in the set of states {sorted(self.states)}."
                    )

    def accepts(self, input_string: str) -> bool:
        """Determine whether the NFA accepts the given input string.

        Tracks a set of current active states. For each symbol, computes the
        union of transitions from all active states. Accepts if any final
        active state is an accepting state.

        Args:
            input_string: The string to test.

        Returns:
            True if the NFA accepts the string, False otherwise.

        Raises:
            ValueError: If any symbol in the string is not in the alphabet.
        """
        validate_input_string(input_string, self.alphabet)

        current_states: Set[str] = {self.start_state}

        for symbol in input_string:
            next_states: Set[str] = set()
            for state in current_states:
                key = (state, symbol)
                if key in self.transitions:
                    next_states |= self.transitions[key]
            current_states = next_states
            if not current_states:
                return False

        return bool(current_states & self.accept_states)

    def simulate(self, input_string: str) -> Dict[str, Any]:
        """Simulate the NFA on the given input string with step-by-step tracking.

        Args:
            input_string: The string to simulate.

        Returns:
            A dict with keys:
                accepted (bool): Whether the string is accepted.
                steps (list): List of step dicts, each containing:
                    symbol (str), active_states_before (sorted list),
                    active_states_after (sorted list).
                final_active_states (sorted list): The final set of active states.
                input_string (str): The original input string.

        Raises:
            ValueError: If any symbol is not in the alphabet.
        """
        validate_input_string(input_string, self.alphabet)

        steps: List[Dict[str, Any]] = []
        current_states: Set[str] = {self.start_state}

        for symbol in input_string:
            before = sorted(current_states)
            next_states: Set[str] = set()
            for state in current_states:
                key = (state, symbol)
                if key in self.transitions:
                    next_states |= self.transitions[key]
            current_states = next_states
            after = sorted(current_states)
            steps.append({
                "symbol": symbol,
                "from_states": before,
                "to_states": after,
                "active_states_before": before,
                "active_states_after": after,
            })

        final_active = sorted(current_states)
        accepted = bool(current_states & self.accept_states)

        return {
            "accepted": accepted,
            "steps": steps,
            "final_active_states": final_active,
            "input_string": input_string,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Serialize the NFA to a JSON-compatible dictionary conforming to Spec Section 9.2."""
        nested_transitions: Dict[str, Dict[str, List[str]]] = {s: {} for s in sorted(self.states)}
        for (state, symbol), targets in self.transitions.items():
            if state in nested_transitions:
                nested_transitions[state][symbol] = sorted(targets)

        return {
            "type": "NFA",
            "states": sorted(self.states),
            "alphabet": sorted(self.alphabet),
            "transitions": nested_transitions,
            "start_state": self.start_state,
            "accept_states": sorted(self.accept_states),
            "supports_epsilon": False,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> NFA:
        """Deserialize an NFA from a dictionary supporting both nested and flat transition formats."""
        states: Set[str] = set(data["states"])
        alphabet: Set[str] = set(data["alphabet"])
        start_state: str = data["start_state"]
        accept_states: Set[str] = set(data["accept_states"])

        raw_transitions = data.get("transitions", {})
        transitions: Dict[Tuple[str, str], Set[str]] = {}

        for key, val in raw_transitions.items():
            if isinstance(val, dict):
                # Nested format: key is state, val is {symbol: [targets]}
                state = str(key)
                for sym, targets in val.items():
                    transitions[(state, str(sym))] = set(targets)
            else:
                # Flat format: key is "state,symbol", val is [targets]
                parts = key.rsplit(",", 1)
                state = parts[0]
                symbol = parts[1]
                transitions[(state, symbol)] = set(val)

        return cls(
            states=states,
            alphabet=alphabet,
            transitions=transitions,
            start_state=start_state,
            accept_states=accept_states,
        )

    def __eq__(self, other: object) -> bool:
        """Check structural equality of two NFAs."""
        if not isinstance(other, NFA):
            return NotImplemented
        return (
            self.states == other.states
            and self.alphabet == other.alphabet
            and self.transitions == other.transitions
            and self.start_state == other.start_state
            and self.accept_states == other.accept_states
        )

    def __repr__(self) -> str:
        """Return a string representation of the NFA."""
        return (
            f"NFA(states={sorted(self.states)}, "
            f"alphabet={sorted(self.alphabet)}, "
            f"transitions={self.transitions}, "
            f"start_state='{self.start_state}', "
            f"accept_states={sorted(self.accept_states)})"
        )
