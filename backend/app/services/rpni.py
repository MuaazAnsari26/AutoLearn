"""RPNI (Regular Positive and Negative Inference) state-merging algorithm."""

from __future__ import annotations

from collections import deque
import copy
from typing import Any, Dict, List, Optional, Set, Tuple

from app.services.dfa import DFA
from app.services.minimization import minimize_dfa
from app.utils.validation import validate_alphabet, validate_input_string


class PrefixTreeAcceptor:
    """Prefix Tree Acceptor (PTA) constructed from a set of positive examples."""

    def __init__(self, alphabet: Set[str]) -> None:
        self.alphabet: Set[str] = set(alphabet)
        # Prefix string -> integer state id
        self.prefix_to_state: Dict[str, int] = {"": 0}
        self.state_to_prefix: Dict[int, str] = {0: ""}
        # state -> symbol -> next_state
        self.transitions: Dict[int, Dict[str, int]] = {0: {}}
        self.accept_states: Set[int] = set()
        self.next_state_id = 1

    def insert(self, word: str) -> None:
        """Insert a positive word into the PTA and mark the terminal state accepting."""
        current_state = 0
        current_prefix = ""

        for char in word:
            current_prefix += char
            if char not in self.transitions[current_state]:
                state_id = self.next_state_id
                self.next_state_id += 1
                self.prefix_to_state[current_prefix] = state_id
                self.state_to_prefix[state_id] = current_prefix
                self.transitions[state_id] = {}
                self.transitions[current_state][char] = state_id
                current_state = state_id
            else:
                current_state = self.transitions[current_state][char]

        self.accept_states.add(current_state)


class MutableDFA:
    """A mutable deterministic finite automaton used during RPNI state merging."""

    def __init__(
        self,
        states: Set[int],
        alphabet: Set[str],
        transitions: Dict[int, Dict[str, int]],
        start_state: int,
        accept_states: Set[int],
    ) -> None:
        self.states: Set[int] = set(states)
        self.alphabet: Set[str] = set(alphabet)
        # state -> symbol -> target_state
        self.transitions: Dict[int, Dict[str, int]] = {
            s: dict(transitions.get(s, {})) for s in states
        }
        self.start_state: int = start_state
        self.accept_states: Set[int] = set(accept_states)

    def clone(self) -> MutableDFA:
        return MutableDFA(
            states=set(self.states),
            alphabet=set(self.alphabet),
            transitions={s: dict(t) for s, t in self.transitions.items()},
            start_state=self.start_state,
            accept_states=set(self.accept_states),
        )

    def accepts(self, word: str) -> bool:
        curr = self.start_state
        for char in word:
            if char not in self.transitions.get(curr, {}):
                return False
            curr = self.transitions[curr][char]
        return curr in self.accept_states

    def to_dfa(self) -> DFA:
        """Convert MutableDFA to canonical DFA with string state names."""
        sorted_states = sorted(self.states)
        state_name_map = {s: f"q{idx}" for idx, s in enumerate(sorted_states)}

        # Make sure start_state is q0
        if self.start_state in state_name_map and state_name_map[self.start_state] != "q0":
            # Swap mappings so start state is always q0
            old_q0_state = None
            for s, name in state_name_map.items():
                if name == "q0":
                    old_q0_state = s
                    break
            curr_start_name = state_name_map[self.start_state]
            if old_q0_state is not None:
                state_name_map[old_q0_state] = curr_start_name
                state_name_map[self.start_state] = "q0"

        canonical_states = {state_name_map[s] for s in self.states}
        canonical_accept = {state_name_map[s] for s in self.accept_states if s in self.states}
        canonical_transitions: Dict[Tuple[str, str], str] = {}

        for s in self.states:
            s_name = state_name_map[s]
            for sym, target in self.transitions.get(s, {}).items():
                if target in self.states:
                    canonical_transitions[(s_name, sym)] = state_name_map[target]

        return DFA(
            states=canonical_states,
            alphabet=self.alphabet,
            transitions=canonical_transitions,
            start_state="q0",
            accept_states=canonical_accept,
        )


