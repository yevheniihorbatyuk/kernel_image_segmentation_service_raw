import os
import time
from typing import Any, Dict, Tuple

import numpy as np
import psutil
from skimage.segmentation import felzenszwalb
from skimage.measure import regionprops

from .base import BaseSegmentationAlgorithm, SegmentationMetrics

class FelzenszwalbAlgorithm(BaseSegmentationAlgorithm):
    """Felzenszwalb's efficient graph-based segmentation."""
    
    def __init__(self):
        super().__init__("felzenszwalb", "Felzenszwalb")
    
    def get_default_parameters(self) -> Dict[str, Any]:
        return {
            "scale": 100,
            "sigma": 0.5,
            "min_size": 50
        }
    
    def get_parameter_ranges(self) -> Dict[str, Dict[str, Any]]:
        return {
            "scale": {"min": 10, "max": 1000, "step": 10, "type": "int"},
            "sigma": {"min": 0.1, "max": 2.0, "step": 0.1, "type": "float"},
            "min_size": {"min": 10, "max": 500, "step": 10, "type": "int"}
        }
    
    def segment(self, image: np.ndarray, parameters: Dict[str, Any]) -> Tuple[np.ndarray, SegmentationMetrics]:
        start_time = time.time()
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024  # MB
        
        # Preprocess image
        processed_image = self.preprocess_image(image)
        
        # Apply Felzenszwalb segmentation
        labels = felzenszwalb(
            processed_image,
            scale=parameters.get("scale", 100),
            sigma=parameters.get("sigma", 0.5),
            min_size=parameters.get("min_size", 50)
        )
        
        # Postprocess labels
        labels = self.postprocess_labels(labels)
        
        # Calculate metrics
        processing_time = time.time() - start_time
        memory_after = process.memory_info().rss / 1024 / 1024
        memory_usage = memory_after - memory_before
        segments_count = len(np.unique(labels))
        
        metrics = SegmentationMetrics(
            segments_count=segments_count,
            processing_time=processing_time,
            memory_usage=memory_usage,
            parameters_used=parameters
        )
        
        return labels, metrics
