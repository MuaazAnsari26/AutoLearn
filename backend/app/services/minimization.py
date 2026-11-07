"""DFA minimization using Hopcroft's partition-refinement algorithm."""

from __future__ import annotations

from collections import deque
from typing import Any, Dict, List, Set, Tuple

from app.services.dfa import DFA


def minimize_dfa(dfa: DFA) -> Dict[str, Any]:
    """Minimize a DFA using Hopcroft's algorithm.

    Steps:
        1. Complete the DFA (add sink state for missing transitions).
        2. Remove unreachable states via BFS from the start state.
        3. Initial partition into accepting and non-accepting state groups.
        4. Partition refinement until stable.
        5. Build the minimized DFA from the final partition.

    Args:
        dfa: The DFA to minimize.

    Returns:
        A dict with keys:
            minimized_dfa (DFA): The minimized DFA.
            state_mapping (dict): Maps each old state to its new state name.
            original_state_count (int): Number of states in the original DFA.
            minimized_state_count (int): Number of states in the minimized DFA.
            states_removed (int): Difference between original and minimized counts.
    """
    original_state_count = len(dfa.states)

    # Step 1: Complete the DFA
    complete_dfa = dfa.complete()

    # Step 2: Remove unreachable states (BFS from start_state)
    reachable: Set[str] = set()
    queue: deque[str] = deque([complete_dfa.start_state])
    reachable.add(complete_dfa.start_state)

    while queue:
        state = queue.popleft()
        for symbol in complete_dfa.alphabet:
            key = (state, symbol)
            if key in complete_dfa.transitions:
                target = complete_dfa.transitions[key]
                if target not in reachable:
                    reachable.add(target)
                    queue.append(target)

    # Filter to reachable states only
    reachable_states = reachable
    reachable_accept = complete_dfa.accept_states & reachable_states
    reachable_non_accept = reachable_states - reachable_accept

    # Build filtered transitions (only among reachable states)
    reachable_transitions: Dict[Tuple[str, str], str] = {}
    for (s, sym), t in complete_dfa.transitions.items():
        if s in reachable_states and t in reachable_states:
            reachable_transitions[(s, sym)] = t

    # Step 3: Initial partition
    partition: List[Set[str]] = []
    if reachable_accept:
        partition.append(set(reachable_accept))
    if reachable_non_accept:
        partition.append(set(reachable_non_accept))

    # Handle edge case: no reachable states (shouldn't happen since start is always reachable)
    if not partition:
        # Degenerate — single-state DFA
        min_dfa = DFA(
            states={"q0"},
            alphabet=set(complete_dfa.alphabet),
            transitions={("q0", sym): "q0" for sym in complete_dfa.alphabet},
            start_state="q0",
            accept_states=set() if complete_dfa.start_state not in complete_dfa.accept_states else {"q0"},
        )
        return {
            "minimized_dfa": min_dfa,
            "state_mapping": {complete_dfa.start_state: "q0"},
            "original_state_count": original_state_count,
            "minimized_state_count": 1,
            "states_removed": original_state_count - 1,
        }

    # Helper: find which partition group a state belongs to
    def _group_index(state: str) -> int:
        for idx, group in enumerate(partition):
            if state in group:
                return idx
        raise ValueError(f"State '{state}' not found in any partition group.")

    # Step 4: Partition refinement
    changed = True
    while changed:
        changed = False
        new_partition: List[Set[str]] = []
        for group in partition:
            if len(group) <= 1:
                new_partition.append(group)
                continue

            # Try to split this group
            # For each symbol, check where each state in the group transitions to
            # (i.e., which partition group the target falls in)
            # Two states stay together iff they agree on the target group for every symbol.

            # Build a signature for each state: tuple of target group indices for each symbol (sorted)
            sorted_alphabet = sorted(complete_dfa.alphabet)
            signatures: Dict[Tuple[int, ...], Set[str]] = {}
            for state in group:
                sig_parts: List[int] = []
                for symbol in sorted_alphabet:
                    target = reachable_transitions.get((state, symbol))
                    if target is not None:
                        sig_parts.append(_group_index(target))
                    else:
                        sig_parts.append(-1)  # Should not happen in complete DFA
                sig = tuple(sig_parts)
                if sig not in signatures:
                    signatures[sig] = set()
                signatures[sig].add(state)

            if len(signatures) > 1:
                changed = True
                for sub_group in signatures.values():
                    new_partition.append(sub_group)
            else:
                new_partition.append(group)

        partition = new_partition

    # Step 5: Build minimized DFA
    # Name new states "q0", "q1", ... where "q0" is the group containing start_state
    state_to_group: Dict[str, int] = {}
    for idx, group in enumerate(partition):
        for state in group:
            state_to_group[state] = idx

    # Ensure the start state's group is named "q0"
    start_group_idx = state_to_group[complete_dfa.start_state]

    # Build name mapping: group index -> new state name
    group_name_map: Dict[int, str] = {}
    group_name_map[start_group_idx] = "q0"
    next_id = 1
    for idx in range(len(partition)):
        if idx not in group_name_map:
            group_name_map[idx] = f"q{next_id}"
            next_id += 1

    # Build state mapping: old state -> new state name
    state_mapping: Dict[str, str] = {}
    for state, group_idx in state_to_group.items():
        state_mapping[state] = group_name_map[group_idx]

    # Build new states set
    new_states: Set[str] = set(group_name_map.values())

    # Build new accept states
    new_accept_states: Set[str] = set()
    for idx, group in enumerate(partition):
        # A group is accepting if any state in it is accepting
        # (all states in the group have the same acceptance, by construction)
        representative = next(iter(group))
        if representative in reachable_accept:
            new_accept_states.add(group_name_map[idx])

    # Build new transitions
    new_transitions: Dict[Tuple[str, str], str] = {}
    for idx, group in enumerate(partition):
        representative = next(iter(group))
        for symbol in complete_dfa.alphabet:
            target = reachable_transitions.get((representative, symbol))
            if target is not None:
                target_group_idx = state_to_group[target]
                new_transitions[(group_name_map[idx], symbol)] = group_name_map[target_group_idx]

    new_start_state = "q0"

    minimized_dfa = DFA(
        states=new_states,
        alphabet=set(complete_dfa.alphabet),
        transitions=new_transitions,
        start_state=new_start_state,
        accept_states=new_accept_states,
    )

    minimized_state_count = len(new_states)

    return {
        "minimized_dfa": minimized_dfa,
        "state_mapping": state_mapping,
        "original_state_count": original_state_count,
        "minimized_state_count": minimized_state_count,
        "states_removed": original_state_count - minimized_state_count,
    }
