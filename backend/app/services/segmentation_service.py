# app/services/segmentation_service.py
import asyncio
import uuid
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from PIL import Image
import io
import base64
import time
import structlog

from app.ml.algorithms import get_algorithm, get_available_algorithms
from app.schemas.segmentation import (
    SegmentationRequest, SegmentationResult, SegmentationResponse,
    AlgorithmConfig, PerformanceMetrics
)
from app.services.cache_service import CacheService
from app.services.image_service import ImageService
from app.utils.image_utils import labels_to_colored_image, overlay_segments
from app.config import settings

logger = structlog.get_logger()

class SegmentationService:
    def __init__(self, cache_service: CacheService, image_service: ImageService):
        self.cache_service = cache_service
        self.image_service = image_service
        self.algorithms = get_available_algorithms()
        
    async def process_segmentation_request(
        self, 
        request: SegmentationRequest,
        callback=None
    ) -> SegmentationResponse:
        """Process a segmentation request with multiple algorithms."""
        
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.info(
            "Starting segmentation request",
            request_id=request_id,
            image_id=request.image_id,
            algorithms=[alg.name for alg in request.algorithms]
        )
        
        # Load original image
        image_data = await self.image_service.get_image_data(request.image_id)
        if image_data is None:
            raise ValueError(f"Image not found: {request.image_id}")
        
        # Process each algorithm
        results = []
        tasks = []
        
        for algorithm_config in request.algorithms:
            task = self._process_single_algorithm(
                image_data=image_data,
                algorithm_config=algorithm_config,
                request_id=request_id,
                callback=callback
            )
            tasks.append(task)
        
        # Execute algorithms concurrently (with limit)
        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEGMENTATIONS)
        
        async def limited_task(task):
            async with semaphore:
                return await task
        
        results = await asyncio.gather(*[limited_task(task) for task in tasks])
        
        # Filter out None results (errors)
        valid_results = [r for r in results if r is not None]
        
        total_processing_time = time.time() - start_time
        
        # Get original image URL
        original_image_url = await self.image_service.get_image_url(request.image_id)
        
        response = SegmentationResponse(
            request_id=request_id,
            original_image_url=original_image_url,
            results=valid_results,
            view_mode=request.view_mode,
            total_processing_time=total_processing_time
        )
        
        logger.info(
            "Segmentation request completed",
            request_id=request_id,
            total_time=total_processing_time,
            results_count=len(valid_results)
        )
        
        return response
    
    async def _process_single_algorithm(
        self,
        image_data: np.ndarray,
        algorithm_config: AlgorithmConfig,
        request_id: str,
        callback=None
    ) -> Optional[SegmentationResult]:
        """Process a single algorithm."""
        
        try:
            # Generate cache key
            cache_key = self._generate_cache_key(image_data, algorithm_config)
            
            # Check cache first
            cached_result = await self.cache_service.get(cache_key)
            if cached_result:
                logger.info(
                    "Using cached result",
                    algorithm=algorithm_config.name,
                    request_id=request_id
                )
                return SegmentationResult(**cached_result)
            
            # Get algorithm instance
            algorithm = get_algorithm(algorithm_config.name)
            
            # Progress callback
            if callback:
                await callback({
                    "type": "segmentation_start",
                    "algorithm": algorithm_config.name,
                    "request_id": request_id
                })
            
            # Perform segmentation
            labels, metrics = algorithm.segment(image_data, algorithm_config.parameters)
            
            # Convert labels to colored image
            colored_image = labels_to_colored_image(labels)
            
            # Save result image
            result_image_id = f"{request_id}_{algorithm_config.name}"
            result_image_url = await self.image_service.save_result_image(
                colored_image, result_image_id
            )
            
            # Create result
            result = SegmentationResult(
                algorithm_name=algorithm_config.name,
                result_image_url=result_image_url,
                segments_count=metrics.segments_count,
                processing_time=metrics.processing_time,
                parameters_used=metrics.parameters_used,
                metrics=PerformanceMetrics(
                    processing_time=metrics.processing_time,
                    memory_usage=metrics.memory_usage,
                    segments_count=metrics.segments_count,
                    algorithm_name=algorithm_config.name,
                    image_dimensions=image_data.shape[:2]
                )
            )
            
            # Cache result
            await self.cache_service.set(
                cache_key, 
                result.dict(), 
                ttl=settings.REDIS_CACHE_TTL
            )
            
            # Progress callback
            if callback:
                await callback({
                    "type": "segmentation_complete",
                    "result": result.dict(),
                    "request_id": request_id
                })
            
            logger.info(
                "Algorithm completed",
                algorithm=algorithm_config.name,
                processing_time=metrics.processing_time,
                segments_count=metrics.segments_count
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "Algorithm failed",
                algorithm=algorithm_config.name,
                error=str(e),
                request_id=request_id
            )
            
            if callback:
                await callback({
                    "type": "segmentation_error",
                    "algorithm": algorithm_config.name,
                    "error": str(e),
                    "request_id": request_id
                })
            
            return None
    
    def _generate_cache_key(self, image_data: np.ndarray, algorithm_config: AlgorithmConfig) -> str:
        """Generate cache key for segmentation result."""
        import hashlib
        
        # Create hash from image data and parameters
        image_hash = hashlib.md5(image_data.tobytes()).hexdigest()[:8]
        params_str = str(sorted(algorithm_config.parameters.items()))
        params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
        
        return f"seg:{algorithm_config.name}:{image_hash}:{params_hash}"
    
    async def get_algorithm_info(self, algorithm_name: str) -> Dict[str, Any]:
        """Get information about a specific algorithm."""
        if algorithm_name not in self.algorithms:
            raise ValueError(f"Unknown algorithm: {algorithm_name}")
        
        algorithm = self.algorithms[algorithm_name]
        return {
            "name": algorithm.name,
            "display_name": algorithm.display_name,
            "default_parameters": algorithm.get_default_parameters(),
            "parameter_ranges": algorithm.get_parameter_ranges()
        }
    
    async def get_all_algorithms_info(self) -> List[Dict[str, Any]]:
        """Get information about all available algorithms."""
        return [await self.get_algorithm_info(name) for name in self.algorithms.keys()]
