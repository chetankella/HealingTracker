import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiTrendingUp, FiImage } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getLatestPatientImage } from '../services/aiService';

const PatientCard = ({ patient }) => {
  const { id, name, village, lastUpdate, healingProgress, status, avatar } = patient;
  const [currentImage, setCurrentImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Load current patient image
  useEffect(() => {
    const loadPatientImage = async () => {
      try {
        setImageLoading(true);
        const imageData = await getLatestPatientImage(id.toString());
        if (imageData && imageData.latest_image) {
          setCurrentImage(imageData.latest_image);
        }
      } catch (error) {
        console.error('Failed to load patient image:', error);
      } finally {
        setImageLoading(false);
      }
    };
    
    loadPatientImage();
  }, [id]);
  
  // Determine progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800';
      case 'stable': return 'bg-green-100 text-green-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastUpdate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Link 
      to={`/doctor/patient/${id}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] border border-gray-100"
    >
      <div className="p-6">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {currentImage && !imageLoading ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                  <img 
                    src={`data:image/jpeg;base64,${currentImage.base64}`}
                    alt={`${name} current wound`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {imageLoading ? (
                    <FiImage className="h-5 w-5 animate-pulse" />
                  ) : (
                    avatar || name.charAt(0).toUpperCase()
                  )}
                </div>
              )}
              {currentImage && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FiImage className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <FiMapPin className="h-4 w-4 mr-1" />
                {village}
              </div>
              {currentImage && (
                <div className="text-xs text-blue-600 mt-1">
                  Latest image available
                </div>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Healing Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Healing Progress</span>
            <div className="flex items-center space-x-1">
              <FiTrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-bold text-gray-900">{healingProgress}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(healingProgress)}`}
              style={{ width: `${healingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center text-gray-500 text-sm">
          <FiClock className="h-4 w-4 mr-2" />
          <span>Last updated {formatLastUpdate(lastUpdate)}</span>
        </div>
      </div>
    </Link>
  );
};

export default PatientCard;

