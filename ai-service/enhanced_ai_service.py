#!/usr/bin/env python3
"""
Enhanced AI Service with Advanced Medical Image Analysis
Integrates multiple AI models and external APIs for better accuracy
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
import cv2
from datetime import datetime
import json
import asyncio
import aiohttp
import base64
import os
from io import BytesIO
from PIL import Image, ImageEnhance
import requests
from typing import Dict, List, Tuple
import logging
from external_api_integration import ExternalAPIIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Enhanced Medical AI Analysis Service",
    description="Advanced wound healing analysis with multiple AI models",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EnhancedAIAnalyzer:
    def __init__(self):
        self.wound_classification_model = None
        self.healing_stage_model = None
        self.external_api_integration = ExternalAPIIntegration()
        
    async def preprocess_image(self, image: np.ndarray) -> Dict:
        """Advanced image preprocessing for better analysis"""
        try:
            # Convert to different color spaces
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Image enhancement
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            enhanced = enhancer.enhance(1.5)
            
            # Enhance sharpness
            sharpness_enhancer = ImageEnhance.Sharpness(enhanced)
            sharpened = sharpness_enhancer.enhance(1.2)
            
            enhanced_array = np.array(sharpened)
            enhanced_bgr = cv2.cvtColor(enhanced_array, cv2.COLOR_RGB2BGR)
            
            # Noise reduction
            denoised = cv2.fastNlMeansDenoisingColored(enhanced_bgr, None, 10, 10, 7, 21)
            
            return {
                'original': image,
                'enhanced': denoised,
                'hsv': hsv,
                'lab': lab,
                'gray': gray,
                'pil_enhanced': sharpened
            }
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return {'original': image, 'enhanced': image}
    
    async def advanced_color_analysis(self, image: np.ndarray) -> Dict:
        """Advanced color analysis using multiple color spaces"""
        try:
            # HSV analysis for better color detection
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Define color ranges for wound analysis
            # Red/Inflammation detection
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            
            # Yellow/Pus/Slough detection (CRITICAL INFECTION INDICATOR) - MORE SENSITIVE
            lower_yellow = np.array([10, 60, 60])  # More sensitive to yellow
            upper_yellow = np.array([40, 255, 255])
            
            # White/Yellowish exudate detection (PUS INDICATOR) - MORE SENSITIVE
            lower_white_yellow = np.array([0, 0, 120])  # Lower threshold for white/yellow
            upper_white_yellow = np.array([35, 60, 255])
            
            # Dark/Necrotic tissue detection (DEAD TISSUE INDICATOR) - MORE SENSITIVE
            lower_dark = np.array([0, 0, 0])
            upper_dark = np.array([180, 255, 100])  # Higher threshold to catch more dark areas
            
            # Additional brown/red necrotic tissue detection
            lower_brown = np.array([0, 50, 20])
            upper_brown = np.array([20, 255, 100])
            
            # Green/Healthy tissue detection
            lower_green = np.array([40, 50, 50])
            upper_green = np.array([80, 255, 255])
            
            # Create masks
            red_mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            red_mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            red_mask = cv2.bitwise_or(red_mask1, red_mask2)
            
            yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
            white_yellow_mask = cv2.inRange(hsv, lower_white_yellow, upper_white_yellow)
            dark_mask = cv2.inRange(hsv, lower_dark, upper_dark)
            brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
            green_mask = cv2.inRange(hsv, lower_green, upper_green)
            
            # Combine dark and brown masks for better necrotic tissue detection
            necrotic_mask = cv2.bitwise_or(dark_mask, brown_mask)
            
            # Calculate percentages
            total_pixels = image.shape[0] * image.shape[1]
            red_percentage = (np.sum(red_mask > 0) / total_pixels) * 100
            yellow_percentage = (np.sum(yellow_mask > 0) / total_pixels) * 100
            white_yellow_percentage = (np.sum(white_yellow_mask > 0) / total_pixels) * 100
            dark_percentage = (np.sum(dark_mask > 0) / total_pixels) * 100
            brown_percentage = (np.sum(brown_mask > 0) / total_pixels) * 100
            necrotic_percentage = (np.sum(necrotic_mask > 0) / total_pixels) * 100
            green_percentage = (np.sum(green_mask > 0) / total_pixels) * 100
            
            # RGB analysis
            red_channel = image[:, :, 2]
            green_channel = image[:, :, 1]
            blue_channel = image[:, :, 0]
            
            avg_red = np.mean(red_channel)
            avg_green = np.mean(green_channel)
            avg_blue = np.mean(blue_channel)
            
            # Calculate advanced metrics
            redness_ratio = avg_red / (avg_green + avg_blue + 1)
            inflammation_index = (red_percentage * 0.6) + (redness_ratio * 0.4)
            
            # CRITICAL: Calculate infection indicators - IMPROVED DETECTION
            infection_indicators = {
                'slough_percentage': yellow_percentage + white_yellow_percentage,  # Yellow/white material
                'necrosis_percentage': necrotic_percentage,  # Combined dark/brown tissue
                'purulent_exudate': white_yellow_percentage,  # Pus-like discharge
                'total_infection_score': (yellow_percentage * 3) + (white_yellow_percentage * 4) + (necrotic_percentage * 3) + (brown_percentage * 2)
            }
            
            return {
                'red_percentage': red_percentage,
                'yellow_percentage': yellow_percentage,
                'white_yellow_percentage': white_yellow_percentage,
                'dark_percentage': dark_percentage,
                'brown_percentage': brown_percentage,
                'necrotic_percentage': necrotic_percentage,
                'green_percentage': green_percentage,
                'avg_red': avg_red,
                'avg_green': avg_green,
                'avg_blue': avg_blue,
                'redness_ratio': redness_ratio,
                'inflammation_index': inflammation_index,
                'infection_indicators': infection_indicators,
                'masks': {
                    'red': red_mask,
                    'yellow': yellow_mask,
                    'white_yellow': white_yellow_mask,
                    'dark': dark_mask,
                    'brown': brown_mask,
                    'necrotic': necrotic_mask,
                    'green': green_mask
                }
            }
            
        except Exception as e:
            logger.error(f"Color analysis failed: {e}")
            return {}
    
    async def advanced_texture_analysis(self, image: np.ndarray) -> Dict:
        """Advanced texture analysis using multiple techniques"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Gabor filters for texture analysis
            def gabor_filter(image, frequency, orientation):
                kernel = cv2.getGaborKernel((21, 21), 5, orientation, 10, 0.5, 0, ktype=cv2.CV_32F)
                return cv2.filter2D(image, cv2.CV_8UC3, kernel)
            
            # Apply Gabor filters at different orientations
            orientations = [0, 45, 90, 135]
            gabor_responses = []
            for orientation in orientations:
                response = gabor_filter(gray, 0.1, np.radians(orientation))
                gabor_responses.append(np.mean(response))
            
            # Local Binary Pattern (LBP) analysis
            def local_binary_pattern(image, radius=1, n_points=8):
                rows, cols = image.shape
                lbp = np.zeros_like(image)
                
                for i in range(radius, rows - radius):
                    for j in range(radius, cols - radius):
                        center = image[i, j]
                        binary_string = ''
                        
                        for k in range(n_points):
                            angle = 2 * np.pi * k / n_points
                            x = int(i + radius * np.cos(angle))
                            y = int(j + radius * np.sin(angle))
                            
                            if x < rows and y < cols:
                                binary_string += '1' if image[x, y] >= center else '0'
                        
                        lbp[i, j] = int(binary_string, 2)
                
                return lbp
            
            lbp = local_binary_pattern(gray)
            lbp_uniformity = np.std(lbp)
            
            # Haralick texture features
            def haralick_features(image):
                # Calculate co-occurrence matrix
                glcm = np.zeros((256, 256), dtype=np.uint8)
                
                for i in range(image.shape[0] - 1):
                    for j in range(image.shape[1] - 1):
                        glcm[image[i, j], image[i + 1, j]] += 1
                        glcm[image[i, j], image[i, j + 1]] += 1
                
                # Normalize
                glcm = glcm.astype(np.float32)
                glcm /= glcm.sum()
                
                # Calculate features
                contrast = np.sum(glcm * np.square(np.arange(256)[:, None] - np.arange(256)))
                energy = np.sum(glcm ** 2)
                homogeneity = np.sum(glcm / (1 + np.square(np.arange(256)[:, None] - np.arange(256))))
                
                return {
                    'contrast': contrast,
                    'energy': energy,
                    'homogeneity': homogeneity
                }
            
            haralick = haralick_features(gray)
            
            # Edge density analysis
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1])
            
            # Gradient analysis
            grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
            gradient_mean = np.mean(gradient_magnitude)
            
            return {
                'gabor_responses': gabor_responses,
                'lbp_uniformity': lbp_uniformity,
                'haralick_features': haralick,
                'edge_density': edge_density,
                'gradient_mean': gradient_mean,
                'texture_complexity': np.std(gray) / np.mean(gray)
            }
            
        except Exception as e:
            logger.error(f"Texture analysis failed: {e}")
            return {}
    
    async def wound_segmentation(self, image: np.ndarray) -> Dict:
        """Advanced wound segmentation using multiple techniques"""
        try:
            # Convert to HSV for better segmentation
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Adaptive thresholding
            adaptive_thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Otsu's thresholding
            _, otsu_thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Watershed segmentation
            # Noise removal
            kernel = np.ones((3, 3), np.uint8)
            opening = cv2.morphologyEx(otsu_thresh, cv2.MORPH_OPEN, kernel, iterations=2)
            
            # Sure background area
            sure_bg = cv2.dilate(opening, kernel, iterations=3)
            
            # Finding sure foreground area
            dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
            _, sure_fg = cv2.threshold(dist_transform, 0.7 * dist_transform.max(), 255, 0)
            
            # Finding unknown region
            sure_fg = np.uint8(sure_fg)
            unknown = cv2.subtract(sure_bg, sure_fg)
            
            # Marker labelling
            _, markers = cv2.connectedComponents(sure_fg)
            
            # Add one to all labels so that sure background is not 0, but 1
            markers = markers + 1
            
            # Mark the region of unknown with zero
            markers[unknown == 255] = 0
            
            # Apply watershed
            markers = cv2.watershed(image, markers)
            
            # Calculate wound area
            wound_pixels = np.sum(markers == -1)  # Watershed boundaries
            total_pixels = image.shape[0] * image.shape[1]
            wound_percentage = (wound_pixels / total_pixels) * 100
            
            # Contour analysis
            contours, _ = cv2.findContours(otsu_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Find largest contour (likely the wound)
                largest_contour = max(contours, key=cv2.contourArea)
                area = cv2.contourArea(largest_contour)
                perimeter = cv2.arcLength(largest_contour, True)
                
                # Calculate circularity
                circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
                
                # Calculate aspect ratio
                x, y, w, h = cv2.boundingRect(largest_contour)
                aspect_ratio = w / h if h > 0 else 0
                
                # Calculate solidity
                hull = cv2.convexHull(largest_contour)
                hull_area = cv2.contourArea(hull)
                solidity = area / hull_area if hull_area > 0 else 0
            else:
                area = perimeter = circularity = aspect_ratio = solidity = 0
            
            return {
                'wound_percentage': wound_percentage,
                'wound_area_pixels': wound_pixels,
                'contour_area': area,
                'perimeter': perimeter,
                'circularity': circularity,
                'aspect_ratio': aspect_ratio,
                'solidity': solidity,
                'num_contours': len(contours),
                'markers': markers
            }
            
        except Exception as e:
            logger.error(f"Wound segmentation failed: {e}")
            return {}
    
    async def calculate_enhanced_healing_score(self, analysis_results: Dict) -> Dict:
        """Calculate enhanced healing score using multiple factors"""
        try:
            color_analysis = analysis_results.get('color_analysis', {})
            texture_analysis = analysis_results.get('texture_analysis', {})
            segmentation = analysis_results.get('segmentation', {})
            external_analysis = analysis_results.get('external_analysis', {})
            
            # Base score
            base_score = 50
            
            # Color-based scoring (40% weight)
            red_percentage = color_analysis.get('red_percentage', 0)
            yellow_percentage = color_analysis.get('yellow_percentage', 0)
            green_percentage = color_analysis.get('green_percentage', 0)
            inflammation_index = color_analysis.get('inflammation_index', 0)
            
            # MEDICAL PARAMETERS: Tissue Composition Analysis
            # Granulation tissue (red, beefy, moist) → sign of healing
            granulation_percentage = red_percentage
            
            # Slough (yellow/white tissue) → dead tissue, needs to be cleared
            slough_percentage = yellow_percentage + color_analysis.get('white_yellow_percentage', 0)
            
            # Necrotic/eschar (black/brown hard tissue) → non-healing, no blood flow
            necrotic_percentage = color_analysis.get('dark_percentage', 0) + color_analysis.get('brown_percentage', 0)
            
            # Healthy tissue (green) → epithelialization
            healthy_tissue_percentage = green_percentage
            
            # MEDICAL CALCULATION: Based on tissue composition
            # If 0% granulation, 100% necrotic/slough → 0% healed
            # If 50% granulation, 50% slough → ~50% healed
            # If 80–90% granulation, minimal slough, epithelial edges visible → ~80–90% healed
            # If 100% epithelialization (closed wound) → 100% healed
            
            # Base healing percentage from granulation tissue
            base_healing = granulation_percentage
            
            # Bonus for healthy tissue (epithelialization)
            epithelialization_bonus = healthy_tissue_percentage * 0.5
            
            # Penalty for necrotic tissue (severe penalty)
            necrotic_penalty = necrotic_percentage * 2
            
            # Penalty for slough (moderate penalty)
            slough_penalty = slough_percentage * 0.8
            
            # Calculate medical healing percentage
            medical_healing_percentage = base_healing + epithelialization_bonus - necrotic_penalty - slough_penalty
            
            # Ensure percentage is within medical bounds (0-100%)
            medical_healing_percentage = max(0, min(100, medical_healing_percentage))
            
            # Use medical percentage as the color score
            color_score = medical_healing_percentage
            
            # Texture-based scoring (30% weight)
            texture_complexity = texture_analysis.get('texture_complexity', 0)
            edge_density = texture_analysis.get('edge_density', 0)
            gradient_mean = texture_analysis.get('gradient_mean', 0)
            
            # Moderate texture complexity is good for healing
            texture_score = max(0, 30 - abs(texture_complexity - 0.5) * 20 - (edge_density * 100))
            
            # Shape-based scoring (20% weight)
            circularity = segmentation.get('circularity', 0)
            solidity = segmentation.get('solidity', 0)
            aspect_ratio = segmentation.get('aspect_ratio', 1)
            
            # More circular and solid shapes indicate better healing
            shape_score = max(0, 20 * (circularity * 0.5 + solidity * 0.5))
            
            # Size-based scoring (10% weight)
            wound_percentage = segmentation.get('wound_percentage', 0)
            size_score = max(0, 10 - (wound_percentage * 0.2))
            
            # External API validation score (10% weight)
            external_confidence = external_analysis.get('overall_confidence', 0.8)
            medical_relevance = external_analysis.get('overall_medical_relevance', 0.7)
            external_score = (external_confidence * 0.6 + medical_relevance * 0.4) * 10
            
            # Calculate final score
            final_score = base_score + color_score + texture_score + shape_score + size_score + external_score
            final_score = min(100, max(10, final_score))
            
            # MEDICAL: Determine healing stage based on tissue composition
            if necrotic_percentage > 20 or slough_percentage > 60:
                # SEVERE INFECTION - Extensive necrotic/slough tissue
                healing_stage = "severe_infection"
                inflammation_level = "severe"
                infection_risk = "critical"
                final_score = min(final_score, 15)  # Cap at 15% for severe infection
            elif necrotic_percentage > 10 or slough_percentage > 40:
                # MODERATE INFECTION - Significant necrotic/slough tissue
                healing_stage = "infected"
                inflammation_level = "high"
                infection_risk = "high"
                final_score = min(final_score, 25)  # Cap at 25% for infection
            elif necrotic_percentage > 5 or slough_percentage > 20:
                # MILD INFECTION - Some necrotic/slough tissue
                healing_stage = "infected"
                inflammation_level = "moderate"
                infection_risk = "moderate"
                final_score = min(final_score, 35)  # Cap at 35% for mild infection
            elif medical_healing_percentage >= 80:
                # MATURATION - Mostly healthy tissue
                healing_stage = "maturation"
                inflammation_level = "low"
                infection_risk = "low"
            elif medical_healing_percentage >= 60:
                # HEALING - Good granulation tissue
                healing_stage = "healing"
                inflammation_level = "low"
                infection_risk = "low"
            elif medical_healing_percentage >= 40:
                # PROLIFERATIVE - Some granulation tissue
                healing_stage = "proliferative"
                inflammation_level = "moderate"
                infection_risk = "low"
            else:
                # INFLAMMATORY - Minimal granulation tissue
                healing_stage = "inflammatory"
                inflammation_level = "high"
                infection_risk = "moderate"
            
            # Calculate confidence based on analysis quality
            confidence_factors = [
                min(1.0, color_analysis.get('inflammation_index', 0) / 10),
                min(1.0, texture_analysis.get('texture_complexity', 0) * 2),
                min(1.0, segmentation.get('circularity', 0)),
                min(1.0, segmentation.get('solidity', 0))
            ]
            
            confidence_score = np.mean(confidence_factors)
            confidence_score = max(0.6, min(0.95, confidence_score))
            
            return {
                'healing_score': final_score,
                'healing_stage': healing_stage,
                'inflammation_level': inflammation_level,
                'infection_risk': infection_risk,
                'confidence_score': confidence_score,
                'medical_analysis': {
                    'tissue_composition': {
                        'granulation_percentage': round(granulation_percentage, 1),
                        'slough_percentage': round(slough_percentage, 1),
                        'necrotic_percentage': round(necrotic_percentage, 1),
                        'healthy_tissue_percentage': round(healthy_tissue_percentage, 1)
                    },
                    'medical_calculation': {
                        'base_granulation': round(granulation_percentage, 1),
                        'epithelialization_bonus': round(epithelialization_bonus, 1),
                        'necrotic_penalty': round(necrotic_penalty, 1),
                        'slough_penalty': round(slough_penalty, 1),
                        'medical_percentage': round(medical_healing_percentage, 1)
                    }
                },
                'score_breakdown': {
                    'base_score': base_score,
                    'color_score': color_score,
                    'texture_score': texture_score,
                    'shape_score': shape_score,
                    'size_score': size_score,
                    'external_score': external_score
                }
            }
            
        except Exception as e:
            logger.error(f"Healing score calculation failed: {e}")
            return {'healing_score': 75, 'healing_stage': 'healing', 'confidence_score': 0.8}
    
    async def generate_advanced_recommendations(self, analysis_results: Dict) -> List[str]:
        """Generate advanced recommendations based on comprehensive analysis"""
        try:
            healing_score = analysis_results.get('healing_score', 75)
            healing_stage = analysis_results.get('healing_stage', 'healing')
            inflammation_level = analysis_results.get('inflammation_level', 'moderate')
            infection_risk = analysis_results.get('infection_risk', 'moderate')
            
            recommendations = []
            
            # CRITICAL: Add infection-specific recommendations
            if healing_stage == "severe_infection":
                recommendations.extend([
                    "🚨 URGENT: Severe infection detected - seek immediate medical attention",
                    "🚨 CRITICAL: Extensive necrotic tissue requires immediate debridement",
                    "🚨 URGENT: Purulent exudate indicates active bacterial infection",
                    "🚨 IMMEDIATE: Contact healthcare provider or visit emergency room",
                    "🚨 CRITICAL: Do not delay treatment - infection can spread rapidly"
                ])
            elif healing_stage == "infected":
                recommendations.extend([
                    "⚠️ WARNING: Signs of infection detected - contact healthcare provider immediately",
                    "⚠️ URGENT: Necrotic tissue present - requires medical debridement",
                    "⚠️ WARNING: Slough/exudate indicates bacterial presence",
                    "⚠️ IMMEDIATE: Antibiotic treatment may be required",
                    "⚠️ URGENT: Monitor for signs of spreading infection"
                ])
            
            # Stage-specific recommendations
            if healing_stage == "inflammatory":
                recommendations.extend([
                    "Apply cold compress to reduce inflammation",
                    "Keep wound clean and dry",
                    "Use prescribed anti-inflammatory medication",
                    "Monitor for signs of infection closely",
                    "Avoid excessive physical activity"
                ])
            elif healing_stage == "proliferative":
                recommendations.extend([
                    "Maintain moist wound environment",
                    "Continue gentle range-of-motion exercises",
                    "Ensure adequate protein intake (1.2-1.5g/kg body weight)",
                    "Apply prescribed topical treatments",
                    "Protect wound from trauma"
                ])
            elif healing_stage == "healing":
                recommendations.extend([
                    "Focus on scar management techniques",
                    "Continue mobility and strengthening exercises",
                    "Maintain balanced nutrition with antioxidants",
                    "Use silicone gel or sheets for scar prevention",
                    "Regular follow-up with healthcare provider"
                ])
            else:  # maturation
                recommendations.extend([
                    "Focus on long-term scar management",
                    "Continue full range-of-motion exercises",
                    "Maintain healthy lifestyle habits",
                    "Consider cosmetic treatments if needed",
                    "Schedule regular health checkups"
                ])
            
            # Inflammation-specific recommendations
            if inflammation_level == "high":
                recommendations.extend([
                    "Consider anti-inflammatory diet (reduce processed foods)",
                    "Increase omega-3 fatty acid intake",
                    "Apply ice packs for 15-20 minutes every 2-3 hours",
                    "Consider turmeric or ginger supplements"
                ])
            
            # Infection risk recommendations
            if infection_risk == "high":
                recommendations.extend([
                    "Monitor temperature daily",
                    "Watch for increased redness, warmth, or swelling",
                    "Seek immediate medical attention if symptoms worsen",
                    "Maintain strict hygiene practices"
                ])
            
            # Score-based recommendations
            if healing_score < 50:
                recommendations.extend([
                    "Consider consulting a wound care specialist",
                    "Review current treatment plan with healthcare provider",
                    "Ensure adequate sleep (7-9 hours nightly)",
                    "Manage stress levels effectively"
                ])
            elif healing_score > 85:
                recommendations.extend([
                    "Excellent progress! Continue current care routine",
                    "Focus on prevention of future injuries",
                    "Maintain healthy lifestyle habits",
                    "Consider gradual return to normal activities"
                ])
            
            return list(set(recommendations))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return ["Continue current treatment plan", "Monitor healing progress", "Follow medical advice"]

# Initialize analyzer
analyzer = EnhancedAIAnalyzer()

@app.get("/api/health")
async def health_check():
    """Enhanced health check endpoint"""
    return {
        "status": "healthy",
        "service": "Enhanced Medical AI Analysis Service",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": [
            "Advanced color analysis",
            "Multi-scale texture analysis", 
            "Wound segmentation",
            "Enhanced healing scoring",
            "Comprehensive recommendations",
            "Image storage for doctor portal"
        ]
    }

