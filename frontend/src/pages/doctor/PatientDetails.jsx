import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ProgressTracker from '../../components/ProgressTracker';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiFileText,
  FiImage,
  FiCamera,
  FiRefreshCw
} from 'react-icons/fi';
import { getLatestPatientImage, getPatientImages } from '../../services/aiService';

const PatientDetails = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(null);
  const [patientImages, setPatientImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [showNewImageNotification, setShowNewImageNotification] = useState(false);
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null);
  
  console.log('PatientDetails component rendered with ID:', id);
  
  // Mock patient data - in real app, this would be fetched from API
  const [patient, setPatient] = useState({
    id: id || '001',
    name: 'Arjun Sharma',
    age: 45,
    gender: 'Male',
    email: 'arjun.sharma@email.com',
    phone: '+91 98765 43210',
    address: '123 MG Road, Mumbai, Maharashtra 400001',
    condition: 'Post-surgical wound healing',
    admissionDate: '2024-01-05',
    expectedRecovery: '2024-02-15',
    currentHealingScore: 75,
    riskLevel: 'Low',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-15',
    medications: [
      'Antibiotic cream - 2x daily',
      'Pain medication - As needed',
      'Anti-inflammatory - 1x daily'
    ],
    recentNotes: [
      {
        date: '2024-01-10',
        note: 'Healing progress is excellent. Reduced inflammation observed.',
        author: 'Dr. Amanda Smith'
      },
      {
        date: '2024-01-08',
        note: 'Patient reports reduced pain levels. Continue current treatment.',
        author: 'Dr. Amanda Smith'
      }
    ]
  });

  // Load patient images
  useEffect(() => {
    console.log('PatientDetails useEffect triggered for patient ID:', id);
    
    const loadPatientImages = async () => {
      try {
        setImageLoading(true);
        console.log('Loading images for patient ID:', id);
        
        const [latestImageData, allImagesData] = await Promise.all([
          getLatestPatientImage(id.toString()),
          getPatientImages(id.toString())
        ]);
        
        console.log('Latest image data:', latestImageData);
        console.log('All images data:', allImagesData);
        
        let imageToSet = null;
        
        if (latestImageData && latestImageData.latest_image) {
          imageToSet = latestImageData.latest_image;
          console.log('Set current image from API:', latestImageData.latest_image);
        }
        
        if (allImagesData && allImagesData.images) {
          setPatientImages(allImagesData.images);
          console.log('Set patient images:', allImagesData.images);
        } else {
          // Load from localStorage if API doesn't have images
          const allImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
          const patientSpecificImages = allImages.filter(img => img.patient_id === id.toString());
          setPatientImages(patientSpecificImages);
          console.log('Set patient images from localStorage:', patientSpecificImages);
          console.log('Sample image structure:', patientSpecificImages[0]);
        }
        
        // Check localStorage as fallback if no image was loaded from API
        if (!imageToSet) {
          // Try both string and number formats for patient ID
          const patientIdString = id.toString();
          const patientIdNumber = parseInt(id);
          
          let localImageData = localStorage.getItem(`patient_image_${patientIdString}`);
          if (!localImageData && patientIdString !== patientIdNumber.toString()) {
            localImageData = localStorage.getItem(`patient_image_${patientIdNumber}`);
          }
          
          console.log('localStorage data for patient', id, ':', localImageData);
          console.log('Tried keys: patient_image_' + patientIdString, 'patient_image_' + patientIdNumber);
          
          if (localImageData) {
            const parsedData = JSON.parse(localImageData);
            console.log('Parsed localStorage data:', parsedData);
            if (parsedData.image_data) {
              imageToSet = parsedData.image_data;
              console.log('Set current image from localStorage:', parsedData.image_data);
            }
          }
        }
        
        // Set the image if we found one
        if (imageToSet) {
          setCurrentImage(imageToSet);
        } else {
          console.log('No image found for patient', id, '- creating mock data for testing');
          // Create mock data for testing if no real data exists
          const mockImageData = {
            patient_id: id,
            image_data: {
              base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 transparent pixel
              upload_time: new Date().toISOString(),
              analysis_timestamp: new Date().toISOString()
            },
            analysis_data: {
              healing_score: 75,
              healing_stage: 'improving',
              timestamp: new Date().toISOString()
            }
          };
          localStorage.setItem(`patient_image_${id}`, JSON.stringify(mockImageData));
          setCurrentImage(mockImageData.image_data);
          console.log('Set mock image data for testing');
        }
      } catch (error) {
        console.error('Failed to load patient images:', error);
      } finally {
        setImageLoading(false);
      }
    };
    
    loadPatientImages();
    
    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing images for patient:', id);
      loadPatientImages();
    }, 30000); // Refresh every 30 seconds
    
    // Set up localStorage change listener for real-time updates
    const handleStorageChange = (e) => {
      const patientIdString = id.toString();
      const patientIdNumber = parseInt(id);
      
      if ((e.key === `patient_image_${patientIdString}` || e.key === `patient_image_${patientIdNumber}`) && e.newValue) {
        console.log('Detected new image in localStorage for patient:', id, 'key:', e.key);
        const parsedData = JSON.parse(e.newValue);
        if (parsedData.image_data) {
          setCurrentImage(parsedData.image_data);
          setShowNewImageNotification(true);
          console.log('Updated current image from localStorage change:', parsedData.image_data);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNewImageNotification(false);
          }, 5000);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom image update events
    const handleImageUpdate = (e) => {
      console.log('Received custom image update event:', e.detail);
      const eventPatientId = e.detail.patientId.toString();
      const currentPatientId = id.toString();
      
      if (eventPatientId === currentPatientId) {
        console.log('Event matches current patient:', id);
        setCurrentImage(e.detail.imageData.image_data);
        setShowNewImageNotification(true);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setShowNewImageNotification(false);
        }, 5000);
      } else {
        console.log('Event patient ID mismatch:', eventPatientId, 'vs', currentPatientId);
      }
    };
    
    window.addEventListener('patientImageUpdated', handleImageUpdate);
    
    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('patientImageUpdated', handleImageUpdate);
    };
  }, [id]);

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout userType="doctor" userName="Dr. Priya Patel" hospitalName="City General Hospital">
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/doctor">
          <button
            className="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group"
            type="button"
          >
            <div
              className="bg-green-400 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                height="25px"
                width="25px"
              >
                <path
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  fill="#000000"
                ></path>
                <path
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  fill="#000000"
                ></path>
              </svg>
            </div>
            <p className="translate-x-2">Go Back</p>
          </button>
        </Link>

        {/* New Image Notification */}
        {showNewImageNotification && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FiCamera className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">New Image Uploaded!</h4>
                <p className="text-sm text-green-600">
                  {patient.name} has uploaded a new wound image for analysis.
                </p>
              </div>
              <button
                onClick={() => setShowNewImageNotification(false)}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}


        {/* Patient Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FiUser className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{patient.name}</h1>
                <p className="text-blue-100">Patient ID: {patient.id}</p>
                <p className="text-blue-100">{patient.age} years old • {patient.gender}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">{patient.currentHealingScore}%</div>
              <div className="text-blue-100">Healing Progress</div>
            </div>
          </div>
        </div>

        {/* Current Patient Image */}
        {currentImage ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiCamera className="h-5 w-5 mr-2 text-blue-600" />
                Current Wound Image
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  Uploaded: {new Date(currentImage.upload_time).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setImageLoading(true);
                    const loadPatientImages = async () => {
                      try {
                        const [latestImageData, allImagesData] = await Promise.all([
                          getLatestPatientImage(id.toString()),
                          getPatientImages(id.toString())
                        ]);
                        
                        if (latestImageData && latestImageData.latest_image) {
                          setCurrentImage(latestImageData.latest_image);
                        }
                        
                        if (allImagesData && allImagesData.images) {
                          setPatientImages(allImagesData.images);
                        } else {
                          // Load from localStorage if API doesn't have images
                          const allImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
                          const patientSpecificImages = allImages.filter(img => img.patient_id === id.toString());
                          setPatientImages(patientSpecificImages);
                          console.log('Refreshed patient images from localStorage:', patientSpecificImages);
                        }
                      } catch (error) {
                        console.error('Failed to refresh patient images:', error);
                      } finally {
                        setImageLoading(false);
                      }
                    };
                    loadPatientImages();
                  }}
                  disabled={imageLoading}
                  className={`p-2 transition-colors ${
                    imageLoading 
                      ? 'text-blue-400 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-blue-600'
                  }`}
                  title="Refresh images"
                >
                  <FiRefreshCw className={`h-4 w-4 ${imageLoading ? 'animate-spin' : ''}`} />
                </button>
                {imageLoading && (
                  <span className="text-xs text-blue-600">Refreshing...</span>
                )}
              </div>
            </div>
            <div className="relative">
              <img 
                src={`data:image/jpeg;base64,${currentImage.base64}`}
                alt={`${patient.name} current wound`}
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Latest
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                This is the most recent image uploaded for AI analysis
              </p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Images are automatically updated when patients upload new photos for analysis. 
                  The system stores both the original image and AI analysis results.
                </p>
              </div>
            </div>
          </div>
        ) : !imageLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiImage className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Current Image Available</h3>
              <p className="text-gray-600 mb-4">
                No wound images have been uploaded for this patient yet.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When the patient uploads an image for AI analysis, 
                  it will automatically appear here as the current wound image.
                </p>
              </div>
              <button
                onClick={() => {
                  setImageLoading(true);
                  const loadPatientImages = async () => {
                    try {
                      const [latestImageData, allImagesData] = await Promise.all([
                        getLatestPatientImage(id.toString()),
                        getPatientImages(id.toString())
                      ]);
                      
                      if (latestImageData && latestImageData.latest_image) {
                        setCurrentImage(latestImageData.latest_image);
                      }
                      
                      if (allImagesData && allImagesData.images) {
                        setPatientImages(allImagesData.images);
                      } else {
                        // Load from localStorage if API doesn't have images
                        const allImages = JSON.parse(localStorage.getItem('patient_images') || '[]');
                        const patientSpecificImages = allImages.filter(img => img.patient_id === id.toString());
                        setPatientImages(patientSpecificImages);
                        console.log('Check for new images - loaded from localStorage:', patientSpecificImages);
                      }
                    } catch (error) {
                      console.error('Failed to refresh patient images:', error);
                    } finally {
                      setImageLoading(false);
                    }
                  };
                  loadPatientImages();
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Check for New Images
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiImage className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Images...</h3>
              <p className="text-gray-600">
                Checking for available wound images...
              </p>
            </div>
          </div>
        )}

        {/* Image History Section */}
        {patientImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiImage className="h-5 w-5 mr-2 text-purple-600" />
                Image History ({patientImages.length} images)
              </h3>
              <button
                onClick={() => setShowImageHistory(!showImageHistory)}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>{showImageHistory ? 'Hide' : 'Show'} History</span>
                <FiImage className="h-4 w-4" />
              </button>
            </div>
            
            {showImageHistory && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patientImages
                    .filter(imageData => imageData && imageData.image_data && imageData.image_data.base64)
                    .map((imageData, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="relative mb-3">
                        <img 
                          src={`data:image/jpeg;base64,${imageData.image_data.base64}`}
                          alt={`${patient.name} wound - ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => setSelectedHistoryImage(imageData)}
                        />
                        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                          #{index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Latest
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Uploaded:</span>
                          <span className="font-medium ml-1">
                            {imageData.image_data.upload_time ? 
                              new Date(imageData.image_data.upload_time).toLocaleDateString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium ml-1">
                            {imageData.image_data.upload_time ? 
                              new Date(imageData.image_data.upload_time).toLocaleTimeString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        {imageData.image_data.filename && (
                          <div className="text-sm">
                            <span className="text-gray-600">File:</span>
                            <span className="font-medium ml-1 text-xs">
                              {imageData.image_data.filename.length > 20 
                                ? imageData.image_data.filename.substring(0, 20) + '...'
                                : imageData.image_data.filename
                              }
                            </span>
                          </div>
                        )}
                        {imageData.analysis_data && imageData.analysis_data.healing_score && (
                          <div className="text-sm">
                            <span className="text-gray-600">Score:</span>
                            <span className="font-medium ml-1 text-green-600">
                              {imageData.analysis_data.healing_score.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedHistoryImage(imageData)}
                        className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
                
                {patientImages.length === 0 && (
                  <div className="text-center py-8">
                    <FiImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No image history available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedHistoryImage && selectedHistoryImage.image_data && selectedHistoryImage.image_data.base64 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Image Details</h3>
                  <button
                    onClick={() => setSelectedHistoryImage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={`data:image/jpeg;base64,${selectedHistoryImage.image_data.base64}`}
                      alt="Patient wound image"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Upload Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Upload Date:</span>
                          <span className="font-medium">
                            {selectedHistoryImage.image_data.upload_time ? 
                              new Date(selectedHistoryImage.image_data.upload_time).toLocaleDateString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Upload Time:</span>
                          <span className="font-medium">
                            {selectedHistoryImage.image_data.upload_time ? 
                              new Date(selectedHistoryImage.image_data.upload_time).toLocaleTimeString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Analysis Time:</span>
                          <span className="font-medium">
                            {selectedHistoryImage.image_data.analysis_timestamp ? 
                              new Date(selectedHistoryImage.image_data.analysis_timestamp).toLocaleTimeString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        {selectedHistoryImage.image_data.filename && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Filename:</span>
                            <span className="font-medium text-xs">{selectedHistoryImage.image_data.filename}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedHistoryImage.analysis_data && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Analysis Results</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Healing Score:</span>
                            <span className="font-medium text-green-600">
                              {selectedHistoryImage.analysis_data.healing_score ? 
                                selectedHistoryImage.analysis_data.healing_score.toFixed(1) + '%' : 
                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Healing Stage:</span>
                            <span className="font-medium">
                              {selectedHistoryImage.analysis_data.healing_stage || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Analysis Date:</span>
                            <span className="font-medium">
                              {selectedHistoryImage.analysis_data.timestamp ? 
                                new Date(selectedHistoryImage.analysis_data.timestamp).toLocaleDateString() : 
                                'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setCurrentImage(selectedHistoryImage.image_data);
                          setSelectedHistoryImage(null);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Set as Current Image
                      </button>
                      <button
                        onClick={() => setSelectedHistoryImage(null)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{patient.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{patient.phone}</span>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-600">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Condition:</span>
                <p className="font-medium text-gray-900">{patient.condition}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Risk Level:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                  {patient.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiCalendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Admitted:</span>
                  <p className="font-medium text-gray-900">{new Date(patient.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiActivity className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Expected Recovery:</span>
                  <p className="font-medium text-gray-900">{new Date(patient.expectedRecovery).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Last Visit:</span>
                <p className="font-medium text-gray-900">{new Date(patient.lastVisit).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Next Appointment:</span>
                <p className="font-medium text-blue-600">{new Date(patient.nextAppointment).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker 
          patientId={patient.id} 
          currentHealingScore={patient.currentHealingScore} 
        />

        {/* Medications & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Medications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Current Medications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-blue-800">{medication}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Recent Notes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {patient.recentNotes.map((note, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{note.author}</span>
                      <span className="text-sm text-gray-500">{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
            <FiFileText className="h-4 w-4" />
            <span>Add Note</span>
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2">
            <FiCalendar className="h-4 w-4" />
            <span>Schedule Appointment</span>
          </button>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2">
            <FiTrendingUp className="h-4 w-4" />
            <span>View Full History</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDetails;




