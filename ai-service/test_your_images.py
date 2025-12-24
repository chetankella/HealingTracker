#!/usr/bin/env python3
"""
Test your own images with the Healing Tracker AI Service
"""

import os
import time
import json
from pathlib import Path

# Try to import requests for API calls
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("⚠️ requests not available - install with: pip install requests")

def test_image_upload(image_path, patient_id="your_test_patient"):
    """Test uploading your own image to the AI service"""
    
    if not REQUESTS_AVAILABLE:
        print("❌ Cannot test image upload - requests library not installed")
        print("💡 Install with: pip install requests")
        return False
    
    # Check if image file exists
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    # Check if service is running
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code != 200:
            print("❌ AI service is not running")
            print("💡 Start it with: python demo_app.py")
            return False
    except Exception as e:
        print("❌ Cannot connect to AI service")
        print("💡 Make sure the service is running: python demo_app.py")
        return False
    
    print(f"🔬 Testing image: {image_path}")
    print(f"👤 Patient ID: {patient_id}")
    print("-" * 50)
    
    try:
        # Prepare the image file
        with open(image_path, 'rb') as image_file:
            files = {
                'file': (os.path.basename(image_path), image_file, 'image/jpeg')
            }
            data = {
                'patient_id': patient_id
            }
            
            print("📤 Uploading image to AI service...")
            start_time = time.time()
            
            # Upload to AI service
            response = requests.post(
                "http://localhost:8000/api/analyze-image",
                files=files,
                data=data,
                timeout=30
            )
            
            analysis_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                print("✅ Analysis completed successfully!")
                print(f"⏱️ Analysis time: {analysis_time:.2f} seconds")
                print()
                
                # Display results in a nice format
                print("🏥 AI ANALYSIS RESULTS")
                print("=" * 50)
                print(f"📊 Healing Score: {result['healing_score']:.1f}%")
                print(f"📏 Wound Area: {result['wound_area']:.2f} cm²")
                print(f"🎯 Healing Stage: {result['healing_stage'].title()}")
                print(f"🔥 Inflammation Level: {result['inflammation_level'].title()}")
                print(f"🦠 Infection Risk: {result['infection_risk'].title()}")
                print(f"🎲 AI Confidence: {result['confidence_score']*100:.1f}%")
                
                # Show recommendations
                print(f"\n💡 AI RECOMMENDATIONS ({len(result['recommendations'])} items):")
                print("-" * 50)
                for i, rec in enumerate(result['recommendations'], 1):
                    print(f"  {i}. {rec}")
                
                # Show technical details
                print(f"\n🔬 TECHNICAL DETAILS:")
                print("-" * 50)
                features = result['visual_features']
                print(f"  • Red intensity: {features.get('mean_red', 'N/A')}")
                print(f"  • Green intensity: {features.get('mean_green', 'N/A')}")
                print(f"  • Blue intensity: {features.get('mean_blue', 'N/A')}")
                print(f"  • Texture variance: {features.get('texture_variance', 'N/A')}")
                print(f"  • Shape circularity: {features.get('circularity', 'N/A'):.3f}")
                
                # Test timeline prediction
                print(f"\n📅 HEALING TIMELINE PREDICTION:")
                print("-" * 50)
                timeline_response = requests.post(
                    f"http://localhost:8000/api/predict-timeline",
                    params={
                        'patient_id': patient_id,
                        'current_healing_score': result['healing_score']
                    }
                )
                
                if timeline_response.status_code == 200:
                    timeline = timeline_response.json()
                    print(f"⏰ Predicted healing time: {timeline['predicted_healing_days']} days")
                    print(f"📈 Confidence range: {timeline['confidence_interval']['min']}-{timeline['confidence_interval']['max']} days")
                    print(f"🎯 Success probability: {timeline['success_probability']*100:.1f}%")
                    
                    if timeline['risk_factors']:
                        print("⚠️ Risk factors identified:")
                        for risk in timeline['risk_factors']:
                            print(f"   • {risk}")
                    else:
                        print("✅ No significant risk factors identified")
                
                return True
                
            else:
                print(f"❌ Analysis failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        return False

def find_images_in_directory(directory="."):
    """Find image files in a directory"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'}
    images = []
    
    for file_path in Path(directory).rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in image_extensions:
            images.append(str(file_path))
    
    return images

def interactive_image_tester():
    """Interactive mode to test your images"""
    print("🧠 Healing Tracker AI - Your Image Tester")
    print("=" * 60)
    print("This tool lets you test your own images with the AI service")
    print()
    
    while True:
        print("📁 OPTIONS:")
        print("1. Test a specific image file")
        print("2. Find images in current directory")
        print("3. Find images in a specific directory")
        print("4. Exit")
        print()
        
        choice = input("Choose an option (1-4): ").strip()
        
        if choice == "1":
            image_path = input("Enter the full path to your image file: ").strip()
            if image_path.startswith('"') and image_path.endswith('"'):
                image_path = image_path[1:-1]  # Remove quotes
            
            patient_id = input("Enter patient ID (or press Enter for default): ").strip()
            if not patient_id:
                patient_id = "your_test_patient"
            
            print()
            test_image_upload(image_path, patient_id)
            
        elif choice == "2":
            print("🔍 Searching for images in current directory...")
            images = find_images_in_directory(".")
            
            if not images:
                print("❌ No image files found in current directory")
            else:
                print(f"✅ Found {len(images)} image(s):")
                for i, img in enumerate(images[:10], 1):  # Show max 10
                    print(f"  {i}. {img}")
                
                if len(images) > 10:
                    print(f"  ... and {len(images) - 10} more")
                
                try:
                    img_choice = int(input(f"Choose image (1-{min(len(images), 10)}): ")) - 1
                    if 0 <= img_choice < len(images):
                        test_image_upload(images[img_choice])
                    else:
                        print("❌ Invalid choice")
                except ValueError:
                    print("❌ Please enter a valid number")
        
        elif choice == "3":
            directory = input("Enter directory path: ").strip()
            if directory.startswith('"') and directory.endswith('"'):
                directory = directory[1:-1]
            
            print(f"🔍 Searching for images in: {directory}")
            images = find_images_in_directory(directory)
            
            if not images:
                print(f"❌ No image files found in {directory}")
            else:
                print(f"✅ Found {len(images)} image(s):")
                for i, img in enumerate(images[:5], 1):  # Show max 5
                    print(f"  {i}. {img}")
                
                if len(images) > 5:
                    print(f"  ... and {len(images) - 5} more")
        
        elif choice == "4":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please choose 1-4.")
        
        print("\n" + "="*60 + "\n")

def main():
    """Main function"""
    print("🚀 Starting Your Image Tester")
    print()
    
    # Check if service is running
    if REQUESTS_AVAILABLE:
        try:
            response = requests.get("http://localhost:8000/api/health", timeout=3)
            if response.status_code == 200:
                print("✅ AI Service is running and ready!")
                print("🔗 Service URL: http://localhost:8000")
                print("📖 API Docs: http://localhost:8000/docs")
                print()
            else:
                print("⚠️ AI Service responded but may have issues")
        except:
            print("❌ AI Service is not running")
            print("💡 Start it first with: python demo_app.py")
            print("⏳ Wait for it to show 'Uvicorn running on http://0.0.0.0:8000'")
            print()
            return
    
    # Start interactive tester
    interactive_image_tester()

if __name__ == "__main__":
    main()
















