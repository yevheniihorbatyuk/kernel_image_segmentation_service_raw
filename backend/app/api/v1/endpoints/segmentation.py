# app/api/v1/endpoints/segmentation.py
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import asyncio
import structlog

from app.services.segmentation_service import SegmentationService
from app.services.image_service import ImageService
from app.services.cache_service import CacheService
from app.schemas.segmentation import (
    SegmentationRequest, SegmentationResponse, AlgorithmInfo, 
    AlgorithmsListResponse, AlgorithmConfig
)
from app.config import AVAILABLE_ALGORITHMS

logger = structlog.get_logger()
router = APIRouter()

def get_cache_service() -> CacheService:
    cache_service = CacheService()
    return cache_service

def get_image_service() -> ImageService:
    return ImageService()

def get_segmentation_service(
    cache_service: CacheService = Depends(get_cache_service),
    image_service: ImageService = Depends(get_image_service)
) -> SegmentationService:
    return SegmentationService(cache_service, image_service)

@router.get("/algorithms", response_model=AlgorithmsListResponse)
async def get_available_algorithms(
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Get list of available segmentation algorithms."""
    
    algorithms_info = await segmentation_service.get_all_algorithms_info()
    
    # Convert to AlgorithmInfo objects
    algorithms = []
    for info in algorithms_info:
        # Create parameter schemas
        param_schemas = {}
        for param_name, param_value in info["default_parameters"].items():
            param_ranges = info["parameter_ranges"].get(param_name, {})
            param_schemas[param_name] = {
                "name": param_name,
                "value": param_value,
                "type": param_ranges.get("type", "float"),
                "min_value": param_ranges.get("min"),
                "max_value": param_ranges.get("max"),
                "step": param_ranges.get("step")
            }
        
        # Create a copy of parameter_ranges and remove the problematic 'type' key
        cleaned_parameter_ranges = {}
        for param_name, ranges in info["parameter_ranges"].items():
            cleaned_ranges = ranges.copy()
            cleaned_ranges.pop("type", None)
            cleaned_parameter_ranges[param_name] = cleaned_ranges
        
        algorithm_info = AlgorithmInfo(
            name=info["name"],
            display_name=info["display_name"],
            description=f"{info['display_name']} segmentation algorithm",
            default_parameters=param_schemas,
            parameter_ranges=cleaned_parameter_ranges
        )
        algorithms.append(algorithm_info)
    
    return AlgorithmsListResponse(
        algorithms=algorithms,
        total_count=len(algorithms)
    )

@router.get("/algorithms/{algorithm_name}")
async def get_algorithm_info(
    algorithm_name: str,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Get detailed information about a specific algorithm."""
    
    try:
        info = await segmentation_service.get_algorithm_info(algorithm_name)
        return info
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/segment", response_model=SegmentationResponse)
async def segment_image(
    request: SegmentationRequest,
    background_tasks: BackgroundTasks,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Perform image segmentation with specified algorithms."""
    
    try:
        # Validate algorithms
        for algorithm_config in request.algorithms:
            if algorithm_config.name not in AVAILABLE_ALGORITHMS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unknown algorithm: {algorithm_config.name}"
                )
        
        # Process segmentation
        result = await segmentation_service.process_segmentation_request(request)
        
        logger.info(
            "Segmentation completed",
            request_id=result.request_id,
            algorithms_count=len(request.algorithms),
            results_count=len(result.results),
            total_time=result.total_processing_time
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Segmentation failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/segment/batch")
async def batch_segment_images(
    requests: List[SegmentationRequest],
    background_tasks: BackgroundTasks,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Perform batch segmentation on multiple images."""
    
    if len(requests) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 images allowed in batch processing"
        )
    
    try:
        # Process all requests concurrently
        tasks = [
            segmentation_service.process_segmentation_request(request)
            for request in requests
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Separate successful results from errors
        successful_results = []
        errors = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                errors.append({
                    "index": i,
                    "error": str(result)
                })
            else:
                successful_results.append(result)
        
        return {
            "successful_results": successful_results,
            "errors": errors,
            "total_requested": len(requests),
            "successful_count": len(successful_results),
            "error_count": len(errors)
        }
        
    except Exception as e:
        logger.error("Batch segmentation failed", error=str(e))
        raise HTTPException(status_code=500, detail="Batch processing failed")


@router.get("/results/history")
async def get_results_history(
    limit: int = 50,
    offset: int = 0,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Get history of segmentation results."""
    
    try:
        # Тут можна реалізувати реальну логіку з бази даних
        # Поки що повертаємо mock дані для тестування
        
        mock_history = [
            {
                "id": "result_1",
                "image_id": "img_123",
                "image_filename": "test_image.jpg",
                "algorithm_name": "felzenszwalb",
                "result_image_url": "/static/results/result_1.png",
                "segments_count": 245,
                "processing_time": 2.3,
                "created_at": "2025-09-21T10:30:00Z",
                "parameters_used": {"scale": 100, "sigma": 0.5, "min_size": 50}
            },
            {
                "id": "result_2", 
                "image_id": "img_124",
                "image_filename": "another_image.jpg",
                "algorithm_name": "slic",
                "result_image_url": "/static/results/result_2.png",
                "segments_count": 180,
                "processing_time": 1.8,
                "created_at": "2025-09-21T11:15:00Z",
                "parameters_used": {"n_segments": 250, "compactness": 10, "sigma": 1}
            },
            {
                "id": "result_3",
                "image_id": "img_125", 
                "image_filename": "third_image.jpg",
                "algorithm_name": "quickshift",
                "result_image_url": "/static/results/result_3.png",
                "segments_count": 320,
                "processing_time": 3.1,
                "created_at": "2025-09-21T12:00:00Z",
                "parameters_used": {"kernel_size": 3, "max_dist": 6, "ratio": 0.5}
            }
        ]
        
        # Застосовуємо pagination
        total_count = len(mock_history)
        paginated_results = mock_history[offset:offset+limit]
        
        return {
            "results": paginated_results,
            "total_count": total_count,
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        logger.error("Failed to get results history", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get results history")

@router.get("/results/{result_id}")
async def get_result_by_id(
    result_id: str,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """Get specific segmentation result by ID."""
    
    try:
        # Mock implementation - в реальній системі це буде запит до бази даних
        mock_results = {
            "result_1": {
                "id": "result_1",
                "image_id": "img_123",
                "image_filename": "test_image.jpg",
                "algorithm_name": "felzenszwalb", 
                "result_image_url": "/static/results/result_1.png",
                "segments_count": 245,
                "processing_time": 2.3,
                "created_at": "2025-09-21T10:30:00Z",
                "parameters_used": {"scale": 100, "sigma": 0.5, "min_size": 50}
            },
            "result_2": {
                "id": "result_2",
                "image_id": "img_124", 
                "image_filename": "another_image.jpg",
                "algorithm_name": "slic",
                "result_image_url": "/static/results/result_2.png",
                "segments_count": 180,
                "processing_time": 1.8,
                "created_at": "2025-09-21T11:15:00Z",
                "parameters_used": {"n_segments": 250, "compactness": 10, "sigma": 1}
            }
        }
        
        if result_id not in mock_results:
            raise HTTPException(status_code=404, detail="Result not found")
            
        return mock_results[result_id]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get result", result_id=result_id, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
    

@router.get("/list")
async def get_images_list(
    limit: int = 50,
    offset: int = 0,
    image_service: ImageService = Depends(get_image_service)
):
    """Get list of uploaded images."""
    
    try:
        # Mock дані для тестування
        mock_images = [
            {
                "id": "img_123",
                "filename": "test_image.jpg",
                "original_filename": "test_image.jpg", 
                "url": "/static/uploads/test_image.jpg",
                "content_type": "image/jpeg",
                "size": 245760,
                "dimensions": [1920, 1080],
                "created_at": "2025-09-21T10:00:00Z"
            },
            {
                "id": "img_124",
                "filename": "another_image.jpg",
                "original_filename": "another_image.jpg",
                "url": "/static/uploads/another_image.jpg", 
                "content_type": "image/jpeg",
                "size": 387520,
                "dimensions": [1600, 900],
                "created_at": "2025-09-21T10:30:00Z"
            }
        ]
        
        total_count = len(mock_images)
        paginated_images = mock_images[offset:offset+limit]
        
        return {
            "images": paginated_images,
            "total_count": total_count,
            "offset": offset, 
            "limit": limit
        }
        
    except Exception as e:
        logger.error("Failed to get images list", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get images list")