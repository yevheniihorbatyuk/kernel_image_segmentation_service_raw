# app/ml/algorithms/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
import numpy as np
import time
from dataclasses import dataclass

@dataclass
class SegmentationMetrics:
    segments_count: int
    processing_time: float
    memory_usage: Optional[float] = None
    parameters_used: Optional[Dict[str, Any]] = None

class BaseSegmentationAlgorithm(ABC):
    """Base class for all segmentation algorithms."""
    
    def __init__(self, name: str, display_name: str):
        self.name = name
        self.display_name = display_name
        
    @abstractmethod
    def get_default_parameters(self) -> Dict[str, Any]:
        """Return default parameters for the algorithm."""
        pass
    
    @abstractmethod
    def get_parameter_ranges(self) -> Dict[str, Dict[str, Any]]:
        """Return parameter ranges and constraints."""
        pass
    
    @abstractmethod
    def segment(self, image: np.ndarray, parameters: Dict[str, Any]) -> Tuple[np.ndarray, SegmentationMetrics]:
        """
        Perform image segmentation.
        
        Args:
            image: Input image as numpy array (H, W, 3)
            parameters: Algorithm parameters
            
        Returns:
            Tuple of (segmented_labels, metrics)
        """
        pass
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image before segmentation."""
        # Convert to float and normalize to [0, 1]
        if image.dtype == np.uint8:
            image = image.astype(np.float32) / 255.0
        return image
    
    def postprocess_labels(self, labels: np.ndarray) -> np.ndarray:
        """Postprocess segmentation labels."""
        return labels.astype(np.int32)
