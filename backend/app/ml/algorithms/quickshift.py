import os
import time
from typing import Any, Dict, Tuple

import numpy as np
import psutil
from skimage.segmentation import quickshift

from .base import BaseSegmentationAlgorithm, SegmentationMetrics


class QuickshiftAlgorithm(BaseSegmentationAlgorithm):
    """Quickshift image segmentation."""
    
    def __init__(self):
        super().__init__("quickshift", "Quickshift")
    
    def get_default_parameters(self) -> Dict[str, Any]:
        return {
            "kernel_size": 3,
            "max_dist": 6,
            "ratio": 0.5
        }
    
    def get_parameter_ranges(self) -> Dict[str, Dict[str, Any]]:
        return {
            "kernel_size": {"min": 1, "max": 10, "step": 1, "type": "int"},
            "max_dist": {"min": 1, "max": 20, "step": 1, "type": "int"},
            "ratio": {"min": 0.1, "max": 1.0, "step": 0.1, "type": "float"}
        }
    
    def segment(self, image: np.ndarray, parameters: Dict[str, Any]) -> Tuple[np.ndarray, SegmentationMetrics]:
        start_time = time.time()
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024
        
        # Preprocess image
        processed_image = self.preprocess_image(image)
        
        # Apply Quickshift segmentation
        labels = quickshift(
            processed_image,
            kernel_size=parameters.get("kernel_size", 3),
            max_dist=parameters.get("max_dist", 6),
            ratio=parameters.get("ratio", 0.5),
            channel_axis=-1
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
