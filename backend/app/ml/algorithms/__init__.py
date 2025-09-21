# app/ml/algorithms/__init__.py
from .felzenszwalb import FelzenszwalbAlgorithm
from .slic import SLICAlgorithm
from .quickshift import QuickshiftAlgorithm
from .watershed import WatershedAlgorithm
from .base import BaseSegmentationAlgorithm, SegmentationMetrics
from typing import Dict, Any, Tuple, Optional

# Algorithm registry
ALGORITHM_REGISTRY = {
    "felzenszwalb": FelzenszwalbAlgorithm,
    "slic": SLICAlgorithm,
    "quickshift": QuickshiftAlgorithm,
    "watershed": WatershedAlgorithm
}

def get_algorithm(name: str) -> BaseSegmentationAlgorithm:
    """Get algorithm instance by name."""
    if name not in ALGORITHM_REGISTRY:
        raise ValueError(f"Unknown algorithm: {name}")
    return ALGORITHM_REGISTRY[name]()

def get_available_algorithms() -> Dict[str, BaseSegmentationAlgorithm]:
    """Get all available algorithms."""
    return {name: cls() for name, cls in ALGORITHM_REGISTRY.items()}