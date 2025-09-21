# app/api/v1/endpoints/websockets.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
import uuid
import asyncio
import structlog

from app.services.segmentation_service import SegmentationService
from app.services.image_service import ImageService
from app.services.cache_service import CacheService
from app.schemas.websocket import WSMessage, WSResponse, WSConnectionInfo
from app.schemas.segmentation import SegmentationRequest

logger = structlog.get_logger()
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_info: Dict[str, WSConnectionInfo] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
        # Store connection info
        self.connection_info[connection_id] = WSConnectionInfo(
            connection_id=connection_id,
            user_agent=websocket.headers.get("user-agent"),
            ip_address=websocket.client.host if websocket.client else None
        )
        
        logger.info("WebSocket connection established", connection_id=connection_id)
        return connection_id
    
    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        if connection_id in self.connection_info:
            del self.connection_info[connection_id]
        logger.info("WebSocket connection closed", connection_id=connection_id)
    
    async def send_personal_message(self, message: dict, connection_id: str):
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error("Failed to send WebSocket message", 
                           connection_id=connection_id, error=str(e))
                self.disconnect(connection_id)
    
    async def broadcast(self, message: dict):
        disconnected_connections = []
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error("Failed to broadcast WebSocket message", 
                           connection_id=connection_id, error=str(e))
                disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)

manager = ConnectionManager()

def get_segmentation_service() -> SegmentationService:
    cache_service = CacheService()
    image_service = ImageService()
    return SegmentationService(cache_service, image_service)

# Основний ендпоінт для нових підключень
@router.websocket("")
async def websocket_endpoint_new(
    websocket: WebSocket,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """WebSocket endpoint for new connections."""
    connection_id = await manager.connect(websocket)
    await handle_websocket_connection(websocket, connection_id, segmentation_service)

# Ендпоінт для підключень з існуючим connection_id
@router.websocket("/{connection_id}")
async def websocket_endpoint_existing(
    websocket: WebSocket,
    connection_id: str,
    segmentation_service: SegmentationService = Depends(get_segmentation_service)
):
    """WebSocket endpoint for existing connections."""
    await websocket.accept()
    manager.active_connections[connection_id] = websocket
    await handle_websocket_connection(websocket, connection_id, segmentation_service)

async def handle_websocket_connection(
    websocket: WebSocket,
    connection_id: str,
    segmentation_service: SegmentationService
):
    """Handle WebSocket connection lifecycle."""
    try:
        # Send connection confirmation
        await manager.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "message": "WebSocket connection established"
        }, connection_id)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            await handle_websocket_message(
                message, connection_id, segmentation_service
            )
            
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        logger.error("WebSocket error", connection_id=connection_id, error=str(e))
        manager.disconnect(connection_id)

async def handle_websocket_message(
    message: dict, 
    connection_id: str,
    segmentation_service: SegmentationService
):
    """Handle incoming WebSocket message."""
    
    message_type = message.get("type")
    
    if message_type == "parameter_update":
        await handle_parameter_update(message, connection_id, segmentation_service)
    elif message_type == "start_segmentation":
        await handle_start_segmentation(message, connection_id, segmentation_service)
    elif message_type == "ping":
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": message.get("timestamp")
        }, connection_id)
    else:
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, connection_id)

async def handle_parameter_update(
    message: dict, 
    connection_id: str,
    segmentation_service: SegmentationService
):
    """Handle real-time parameter updates."""
    
    try:
        # Extract parameters
        algorithm_name = message.get("algorithm_name")
        parameter_name = message.get("parameter_name")
        parameter_value = message.get("parameter_value")
        image_id = message.get("image_id")
        
        if not all([algorithm_name, parameter_name, parameter_value is not None, image_id]):
            raise ValueError("Missing required parameters")
        
        # Create segmentation request with updated parameters
        algorithm_config = {
            "name": algorithm_name,
            "parameters": {parameter_name: parameter_value},
            "is_active": True
        }
        
        request = SegmentationRequest(
            image_id=image_id,
            algorithms=[algorithm_config]
        )
        
        # Create callback for progress updates
        async def progress_callback(update):
            await manager.send_personal_message(update, connection_id)
        
        # Process segmentation
        result = await segmentation_service.process_segmentation_request(
            request, callback=progress_callback
        )
        
        # Send result
        await manager.send_personal_message({
            "type": "parameter_update_complete",
            "algorithm_name": algorithm_name,
            "parameter_name": parameter_name,
            "parameter_value": parameter_value,
            "result": result.dict()
        }, connection_id)
        
    except Exception as e:
        await manager.send_personal_message({
            "type": "parameter_update_error",
            "error": str(e)
        }, connection_id)

async def handle_start_segmentation(
    message: dict,
    connection_id: str,
    segmentation_service: SegmentationService
):
    """Handle segmentation start request."""
    
    try:
        # Parse segmentation request
        request_data = message.get("request")
        if not request_data:
            raise ValueError("Missing segmentation request")
        
        request = SegmentationRequest(**request_data)
        
        # Create callback for progress updates
        async def progress_callback(update):
            await manager.send_personal_message(update, connection_id)
        
        # Process segmentation
        result = await segmentation_service.process_segmentation_request(
            request, callback=progress_callback
        )
        
        # Send final result
        await manager.send_personal_message({
            "type": "segmentation_complete",
            "result": result.dict()
        }, connection_id)
        
    except Exception as e:
        await manager.send_personal_message({
            "type": "segmentation_error",
            "error": str(e)
        }, connection_id)