# app/schemas/segmentation.py
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from enum import Enum

class AlgorithmType(str, Enum):
    FELZENSZWALB = "felzenszwalb"
    SLIC = "slic"
    QUICKSHIFT = "quickshift"
    WATERSHED = "watershed"

class ViewMode(str, Enum):
    SINGLE = "single"
    SPLIT = "split"
    GRID_2X2 = "grid_2x2"

# Base Parameter Schema
class ParameterSchema(BaseModel):
    name: str
    value: Union[int, float, str]
    min_value: Optional[Union[int, float]] = None
    max_value: Optional[Union[int, float]] = None
    step: Optional[Union[int, float]] = None
    type: str  # "int", "float", "string", "bool"

# Algorithm Configuration
class AlgorithmConfig(BaseModel):
    name: AlgorithmType
    display_name: str
    parameters: Dict[str, Any]
    is_active: bool = True
    
    class Config:
        use_enum_values = True

# Segmentation Request
class SegmentationRequest(BaseModel):
    image_id: str
    algorithms: List[AlgorithmConfig] = Field(..., min_items=1, max_items=4)
    view_mode: ViewMode = ViewMode.SINGLE
    resize_dimensions: Optional[tuple[int, int]] = None
    
    @validator('algorithms')
    def validate_algorithms(cls, v):
        if len(v) > 4:
            raise ValueError('Maximum 4 algorithms allowed')
        return v

# Performance Metrics
class PerformanceMetrics(BaseModel):
    processing_time: float
    memory_usage: Optional[float] = None
    segments_count: int
    algorithm_name: str
    image_dimensions: tuple[int, int]

# Segmentation Result
class SegmentationResult(BaseModel):
    algorithm_name: AlgorithmType
    result_image_url: str
    segments_count: int
    processing_time: float
    parameters_used: Dict[str, Any]
    metrics: Optional[PerformanceMetrics] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        use_enum_values = True

# Multi-Algorithm Segmentation Response
class SegmentationResponse(BaseModel):
    request_id: str
    original_image_url: str
    results: List[SegmentationResult]
    view_mode: ViewMode
    total_processing_time: float
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        use_enum_values = True

# WebSocket Message Schemas
class WSMessageType(str, Enum):
    PARAMETER_UPDATE = "parameter_update"
    SEGMENTATION_START = "segmentation_start"
    SEGMENTATION_PROGRESS = "segmentation_progress"
    SEGMENTATION_COMPLETE = "segmentation_complete"
    SEGMENTATION_ERROR = "segmentation_error"
    VIEW_MODE_CHANGE = "view_mode_change"

class WSParameterUpdate(BaseModel):
    message_type: WSMessageType = WSMessageType.PARAMETER_UPDATE
    algorithm_name: AlgorithmType
    parameter_name: str
    parameter_value: Union[int, float, str]
    image_id: str

class WSSegmentationProgress(BaseModel):
    message_type: WSMessageType = WSMessageType.SEGMENTATION_PROGRESS
    algorithm_name: AlgorithmType
    progress_percent: float
    estimated_time_remaining: Optional[float] = None

class WSSegmentationComplete(BaseModel):
    message_type: WSMessageType = WSMessageType.SEGMENTATION_COMPLETE
    result: SegmentationResult

class WSSegmentationError(BaseModel):
    message_type: WSMessageType = WSMessageType.SEGMENTATION_ERROR
    algorithm_name: AlgorithmType
    error_message: str
    error_code: Optional[str] = None

# Algorithm Info Response
class AlgorithmInfo(BaseModel):
    name: AlgorithmType
    display_name: str
    description: str
    default_parameters: Dict[str, ParameterSchema]
    parameter_ranges: Dict[str, Dict[str, Union[int, float]]]
    
    class Config:
        use_enum_values = True

class AlgorithmsListResponse(BaseModel):
    algorithms: List[AlgorithmInfo]
    total_count: int
