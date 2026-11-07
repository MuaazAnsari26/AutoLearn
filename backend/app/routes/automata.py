"""Automata transformation and analysis routes."""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException

from app.schemas.automaton import EquivalenceRequest, MinimizeRequest
from app.services.dataset_generator import get_language
from app.services.dfa import DFA
from app.services.equivalence import check_equivalence
from app.services.minimization import minimize_dfa

router = APIRouter(tags=["Automata"])


@router.post("/automata/minimize")
def api_minimize_dfa(req: MinimizeRequest) -> Dict[str, Any]:
    """Minimize a DFA using partition refinement (Hopcroft's algorithm)."""
    try:
        dfa = DFA.from_dict(req.dfa)
        res = minimize_dfa(dfa)
        min_dfa: DFA = res["minimized_dfa"]
        return {
            "minimized_dfa": min_dfa.to_dict(),
            "original_state_count": res["original_state_count"],
            "minimized_state_count": res["minimized_state_count"],
            "states_removed": res["states_removed"],
            "state_mapping": res["state_mapping"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minimization failed: {str(e)}")


@router.post("/automata/equivalence")
def api_check_equivalence(req: EquivalenceRequest) -> Dict[str, Any]:
    """Check equivalence of two DFAs using product-automaton BFS."""
    try:
        dfa1 = DFA.from_dict(req.dfa1)
        dfa2 = DFA.from_dict(req.dfa2)
        result = check_equivalence(dfa1, dfa2)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Equivalence check failed: {str(e)}")


@router.get("/automata/reference/{language_id}")
def api_get_reference_dfa(language_id: str) -> Dict[str, Any]:
    """Retrieve the minimal reference DFA for a built-in language."""
    try:
        lang = get_language(language_id)
        ref_dfa = lang.get_reference_dfa()
        return {
            "language_id": lang.language_id,
            "language_name": lang.name,
            "description": lang.description,
            "automaton": ref_dfa.to_dict(),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

