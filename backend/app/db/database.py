
# app/db/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import structlog
from app.config import settings

logger = structlog.get_logger()

# SQLAlchemy setup
Base = declarative_base()
engine = None
async_session = None

async def init_db():
    """Initialize database connection."""
    global engine, async_session
    
    if not settings.DATABASE_URL:
        logger.info("No database URL provided, skipping database initialization")
        return
    
    try:
        # Create async engine
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_recycle=300
        )
        
        # Create session factory
        async_session = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        
        # Test connection
        async with async_session() as session:
            await session.execute("SELECT 1")
        
        logger.info("Database connection established", url=settings.DATABASE_URL)
        
    except Exception as e:
        logger.error("Failed to connect to database", error=str(e))
        engine = None
        async_session = None

async def get_db():
    """Get database session."""
    if async_session is None:
        raise RuntimeError("Database not initialized")
    
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def close_db():
    """Close database connection."""
    global engine
    if engine:
        await engine.dispose()
        logger.info("Database connection closed")
