# Automata & Learning Algorithms Specification

## 1. Deterministic & Non-Deterministic Finite Automata
- **DFA**: $M = (Q, \Sigma, \delta, q_0, F)$ where $\delta: Q \times \Sigma \to Q$. Complete transition functions are enforced with an explicit rejecting sink state.
- **NFA**: $M = (Q, \Sigma, \delta, q_0, F)$ where $\delta: Q \times \Sigma \to 2^Q$. Simulation computes sets of reachable states dynamically across symbols without falsifying determinism.

## 2. RPNI (Regular Positive and Negative Inference)
RPNI solves the grammatical inference problem using blue-fringe state-merging:
1. **PTA Construction**: Construct a Prefix Tree Acceptor $PTA(S_+)$ from positive strings $S_+$.
2. **Red-Blue Partition**: Start with $q_0 \in RED$. States reachable via a single transition from $RED$ form $BLUE$.
3. **Merge & Fold**: In shortlex order, select $q_b \in BLUE$ and tentatively merge it with $q_r \in RED$. Subtrees are folded deterministically.
4. **Negative Consistency Check**: Check whether any negative sample $w \in S_-$ is accepted by the candidate automaton.
   - If inconsistent: Reject merge, restore candidate.
   - If consistent: Accept merge and retain folded structure.
5. If no merge with any $RED$ state is valid, promote $q_b$ to $RED$.
6. Repeat until no $BLUE$ states remain.

## 3. Hopcroft's DFA Minimization
1. Add explicit sink state for any undefined transitions.
2. Filter to states reachable from $q_0$ via BFS.
3. Partition states into $P = \{F, Q \setminus F\}$.
4. Iteratively refine partition groups based on the target group index of transitions for each symbol until stable.
5. Reconstruct canonical minimal DFA.

## 4. Product Automaton BFS Equivalence
1. For DFAs $M_1$ and $M_2$ over $\Sigma$, perform BFS on pairs $(s_1, s_2) \in Q_1 \times Q_2$ starting from $(q_{0,1}, q_{0,2})$.
2. If any reachable pair satisfies $(s_1 \in F_1 \land s_2 \notin F_2)$ or $(s_1 \notin F_1 \land s_2 \in F_2)$, backtrack using the predecessor map to output the distinguishing string $w$.
3. If all reachable pairs have matching acceptance, $L(M_1) = L(M_2)$.

