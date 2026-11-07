"""Automata and learning Pydantic schemas for AutoLearn."""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class DFASchema(BaseModel):
    type: str = "DFA"
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, Any]
    start_state: str
    accept_states: List[str]
    is_complete: Optional[bool] = True


class NFASchema(BaseModel):
    type: str = "NFA"
    states: List[str]
    alphabet: List[str]
    transitions: Dict[str, Any]
    start_state: str
    accept_states: List[str]
    supports_epsilon: Optional[bool] = False


class LearnAutomatonRequest(BaseModel):
    alphabet: Optional[List[str]] = Field(default_factory=lambda: ["0", "1"])
    positive_examples: List[str]
    negative_examples: List[str]
    algorithm: str = Field(default="rpni")
    minimize_result: bool = Field(default=True)


class SimulateRequest(BaseModel):
    automaton: Dict[str, Any]
    input_string: str = Field(default="")


class EquivalenceRequest(BaseModel):
    dfa1: Dict[str, Any]
    dfa2: Dict[str, Any]


class MinimizeRequest(BaseModel):
    dfa: Dict[str, Any]


class ExperimentTrainingSizeRequest(BaseModel):
    language_id: str = "contains_01"
    sample_sizes: Optional[List[int]] = None
    test_size: int = 150
    seed: Optional[int] = 42


class ExperimentDiversityRequest(BaseModel):
    language_id: str = "contains_01"
    sample_count: int = 60
    test_size: int = 150
    seed: Optional[int] = 42


class ExperimentNoiseRequest(BaseModel):
    language_id: str = "contains_01"
    noise_rates: Optional[List[float]] = None
    sample_count: int = 80
    test_size: int = 150
    seed: Optional[int] = 42


class ExperimentInsufficientDataRequest(BaseModel):
    language_id: str = "contains_01"
    sample_count: int = 15
    seed: Optional[int] = 42

