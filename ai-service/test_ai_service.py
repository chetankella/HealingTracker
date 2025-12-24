#!/usr/bin/env python3
"""
Test script for Healing Tracker AI Service
"""

import asyncio
import aiohttp
import json
import base64
import numpy as np
from PIL import Image, ImageDraw
import io
from pathlib import Path
import time

class AIServiceTester:
    """Test the AI service endpoints"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def create_test_image(self, width: int = 400, height: int = 400) -> bytes:
        """Create a synthetic wound image for testing"""
        # Create a base skin-colored image
        image = Image.new('RGB', (width, height), color=(255, 220, 177))
        draw = ImageDraw.Draw(image)
        
        # Draw a simulated wound (reddish oval)
        wound_center = (width // 2, height // 2)
        wound_width = 80
        wound_height = 60
        
        # Main wound area (darker red)
        wound_bbox = [
            wound_center[0] - wound_width // 2,
            wound_center[1] - wound_height // 2,
            wound_center[0] + wound_width // 2,
            wound_center[1] + wound_height // 2
        ]
        draw.ellipse(wound_bbox, fill=(180, 60, 60))
        
        # Surrounding inflammation (lighter red)
        inflam_bbox = [
            wound_center[0] - wound_width // 2 - 20,
            wound_center[1] - wound_height // 2 - 20,
            wound_center[0] + wound_width // 2 + 20,
            wound_center[1] + wound_height // 2 + 20
        ]
        draw.ellipse(inflam_bbox, fill=(220, 120, 120))
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return img_byte_arr
    
    async def test_health_endpoint(self):
        """Test the health check endpoint"""
        print("🔍 Testing health endpoint...")
        
        try:
            async with self.session.get(f"{self.base_url}/api/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Health check passed")
                    print(f"   Status: {data.get('status')}")
                    print(f"   AI Service: {data.get('ai_service')}")
                    return True
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Health check error: {str(e)}")
            return False
    
    async def test_root_endpoint(self):
        """Test the root endpoint"""
        print("🔍 Testing root endpoint...")
        
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Root endpoint working")
                    print(f"   Service: {data.get('service')}")
                    print(f"   Version: {data.get('version')}")
                    print(f"   Features: {len(data.get('features', []))} available")
                    return True
                else:
                    print(f"❌ Root endpoint failed: {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Root endpoint error: {str(e)}")
            return False
    
    async def test_image_analysis(self):
        """Test the image analysis endpoint"""
        print("🔍 Testing image analysis endpoint...")
        
        try:
            # Create test image
            test_image = self.create_test_image()
            
            # Prepare multipart form data
            data = aiohttp.FormData()
            data.add_field('file', test_image, filename='test_wound.png', content_type='image/png')
            data.add_field('patient_id', 'test_patient_001')
            
            start_time = time.time()
            
            async with self.session.post(f"{self.base_url}/api/analyze-image", data=data) as response:
                analysis_time = time.time() - start_time
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Image analysis successful")
                    print(f"   Analysis Time: {analysis_time:.2f} seconds")
                    print(f"   Patient ID: {result.get('patient_id')}")
                    print(f"   Healing Score: {result.get('healing_score', 0):.1f}%")
                    print(f"   Wound Area: {result.get('wound_area', 0):.2f} cm²")
                    print(f"   Healing Stage: {result.get('healing_stage')}")
                    print(f"   Inflammation: {result.get('inflammation_level')}")
                    print(f"   Infection Risk: {result.get('infection_risk')}")
                    print(f"   Confidence: {result.get('confidence_score', 0):.2f}")
                    print(f"   Recommendations: {len(result.get('recommendations', []))} items")
                    
                    # Print first few recommendations
                    recommendations = result.get('recommendations', [])
                    if recommendations:
                        print("   Top Recommendations:")
                        for i, rec in enumerate(recommendations[:3]):
                            print(f"     {i+1}. {rec}")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Image analysis failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Image analysis error: {str(e)}")
            return False
    
    async def test_timeline_prediction(self):
        """Test the timeline prediction endpoint"""
        print("🔍 Testing timeline prediction endpoint...")
        
        try:
            params = {
                'patient_id': 'test_patient_001',
                'current_healing_score': 65.5
            }
            
            async with self.session.post(f"{self.base_url}/api/predict-timeline", params=params) as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ Timeline prediction successful")
                    print(f"   Patient ID: {result.get('patient_id')}")
                    print(f"   Predicted Days: {result.get('predicted_healing_days')}")
                    print(f"   Confidence Interval: {result.get('confidence_interval')}")
                    print(f"   Success Probability: {result.get('success_probability', 0):.2f}")
                    print(f"   Risk Factors: {len(result.get('risk_factors', []))} identified")
                    
                    risk_factors = result.get('risk_factors', [])
                    if risk_factors:
                        print("   Risk Factors:")
                        for risk in risk_factors:
                            print(f"     • {risk}")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Timeline prediction failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Timeline prediction error: {str(e)}")
            return False
    
    async def test_recommendations(self):
        """Test the recommendations endpoint"""
        print("🔍 Testing recommendations endpoint...")
        
        try:
            patient_id = "test_patient_001"
            
            async with self.session.get(f"{self.base_url}/api/recommendations/{patient_id}") as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ Recommendations retrieved successfully")
                    print(f"   Patient ID: {result.get('patient_id')}")
                    
                    categories = ['daily_care', 'lifestyle', 'exercises', 'warning_signs', 'next_steps']
                    for category in categories:
                        items = result.get(category, [])
                        print(f"   {category.replace('_', ' ').title()}: {len(items)} items")
                        if items and len(items) <= 3:  # Show all if 3 or fewer
                            for item in items:
                                print(f"     • {item}")
                        elif items:  # Show first 2 if more than 3
                            for item in items[:2]:
                                print(f"     • {item}")
                            print(f"     ... and {len(items)-2} more")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Recommendations failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Recommendations error: {str(e)}")
            return False
    
    async def test_analytics(self):
        """Test the analytics endpoint"""
        print("🔍 Testing analytics endpoint...")
        
        try:
            patient_id = "test_patient_001"
            params = {'days': 30}
            
            async with self.session.get(f"{self.base_url}/api/analytics/{patient_id}", params=params) as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ Analytics retrieved successfully")
                    print(f"   Patient ID: {result.get('patient_id')}")
                    print(f"   Period: {result.get('period_days')} days")
                    print(f"   Progress Trend: {result.get('progress_trend')}")
                    print(f"   Average Healing Rate: {result.get('average_healing_rate')} points/day")
                    print(f"   Total Improvement: {result.get('total_improvement')}%")
                    
                    milestones = result.get('milestones_reached', [])
                    print(f"   Milestones: {len(milestones)} reached")
                    for milestone in milestones:
                        print(f"     • {milestone.get('date')}: {milestone.get('milestone')}")
                    
                    predictions = result.get('predictions', {})
                    if predictions:
                        print(f"   Expected Full Healing: {predictions.get('expected_full_healing')}")
                        print(f"   Prediction Confidence: {predictions.get('confidence', 0):.2f}")
                    
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Analytics failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Analytics error: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting AI Service Tests")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_endpoint),
            ("Root Endpoint", self.test_root_endpoint),
            ("Image Analysis", self.test_image_analysis),
            ("Timeline Prediction", self.test_timeline_prediction),
            ("Recommendations", self.test_recommendations),
            ("Analytics", self.test_analytics)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n📋 Running {test_name}...")
            try:
                if await test_func():
                    passed += 1
                    print(f"✅ {test_name} PASSED")
                else:
                    print(f"❌ {test_name} FAILED")
            except Exception as e:
                print(f"❌ {test_name} ERROR: {str(e)}")
            
            print("-" * 30)
        
        print(f"\n🏁 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! AI Service is working correctly.")
        else:
            print(f"⚠️ {total - passed} tests failed. Please check the service.")
        
        return passed == total

async def main():
    """Main test function"""
    print("🚀 Healing Tracker AI Service Tester")
    print("Make sure the AI service is running on http://localhost:8000")
    print()
    
    # Wait a moment for user to see the message
    await asyncio.sleep(1)
    
    async with AIServiceTester() as tester:
        success = await tester.run_all_tests()
        
        if success:
            print("\n🌟 All tests completed successfully!")
            print("The AI service is ready for integration with the frontend.")
        else:
            print("\n🔧 Some tests failed. Please check the AI service logs.")

if __name__ == "__main__":
    asyncio.run(main())
