def _merge_and_fold(
    dfa: MutableDFA,
    red_state: int,
    blue_state: int,
) -> Tuple[MutableDFA, bool]:
    """Tentatively merge blue_state into red_state and determinize (fold subtrees).

    Returns:
        (new_dfa, success_flag)
    """
    candidate = dfa.clone()

    # Disjoint-set union / mapping
    parent: Dict[int, int] = {s: s for s in candidate.states}

    def find(s: int) -> int:
        path = []
        while parent[s] != s:
            path.append(s)
            s = parent[s]
        for node in path:
            parent[node] = s
        return s

    def union(s1: int, s2: int) -> int:
        r1, r2 = find(s1), find(s2)
        if r1 == r2:
            return r1
        # Prefer keeping smaller/older id (red states are smaller)
        if r1 > r2:
            r1, r2 = r2, r1
        parent[r2] = r1
        return r1

    # Merge queue for folding
    merge_queue: deque[Tuple[int, int]] = deque([(red_state, blue_state)])

    # Record which pairs we already folded
    folded_pairs: Set[Tuple[int, int]] = set()

    while merge_queue:
        s1, s2 = merge_queue.popleft()
        r1, r2 = find(s1), find(s2)
        if r1 == r2:
            continue

        rep = union(r1, r2)
        other = r2 if rep == r1 else r1

        pair_key = (min(r1, r2), max(r1, r2))
        if pair_key in folded_pairs:
            continue
        folded_pairs.add(pair_key)

        # Fold outgoing transitions
        # Collect transitions from both
        transitions_rep = dict(candidate.transitions.get(rep, {}))
        transitions_other = dict(candidate.transitions.get(other, {}))

        combined_transitions = dict(transitions_rep)
        for sym, target_other in transitions_other.items():
            if sym in combined_transitions:
                target_rep = combined_transitions[sym]
                if find(target_rep) != find(target_other):
                    merge_queue.append((target_rep, target_other))
            else:
                combined_transitions[sym] = target_other

        candidate.transitions[rep] = combined_transitions

        # Merge acceptance
        if other in candidate.accept_states:
            candidate.accept_states.add(rep)

    # Rebuild candidate with canonical partition representatives
    new_states = {find(s) for s in candidate.states}
    new_accept = {find(s) for s in candidate.accept_states}
    new_start = find(candidate.start_state)
    new_transitions: Dict[int, Dict[str, int]] = {s: {} for s in new_states}

    for s in candidate.states:
        s_rep = find(s)
        for sym, target in candidate.transitions.get(s, {}).items():
            target_rep = find(target)
            if sym not in new_transitions[s_rep]:
                new_transitions[s_rep][sym] = target_rep

    return (
        MutableDFA(
            states=new_states,
            alphabet=candidate.alphabet,
            transitions=new_transitions,
            start_state=new_start,
            accept_states=new_accept,
        ),
        True,
    )


