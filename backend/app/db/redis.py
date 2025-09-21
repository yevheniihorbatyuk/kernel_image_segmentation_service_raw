# app/db/redis.py
import redis.asyncio as redis
import structlog
from app.config import settings

logger = structlog.get_logger()

# Global Redis connection
redis_client = None

async def init_redis():
    """Initialize Redis connection."""
    global redis_client
    
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_keepalive=True,
            socket_keepalive_options={},
            health_check_interval=30
        )
        
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection established", url=settings.REDIS_URL)
        
    except Exception as e:
        logger.error("Failed to connect to Redis", error=str(e))
        redis_client = None

async def get_redis():
    """Get Redis client instance."""
    return redis_client

async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")
