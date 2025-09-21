# app/utils/image_utils.py
import numpy as np
from PIL import Image
import io
from typing import Optional, Tuple
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from skimage.segmentation import mark_boundaries
from skimage.color import label2rgb
import structlog

logger = structlog.get_logger()

def validate_image(file_content: bytes) -> Optional[Image.Image]:
    """Validate and load image from bytes."""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Verify it's a valid image
        image.verify()
        
        # Reopen for actual use (verify() closes the file)
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode not in ['RGB', 'L']:
            image = image.convert('RGB')
        
        return image
        
    except Exception as e:
        logger.warning("Image validation failed", error=str(e))
        return None

def resize_image(image: Image.Image, max_dimension: int) -> Image.Image:
    """Resize image while maintaining aspect ratio."""
    width, height = image.size
    
    if max(width, height) <= max_dimension:
        return image
    
    if width > height:
        new_width = max_dimension
        new_height = int((height * max_dimension) / width)
    else:
        new_height = max_dimension
        new_width = int((width * max_dimension) / height)
    
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

def labels_to_colored_image(labels: np.ndarray, alpha: float = 0.7) -> np.ndarray:
    """Convert segmentation labels to colored image."""
    try:
        # Generate colors for labels
        unique_labels = np.unique(labels)
        num_labels = len(unique_labels)
        
        if num_labels <= 1:
            # Single segment, return grayscale
            return np.stack([labels] * 3, axis=-1).astype(np.uint8)
        
        # Create colormap
        colors = plt.cm.tab20(np.linspace(0, 1, min(num_labels, 20)))
        if num_labels > 20:
            # Generate additional colors
            additional_colors = plt.cm.Set3(np.linspace(0, 1, num_labels - 20))
            colors = np.vstack([colors, additional_colors])
        
        # Map labels to colors
        colored_image = np.zeros((*labels.shape, 3))
        
        for i, label_id in enumerate(unique_labels):
            mask = labels == label_id
            colored_image[mask] = colors[i][:3]  # RGB only
        
        # Convert to uint8
        colored_image = (colored_image * 255).astype(np.uint8)
        
        return colored_image
        
    except Exception as e:
        logger.error("Failed to convert labels to colored image", error=str(e))
        # Return grayscale fallback
        normalized_labels = ((labels - labels.min()) / (labels.max() - labels.min()) * 255).astype(np.uint8)
        return np.stack([normalized_labels] * 3, axis=-1)

def overlay_segments(image: np.ndarray, labels: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    """Overlay segmentation boundaries on original image."""
    try:
        # Ensure image is in the right format
        if image.dtype != np.uint8:
            if image.max() <= 1.0:
                image = (image * 255).astype(np.uint8)
            else:
                image = image.astype(np.uint8)
        
        # Create boundaries overlay
        boundaries = mark_boundaries(
            image / 255.0,  # mark_boundaries expects float input
            labels,
            color=(1, 0, 0),  # Red boundaries
            mode='thick'
        )
        
        # Convert back to uint8
        result = (boundaries * 255).astype(np.uint8)
        
        return result
        
    except Exception as e:
        logger.error("Failed to overlay segments", error=str(e))
        return image

def create_comparison_grid(
    original: np.ndarray, 
    results: list, 
    grid_size: Tuple[int, int] = (2, 2)
) -> np.ndarray:
    """Create a comparison grid of segmentation results."""
    try:
        rows, cols = grid_size
        height, width = original.shape[:2]
        
        # Create grid
        grid_height = height * rows
        grid_width = width * cols
        grid = np.zeros((grid_height, grid_width, 3), dtype=np.uint8)
        
        # Place original in top-left
        grid[0:height, 0:width] = original
        
        # Place results
        for i, result in enumerate(results[:rows*cols-1]):  # -1 for original
            row = (i + 1) // cols
            col = (i + 1) % cols
            
            start_row = row * height
            end_row = start_row + height
            start_col = col * width
            end_col = start_col + width
            
            if isinstance(result, np.ndarray):
                grid[start_row:end_row, start_col:end_col] = result
        
        return grid
        
    except Exception as e:
        logger.error("Failed to create comparison grid", error=str(e))
        return original

def get_segmentation_stats(labels: np.ndarray) -> dict:
    """Calculate segmentation statistics."""
    try:
        unique_labels = np.unique(labels)
        num_segments = len(unique_labels)
        
        # Calculate segment sizes
        segment_sizes = []
        for label_id in unique_labels:
            size = np.sum(labels == label_id)
            segment_sizes.append(size)
        
        stats = {
            "num_segments": num_segments,
            "min_segment_size": min(segment_sizes) if segment_sizes else 0,
            "max_segment_size": max(segment_sizes) if segment_sizes else 0,
            "mean_segment_size": np.mean(segment_sizes) if segment_sizes else 0,
            "std_segment_size": np.std(segment_sizes) if segment_sizes else 0,
            "total_pixels": labels.size
        }
        
        return stats
        
    except Exception as e:
        logger.error("Failed to calculate segmentation stats", error=str(e))
        return {}

def normalize_image(image: np.ndarray) -> np.ndarray:
    """Normalize image to [0, 1] range."""
    if image.dtype == np.uint8:
        return image.astype(np.float32) / 255.0
    elif image.max() > 1.0:
        return image / image.max()
    return image.astype(np.float32)

def denormalize_image(image: np.ndarray) -> np.ndarray:
    """Convert normalized image back to uint8."""
    if image.max() <= 1.0:
        return (image * 255).astype(np.uint8)
    return image.astype(np.uint8)

def apply_color_scheme(labels: np.ndarray, scheme: str = "default") -> np.ndarray:
    """Apply different color schemes to segmentation labels."""
    try:
        unique_labels = np.unique(labels)
        num_labels = len(unique_labels)
        
        if scheme == "rainbow":
            colors = plt.cm.rainbow(np.linspace(0, 1, num_labels))
        elif scheme == "viridis":
            colors = plt.cm.viridis(np.linspace(0, 1, num_labels))
        elif scheme == "plasma":
            colors = plt.cm.plasma(np.linspace(0, 1, num_labels))
        elif scheme == "cool":
            colors = plt.cm.cool(np.linspace(0, 1, num_labels))
        else:  # default
            colors = plt.cm.tab20(np.linspace(0, 1, min(num_labels, 20)))
            if num_labels > 20:
                additional_colors = plt.cm.Set3(np.linspace(0, 1, num_labels - 20))
                colors = np.vstack([colors, additional_colors])
        
        # Map labels to colors
        colored_image = np.zeros((*labels.shape, 3))
        
        for i, label_id in enumerate(unique_labels):
            mask = labels == label_id
            colored_image[mask] = colors[i][:3]
        
        return (colored_image * 255).astype(np.uint8)
        
    except Exception as e:
        logger.error("Failed to apply color scheme", scheme=scheme, error=str(e))
        return labels_to_colored_image(labels)

def create_side_by_side_comparison(
    original: np.ndarray, 
    segmented: np.ndarray,
    show_overlay: bool = True
) -> np.ndarray:
    """Create side-by-side comparison of original and segmented images."""
    try:
        height, width = original.shape[:2]
        
        if show_overlay and len(segmented.shape) == 2:
            # Create overlay if segmented is labels
            right_image = overlay_segments(original, segmented)
        else:
            right_image = segmented
        
        # Ensure both images have same dimensions
        if right_image.shape[:2] != (height, width):
            right_image_pil = Image.fromarray(right_image)
            right_image_pil = right_image_pil.resize((width, height), Image.Resampling.LANCZOS)
            right_image = np.array(right_image_pil)
        
        # Create side-by-side image
        comparison = np.zeros((height, width * 2, 3), dtype=np.uint8)
        comparison[:, :width] = original
        comparison[:, width:] = right_image
        
        # Add vertical divider line
        comparison[:, width-1:width+1] = [255, 255, 255]  # White line
        
        return comparison
        
    except Exception as e:
        logger.error("Failed to create side-by-side comparison", error=str(e))
        return original