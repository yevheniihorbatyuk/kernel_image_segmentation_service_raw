
# app/dependencies.py
from fastapi import Depends
from app.services.cache_service import CacheService
from app.services.image_service import ImageService
from app.services.segmentation_service import SegmentationService

async def get_cache_service() -> CacheService:
    """Dependency to get cache service instance."""
    cache_service = CacheService()
    if not cache_service.redis_client:
        await cache_service.init_redis()
    return cache_service

async def get_image_service() -> ImageService:
    """Dependency to get image service instance."""
    return ImageService()

async def get_segmentation_service(
    cache_service: CacheService = Depends(get_cache_service),
    image_service: ImageService = Depends(get_image_service)
) -> SegmentationService:
    """Dependency to get segmentation service instance."""
    return SegmentationService(cache_service, image_service)