# Simplified AI Service for Healing Tracker (without heavy ML dependencies)
# This version provides mock AI responses while maintaining the same API structure

import os
import asyncio
import numpy as np
import cv2
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import json
import base64
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# PIL for basic image processing
from PIL import Image
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Logging
from loguru import logger
import sys

# Configure logging
logger.remove()
logger.add(sys.stdout, level="INFO", format="{time} | {level} | {message}")
if not os.path.exists("logs"):
    os.makedirs("logs")
logger.add("logs/healing_ai.log", rotation="1 day", retention="30 days", level="DEBUG")

# Initialize FastAPI app
app = FastAPI(
    title="Healing Tracker AI Service (Simplified)",
    description="AI-powered medical image analysis for wound healing assessment (Mock Version)",
    version="2.0.0-simplified",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ImageAnalysisRequest(BaseModel):
    patient_id: str = Field(..., description="Patient identifier")
    image_type: str = Field(default="wound", description="Type of medical image")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class HealingAnalysisResponse(BaseModel):
    patient_id: str
    analysis_id: str
    timestamp: datetime
    healing_score: float = Field(..., ge=0, le=100, description="Healing progress percentage")
    wound_area: float = Field(..., description="Wound area in square cm")
    inflammation_level: str = Field(..., description="Inflammation assessment")
    infection_risk: str = Field(..., description="Infection risk level")
    healing_stage: str = Field(..., description="Current healing stage")
    recommendations: List[str] = Field(..., description="AI-generated recommendations")
    confidence_score: float = Field(..., ge=0, le=1, description="Model confidence")
    visual_features: Dict[str, Any] = Field(..., description="Extracted visual features")
    image_data: Optional[Dict[str, Any]] = Field(None, description="Image storage data for doctor portal")

class ProgressPredictionResponse(BaseModel):
    patient_id: str
    predicted_healing_days: int
    confidence_interval: Dict[str, int]
    risk_factors: List[str]
    success_probability: float

# Simplified AI Manager Class
class SimplifiedHealingAI:
    def __init__(self):
        logger.info("Initializing Simplified Healing AI Manager...")
        
        # Mock model status
        self.models_loaded = True
        
        logger.info("Simplified AI Manager initialized successfully")
    
    async def analyze_wound_image(self, image: np.ndarray, patient_id: str) -> Dict[str, Any]:
        """
        Simplified wound analysis using basic computer vision
        """
        try:
            # Basic image analysis
            height, width = image.shape[:2]
            total_pixels = height * width
            
            # Actual image analysis based on uploaded image properties
            # Convert to different color spaces for analysis
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Simulate processing time
            await asyncio.sleep(2)
            
            # Analyze actual image characteristics
            # 1. Color analysis - detect redness (inflammation)
            red_channel = image[:, :, 2]  # BGR format, so red is index 2
            green_channel = image[:, :, 1]
            blue_channel = image[:, :, 0]
            
            avg_red = np.mean(red_channel)
            avg_green = np.mean(green_channel) 
            avg_blue = np.mean(blue_channel)
            
            # Calculate redness ratio (higher = more inflamed)
            redness_ratio = avg_red / (avg_green + avg_blue + 1)
            
            # 2. Brightness analysis (darker areas might indicate wounds)
            brightness = np.mean(gray)
            
            # 3. Contrast analysis (texture variance)
            contrast = np.std(gray)
            
            # 4. Edge detection for wound boundaries
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / total_pixels
            
            # Calculate healing score based on actual image analysis
            base_score = 50
            
            # Brightness factor (brighter = healthier)
            brightness_score = min(30, (brightness / 255) * 30)
            
            # Redness factor (less red = better healing)
            redness_score = max(0, 25 - (redness_ratio * 15))
            
            # Contrast factor (moderate contrast is good)
            contrast_score = min(20, max(0, 20 - abs(contrast - 50) / 5))
            
            # Edge density factor (fewer sharp edges = better healing)
            edge_score = max(0, 25 - (edge_density * 100))
            
            healing_score = base_score + brightness_score + redness_score + contrast_score + edge_score
            healing_score = min(100, max(10, healing_score))  # Clamp between 10-100
            
            # Calculate wound area based on dark regions
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            dark_pixels = np.sum(binary == 0)
            wound_area = (dark_pixels / total_pixels) * 25  # Scale to reasonable cm² range
            
            # Determine levels based on mock score
            if healing_score > 85:
                inflammation_level = "low"
                infection_risk = "low"
                healing_stage = "maturation"
            elif healing_score > 70:
                inflammation_level = "moderate"
                infection_risk = "low"
                healing_stage = "proliferative"
            elif healing_score > 50:
                inflammation_level = "moderate"
                infection_risk = "moderate"
                healing_stage = "healing"
            else:
                inflammation_level = "high"
                infection_risk = "moderate"
                healing_stage = "inflammatory"
            
            # Generate recommendations based on analysis
            recommendations = self._generate_mock_recommendations(healing_stage, inflammation_level)
            
            # Real visual features from actual image analysis
            visual_features = {
                "area_cm2": wound_area,
                "perimeter_cm": wound_area * 0.8 + (edge_density * 10),
                "circularity": max(0.1, 1 - edge_density),  # More edges = less circular
                "mean_red": float(avg_red),
                "mean_green": float(avg_green),
                "mean_blue": float(avg_blue),
                "texture_variance": float(contrast),
                "texture_smoothness": max(0.1, 1 - (contrast / 100)),
                "brightness": float(brightness),
                "redness_ratio": float(redness_ratio),
                "edge_density": float(edge_density),
                "image_dimensions": {"width": width, "height": height}
            }
            
            # Calculate confidence based on image quality
            # Higher resolution and better contrast = higher confidence
            resolution_factor = min(1.0, (width * height) / (640 * 480))  # Normalize to VGA
            contrast_factor = min(1.0, contrast / 100)  # Good contrast increases confidence
            brightness_factor = min(1.0, brightness / 128)  # Adequate brightness needed
            
            confidence_score = (resolution_factor * 0.4 + contrast_factor * 0.3 + brightness_factor * 0.3)
            confidence_score = max(0.6, min(0.95, confidence_score))  # Clamp between 0.6-0.95
            
            # Log the analysis results
            logger.info(f"Image Analysis Results for {patient_id}:")
            logger.info(f"  - Image size: {width}x{height}")
            logger.info(f"  - Brightness: {brightness:.1f}/255")
            logger.info(f"  - Redness ratio: {redness_ratio:.2f}")
            logger.info(f"  - Contrast: {contrast:.1f}")
            logger.info(f"  - Edge density: {edge_density:.3f}")
            logger.info(f"  - Calculated healing score: {healing_score:.1f}%")
            logger.info(f"  - Confidence: {confidence_score:.2f}")
            
            return {
                "healing_score": healing_score,
                "wound_area": wound_area,
                "inflammation_level": inflammation_level,
                "infection_risk": infection_risk,
                "healing_stage": healing_stage,
                "recommendations": recommendations,
                "confidence_score": confidence_score,
                "visual_features": visual_features
            }
            
        except Exception as e:
            logger.error(f"Error in wound analysis: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    def _generate_mock_recommendations(self, stage: str, inflammation: str) -> List[str]:
        """Generate mock recommendations based on healing stage and inflammation"""
        recommendations = []
        
        # Stage-based recommendations
        if stage == "inflammatory":
            recommendations.extend([
                "Keep wound clean and dry",
                "Apply prescribed anti-inflammatory medication",
                "Monitor for signs of infection",
                "Avoid excessive physical activity"
            ])
        elif stage == "proliferative":
            recommendations.extend([
                "Maintain moist wound environment",
                "Ensure adequate protein intake",
                "Gentle wound cleaning twice daily",
                "Consider advanced wound dressings"
            ])
        elif stage == "maturation":
            recommendations.extend([
                "Continue gentle care routine",
                "Begin scar management if needed",
                "Gradually increase activity level",
                "Monitor for complete healing"
            ])
        else:
            recommendations.extend([
                "Follow prescribed treatment plan",
                "Monitor healing progress daily",
                "Maintain good nutrition and hydration"
            ])
        
        # Inflammation-based recommendations
        if inflammation == "high":
            recommendations.extend([
                "Apply cold compress for 15 minutes, 3 times daily",
                "Consider anti-inflammatory medication",
                "Consult healthcare provider if symptoms persist"
            ])
        
        return recommendations[:6]  # Limit to 6 recommendations

# Initialize AI Manager
ai_manager = SimplifiedHealingAI()

# API Endpoints

@app.get("/")
async def root():
    return {
        "service": "Healing Tracker AI Service (Simplified)",
        "version": "2.0.0-simplified",
        "status": "operational",
        "features": [
            "Basic wound analysis",
            "Healing progress prediction",
            "Risk assessment",
            "Treatment recommendations",
            "Progress tracking"
        ],
        "models_loaded": ai_manager.models_loaded,
        "note": "This is a simplified version using mock AI responses for demonstration"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ai_service": "operational",
        "ml_models": "mock_loaded",
        "gpu_available": False,
        "memory_usage": "optimal",
        "version": "simplified",
        "features": ["Image storage for doctor portal"]
    }

@app.get("/api/patient-images/{patient_id}")
async def get_patient_images(patient_id: str):
    """Get all uploaded images for a specific patient"""
    try:
        images_dir = "uploaded_images"
        logger.info(f"Getting images for patient: {patient_id}")
        
        if not os.path.exists(images_dir):
            logger.info(f"Images directory does not exist, returning empty list")
            return {"patient_id": patient_id, "images": []}
        
        # Find all images for this patient
        patient_images = []
        all_files = os.listdir(images_dir)
        logger.info(f"All files in images directory: {all_files}")
        
        for filename in all_files:
            if filename.startswith(f"{patient_id}_"):
                file_path = os.path.join(images_dir, filename)
                file_stat = os.stat(file_path)
                
                # Read image and convert to base64
                with open(file_path, "rb") as f:
                    image_data = f.read()
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                
                patient_images.append({
                    "filename": filename,
                    "path": file_path,
                    "base64": image_base64,
                    "upload_time": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                    "size_bytes": file_stat.st_size
                })
        
        # Sort by upload time (newest first)
        patient_images.sort(key=lambda x: x["upload_time"], reverse=True)
        
        return {
            "patient_id": patient_id,
            "images": patient_images,
            "total_images": len(patient_images)
        }
        
    except Exception as e:
        logger.error(f"Failed to get patient images: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve images: {str(e)}")

@app.get("/api/latest-patient-image/{patient_id}")
async def get_latest_patient_image(patient_id: str):
    """Get the most recent uploaded image for a patient"""
    try:
        images_dir = "uploaded_images"
        logger.info(f"Getting latest image for patient: {patient_id}")
        
        if not os.path.exists(images_dir):
            raise HTTPException(status_code=404, detail="No images found for this patient")
        
        # Find the most recent image for this patient
        latest_image = None
        latest_time = 0
        
        for filename in os.listdir(images_dir):
            if filename.startswith(f"{patient_id}_"):
                file_path = os.path.join(images_dir, filename)
                file_stat = os.stat(file_path)
                
                if file_stat.st_mtime > latest_time:
                    latest_time = file_stat.st_mtime
                    latest_image = {
                        "filename": filename,
                        "path": file_path,
                        "upload_time": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                        "size_bytes": file_stat.st_size
                    }
        
        if not latest_image:
            raise HTTPException(status_code=404, detail="No images found for this patient")
        
        # Read image and convert to base64
        with open(latest_image["path"], "rb") as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        latest_image["base64"] = image_base64
        
        return {
            "patient_id": patient_id,
            "latest_image": latest_image
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get latest patient image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve image: {str(e)}")

@app.post("/api/analyze-image", response_model=HealingAnalysisResponse)
async def analyze_healing_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    patient_id: str = Form("default_patient")
):
    """
    Analyze uploaded medical image for healing progress assessment
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        logger.info(f"Processing image analysis for patient: {patient_id}")
        
        # Create images directory if it doesn't exist
        images_dir = "uploaded_images"
        os.makedirs(images_dir, exist_ok=True)
        
        # Save image for doctor portal access
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_filename = f"{patient_id}_{timestamp}_{file.filename}"
        image_path = os.path.join(images_dir, image_filename)
        
        # Save original image
        with open(image_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"Image saved to: {image_path}")
        
        # Convert image to base64 for frontend access
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Perform simplified AI analysis
        analysis_result = await ai_manager.analyze_wound_image(image, patient_id)
        
        # Create response - ensure all values are JSON serializable
        response_data = {
            "patient_id": patient_id,
            "analysis_id": f"analysis_{timestamp}",
            "timestamp": datetime.now(),
            "image_data": {
                "filename": image_filename,
                "path": image_path,
                "base64": image_base64,
                "upload_timestamp": timestamp
            },
            **analysis_result
        }
        
        # Convert any numpy types to Python native types
        def convert_numpy_types(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {key: convert_numpy_types(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            else:
                return obj
        
        # Clean the response data
        cleaned_data = convert_numpy_types(response_data)
        
        response = HealingAnalysisResponse(**cleaned_data)
        
        logger.info(f"Analysis completed for patient {patient_id}: {response.healing_score:.1f}% healing")
        
        # Background task to save analysis results
        background_tasks.add_task(save_analysis_result, response.dict())
        
        return response
        
    except Exception as e:
        logger.error(f"Error in image analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/predict-timeline", response_model=ProgressPredictionResponse)
async def predict_healing_timeline(patient_id: str, current_healing_score: float):
    """
    Predict healing timeline based on current progress
    """
    try:
        # Simple prediction model
        days_remaining = max(1, int((100 - current_healing_score) * 0.5))
        
        # Risk factors assessment
        risk_factors = []
        if current_healing_score < 30:
            risk_factors.extend(["Slow healing rate", "Possible complications"])
        if current_healing_score < 50:
            risk_factors.append("Extended recovery time expected")
        
        # Success probability
        success_prob = min(0.95, current_healing_score / 100 + 0.1)
        
        response = ProgressPredictionResponse(
            patient_id=patient_id,
            predicted_healing_days=days_remaining,
            confidence_interval={"min": max(1, days_remaining - 3), "max": days_remaining + 5},
            risk_factors=risk_factors,
            success_probability=success_prob
        )
        
        logger.info(f"Timeline prediction for patient {patient_id}: {days_remaining} days")
        return response
        
    except Exception as e:
        logger.error(f"Error in timeline prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/recommendations/{patient_id}")
async def get_personalized_recommendations(patient_id: str):
    """
    Get personalized treatment recommendations
    """
    try:
        recommendations = {
            "patient_id": patient_id,
            "daily_care": [
                "Clean wound with saline solution twice daily",
                "Apply prescribed topical medication",
                "Keep wound covered with sterile dressing",
                "Monitor for signs of infection"
            ],
            "lifestyle": [
                "Maintain balanced diet rich in protein and vitamin C",
                "Stay hydrated (8-10 glasses of water daily)",
                "Get adequate sleep (7-9 hours nightly)",
                "Avoid smoking and excessive alcohol"
            ],
            "exercises": [
                "Gentle range of motion exercises",
                "Light walking as tolerated",
                "Deep breathing exercises",
                "Avoid high-impact activities"
            ],
            "warning_signs": [
                "Increased redness or swelling",
                "Fever or chills",
                "Unusual discharge or odor",
                "Severe or worsening pain"
            ],
            "next_steps": [
                "Schedule follow-up appointment in 1 week",
                "Take progress photos daily",
                "Continue current medication regimen",
                "Contact healthcare provider if concerns arise"
            ]
        }
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/api/analytics/{patient_id}")
async def get_healing_analytics(patient_id: str, days: int = 30):
    """
    Get healing progress analytics and trends
    """
    try:
        # Mock analytics data
        analytics = {
            "patient_id": patient_id,
            "period_days": days,
            "progress_trend": "improving",
            "average_healing_rate": 2.3,
            "best_day": "2024-01-08",
            "total_improvement": 15.5,
            "milestones_reached": [
                {"date": "2024-01-05", "milestone": "Inflammation reduced"},
                {"date": "2024-01-08", "milestone": "50% healing achieved"},
                {"date": "2024-01-10", "milestone": "Granulation tissue formed"}
            ],
            "predictions": {
                "expected_full_healing": "2024-01-25",
                "confidence": 0.82
            }
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

# Background task functions
async def save_analysis_result(analysis_data: Dict[str, Any]):
    """Save analysis result to database (mock implementation)"""
    try:
        logger.info(f"Saving analysis result for patient: {analysis_data.get('patient_id')}")
        # In production, save to database
    except Exception as e:
        logger.error(f"Error saving analysis result: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting Healing Tracker AI Service (Simplified)...")
    uvicorn.run(
        "app_simplified:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )
