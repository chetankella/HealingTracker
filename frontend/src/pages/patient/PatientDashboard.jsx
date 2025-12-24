import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import NavigationCard from '../../components/NavigationCard';
import ProgressTracker from '../../components/ProgressTracker';
import { FiActivity, FiZap, FiBell, FiTrendingUp, FiCalendar, FiHeart, FiImage, FiCamera, FiFileText } from 'react-icons/fi';

const PatientDashboard = () => {
  const [patientHistory, setPatientHistory] = useState([]);
  const [patientImages, setPatientImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  // Mock patient data
  const patientData = {
    name: "Arjun Sharma",
    healingProgress: 68,
    lastUpdate: "Today, 2:30 PM",
    nextAppointment: "Jan 15, 2024",
    currentStreak: 7,
    totalExercises: 24
  };

  // Load patient history from localStorage
  useEffect(() => {
    const loadPatientHistory = () => {
      try {
        setLoading(true);
        
        // Get patient images from localStorage
        const allImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
        const patientImages = allImages.filter(img => img.patient_id === 'patient_001' || img.patient_id === '1');
        
        // Set patient images for gallery
        setPatientImages(patientImages);
        console.log('Patient images loaded:', patientImages);
        console.log('Patient images length:', patientImages.length);
        
        // Create history items from images
        const imageHistory = patientImages.map((imageData, index) => ({
          id: `image_${index}`,
          type: 'image_upload',
          title: 'Uploaded healing progress photo',
          description: `Photo uploaded for AI analysis`,
          timestamp: imageData.image_data?.upload_time || new Date().toISOString(),
          icon: FiCamera,
          color: 'blue',
          details: {
            filename: imageData.image_data?.filename || 'Unknown file',
            healingScore: imageData.analysis_data?.healing_score || null,
            healingStage: imageData.analysis_data?.healing_stage || null
          }
        }));

        // Add mock activities for demonstration
        const mockActivities = [
          {
            id: 'exercise_1',
            type: 'exercise',
            title: 'Completed morning exercises',
            description: 'Finished daily rehabilitation routine',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            icon: FiActivity,
            color: 'green'
          },
          {
            id: 'medication_1',
            type: 'medication',
            title: 'Medication reminder sent',
            description: 'Daily medication reminder received',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            icon: FiBell,
            color: 'orange'
          },
          {
            id: 'analysis_1',
            type: 'analysis',
            title: 'Received AI analysis report',
            description: 'Latest wound analysis completed',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            icon: FiZap,
            color: 'purple'
          }
        ];

        // Combine and sort by timestamp (newest first)
        const allHistory = [...imageHistory, ...mockActivities]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setPatientHistory(allHistory);
        console.log('Loaded patient history:', allHistory);
      } catch (error) {
        console.error('Failed to load patient history:', error);
        setPatientHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatientHistory();

    // Listen for new image uploads
    const handleImageUpdate = (e) => {
      console.log('New image uploaded, refreshing history:', e.detail);
      loadPatientHistory();
    };

    window.addEventListener('patientImageUpdated', handleImageUpdate);
    
    return () => {
      window.removeEventListener('patientImageUpdated', handleImageUpdate);
    };
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper function to format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return time.toLocaleDateString();
    }
  };

  // Helper function to get color classes for activity types
  const getActivityColor = (color) => {
    const colorMap = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <Layout userType="patient" userName={patientData.name}>
      <div className="space-y-8">
        {/* Welcome Section with Progress */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 xl:p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between xl:justify-start xl:space-x-12">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2">
                Welcome back, {patientData.name.split(' ')[0]}!
              </h1>
              <p className="text-blue-100 text-lg xl:text-xl">
                Keep up the great work on your healing journey
              </p>
            </div>
            
            {/* Progress Circle */}
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24 xl:w-32 xl:h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                    className="xl:stroke-[10]"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - patientData.healingProgress / 100)}`}
                    className="transition-all duration-300 xl:stroke-[10]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl xl:text-3xl font-bold">{patientData.healingProgress}%</span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm text-blue-100">Healing Progress</div>
                <div className="text-xl font-semibold">Great progress!</div>
                <div className="text-sm text-blue-100">Updated {patientData.lastUpdate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <NavigationCard
            icon={FiActivity}
            label="Exercises"
            link="/patient/exercises"
            count={`${patientData.currentStreak} day streak`}
            color="green"
          />
          <NavigationCard
            icon={FiZap}
            label="AI Analysis"
            link="/patient/analysis"
            count="View insights"
            color="purple"
          />
          <NavigationCard
            icon={FiBell}
            label="Notifications"
            link="/patient/notifications"
            count={3}
            color="blue"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
          {/* Today's Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Progress</h3>
              <FiTrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Exercises</span>
                  <span className="font-medium">3/4 completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Medication</span>
                  <span className="font-medium text-green-600">✓ Taken</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Photo Update</span>
                  <span className="font-medium text-blue-600">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Next Appointment</h3>
              <FiCalendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {patientData.nextAppointment}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Dr. Amanda Smith
              </div>
              <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                View Details
              </button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>
              <FiHeart className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Pain Level</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= 2 ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">2/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Mobility</span>
                <span className="text-sm font-medium text-green-600">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Sleep Quality</span>
                <span className="text-sm font-medium text-blue-600">7.5/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Photo Section */}
        {patientImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiCamera className="h-5 w-5 mr-2 text-green-600" />
                Latest Healing Photo
              </h3>
              <span className="text-sm text-gray-500">
                {patientImages.length} photo{patientImages.length !== 1 ? 's' : ''} uploaded
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <img 
                  src={`data:image/jpeg;base64,${patientImages[0].image_data.base64}`}
                  alt="Latest healing progress"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Latest Upload
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Upload Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Date:</span>
                      <span className="font-medium">
                        {patientImages[0].image_data.upload_time ? 
                          new Date(patientImages[0].image_data.upload_time).toLocaleDateString() : 
                          'Unknown'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Time:</span>
                      <span className="font-medium">
                        {patientImages[0].image_data.upload_time ? 
                          new Date(patientImages[0].image_data.upload_time).toLocaleTimeString() : 
                          'Unknown'
                        }
                      </span>
                    </div>
                    {patientImages[0].image_data.filename && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Filename:</span>
                        <span className="font-medium text-xs">
                          {patientImages[0].image_data.filename.length > 20 
                            ? patientImages[0].image_data.filename.substring(0, 20) + '...'
                            : patientImages[0].image_data.filename
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {patientImages[0].analysis_data && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">AI Analysis Results</h4>
                    <div className="space-y-2 text-sm">
                      {patientImages[0].analysis_data.healing_score && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Healing Score:</span>
                          <span className="font-medium text-green-600">
                            {patientImages[0].analysis_data.healing_score.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {patientImages[0].analysis_data.healing_stage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Healing Stage:</span>
                          <span className="font-medium">
                            {patientImages[0].analysis_data.healing_stage}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Date:</span>
                        <span className="font-medium">
                          {patientImages[0].analysis_data.timestamp ? 
                            new Date(patientImages[0].analysis_data.timestamp).toLocaleDateString() : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowImageGallery(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Photos
                  </button>
                  <button 
                    onClick={() => window.location.href = '/patient/analysis'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Upload New Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        <ProgressTracker 
          patientId="patient_001" 
          currentHealingScore={patientData.healingProgress} 
        />

        {/* My Photos Section */}
        {patientImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiCamera className="h-5 w-5 mr-2 text-blue-600" />
                My Healing Photos ({patientImages.length})
              </h3>
              <button
                onClick={() => setShowImageGallery(!showImageGallery)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>{showImageGallery ? 'Hide' : 'Show'} Photos</span>
                <FiImage className="h-4 w-4" />
              </button>
            </div>
            
            {showImageGallery && (
              <div className="space-y-4">
                {/* Debug info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Debug:</strong> patientImages.length = {patientImages.length}, 
                    showImageGallery = {showImageGallery.toString()}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Filtered images: {patientImages.filter(imageData => imageData && imageData.image_data && imageData.image_data.base64).length}
                  </p>
                  <button
                    onClick={() => {
                      // Add a test image for debugging
                      const testImageData = {
                        patient_id: 'patient_001',
                        image_data: {
                          base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                          upload_time: new Date().toISOString(),
                          analysis_timestamp: new Date().toISOString(),
                          filename: `test_image_${Date.now()}.jpg`
                        },
                        analysis_data: {
                          healing_score: Math.floor(Math.random() * 40) + 60,
                          healing_stage: 'improving',
                          timestamp: new Date().toISOString()
                        }
                      };
                      
                      const existingImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
                      const updatedImages = [testImageData, ...existingImages];
                      localStorage.setItem('patient_images', JSON.stringify(updatedImages));
                      
                      // Trigger refresh
                      window.dispatchEvent(new CustomEvent('patientImageUpdated', {
                        detail: { patientId: 'patient_001', imageData: testImageData }
                      }));
                      
                      console.log('Test image added');
                    }}
                    className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                  >
                    Add Test Image
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {patientImages
                    .filter(imageData => imageData && imageData.image_data && imageData.image_data.base64)
                    .map((imageData, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={`data:image/jpeg;base64,${imageData.image_data.base64}`}
                          alt={`Healing progress ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                        #{index + 1}
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Latest
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg">
                        <div className="text-xs">
                          <div className="font-medium">
                            {imageData.image_data.upload_time ? 
                              new Date(imageData.image_data.upload_time).toLocaleDateString() : 
                              'Unknown date'
                            }
                          </div>
                          {imageData.analysis_data?.healing_score && (
                            <div className="text-green-300">
                              Score: {imageData.analysis_data.healing_score.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {patientImages.filter(imageData => imageData && imageData.image_data && imageData.image_data.base64).length === 0 && (
                  <div className="text-center py-8">
                    <FiImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No photos uploaded yet</p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Upload your first photo by going to the AI Analysis page.
                      </p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/patient/analysis'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Your First Photo
                    </button>
                  </div>
                )}
                
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Track your healing progress with regular photo uploads
                  </p>
                  <button 
                    onClick={() => window.location.href = '/patient/analysis'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload New Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patient History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Activity History</h2>
              <div className="flex items-center space-x-2">
                <FiFileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">{patientHistory.length} activities</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiActivity className="h-4 w-4 text-blue-600 animate-pulse" />
                </div>
                <p className="text-gray-500">Loading your activity history...</p>
              </div>
            ) : patientHistory.length === 0 ? (
              <div className="text-center py-8">
                <FiActivity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-500 mb-4">
                  Start your healing journey by uploading photos and completing exercises.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Upload First Photo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 ${getActivityColor(activity.color)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            
                            {/* Show additional details for image uploads */}
                            {activity.type === 'image_upload' && activity.details && (
                              <div className="mt-2 space-y-1">
                                {activity.details.filename && (
                                  <p className="text-xs text-gray-500">
                                    📁 File: {activity.details.filename}
                                  </p>
                                )}
                                {activity.details.healingScore && (
                                  <p className="text-xs text-green-600">
                                    📊 Healing Score: {activity.details.healingScore.toFixed(1)}%
                                  </p>
                                )}
                                {activity.details.healingStage && (
                                  <p className="text-xs text-blue-600">
                                    🎯 Stage: {activity.details.healingStage}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                            <div className="mt-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                activity.type === 'image_upload' ? 'bg-blue-100 text-blue-800' :
                                activity.type === 'exercise' ? 'bg-green-100 text-green-800' :
                                activity.type === 'medication' ? 'bg-orange-100 text-orange-800' :
                                activity.type === 'analysis' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.type === 'image_upload' ? 'Photo Upload' :
                                 activity.type === 'exercise' ? 'Exercise' :
                                 activity.type === 'medication' ? 'Medication' :
                                 activity.type === 'analysis' ? 'AI Analysis' :
                                 'Activity'}
                              </span>
                </div>
              </div>
                </div>
              </div>
            </div>
                  );
                })}
                
                {/* Show more button if there are many activities */}
                {patientHistory.length > 5 && (
                  <div className="text-center pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
                      View All Activities ({patientHistory.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
