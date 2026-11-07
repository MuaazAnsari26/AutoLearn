"""Custom exceptions for AutoLearn API."""

from __future__ import annotations


class AutoLearnError(Exception):
    """Base exception for all AutoLearn domain errors."""
    pass


class ValidationError(AutoLearnError):
    """Raised when automata or dataset inputs fail validation."""
    pass


class LearningError(AutoLearnError):
    """Raised when RPNI fails to find a valid automaton."""
    pass

