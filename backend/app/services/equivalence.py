"""DFA equivalence checking via product automaton construction."""

from __future__ import annotations

from collections import deque
from typing import Any, Dict, List, Optional, Set, Tuple

from app.services.dfa import DFA


def check_equivalence(dfa1: DFA, dfa2: DFA) -> Dict[str, Any]:
    """Check whether two DFAs recognize the same language.

    Uses a product automaton approach:
        1. Complete both DFAs.
        2. Build the product automaton with states (s1, s2).
        3. BFS from (start1, start2).
        4. If a pair is found where one state is accepting and the other is not,
           reconstruct the distinguishing string.

    Args:
        dfa1: The first DFA.
        dfa2: The second DFA.

    Returns:
        A dict with keys:
            equivalent (bool): True if the DFAs are equivalent.
            distinguishing_string (str | None): A string accepted by one DFA
                but not the other, or None if they are equivalent.
            states_explored (int): Number of product states explored.
            explanation (str): Human-readable explanation.

    Raises:
        ValueError: If the alphabets of the two DFAs do not match.
    """
    if dfa1.alphabet != dfa2.alphabet:
        raise ValueError(
            f"Cannot check equivalence: alphabets differ. "
            f"DFA1 alphabet: {sorted(dfa1.alphabet)}, "
            f"DFA2 alphabet: {sorted(dfa2.alphabet)}."
        )

    # Step 1: Complete both DFAs
    c1 = dfa1.complete()
    c2 = dfa2.complete()

    alphabet = c1.alphabet
    sorted_alphabet = sorted(alphabet)

    # Step 2 & 3: BFS through product automaton
    start_pair: Tuple[str, str] = (c1.start_state, c2.start_state)

    visited: Set[Tuple[str, str]] = {start_pair}
    # parent_map stores: current_pair -> (parent_pair, symbol_taken)
    parent_map: Dict[Tuple[str, str], Optional[Tuple[Tuple[str, str], str]]] = {
        start_pair: None,
    }
    queue: deque[Tuple[str, str]] = deque([start_pair])
    states_explored: int = 0

    distinguishing_pair: Optional[Tuple[str, str]] = None

    while queue:
        s1, s2 = queue.popleft()
        states_explored += 1

        # Step 4: Check if acceptance differs
        s1_accepts = s1 in c1.accept_states
        s2_accepts = s2 in c2.accept_states

        if s1_accepts != s2_accepts:
            distinguishing_pair = (s1, s2)
            break

        # Explore neighbors
        for symbol in sorted_alphabet:
            next_s1 = c1.transitions.get((s1, symbol))
            next_s2 = c2.transitions.get((s2, symbol))

            # Both DFAs are complete, so these should always exist
            if next_s1 is None or next_s2 is None:
                continue

            next_pair = (next_s1, next_s2)
            if next_pair not in visited:
                visited.add(next_pair)
                parent_map[next_pair] = ((s1, s2), symbol)
                queue.append(next_pair)

    if distinguishing_pair is None:
        return {
            "equivalent": True,
            "distinguishing_string": None,
            "states_explored": states_explored,
            "explanation": (
                "The DFAs are equivalent. No distinguishing string exists. "
                f"{states_explored} product states were explored."
            ),
        }

    # Step 5: Reconstruct the distinguishing string by backtracking through parent_map
    path_symbols: List[str] = []
    current = distinguishing_pair
    while parent_map[current] is not None:
        parent_pair, symbol = parent_map[current]
        path_symbols.append(symbol)
        current = parent_pair
    path_symbols.reverse()
    distinguishing_string = "".join(path_symbols)

    # Determine which DFA accepts and which rejects
    ds1, ds2 = distinguishing_pair
    dfa1_accepts = ds1 in c1.accept_states
    dfa2_accepts = ds2 in c2.accept_states

    if dfa1_accepts:
        explanation = (
            f"The DFAs are NOT equivalent. The string '{distinguishing_string}' "
            f"is accepted by DFA1 but rejected by DFA2. "
            f"{states_explored} product states were explored."
        )
    else:
        explanation = (
            f"The DFAs are NOT equivalent. The string '{distinguishing_string}' "
            f"is rejected by DFA1 but accepted by DFA2. "
            f"{states_explored} product states were explored."
        )

    return {
        "equivalent": False,
        "distinguishing_string": distinguishing_string,
        "states_explored": states_explored,
        "explanation": explanation,
    }
