#!/usr/bin/env python3
"""
Simple test server for AI analysis functionality
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
import cv2
from datetime import datetime
import json

app = FastAPI(title="AI Analysis Test Server")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Analysis Test Server",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/nutrition-recommendations/{patient_id}")
async def get_nutrition_recommendations(patient_id: str):
    """Get nutrition recommendations for a patient"""
    return {
        "patient_id": patient_id,
        "recommendations": [
            "Focus on high-protein foods to support healing",
            "Include vitamin C rich foods for collagen formation",
            "Stay well hydrated with 8-10 glasses of water daily",
            "Consider anti-inflammatory foods like fatty fish and berries"
        ],
        "priority_foods": ["Lean proteins", "Citrus fruits", "Leafy greens", "Nuts and seeds"],
        "meal_timing": [
            "Eat within 1 hour of waking",
            "Have protein with each meal",
            "Space meals 3-4 hours apart",
            "Avoid eating 2 hours before bed"
        ]
    }

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...), patient_id: str = Form("test_patient")):
    """Analyze uploaded image for healing progress"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Basic image analysis
        height, width = image.shape[:2]
        
        # Analyze image characteristics
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Color analysis
        red_channel = image[:, :, 2]
        green_channel = image[:, :, 1]
        blue_channel = image[:, :, 0]
        
        avg_red = np.mean(red_channel)
        avg_green = np.mean(green_channel)
        avg_blue = np.mean(blue_channel)
        
        # Calculate metrics
        brightness = np.mean(gray)
        contrast = np.std(gray)
        redness_ratio = avg_red / (avg_green + avg_blue + 1)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (height * width)
        
        # Calculate healing score (simplified)
        base_score = 50
        brightness_score = min(30, (brightness / 255) * 30)
        redness_score = max(0, 25 - (redness_ratio * 15))
        contrast_score = min(20, max(0, 20 - abs(contrast - 50) / 5))
        edge_score = max(0, 25 - (edge_density * 100))
        
        healing_score = base_score + brightness_score + redness_score + contrast_score + edge_score
        healing_score = min(100, max(10, healing_score))
        
        # Determine levels
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
        
        # Generate recommendations
        recommendations = []
        if healing_stage == "inflammatory":
            recommendations = [
                "Keep wound clean and dry",
                "Apply prescribed anti-inflammatory medication",
                "Monitor for signs of infection",
                "Avoid excessive physical activity"
            ]
        elif healing_stage == "proliferative":
            recommendations = [
                "Maintain moist wound environment",
                "Continue gentle exercises",
                "Ensure adequate protein intake",
                "Monitor healing progress"
            ]
        elif healing_stage == "maturation":
            recommendations = [
                "Focus on scar management",
                "Continue mobility exercises",
                "Maintain healthy lifestyle",
                "Regular follow-up appointments"
            ]
        else:
            recommendations = [
                "Continue current treatment plan",
                "Monitor for any changes",
                "Maintain good hygiene",
                "Follow medical advice"
            ]
        
        # Calculate wound area (simplified)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        dark_pixels = np.sum(binary == 0)
        wound_area = (dark_pixels / (height * width)) * 25
        
        # Calculate confidence
        resolution_factor = min(1.0, (width * height) / (640 * 480))
        contrast_factor = min(1.0, contrast / 100)
        brightness_factor = min(1.0, brightness / 128)
        confidence_score = (resolution_factor * 0.4 + contrast_factor * 0.3 + brightness_factor * 0.3)
        confidence_score = max(0.6, min(0.95, confidence_score))
        
        # Visual features
        visual_features = {
            "area_cm2": float(wound_area),
            "brightness": float(brightness),
            "redness_ratio": float(redness_ratio),
            "mean_red": float(avg_red),
            "mean_green": float(avg_green),
            "mean_blue": float(avg_blue),
            "texture_variance": float(contrast),
            "edge_density": float(edge_density),
            "image_dimensions": {"width": width, "height": height}
        }
        
        return {
            "patient_id": patient_id,
            "analysis_id": f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "timestamp": datetime.now().isoformat(),
            "healing_score": float(healing_score),
            "wound_area": float(wound_area),
            "inflammation_level": inflammation_level,
            "infection_risk": infection_risk,
            "healing_stage": healing_stage,
            "recommendations": recommendations,
            "confidence_score": float(confidence_score),
            "visual_features": visual_features
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    print("Starting AI Analysis Test Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
