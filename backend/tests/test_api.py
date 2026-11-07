"""Integration tests for AutoLearn FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "autolearn-backend"}


def test_list_languages():
    response = client.get("/api/languages")
    assert response.status_code == 200
    langs = response.json()
    assert len(langs) == 5
    assert any(l["id"] == "contains_01" for l in langs)


def test_generate_dataset():
    response = client.post(
        "/api/datasets/generate",
        json={
            "language_id": "contains_01",
            "sample_count": 30,
            "min_length": 0,
            "max_length": 6,
            "positive_ratio": 0.5,
            "noise_rate": 0.0,
            "seed": 42,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["samples"]) == 30
    assert "summary" in data


def test_validate_dataset():
    response = client.post(
        "/api/datasets/validate",
        json={
            "samples": [
                {"id": "s1", "string": "01", "label": 1},
                {"id": "s2", "string": "01", "label": 0},
            ],
            "alphabet": ["0", "1"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert any("Conflicting" in err for err in data["errors"])


def test_learn_automaton():
    response = client.post(
        "/api/automata/learn",
        json={
            "alphabet": ["0", "1"],
            "positive_examples": ["01", "101", "001"],
            "negative_examples": ["00", "11", "10"],
            "algorithm": "rpni",
            "minimize_result": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "automaton" in data
    assert data["training_consistency"] == 1.0


def test_simulate_dfa():
    dfa_dict = {
        "type": "DFA",
        "states": ["q0", "q1"],
        "alphabet": ["0", "1"],
        "start_state": "q0",
        "accept_states": ["q1"],
        "transitions": {"q0": {"1": "q1", "0": "q0"}, "q1": {"0": "q1", "1": "q1"}},
    }
    response = client.post(
        "/api/automata/simulate",
        json={"automaton": dfa_dict, "input_string": "10"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["accepted"] is True
    assert len(data["steps"]) == 2


def test_equivalence():
    dfa1 = {
        "type": "DFA",
        "states": ["q0"],
        "alphabet": ["0", "1"],
        "start_state": "q0",
        "accept_states": ["q0"],
        "transitions": {"q0": {"0": "q0", "1": "q0"}},
    }
    dfa2 = {
        "type": "DFA",
        "states": ["s0"],
        "alphabet": ["0", "1"],
        "start_state": "s0",
        "accept_states": [],
        "transitions": {"s0": {"0": "s0", "1": "s0"}},
    }
    response = client.post(
        "/api/automata/equivalence",
        json={"dfa1": dfa1, "dfa2": dfa2},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["equivalent"] is False
    assert data["distinguishing_string"] == ""


def test_experiment_training_size_api():
    response = client.post(
        "/api/experiments/training-size",
        json={
            "language_id": "contains_01",
            "sample_sizes": [10, 20],
            "test_size": 30,
            "seed": 42,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["experiment_type"] == "training_size"
    assert len(data["results"]) == 2
    assert "summary" in data


def test_experiment_diversity_api():
    response = client.post(
        "/api/experiments/diversity",
        json={
            "language_id": "contains_01",
            "sample_count": 20,
            "test_size": 30,
            "seed": 42,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["experiment_type"] == "diversity"
    assert len(data["results"]) == 4


def test_experiment_noise_api():
    response = client.post(
        "/api/experiments/noise",
        json={
            "language_id": "contains_01",
            "noise_rates": [0.0, 0.1],
            "sample_count": 25,
            "test_size": 30,
            "seed": 42,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["experiment_type"] == "noise"
    assert len(data["results"]) == 2


def test_experiment_insufficient_data_api():
    response = client.post(
        "/api/experiments/insufficient-data",
        json={
            "language_id": "contains_01",
            "sample_count": 12,
            "seed": 42,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["experiment_type"] == "insufficient_data"
    assert "length_bucket_evaluations" in data
    assert "scientific_insight" in data

