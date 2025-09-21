# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import images, segmentation, websockets

api_router = APIRouter()

api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(segmentation.router, prefix="/segmentation", tags=["segmentation"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websocket"])