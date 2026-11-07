import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  Network,
  PlayCircle,
  FlaskConical,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dataset', label: 'Dataset Generator', icon: Database },
  { to: '/learn', label: 'Learn Automaton', icon: BrainCircuit },
  { to: '/inspector', label: 'Automaton Inspector', icon: Network },
  { to: '/simulator', label: 'Simulator', icon: PlayCircle },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/settings', label: 'Settings / About', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-400">Theory of Computation</p>
          <p>Automata Inference Studio</p>
          <p className="text-[10px] text-slate-600">RPNI • DFA • NFA • Equivalence</p>
        </div>
      </aside>
    </>
  );
}

