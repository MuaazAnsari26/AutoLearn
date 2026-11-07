"""Validation utilities for automata components."""

from typing import Set


def validate_alphabet(alphabet: Set[str]) -> None:
    """Validate alphabet - each symbol must be a single character string.

    Args:
        alphabet: Set of symbols to validate.

    Raises:
        ValueError: If the alphabet is empty or contains invalid symbols.
    """
    if not alphabet:
        raise ValueError("Alphabet must not be empty.")
    for symbol in alphabet:
        if not isinstance(symbol, str):
            raise ValueError(
                f"Each symbol in the alphabet must be a string, got {type(symbol).__name__}."
            )
        if len(symbol) != 1:
            raise ValueError(
                f"Each symbol in the alphabet must be a single character, got '{symbol}' (length {len(symbol)})."
            )


def validate_states(states: Set[str]) -> None:
    """Validate states - must be non-empty, each must be a non-empty string.

    Args:
        states: Set of state names to validate.

    Raises:
        ValueError: If the states set is empty or contains invalid state names.
    """
    if not states:
        raise ValueError("States set must not be empty.")
    for state in states:
        if not isinstance(state, str):
            raise ValueError(
                f"Each state must be a string, got {type(state).__name__}."
            )
        if len(state) == 0:
            raise ValueError("Each state must be a non-empty string.")


def validate_input_string(input_string: str, alphabet: Set[str]) -> None:
    """Validate that all characters in the string are in the alphabet.

    Args:
        input_string: The input string to validate.
        alphabet: The valid alphabet.

    Raises:
        ValueError: If any character in the string is not in the alphabet.
    """
    for i, char in enumerate(input_string):
        if char not in alphabet:
            raise ValueError(
                f"Symbol '{char}' at position {i} is not in the alphabet {sorted(alphabet)}."
            )