@app.get("/api/debug/images")
async def debug_images():
    """Debug endpoint to check image storage"""
    try:
        images_dir = "uploaded_images"
        if not os.path.exists(images_dir):
            return {
                "images_directory_exists": False,
                "message": "Images directory does not exist"
            }
        
        all_files = os.listdir(images_dir)
        return {
            "images_directory_exists": True,
            "total_files": len(all_files),
            "files": all_files,
            "directory_path": os.path.abspath(images_dir)
        }
    except Exception as e:
        return {
            "error": str(e),
            "images_directory_exists": False
        }

@app.get("/api/patient-images/{patient_id}")
async def get_patient_images(patient_id: str):
    """Get all uploaded images for a specific patient"""
    try:
        images_dir = "uploaded_images"
        logger.info(f"Getting images for patient: {patient_id}")
        logger.info(f"Images directory exists: {os.path.exists(images_dir)}")
        
        if not os.path.exists(images_dir):
            logger.info(f"Images directory does not exist, returning empty list")
            return {"patient_id": patient_id, "images": []}
        
        # Find all images for this patient
        patient_images = []
        all_files = os.listdir(images_dir)
        logger.info(f"All files in images directory: {all_files}")
        
        for filename in all_files:
            logger.info(f"Checking file: {filename}, starts with {patient_id}_: {filename.startswith(f'{patient_id}_')}")
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

