"""Automata learning endpoint using genuine RPNI."""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException

from app.schemas.automaton import LearnAutomatonRequest
from app.services.rpni import rpni

router = APIRouter(tags=["Learning"])


@router.post("/automata/learn")
def api_learn_automaton(req: LearnAutomatonRequest) -> Dict[str, Any]:
    """Infer a DFA from positive and negative examples using RPNI state-merging."""
    if not req.positive_examples:
        raise HTTPException(
            status_code=400,
            detail="At least one positive example is required to build a Prefix Tree Acceptor.",
        )

    alphabet_set = set(req.alphabet) if req.alphabet else None

    try:
        result = rpni(
            positive_examples=req.positive_examples,
            negative_examples=req.negative_examples,
            alphabet=alphabet_set,
            minimize_result=req.minimize_result,
        )

        inferred_dfa = result["inferred_dfa"]

        return {
            "automaton": inferred_dfa.to_dict(),
            "algorithm": result["algorithm"],
            "training_consistency": result["training_consistency"],
            "consistency_details": result["consistency_details"],
            "state_counts": result["state_counts"],
            "warnings": result["warnings"],
            "scientific_note": (
                "Finite training examples do not uniquely determine an unknown regular language. "
                "The inferred DFA is a minimal consistent hypothesis under the given evidence."
            ),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automata learning failed: {str(e)}")

