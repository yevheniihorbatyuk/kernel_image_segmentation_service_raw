# app/schemas/websocket.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from .segmentation import (    
    WSParameterUpdate,
    WSSegmentationProgress,
    WSSegmentationComplete,
    WSSegmentationError
)

WSMessage = Union[
    WSParameterUpdate,
    WSSegmentationProgress,
    WSSegmentationComplete,
    WSSegmentationError
]

class WSConnectionInfo(BaseModel):
    connection_id: str
    connected_at: datetime = Field(default_factory=datetime.now)
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class WSResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)