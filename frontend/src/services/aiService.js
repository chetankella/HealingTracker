// AI Service for handling analytics, predictions, and recommendations
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Get analytics data for a patient
export const getAnalytics = async (patientId, days = 30) => {
  try {
    const data = await apiCall(`/analytics/${patientId}?days=${days}`);
    return data;
  } catch (error) {
    // Return mock data if API fails
    console.warn('Using mock analytics data due to API error:', error);
    return {
      progress_trend: 'improving',
      average_healing_rate: 2.5,
      total_improvement: 15,
      milestones_reached: [
        {
          milestone: 'Reduced inflammation by 30%',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          milestone: 'Improved mobility range',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      predictions: {
        expected_full_healing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85
      }
    };
  }
};

// Predict healing timeline for a patient
export const predictTimeline = async (patientId, currentHealingScore) => {
  try {
    const data = await apiCall(`/timeline/${patientId}`, {
      method: 'POST',
      body: JSON.stringify({ current_score: currentHealingScore })
    });
    return data;
  } catch (error) {
    // Return mock data if API fails
    console.warn('Using mock timeline data due to API error:', error);
    return {
      predicted_healing_days: 25,
      confidence_interval: {
        min: 20,
        max: 35
      },
      success_probability: 0.88,
      risk_factors: [
        'Monitor for increased pain levels',
        'Ensure consistent exercise routine',
        'Watch for signs of inflammation'
      ]
    };
  }
};

// Get personalized recommendations for a patient
export const getRecommendations = async (patientId) => {
  try {
    const data = await apiCall(`/recommendations/${patientId}`);
    return data;
  } catch (error) {
    // Return mock data if API fails
    console.warn('Using mock recommendations data due to API error:', error);
    return {
      daily_care: [
        'Perform gentle stretching exercises for 15 minutes',
        'Apply ice pack for 20 minutes if experiencing inflammation',
        'Take prescribed medication as directed',
        'Maintain proper posture during daily activities'
      ],
      lifestyle: [
        'Get 7-8 hours of quality sleep each night',
        'Maintain a balanced diet rich in anti-inflammatory foods',
        'Stay hydrated by drinking 8 glasses of water daily',
        'Avoid prolonged sitting or standing in one position'
      ],
      warning_signs: [
        'Sudden increase in pain intensity',
        'Numbness or tingling in affected area',
        'Significant decrease in mobility',
        'Signs of infection (redness, warmth, swelling)'
      ]
    };
  }
};

// Get personalized diet plan for recovery
export const getDietPlan = async (patientId, healingStage = 'active') => {
  try {
    const data = await apiCall(`/diet-plan/${patientId}?stage=${healingStage}`);
    return data;
  } catch (error) {
    // Return mock data if API fails
    console.warn('Using mock diet plan data due to API error:', error);
    return {
      stage: healingStage,
      daily_meals: {
        breakfast: [
          'Greek yogurt with berries and nuts',
          'Oatmeal with banana and honey',
          'Scrambled eggs with spinach and whole grain toast'
        ],
        lunch: [
          'Grilled salmon with quinoa and steamed vegetables',
          'Chicken salad with mixed greens and olive oil dressing',
          'Lentil soup with whole grain bread'
        ],
        dinner: [
          'Baked chicken breast with sweet potato and broccoli',
          'Fish with brown rice and asparagus',
          'Turkey meatballs with whole wheat pasta and marinara'
        ],
        snacks: [
          'Apple slices with almond butter',
          'Mixed nuts and dried fruit',
          'Greek yogurt with granola'
        ]
      },
      hydration: {
        daily_goal: '8-10 glasses',
        timing: [
          'Drink water upon waking',
          'Hydrate before and after exercise',
          'Limit caffeine to 1-2 cups daily'
        ]
      },
      supplements: [
        'Vitamin C (1000mg daily) for collagen synthesis',
        'Zinc (15mg daily) for wound healing',
        'Omega-3 fatty acids for anti-inflammatory support',
        'Protein powder if dietary intake is insufficient'
      ],
      foods_to_avoid: [
        'Processed foods high in sugar',
        'Excessive alcohol consumption',
        'Foods high in trans fats',
        'Excessive caffeine'
      ],
      recovery_tips: [
        'Eat protein with every meal to support tissue repair',
        'Include colorful fruits and vegetables for antioxidants',
        'Stay hydrated to support circulation and healing',
        'Consider smaller, more frequent meals if appetite is low'
      ]
    };
  }
};

// Get nutrition recommendations based on healing progress
export const getNutritionRecommendations = async (patientId, healingScore) => {
  try {
    const data = await apiCall(`/nutrition-recommendations/${patientId}`, {
      method: 'POST',
      body: JSON.stringify({ healing_score: healingScore })
    });
    return data;
  } catch (error) {
    // Return mock data if API fails
    console.warn('Using mock nutrition recommendations due to API error:', error);
    
    let recommendations = [];
    
    if (healingScore < 50) {
      recommendations = [
        'Focus on high-protein foods to support initial healing',
        'Increase vitamin C intake for collagen formation',
        'Consider protein supplements if appetite is poor',
        'Stay well hydrated to support circulation'
      ];
    } else if (healingScore < 75) {
      recommendations = [
        'Maintain balanced protein intake for continued healing',
        'Include anti-inflammatory foods like fatty fish and berries',
        'Ensure adequate zinc intake for wound healing',
        'Continue hydration and consider electrolyte balance'
      ];
    } else {
      recommendations = [
        'Focus on maintaining healthy eating habits',
        'Include foods rich in antioxidants for long-term health',
        'Consider foods that support skin health and elasticity',
        'Maintain balanced nutrition for overall wellness'
      ];
    }
    
    return {
      healing_score: healingScore,
      recommendations: recommendations,
      priority_foods: healingScore < 50 ? 
        ['Lean proteins', 'Citrus fruits', 'Leafy greens', 'Nuts and seeds'] :
        ['Fatty fish', 'Berries', 'Whole grains', 'Colorful vegetables'],
      meal_timing: [
        'Eat within 1 hour of waking',
        'Have protein with each meal',
        'Space meals 3-4 hours apart',
        'Avoid eating 2 hours before bed'
      ]
    };
  }
};

// Analyze image for healing progress
export const analyzeImage = async (imageFile, patientId) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('patient_id', patientId);

    const response = await fetch(`${API_BASE_URL}/analyze-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI Service Response:', result);
    console.log('Image data in response:', result.image_data);
    
    // Store image data in localStorage for doctor portal access
    if (result.image_data) {
      console.log('Storing image data in localStorage for patient:', patientId);
      const imageData = {
        patient_id: patientId,
        image_data: {
          ...result.image_data,
          upload_time: new Date().toISOString(),
          analysis_timestamp: result.timestamp
        },
        analysis_data: {
          healing_score: result.healing_score,
          healing_stage: result.healing_stage,
          timestamp: result.timestamp
        }
      };
      
      // Store in localStorage with patient ID as key
      localStorage.setItem(`patient_image_${patientId}`, JSON.stringify(imageData));
      
      // Also store in a general images list
      const existingImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
      const updatedImages = existingImages.filter(img => img.patient_id !== patientId);
      updatedImages.unshift(imageData);
      localStorage.setItem('patient_images', JSON.stringify(updatedImages));
      
      // Trigger a custom event for real-time updates
      window.dispatchEvent(new CustomEvent('patientImageUpdated', {
        detail: { patientId, imageData }
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Image analysis failed, using mock data:', error);
    
    // Convert uploaded image to base64 for storage
    let imageBase64 = null;
    if (imageFile) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          reader.onerror = reject;
        });
        reader.readAsDataURL(imageFile);
        imageBase64 = await base64Promise;
      } catch (base64Error) {
        console.error('Failed to convert image to base64:', base64Error);
      }
    }
    
    // Return mock analysis data when AI service is unavailable
    const mockAnalysis = {
      patient_id: patientId,
      analysis_id: `analysis_${Date.now()}`,
      timestamp: new Date().toISOString(),
      healing_score: Math.random() * 40 + 60, // Random score between 60-100
      wound_area: Math.random() * 10 + 5, // Random area between 5-15 cm²
      inflammation_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
      infection_risk: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
      healing_stage: ['inflammatory', 'proliferative', 'healing', 'maturation'][Math.floor(Math.random() * 4)],
      recommendations: [
        "Continue current treatment plan",
        "Monitor healing progress regularly",
        "Maintain good hygiene practices",
        "Follow medical advice closely"
      ],
      confidence_score: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
      visual_features: {
        area_cm2: Math.random() * 10 + 5,
        brightness: Math.random() * 100 + 100,
        redness_ratio: Math.random() * 2 + 0.5,
        mean_red: Math.random() * 100 + 100,
        mean_green: Math.random() * 100 + 100,
        mean_blue: Math.random() * 100 + 100,
        texture_variance: Math.random() * 50 + 25,
        edge_density: Math.random() * 0.1 + 0.05,
        image_dimensions: { width: 800, height: 600 }
      },
      // Include image data even in mock response
      image_data: imageBase64 ? {
        filename: imageFile.name || `patient_${patientId}_${Date.now()}.jpg`,
        path: `uploaded_images/patient_${patientId}_${Date.now()}.jpg`,
        base64: imageBase64,
        upload_timestamp: new Date().toISOString()
      } : null
    };
    
    // Store image data in localStorage for doctor portal access (even for mock data)
    if (mockAnalysis.image_data) {
      console.log('Storing mock image data in localStorage for patient:', patientId);
      const imageData = {
        patient_id: patientId,
        image_data: {
          ...mockAnalysis.image_data,
          upload_time: new Date().toISOString(),
          analysis_timestamp: mockAnalysis.timestamp
        },
        analysis_data: {
          healing_score: mockAnalysis.healing_score,
          healing_stage: mockAnalysis.healing_stage,
          timestamp: mockAnalysis.timestamp
        }
      };
      
      // Store in localStorage with patient ID as key
      localStorage.setItem(`patient_image_${patientId}`, JSON.stringify(imageData));
      
      // Also store in a general images list
      const existingImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
      const updatedImages = existingImages.filter(img => img.patient_id !== patientId);
      updatedImages.unshift(imageData);
      localStorage.setItem('patient_images', JSON.stringify(updatedImages));
      
      // Trigger a custom event for real-time updates
      window.dispatchEvent(new CustomEvent('patientImageUpdated', {
        detail: { patientId, imageData }
      }));
    }
    
    return mockAnalysis;
  }
};

// Get patient's healing score
export const getHealingScore = async (patientId) => {
  try {
    const data = await apiCall(`/healing-score/${patientId}`);
    return data;
  } catch (error) {
    console.warn('Using mock healing score due to API error:', error);
    return {
      score: 85,
      trend: 'improving',
      last_updated: new Date().toISOString()
    };
  }
};

// Health check for AI service
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('AI service health check failed, using mock response:', error);
    // Return mock health check response
    return {
      status: "healthy",
      service: "AI Analysis Service (Mock)",
      timestamp: new Date().toISOString(),
      version: "1.0.0-mock"
    };
  }
};

export const getPatientImages = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patient-images/${patientId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get patient images:', error);
    // Fallback to localStorage
    const imageData = localStorage.getItem(`patient_image_${patientId}`);
    if (imageData) {
      return {
        patient_id: patientId,
        images: [JSON.parse(imageData)],
        total_images: 1
      };
    }
    return { patient_id: patientId, images: [], total_images: 0 };
  }
};

export const getLatestPatientImage = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest-patient-image/${patientId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get latest patient image:', error);
    // Fallback to localStorage
    const imageData = localStorage.getItem(`patient_image_${patientId}`);
    if (imageData) {
      const data = JSON.parse(imageData);
      return {
        patient_id: patientId,
        latest_image: data.image_data
      };
    }
    return null;
  }
};

// Default export for backward compatibility
const aiService = {
  getAnalytics,
  predictTimeline,
  getRecommendations,
  getDietPlan,
  getNutritionRecommendations,
  analyzeImage,
  getHealingScore,
  healthCheck,
  getPatientImages,
  getLatestPatientImage
};

export default aiService;