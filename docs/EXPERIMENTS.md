# AutoLearn Experimentation Suite

AutoLearn provides four reproducible empirical experiment suites:

## 1. Training Size Experiment
- **Hypothesis**: Increasing sample size transitions the inferred hypothesis from under-generalized PTA-like subtrees to the exact minimal target DFA.
- **Controlled Setup**: Fix test set (disjoint held-out strings), vary training sample size (e.g. 10 to 100).
- **Recorded Metrics**: Test Accuracy, Precision, Recall, F1-Score, Inferred States, Runtime (ms), Exact Reference Equivalence.

## 2. Data Diversity Experiment
- **Hypothesis**: Datasets with broader string length distributions and high prefix/suffix diversity produce accurate models faster than narrow-length datasets.
- **Strategies**: Compare narrow (e.g. length 0-3) vs broad (e.g. length 0-10) pools.

## 3. Label Noise Experiment
- **Hypothesis**: Random label flipping creates contradictory transitions and inconsistent constraints, forcing RPNI to create excessive states or fail consistency.
- **Parameters**: 0%, 5%, 10%, 20%, 30% flipped labels. Clean test set is kept uncorrupted.

## 4. Insufficient Data & Generalization Experiment
- **Hypothesis**: Models trained on short strings fail to generalize to longer strings when characteristic transitions (e.g. loopbacks) have not been observed in training evidence.
- **Setup**: Train on strings of length $\le 4$, evaluate on strings of length $5 \dots 10$.

