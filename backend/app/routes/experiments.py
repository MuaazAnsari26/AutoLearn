"""Experiment execution routes for empirical automata learning studies."""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException

from app.schemas.automaton import (
    ExperimentDiversityRequest,
    ExperimentInsufficientDataRequest,
    ExperimentNoiseRequest,
    ExperimentTrainingSizeRequest,
)
from app.services.experiment_runner import (
    run_diversity_experiment,
    run_insufficient_data_experiment,
    run_noise_experiment,
    run_training_size_experiment,
)

router = APIRouter(tags=["Experiments"])


@router.post("/experiments/training-size")
def api_exp_training_size(req: ExperimentTrainingSizeRequest) -> Dict[str, Any]:
    """Run Experiment A: Training size vs. test accuracy, state count, and runtime."""
    try:
        return run_training_size_experiment(
            language_id=req.language_id,
            sample_sizes=req.sample_sizes,
            test_size=req.test_size,
            seed=req.seed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training size experiment failed: {str(e)}")


@router.post("/experiments/diversity")
def api_exp_diversity(req: ExperimentDiversityRequest) -> Dict[str, Any]:
    """Run Experiment B: Data diversity and length coverage comparison."""
    try:
        return run_diversity_experiment(
            language_id=req.language_id,
            sample_count=req.sample_count,
            test_size=req.test_size,
            seed=req.seed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diversity experiment failed: {str(e)}")


@router.post("/experiments/noise")
def api_exp_noise(req: ExperimentNoiseRequest) -> Dict[str, Any]:
    """Run Experiment C: Training label noise impact on inference."""
    try:
        return run_noise_experiment(
            language_id=req.language_id,
            noise_rates=req.noise_rates,
            sample_count=req.sample_count,
            test_size=req.test_size,
            seed=req.seed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Noise experiment failed: {str(e)}")


@router.post("/experiments/insufficient-data")
def api_exp_insufficient_data(req: ExperimentInsufficientDataRequest) -> Dict[str, Any]:
    """Run Experiment D: Insufficient data and length extrapolation test."""
    try:
        return run_insufficient_data_experiment(
            language_id=req.language_id,
            sample_count=req.sample_count,
            seed=req.seed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insufficient data experiment failed: {str(e)}")

