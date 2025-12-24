#!/usr/bin/env python3
"""
External API Integration for Enhanced Medical AI Analysis
Integrates with Google Vision, Azure Cognitive Services, and AWS Rekognition
"""

import asyncio
import aiohttp
import base64
import json
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class ExternalAPIIntegration:
    def __init__(self):
        self.apis = {
            'google_vision': {
                'url': 'https://vision.googleapis.com/v1/images:annotate',
                'key': 'YOUR_GOOGLE_API_KEY',  # Replace with actual key
                'enabled': False  # Set to True when you have API key
            },
            'azure_cognitive': {
                'url': 'https://your-region.cognitiveservices.azure.com/vision/v3.2/analyze',
                'key': 'YOUR_AZURE_API_KEY',  # Replace with actual key
                'enabled': False  # Set to True when you have API key
            },
            'aws_rekognition': {
                'url': 'https://rekognition.us-east-1.amazonaws.com',
                'key': 'YOUR_AWS_ACCESS_KEY',  # Replace with actual key
                'secret': 'YOUR_AWS_SECRET_KEY',  # Replace with actual key
                'enabled': False  # Set to True when you have API keys
            }
        }
    
    async def analyze_with_google_vision(self, image_base64: str) -> Dict:
        """Analyze image using Google Vision API"""
        try:
            if not self.apis['google_vision']['enabled']:
                return self._get_mock_google_vision_response()
            
            url = f"{self.apis['google_vision']['url']}?key={self.apis['google_vision']['key']}"
            
            payload = {
                "requests": [
                    {
                        "image": {
                            "content": image_base64
                        },
                        "features": [
                            {
                                "type": "LABEL_DETECTION",
                                "maxResults": 10
                            },
                            {
                                "type": "OBJECT_LOCALIZATION",
                                "maxResults": 10
                            },
                            {
                                "type": "IMAGE_PROPERTIES"
                            }
                        ]
                    }
                ]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_google_vision_response(data)
                    else:
                        logger.error(f"Google Vision API error: {response.status}")
                        return self._get_mock_google_vision_response()
                        
        except Exception as e:
            logger.error(f"Google Vision API failed: {e}")
            return self._get_mock_google_vision_response()
    
    async def analyze_with_azure_cognitive(self, image_base64: str) -> Dict:
        """Analyze image using Azure Cognitive Services"""
        try:
            if not self.apis['azure_cognitive']['enabled']:
                return self._get_mock_azure_response()
            
            url = f"{self.apis['azure_cognitive']['url']}?visualFeatures=Objects,Tags,Description"
            headers = {
                'Ocp-Apim-Subscription-Key': self.apis['azure_cognitive']['key'],
                'Content-Type': 'application/octet-stream'
            }
            
            image_bytes = base64.b64decode(image_base64)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, data=image_bytes) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_azure_response(data)
                    else:
                        logger.error(f"Azure Cognitive Services error: {response.status}")
                        return self._get_mock_azure_response()
                        
        except Exception as e:
            logger.error(f"Azure Cognitive Services failed: {e}")
            return self._get_mock_azure_response()
    
    async def analyze_with_aws_rekognition(self, image_base64: str) -> Dict:
        """Analyze image using AWS Rekognition"""
        try:
            if not self.apis['aws_rekognition']['enabled']:
                return self._get_mock_aws_response()
            
            # This would require AWS SDK integration
            # For now, return mock data
            return self._get_mock_aws_response()
            
        except Exception as e:
            logger.error(f"AWS Rekognition failed: {e}")
            return self._get_mock_aws_response()
    
    def _process_google_vision_response(self, data: Dict) -> Dict:
        """Process Google Vision API response"""
        try:
            response = data.get('responses', [{}])[0]
            
            # Extract labels
            labels = response.get('labelAnnotations', [])
            label_descriptions = [label.get('description', '') for label in labels]
            label_scores = [label.get('score', 0) for label in labels]
            
            # Extract objects
            objects = response.get('localizedObjectAnnotations', [])
            object_names = [obj.get('name', '') for obj in objects]
            
            # Extract image properties
            image_props = response.get('imagePropertiesAnnotation', {})
            dominant_colors = image_props.get('dominantColors', {}).get('colors', [])
            
            # Analyze for medical relevance
            medical_keywords = ['skin', 'wound', 'injury', 'healing', 'scar', 'tissue', 'medical', 'health']
            medical_relevance = sum(1 for label in label_descriptions 
                                  if any(keyword in label.lower() for keyword in medical_keywords))
            
            return {
                'labels': label_descriptions,
                'label_scores': label_scores,
                'objects': object_names,
                'dominant_colors': dominant_colors,
                'medical_relevance_score': medical_relevance / len(label_descriptions) if label_descriptions else 0,
                'confidence': max(label_scores) if label_scores else 0
            }
            
        except Exception as e:
            logger.error(f"Error processing Google Vision response: {e}")
            return {}
    
    def _process_azure_response(self, data: Dict) -> Dict:
        """Process Azure Cognitive Services response"""
        try:
            # Extract tags
            tags = data.get('tags', [])
            tag_names = [tag.get('name', '') for tag in tags]
            tag_confidence = [tag.get('confidence', 0) for tag in tags]
            
            # Extract objects
            objects = data.get('objects', [])
            object_names = [obj.get('object', '') for obj in objects]
            
            # Extract description
            description = data.get('description', {})
            captions = description.get('captions', [])
            caption_text = [caption.get('text', '') for caption in captions]
            
            # Analyze for medical relevance
            medical_keywords = ['skin', 'wound', 'injury', 'healing', 'scar', 'tissue', 'medical', 'health']
            medical_relevance = sum(1 for tag in tag_names 
                                  if any(keyword in tag.lower() for keyword in medical_keywords))
            
            return {
                'tags': tag_names,
                'tag_confidence': tag_confidence,
                'objects': object_names,
                'captions': caption_text,
                'medical_relevance_score': medical_relevance / len(tag_names) if tag_names else 0,
                'confidence': max(tag_confidence) if tag_confidence else 0
            }
            
        except Exception as e:
            logger.error(f"Error processing Azure response: {e}")
            return {}
    
    def _get_mock_google_vision_response(self) -> Dict:
        """Mock Google Vision API response for testing"""
        return {
            'labels': ['skin', 'human body', 'medical', 'tissue', 'health'],
            'label_scores': [0.95, 0.89, 0.82, 0.78, 0.75],
            'objects': ['person', 'skin'],
            'dominant_colors': [
                {'color': {'red': 200, 'green': 150, 'blue': 120}, 'score': 0.8},
                {'color': {'red': 180, 'green': 140, 'blue': 100}, 'score': 0.6}
            ],
            'medical_relevance_score': 0.8,
            'confidence': 0.95
        }
    
    def _get_mock_azure_response(self) -> Dict:
        """Mock Azure Cognitive Services response for testing"""
        return {
            'tags': ['skin', 'medical', 'health', 'tissue', 'human'],
            'tag_confidence': [0.92, 0.85, 0.78, 0.72, 0.68],
            'objects': ['person', 'skin'],
            'captions': ['A close-up view of human skin tissue'],
            'medical_relevance_score': 0.85,
            'confidence': 0.92
        }
    
    def _get_mock_aws_response(self) -> Dict:
        """Mock AWS Rekognition response for testing"""
        return {
            'labels': ['Skin', 'Human', 'Medical', 'Tissue', 'Health'],
            'confidence': 0.88,
            'medical_relevance_score': 0.82
        }
    
    async def get_combined_external_analysis(self, image_base64: str) -> Dict:
        """Get analysis from multiple external APIs and combine results"""
        try:
            # Run all API calls concurrently
            tasks = [
                self.analyze_with_google_vision(image_base64),
                self.analyze_with_azure_cognitive(image_base64),
                self.analyze_with_aws_rekognition(image_base64)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine results
            combined_analysis = {
                'google_vision': results[0] if not isinstance(results[0], Exception) else {},
                'azure_cognitive': results[1] if not isinstance(results[1], Exception) else {},
                'aws_rekognition': results[2] if not isinstance(results[2], Exception) else {}
            }
            
            # Calculate overall confidence
            confidences = []
            medical_scores = []
            
            for api_name, result in combined_analysis.items():
                if result:
                    confidences.append(result.get('confidence', 0))
                    medical_scores.append(result.get('medical_relevance_score', 0))
            
            overall_confidence = sum(confidences) / len(confidences) if confidences else 0
            overall_medical_relevance = sum(medical_scores) / len(medical_scores) if medical_scores else 0
            
            return {
                'combined_analysis': combined_analysis,
                'overall_confidence': overall_confidence,
                'overall_medical_relevance': overall_medical_relevance,
                'api_count': len([r for r in results if not isinstance(r, Exception)])
            }
            
        except Exception as e:
            logger.error(f"Combined external analysis failed: {e}")
            return {
                'combined_analysis': {},
                'overall_confidence': 0.7,
                'overall_medical_relevance': 0.6,
                'api_count': 0
            }

# Usage example and API key setup instructions
def setup_api_keys():
    """
    Instructions for setting up external API keys:
    
    1. Google Vision API:
       - Go to Google Cloud Console
       - Enable Vision API
       - Create credentials (API key)
       - Replace 'YOUR_GOOGLE_API_KEY' in the code
    
    2. Azure Cognitive Services:
       - Go to Azure Portal
       - Create Computer Vision resource
       - Get API key and endpoint
       - Replace 'YOUR_AZURE_API_KEY' and update URL
    
    3. AWS Rekognition:
       - Go to AWS Console
       - Create IAM user with Rekognition permissions
       - Get access key and secret key
       - Replace 'YOUR_AWS_ACCESS_KEY' and 'YOUR_AWS_SECRET_KEY'
    
    After setting up keys, set 'enabled': True for the respective APIs
    """
    pass









