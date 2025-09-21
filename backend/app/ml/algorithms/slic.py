import os
import time
from typing import Any, Dict, Tuple

import numpy as np
import psutil
from skimage.segmentation import slic

from .base import BaseSegmentationAlgorithm, SegmentationMetrics


class SLICAlgorithm(BaseSegmentationAlgorithm):
    """Simple Linear Iterative Clustering (SLIC) superpixels."""

    def __init__(self):
        super().__init__("slic", "SLIC")

    def get_default_parameters(self) -> Dict[str, Any]:
        return {
            "n_segments": 250,
            "compactness": 10,
            "sigma": 1,
            "start_label": 1
        }

    def get_parameter_ranges(self) -> Dict[str, Dict[str, Any]]:
        return {
            "n_segments": {"min": 50, "max": 1000, "step": 10, "type": "int"},
            "compactness": {"min": 1, "max": 50, "step": 1, "type": "int"},
            "sigma": {"min": 0, "max": 5, "step": 0.1, "type": "float"},
            "start_label": {"min": 0, "max": 1, "step": 1, "type": "int"}
        }

    def segment(self, image: np.ndarray, parameters: Dict[str, Any]) -> Tuple[np.ndarray, SegmentationMetrics]:
        start_time = time.time()
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024

        # Preprocess image
        processed_image = self.preprocess_image(image)

        # Apply SLIC segmentation
        labels = slic(
            processed_image,
            n_segments=parameters.get("n_segments", 250),
            compactness=parameters.get("compactness", 10),
            sigma=parameters.get("sigma", 1),
            start_label=parameters.get("start_label", 1),
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
