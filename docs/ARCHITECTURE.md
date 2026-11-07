# AutoLearn System Architecture

## Overview
AutoLearn is an educational and exploratory platform for Theory of Computation (TOC) and Machine Learning from Grammatical Inference. It demonstrates the inference of approximate Deterministic Finite Automata (DFA) from finite sets of labeled positive and negative strings using the **RPNI (Regular Positive and Negative Inference)** state-merging algorithm.

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│  - React Flow Canvas (@xyflow/react)                   │
│  - Recharts for Experiment Visualizations              │
│  - Interactive Simulator & Transition Table            │
│  - WorkspaceContext & Axios API client                 │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (port 8000)
┌───────────────────────────▼────────────────────────────┐
│                   Backend (FastAPI)                    │
│  ├── routes/                                           │
│  │   ├── health.py, datasets.py, learning.py          │
│  │   ├── simulation.py, automata.py, experiments.py   │
│  ├── services/                                         │
│  │   ├── dfa.py (DFA model, trace simulator)           │
│  │   ├── nfa.py (NFA model, active state-set)          │
│  │   ├── rpni.py (PTA & blue-fringe state-merging)     │
│  │   ├── minimization.py (Hopcroft refinement)        │
│  │   ├── equivalence.py (Product-automaton BFS)        │
│  │   ├── dataset_generator.py (5 built-in languages)  │
│  │   ├── experiment_runner.py (4 experiment suites)   │
│  │   └── metrics.py (TP/TN/FP/FN/Acc/F1/Precision)     │
│  └── schemas/ (Pydantic validation models)             │
└────────────────────────────────────────────────────────┘
```

## Architectural Highlights

### 1. Data Contracts
- **DFA / NFA JSON**: Nested mapping `state -> symbol -> target(s)`.
- **Simulation**: Provides complete execution traces (states visited, symbols read, acceptance flags).
- **RPNI Learner**: Ingestion of learner-visible labels (isolated from clean evaluation labels).

### 2. Separation of Concerns
- The backend automata algorithms have zero dependency on UI libraries or external black-box automata packages.
- Minimization uses Hopcroft's partition-refinement algorithm.
- Equivalence checks construct the synchronous product DFA and backtrack a concrete distinguishing string if inequivalent.

