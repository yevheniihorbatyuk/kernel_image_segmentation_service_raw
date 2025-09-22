import os
import time
from typing import Any, Dict, Tuple

import numpy as np
import psutil
from skimage.feature import peak_local_max
from skimage.filters import sobel
from scipy import ndimage as ndi
from skimage.segmentation import watershed  # Додано імпорт watershed

from .base import BaseSegmentationAlgorithm, SegmentationMetrics


class WatershedAlgorithm(BaseSegmentationAlgorithm):
    """Watershed segmentation algorithm."""
    
    def __init__(self):
        super().__init__("watershed", "Watershed")
    
    def get_default_parameters(self) -> Dict[str, Any]:
        return {
            "markers": 250,
            "compactness": 0
        }
    
    def get_parameter_ranges(self) -> Dict[str, Dict[str, Any]]:
        return {
            "markers": {"min": 50, "max": 1000, "step": 10, "type": "int"},
            "compactness": {"min": 0, "max": 1, "step": 0.1, "type": "float"}
        }
    
    def segment(self, image: np.ndarray, parameters: Dict[str, Any]) -> Tuple[np.ndarray, SegmentationMetrics]:
        start_time = time.time()
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024
        
        # Preprocess image
        processed_image = self.preprocess_image(image)
        
        # Convert to grayscale for edge detection
        if len(processed_image.shape) == 3:
            gray_image = np.mean(processed_image, axis=2)
        else:
            gray_image = processed_image
        
        # Compute elevation map (edge magnitude)
        elevation = sobel(gray_image)
        
        # Generate markers using local maxima
        markers_count = parameters.get("markers", 250)
        
        # Find local maxima as markers using correct function and syntax
        local_maxima = peak_local_max(elevation, min_distance=10, num_peaks=markers_count, exclude_border=False)
        markers = np.zeros_like(gray_image, dtype=int)
        
        # Use correct indexing to assign markers
        for i, coords in enumerate(local_maxima):
            markers[tuple(coords)] = i + 1
        
        # Apply watershed
        labels = watershed(
            elevation,
            markers,
            compactness=parameters.get("compactness", 0)
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