import React from 'react';
import { BookOpen, ShieldAlert, Cpu, CheckCircle2, Code2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">About AutoLearn & Algorithm Guide</h1>
        <p className="text-xs text-slate-500">
          Theoretical foundations, algorithms, built-in languages, and scientific limitations.
        </p>
      </div>

      {/* Scientific Limitation Card */}
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Fundamental Scientific Limitation</span>
        </div>
        <p className="text-xs leading-relaxed">
          A finite collection of positive and negative string examples does <strong>not</strong>{' '}
          uniquely determine an unknown regular language. Multiple distinct DFAs may agree
          perfectly on every supplied training sample (yielding 100% training consistency), yet
          disagree significantly on longer or unseen strings. Therefore, the output of the RPNI
          learner is a <em>minimal consistent hypothesis</em> under the provided evidence, not
          mathematical proof of exact language identity.
        </p>
      </div>

      {/* RPNI Explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            RPNI (Regular Positive & Negative Inference)
          </h2>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            RPNI is an exact state-merging grammatical inference algorithm for regular
            languages. It guarantees convergence in the limit from polynomial time and data,
            provided a characteristic sample is supplied.
          </p>

          <ol className="list-decimal pl-5 space-y-2 text-slate-700">
            <li>
              <strong>Prefix Tree Acceptor (PTA):</strong> A tree automaton is constructed from the
              positive examples <code className="bg-slate-100 px-1 rounded">P</code>. The root is the
              state for prefix <code className="bg-slate-100 px-1 rounded">ε</code>. States reached
              by full positive strings are marked accepting.
            </li>
            <li>
              <strong>Ordered State Merging:</strong> States are traversed in breadth-first /
              lexicographic order. We maintain a set of <em>RED</em> (core) states and <em>BLUE</em>{' '}
              (fringe) states.
            </li>
            <li>
              <strong>Folding & Determinization:</strong> When a blue state is tentatively merged
              into a red state, identical outgoing transitions are recursively merged to preserve
              determinism.
            </li>
            <li>
              <strong>Negative Constraint Verification:</strong> The merged candidate is tested
              against every negative example <code className="bg-slate-100 px-1 rounded">N</code>. If
              any negative string is accepted, the merge is rejected and undone.
            </li>
            <li>
              <strong>Minimization:</strong> The final consistent DFA is optionally minimized using
              Hopcroft's partition-refinement algorithm.
            </li>
          </ol>
        </div>
      </div>

      {/* Five Built-in Languages */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-slate-900">Built-in Regular Languages</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-900 block">1. Contains Substring '01'</span>
            <p className="text-slate-600">
              Binary strings containing '01' anywhere. Minimal DFA has 3 states.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-900 block">2. Even Number of '1's</span>
            <p className="text-slate-600">
              Parity condition: count of '1's % 2 == 0. Minimal DFA has 2 states.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-900 block">3. Ends with '01'</span>
            <p className="text-slate-600">
              Final two symbols must be '01'. Minimal DFA has 3 states.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-900 block">4. Starts with '1'</span>
            <p className="text-slate-600">
              First symbol must be '1' (ε and '0' rejected). Minimal DFA has 3 states.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 sm:col-span-2">
            <span className="font-bold text-slate-900 block">5. Even Number of '0's</span>
            <p className="text-slate-600">
              Parity condition: count of '0's % 2 == 0. Minimal DFA has 2 states.
            </p>
          </div>
        </div>
      </div>

      {/* Equivalence and Minimization */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900">
          DFA Minimization & Product-Automaton Equivalence
        </h3>
        <p>
          <strong>Minimization:</strong> Uses partition refinement to merge indistinguishable
          states, eliminating unreachable states and unreachable sink components while guaranteeing
          language equivalence.
        </p>
        <p>
          <strong>Equivalence BFS:</strong> Constructs the product automaton{' '}
          <code className="bg-slate-100 px-1 rounded">M1 × M2</code>. If a reachable pair{' '}
          <code className="bg-slate-100 px-1 rounded">(q1, q2)</code> differs in acceptance
          status, a distinguishing string is returned by tracing the BFS shortest path.
        </p>
      </div>
    </div>
  );
}