def rpni(
    positive_examples: List[str],
    negative_examples: List[str],
    alphabet: Optional[Set[str]] = None,
    minimize_result: bool = True,
) -> Dict[str, Any]:
    """Execute the RPNI state-merging algorithm.

    Args:
        positive_examples: List of positive strings (P).
        negative_examples: List of negative strings (N).
        alphabet: Target alphabet. If None, inferred from examples.
        minimize_result: Whether to run DFA minimization on the inferred DFA.

    Returns:
        Dict with:
            inferred_dfa: The learned DFA object.
            algorithm: Algorithm metadata and variant.
            training_consistency: Ratio of training examples correctly classified.
            consistency_details: TP, TN, FP, FN counts on training data.
            state_counts: States before and after minimization.
            warnings: Any warnings (imbalance, small data, etc.).
    """
    # Deduplicate
    pos_set = set(positive_examples)
    neg_set = set(negative_examples)

    # Check for conflicts
    conflicts = pos_set & neg_set
    if conflicts:
        raise ValueError(
            f"Dataset contains conflicting labels for identical strings: {sorted(conflicts)}"
        )

    # Infer or validate alphabet
    inferred_alphabet: Set[str] = set()
    for s in pos_set | neg_set:
        inferred_alphabet.update(s)

    if alphabet is not None:
        target_alphabet = set(alphabet)
        validate_alphabet(target_alphabet)
        # Check that no sample has chars outside alphabet
        for s in pos_set | neg_set:
            validate_input_string(s, target_alphabet)
    else:
        if not inferred_alphabet:
            target_alphabet = {"0", "1"}
        else:
            target_alphabet = inferred_alphabet

    warnings: List[str] = []

    if not pos_set:
        raise ValueError(
            "RPNI requires at least one positive example to construct a Prefix Tree Acceptor."
        )

    if not neg_set:
        warnings.append(
            "No negative examples provided. Without negative constraints, RPNI cannot safely restrict over-generalization."
        )

    if len(pos_set) + len(neg_set) < 10:
        warnings.append(
            "Small training set (< 10 examples). Inferred model may under-generalize or over-fit specific prefixes."
        )

    # 1. Build Prefix Tree Acceptor (PTA) from positive examples
    pta = PrefixTreeAcceptor(target_alphabet)
    # Insert in shortlex order for deterministic construction
    sorted_pos = sorted(pos_set, key=lambda x: (len(x), x))
    for word in sorted_pos:
        pta.insert(word)

    # Create initial MutableDFA from PTA
    all_pta_states = set(pta.state_to_prefix.keys())
    current_dfa = MutableDFA(
        states=all_pta_states,
        alphabet=target_alphabet,
        transitions=pta.transitions,
        start_state=0,
        accept_states=pta.accept_states,
    )

    # 2. State-merging loop
    # Order states by prefix length then lexicographically (breadth-first in PTA)
    def state_sort_key(s_id: int) -> Tuple[int, str]:
        prefix = pta.state_to_prefix.get(s_id, "")
        return (len(prefix), prefix)

    # RED = core states of learned DFA (initially start state)
    red_states: Set[int] = {0}

    def get_blue_states(curr: MutableDFA, red: Set[int]) -> List[int]:
        """BLUE states are non-red states directly reachable from RED states."""
        blue: Set[int] = set()
        for r in red:
            for sym, target in curr.transitions.get(r, {}).items():
                if target in curr.states and target not in red:
                    blue.add(target)
        return sorted(blue, key=state_sort_key)

    blue_list = get_blue_states(current_dfa, red_states)

    while blue_list:
        q_blue = blue_list[0]
        merged = False

        # Try merging q_blue with an existing red state in order
        sorted_red = sorted(red_states, key=state_sort_key)
        for q_red in sorted_red:
            candidate_dfa, ok = _merge_and_fold(current_dfa, q_red, q_blue)
            if not ok:
                continue

            # Consistency check: does candidate accept ANY negative sample?
            consistent = True
            for neg_word in neg_set:
                if candidate_dfa.accepts(neg_word):
                    consistent = False
                    break

            if consistent:
                # Accept merge!
                current_dfa = candidate_dfa
                # Update red states that still exist in current_dfa
                red_states = {s for s in red_states if s in current_dfa.states}
                merged = True
                break

        if not merged:
            # Promote q_blue to RED
            red_states.add(q_blue)

        blue_list = get_blue_states(current_dfa, red_states)

    # Convert to canonical DFA
    learned_dfa = current_dfa.to_dfa()
    states_before_min = len(learned_dfa.states)

    if minimize_result:
        min_result = minimize_dfa(learned_dfa)
        final_dfa = min_result["minimized_dfa"]
        states_after_min = min_result["minimized_state_count"]
    else:
        final_dfa = learned_dfa
        states_after_min = states_before_min

    # Verify training consistency
    correct_pos = sum(1 for w in pos_set if final_dfa.accepts(w))
    correct_neg = sum(1 for w in neg_set if not final_dfa.accepts(w))
    total_training = len(pos_set) + len(neg_set)
    correct_total = correct_pos + correct_neg
    training_consistency = round(correct_total / total_training, 4) if total_training > 0 else 1.0

    return {
        "inferred_dfa": final_dfa,
        "algorithm": {
            "name": "RPNI",
            "variant": "Blue-Fringe Deterministic State-Merging",
            "description": "Prefix-tree acceptor construction with ordered state-folding and negative constraint verification.",
        },
        "training_consistency": training_consistency,
        "consistency_details": {
            "positive_total": len(pos_set),
            "positive_correct": correct_pos,
            "negative_total": len(neg_set),
            "negative_correct": correct_neg,
            "total_examples": total_training,
            "correct_examples": correct_total,
        },
        "state_counts": {
            "inferred_states": states_before_min,
            "minimized_states": states_after_min,
            "reduction": states_before_min - states_after_min,
        },
        "warnings": warnings,
    }