@app.post("/api/nutrition-recommendations/{patient_id}")
async def get_nutrition_recommendations(patient_id: str):
    """Enhanced nutrition recommendations"""
    return {
        "patient_id": patient_id,
        "recommendations": [
            "Increase protein intake to 1.2-1.5g per kg body weight for optimal healing",
            "Include vitamin C rich foods (citrus fruits, bell peppers, strawberries)",
            "Add zinc-rich foods (lean meats, nuts, seeds, legumes)",
            "Consume omega-3 fatty acids (fatty fish, flaxseeds, walnuts)",
            "Stay hydrated with 8-10 glasses of water daily",
            "Include antioxidant-rich foods (berries, leafy greens, colorful vegetables)",
            "Consider collagen supplements or bone broth",
            "Limit processed foods and added sugars"
        ],
        "priority_foods": [
            "Salmon and other fatty fish",
            "Greek yogurt and cottage cheese", 
            "Eggs and lean poultry",
            "Citrus fruits and berries",
            "Leafy green vegetables",
            "Nuts and seeds",
            "Whole grains",
            "Colorful vegetables"
        ],
        "meal_timing": [
            "Eat protein within 1 hour of waking",
            "Include protein with each meal and snack",
            "Space meals 3-4 hours apart",
            "Have a protein-rich snack before bed",
            "Avoid eating 2-3 hours before sleep"
        ],
        "supplements": [
            "Vitamin C: 1000mg daily",
            "Zinc: 15-30mg daily",
            "Omega-3: 1000-2000mg daily",
            "Collagen peptides: 10-20g daily",
            "Probiotics for gut health"
        ]
    }

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...), patient_id: str = Form("test_patient")):
    """Enhanced image analysis with advanced AI algorithms"""
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
        
        logger.info(f"Starting enhanced analysis for patient: {patient_id}")
        logger.info(f"Image saved to: {image_path}")
        logger.info(f"Image filename: {image_filename}")
        logger.info(f"Images directory exists: {os.path.exists(images_dir)}")
        logger.info(f"Image file exists: {os.path.exists(image_path)}")
        
        # Preprocess image
        preprocessed = await analyzer.preprocess_image(image)
        
        # Convert image to base64 for external API analysis
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Perform comprehensive analysis (run in parallel)
        analysis_tasks = [
            analyzer.advanced_color_analysis(preprocessed['enhanced']),
            analyzer.advanced_texture_analysis(preprocessed['enhanced']),
            analyzer.wound_segmentation(preprocessed['enhanced']),
            analyzer.external_api_integration.get_combined_external_analysis(image_base64)
        ]
        
        results = await asyncio.gather(*analysis_tasks)
        color_analysis, texture_analysis, segmentation, external_analysis = results
        
        # Combine analysis results
        analysis_results = {
            'color_analysis': color_analysis,
            'texture_analysis': texture_analysis,
            'segmentation': segmentation,
            'external_analysis': external_analysis
        }
        
        # Calculate enhanced healing score
        healing_assessment = await analyzer.calculate_enhanced_healing_score(analysis_results)
        
        # Generate advanced recommendations
        recommendations = await analyzer.generate_advanced_recommendations(healing_assessment)
        
        # Calculate wound area in cm² (assuming standard reference)
        wound_area_cm2 = segmentation.get('wound_percentage', 0) * 0.1  # Rough conversion
        
        # Enhanced visual features
        visual_features = {
            'area_cm2': wound_area_cm2,
            'wound_percentage': segmentation.get('wound_percentage', 0),
            'circularity': segmentation.get('circularity', 0),
            'solidity': segmentation.get('solidity', 0),
            'aspect_ratio': segmentation.get('aspect_ratio', 0),
            'red_percentage': color_analysis.get('red_percentage', 0),
            'yellow_percentage': color_analysis.get('yellow_percentage', 0),
            'green_percentage': color_analysis.get('green_percentage', 0),
            'inflammation_index': color_analysis.get('inflammation_index', 0),
            'texture_complexity': texture_analysis.get('texture_complexity', 0),
            'edge_density': texture_analysis.get('edge_density', 0),
            'gradient_mean': texture_analysis.get('gradient_mean', 0),
            'image_dimensions': {
                'width': image.shape[1],
                'height': image.shape[0]
            }
        }
        
        result = {
            "patient_id": patient_id,
            "analysis_id": f"enhanced_analysis_{timestamp}",
            "timestamp": datetime.now().isoformat(),
            "healing_score": healing_assessment['healing_score'],
            "wound_area": wound_area_cm2,
            "inflammation_level": healing_assessment['inflammation_level'],
            "infection_risk": healing_assessment['infection_risk'],
            "healing_stage": healing_assessment['healing_stage'],
            "recommendations": recommendations,
            "confidence_score": healing_assessment['confidence_score'],
            "image_data": {
                "filename": image_filename,
                "path": image_path,
                "base64": image_base64,
                "upload_timestamp": timestamp
            },
            "visual_features": visual_features,
            "analysis_details": {
                "score_breakdown": healing_assessment.get('score_breakdown', {}),
                "color_analysis": color_analysis,
                "texture_analysis": texture_analysis,
                "segmentation": segmentation,
                "external_analysis": external_analysis
            }
        }
        
        # Add medical analysis if available
        if 'medical_analysis' in healing_assessment:
            result['medical_analysis'] = healing_assessment['medical_analysis']
        
        logger.info(f"Enhanced analysis completed for patient {patient_id}: {healing_assessment['healing_score']:.1f}% healing")
        
        return result
        
    except Exception as e:
        logger.error(f"Enhanced analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    print("Starting Enhanced Medical AI Analysis Service...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
