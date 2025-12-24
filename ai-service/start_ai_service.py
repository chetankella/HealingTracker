#!/usr/bin/env python3
"""
Startup script for Healing Tracker AI Service
"""

import os
import sys
import asyncio
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from loguru import logger
from config.settings import settings

def setup_logging():
    """Configure logging for the AI service"""
    # Remove default handler
    logger.remove()
    
    # Console logging
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    
    # File logging
    log_file = Path(settings.LOG_FILE)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    
    logger.add(
        log_file,
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="1 day",
        retention="30 days",
        compression="zip"
    )

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        "fastapi", "uvicorn", "torch", "torchvision", "opencv-python",
        "Pillow", "numpy", "pandas", "scikit-learn", "scikit-image",
        "matplotlib", "seaborn", "loguru"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.error("Please install them using: pip install -r requirements.txt")
        return False
    
    logger.info("All required dependencies are installed")
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        Path(settings.MODEL_PATH),
        Path("logs"),
        Path("temp"),
        Path("uploads")
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")

async def startup_checks():
    """Perform startup checks and initialization"""
    logger.info("🚀 Starting Healing Tracker AI Service...")
    logger.info(f"Version: {settings.API_VERSION}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"Host: {settings.HOST}:{settings.PORT}")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Check GPU availability
    try:
        import torch
        if torch.cuda.is_available():
            gpu_count = torch.cuda.device_count()
            gpu_name = torch.cuda.get_device_name(0)
            logger.info(f"🎯 GPU Available: {gpu_name} (Count: {gpu_count})")
        else:
            logger.info("🔧 Using CPU for computations")
    except ImportError:
        logger.warning("PyTorch not available")
    
    # Test model loading
    try:
        from models.healing_predictor import HealingPredictor
        predictor = HealingPredictor()
        logger.info("✅ ML models initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ ML models not loaded: {str(e)}")
        logger.info("Service will use rule-based algorithms")
    
    logger.info("✅ Startup checks completed successfully")

def main():
    """Main entry point"""
    # Setup logging
    setup_logging()
    
    # Run startup checks
    asyncio.run(startup_checks())
    
    # Start the server
    logger.info("🌟 Starting FastAPI server...")
    
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
        server_header=False,
        date_header=False
    )

if __name__ == "__main__":
    main()
















