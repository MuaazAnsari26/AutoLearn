"""Simulation routes for DFA and NFA."""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException

from app.schemas.automaton import SimulateRequest
from app.services.dfa import DFA
from app.services.nfa import NFA
from app.services.simulator import simulate_dfa, simulate_nfa

router = APIRouter(tags=["Simulation"])


@router.post("/automata/simulate")
def api_simulate_automaton(req: SimulateRequest) -> Dict[str, Any]:
    """Simulate string processing on a DFA or NFA."""
    auto_data = req.automaton
    auto_type = auto_data.get("type", "DFA").upper()

    try:
        if auto_type == "NFA":
            nfa = NFA.from_dict(auto_data)
            return simulate_nfa(nfa, req.input_string)
        else:
            dfa = DFA.from_dict(auto_data)
            return simulate_dfa(dfa, req.input_string)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

