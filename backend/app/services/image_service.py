
# app/services/image_service.py
import os
import uuid
import aiofiles
from typing import Optional, Tuple
import numpy as np
from PIL import Image
import io
import structlog

from app.config import settings
from app.schemas.image import ImageInfo, ImageUploadResponse
from app.utils.image_utils import resize_image, validate_image

logger = structlog.get_logger()

class ImageService:
    def __init__(self):
        self.upload_path = settings.UPLOAD_PATH
        os.makedirs(self.upload_path, exist_ok=True)
        
    async def upload_image(self, file_content: bytes, filename: str, content_type: str) -> ImageUploadResponse:
        """Upload and process an image file."""
        
        try:
            # Validate image
            image = validate_image(file_content)
            if image is None:
                return ImageUploadResponse(
                    success=False,
                    message="Invalid image format"
                )
            
            # Generate unique ID and filename
            image_id = str(uuid.uuid4())
            file_extension = os.path.splitext(filename)[1].lower()
            if not file_extension:
                file_extension = '.jpg'
            
            stored_filename = f"{image_id}{file_extension}"
            file_path = os.path.join(self.upload_path, stored_filename)
            
            # Resize if too large
            if max(image.size) > settings.MAX_IMAGE_DIMENSION:
                image = resize_image(image, settings.MAX_IMAGE_DIMENSION)
            
            # Save image
            image.save(file_path, quality=95, optimize=True)
            
            # Get file stats
            file_size = os.path.getsize(file_path)
            
            # Create image info
            image_info = ImageInfo(
                id=image_id,
                filename=stored_filename,
                original_filename=filename,
                url=f"/uploads/{stored_filename}",
                content_type=content_type,
                size=file_size,
                dimensions=image.size
            )
            
            logger.info(
                "Image uploaded successfully",
                image_id=image_id,
                filename=filename,
                size=file_size,
                dimensions=image.size
            )
            
            return ImageUploadResponse(
                success=True,
                image=image_info,
                message="Image uploaded successfully",
                upload_url=image_info.url
            )
            
        except Exception as e:
            logger.error("Image upload failed", error=str(e), filename=filename)
            return ImageUploadResponse(
                success=False,
                message=f"Upload failed: {str(e)}"
            )
    
    async def get_image_data(self, image_id: str) -> Optional[np.ndarray]:
        """Load image data as numpy array."""
        try:
            # Find image file
            for ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                file_path = os.path.join(self.upload_path, f"{image_id}{ext}")
                if os.path.exists(file_path):
                    break
            else:
                logger.warning("Image not found", image_id=image_id)
                return None
            
            # Load image
            image = Image.open(file_path)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return np.array(image)
            
        except Exception as e:
            logger.error("Failed to load image", image_id=image_id, error=str(e))
            return None
    
    async def get_image_url(self, image_id: str) -> Optional[str]:
        """Get image URL by ID."""
        for ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            filename = f"{image_id}{ext}"
            file_path = os.path.join(self.upload_path, filename)
            if os.path.exists(file_path):
                return f"/uploads/{filename}"
        return None
    
    async def save_result_image(self, image_array: np.ndarray, result_id: str) -> str:
        """Save segmentation result image."""
        try:
            # Convert numpy array to PIL Image
            if image_array.dtype != np.uint8:
                # Normalize to 0-255 range
                image_array = (image_array * 255).astype(np.uint8)
            
            image = Image.fromarray(image_array)
            
            # Save as PNG for better quality
            filename = f"{result_id}_result.png"
            file_path = os.path.join(self.upload_path, filename)
            image.save(file_path, format='PNG', optimize=True)
            
            return f"/uploads/{filename}"
            
        except Exception as e:
            logger.error("Failed to save result image", result_id=result_id, error=str(e))
            raise
