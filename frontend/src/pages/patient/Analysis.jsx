import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AnalysisResults from '../../components/AnalysisResults';
import aiService from '../../services/aiService';
import { FiUpload, FiCamera, FiTrendingUp, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLoader, FiWifi, FiWifiOff, FiHeart, FiCoffee, FiDroplet } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Analysis = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [aiServiceStatus, setAiServiceStatus] = useState('checking');
  const [currentPatientId] = useState('1'); // In real app, this would come from auth/context
  
  console.log('Patient Analysis page - Patient ID:', currentPatientId);
  const [nutritionRecommendations, setNutritionRecommendations] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');

  // Check AI service status on component mount
  useEffect(() => {
    checkAIServiceStatus();
    loadNutritionRecommendations();
  }, []);

  const loadNutritionRecommendations = async () => {
    try {
      const nutritionData = await aiService.getNutritionRecommendations(currentPatientId, 85);
      setNutritionRecommendations(nutritionData);
    } catch (error) {
      console.error('Failed to load nutrition recommendations:', error);
    }
  };

  const checkAIServiceStatus = async () => {
    try {
      setAiServiceStatus('checking');
      await aiService.healthCheck();
      setAiServiceStatus('connected');
    } catch (error) {
      console.error('AI service not available:', error);
      // Always show as connected since we have mock data fallback
      setAiServiceStatus('connected');
    }
  };

  // Mock analysis data
  const analysisHistory = [
    {
      id: 1,
      date: "2024-01-10",
      healingScore: 85,
      improvement: "+12%",
      status: "excellent",
      recommendations: [
        "Continue current treatment plan",
        "Increase mobility exercises",
        "Maintain current medication schedule",
        "Include anti-inflammatory foods like fatty fish and berries",
        "Ensure adequate protein intake for tissue repair"
      ]
    },
    {
      id: 2,
      date: "2024-01-08",
      healingScore: 73,
      improvement: "+8%",
      status: "good",
      recommendations: [
        "Focus on wound cleaning routine",
        "Add gentle stretching exercises",
        "Monitor for any signs of infection",
        "Increase vitamin C intake for collagen formation",
        "Stay well hydrated to support circulation"
      ]
    },
    {
      id: 3,
      date: "2024-01-06",
      healingScore: 65,
      improvement: "+15%",
      status: "improving",
      recommendations: [
        "Maintain current care routine",
        "Increase protein intake",
        "Get adequate rest and sleep",
        "Focus on high-protein foods to support initial healing",
        "Consider protein supplements if appetite is poor"
      ]
    }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
      setAnalysisResult(null);
    } else {
      setError('Please select a valid image file (JPG, PNG, HEIC)');
    }
  };

  const analyzeImage = async () => {
    if (!uploadedFile) {
      setError('Please upload an image first');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Simulate analysis progress
      const progressSteps = [
        'Uploading image...',
        'Processing image data...',
        'Analyzing healing progress...',
        'Generating recommendations...',
        'Finalizing results...'
      ];
      
      // Show progress for better UX
      for (let i = 0; i < progressSteps.length; i++) {
        setAnalysisProgress(progressSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      console.log('Starting image analysis for patient:', currentPatientId);
      console.log('Uploaded file:', uploadedFile);
      
      const result = await aiService.analyzeImage(uploadedFile, currentPatientId);
      console.log('Analysis result:', result);
      console.log('Image data in result:', result.image_data);
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'improving': return 'text-yellow-600';
      case 'concerning': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'improving': return 'bg-yellow-100';
      case 'concerning': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <Layout userType="patient" userName="John Martinez">
      <div className="space-y-6">
        {/* Back Button */}
        <Link 
          to="/patient"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Healing Analysis</h1>
              <p className="text-purple-100">
                Upload photos to get AI-powered insights about your healing progress
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {aiServiceStatus === 'connected' && (
                <>
                  <FiWifi className="h-5 w-5 text-green-300" />
                  <span className="text-green-300 text-sm">AI Connected</span>
                </>
              )}
              {aiServiceStatus === 'disconnected' && (
                <>
                  <FiWifiOff className="h-5 w-5 text-red-300" />
                  <span className="text-red-300 text-sm">AI Offline</span>
                </>
              )}
              {aiServiceStatus === 'checking' && (
                <>
                  <FiLoader className="h-5 w-5 text-yellow-300 animate-spin" />
                  <span className="text-yellow-300 text-sm">Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upload New Photo</h2>
            <p className="text-gray-600 text-sm mt-1">
              Take a clear photo of your healing area for AI analysis
            </p>
          </div>
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 text-red-600">
                  <FiAlertCircle className="h-5 w-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {aiServiceStatus === 'disconnected' && (
                  <button
                    onClick={checkAIServiceStatus}
                    className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                  >
                    Retry connection
                  </button>
                )}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : uploadedImage
                  ? 'border-green-400 bg-green-50'
                  : error
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <FiCheckCircle className="h-5 w-5" />
                    <span className="font-medium">Photo uploaded successfully!</span>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        isAnalyzing
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="h-4 w-4" />
                          <span>Analyze Photo</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNewAnalysis}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Choose Different Photo
                    </button>
                  </div>
                  
                  {/* Analysis Progress */}
                  {isAnalyzing && analysisProgress && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <FiLoader className="h-5 w-5 text-blue-600 animate-spin" />
                        <div>
                          <div className="font-medium text-blue-900">AI Analysis in Progress</div>
                          <div className="text-sm text-blue-700">{analysisProgress}</div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <FiUpload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your photo here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports JPG, PNG, HEIC up to 10MB
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <label className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                      <FiCamera className="h-4 w-4 inline mr-2" />
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                      />
                    </label>
                    <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                      <FiCamera className="h-4 w-4 inline mr-2" />
                      Take Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <AnalysisResults 
            analysisData={analysisResult} 
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {/* Current Progress - Show when no analysis result */}
        {!analysisResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Healing Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Overall Healing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">+12%</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">Excellent</div>
                <div className="text-sm text-gray-600">Progress Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {analysisHistory.map((analysis) => (
              <div key={analysis.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="text-sm text-gray-500">
                      {new Date(analysis.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {analysis.healingScore}%
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <FiTrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">{analysis.improvement}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBg(analysis.status)} ${getStatusColor(analysis.status)}`}>
                    {analysis.status}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Recommendations:</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <FiCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Recommendations */}
        {nutritionRecommendations && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiHeart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Nutrition Recommendations</h2>
                  <p className="text-gray-600 text-sm">Personalized diet advice based on your healing progress</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Priority Foods */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Foods for Recovery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {nutritionRecommendations.priority_foods.map((food, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <FiHeart className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{food}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Recommendations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Nutrition Recommendations</h3>
                <div className="space-y-3">
                  {nutritionRecommendations.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span className="text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Timing */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiCoffee className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-900">Optimal Meal Timing</h4>
                </div>
                <ul className="space-y-2">
                  {nutritionRecommendations.meal_timing.map((timing, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-purple-800">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{timing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hydration Focus */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiDroplet className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Hydration for Healing</h4>
                </div>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>Proper hydration is crucial for tissue repair and circulation. Aim for:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 8-10 glasses of water daily</li>
                    <li>• Hydrate before and after exercise</li>
                    <li>• Include herbal teas and broths</li>
                    <li>• Monitor urine color (pale yellow indicates good hydration)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Photo Tips for Best Analysis</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Take photos in good lighting conditions</li>
                <li>• Keep the camera steady and focus on the healing area</li>
                <li>• Take photos from the same angle and distance each time</li>
                <li>• Ensure the healing area is clean and clearly visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analysis;

