"""
Simple WHO/Europe (European Health Information Gateway) API client scaffold.

This is a starting point for programmatic access to EU/European health data
via the WHO/Europe Data Gateway API:
  - API documentation: https://gateway.euro.who.int/en/api/

The idea is:
  - You call this script with a dataset code and optional filters.
  - It fetches JSON from the WHO/Europe gateway.
  - It writes a CSV into the `data/` folder for use by the altruism engine.

NOTE:
  - This is a scaffold; you may need to refine dataset codes & filters
    based on the API documentation and your data needs.
"""

import csv
import json
from pathlib import Path
from typing import Dict, Any

import requests


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def fetch_gateway_dataset(dataset_code: str, params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """
    Fetch a dataset from the WHO/Europe gateway API.
    Example dataset codes and parameters must be taken from the official docs.
    """
    base_url = "https://gateway.euro.who.int/en/api/data/"
    url = base_url + dataset_code + "/"
    response = requests.get(url, params=params or {}, timeout=60)
    response.raise_for_status()
    return response.json()


def save_flat_csv(json_data: Dict[str, Any], out_path: Path) -> None:
    """
    Very simple flattener: expects a 'value' or 'data' field with rows that are
    dict-like. This may need customization based on the particular dataset.
    """
    # Heuristic: find first list of dicts in the JSON
    rows = None
    for key in ["value", "values", "data", "results"]:
        v = json_data.get(key)
        if isinstance(v, list) and v and isinstance(v[0], dict):
            rows = v
            break
    if rows is None:
        raise ValueError("Could not find a list of records in the JSON payload.")

    # Collect all keys
    fieldnames = sorted({k for row in rows for k in row.keys()})
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def example_fetch_health_expenditure():
    """
    Example usage fetching a plausible dataset; you must check the API docs to
    confirm dataset codes and parameters. Here we just demonstrate the pattern.
    """
    dataset_code = "health-expenditure"  # placeholder; adjust per docs
    try:
        data = fetch_gateway_dataset(dataset_code)
    except Exception as e:
        print(f"Error fetching dataset {dataset_code}: {e}")
        return

    out_csv = DATA_DIR / f"who_euro_{dataset_code}.csv"
    try:
        save_flat_csv(data, out_csv)
        print(f"Saved WHO/Europe dataset '{dataset_code}' to {out_csv}")
    except Exception as e:
        print(f"Error saving dataset {dataset_code} to CSV: {e}")


if __name__ == "__main__":
    example_fetch_health_expenditure()


