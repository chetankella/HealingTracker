import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar, 
  FiTarget,
  FiActivity,
  FiClock,
  FiRefreshCw,
  FiLoader
} from 'react-icons/fi';
import aiService from '../services/aiService';

const ProgressTracker = ({ patientId, currentHealingScore = 85 }) => {
  const [analytics, setAnalytics] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgressData();
  }, [patientId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all progress data in parallel
      const [analyticsData, timelineData, recommendationsData] = await Promise.all([
        aiService.getAnalytics(patientId, 30).catch(() => null),
        aiService.predictTimeline(patientId, currentHealingScore).catch(() => null),
        aiService.getRecommendations(patientId).catch(() => null)
      ]);

      setAnalytics(analyticsData);
      setTimeline(timelineData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTrendIcon = (trend) => {
    return trend === 'improving' ? FiTrendingUp : FiTrendingDown;
  };

  const getTrendColor = (trend) => {
    return trend === 'improving' 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <FiLoader className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading progress data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-600">{error}</span>
            <button
              onClick={loadProgressData}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Progress Analytics</h3>
              <button
                onClick={loadProgressData}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Progress Trend */}
              <div className={`p-4 rounded-xl border ${getTrendColor(analytics.progress_trend)}`}>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const TrendIcon = getTrendIcon(analytics.progress_trend);
                    return <TrendIcon className="h-6 w-6" />;
                  })()}
                  <div>
                    <div className="font-semibold capitalize">{analytics.progress_trend}</div>
                    <div className="text-sm opacity-80">Overall Trend</div>
                  </div>
                </div>
              </div>

              {/* Healing Rate */}
              <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-600">
                <div className="flex items-center space-x-3">
                  <FiActivity className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">+{analytics.average_healing_rate}/day</div>
                    <div className="text-sm opacity-80">Healing Rate</div>
                  </div>
                </div>
              </div>

              {/* Total Improvement */}
              <div className="p-4 rounded-xl border bg-green-50 border-green-200 text-green-600">
                <div className="flex items-center space-x-3">
                  <FiTrendingUp className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">+{analytics.total_improvement}%</div>
                    <div className="text-sm opacity-80">Total Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            {analytics.milestones_reached && analytics.milestones_reached.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Recent Milestones</h4>
                <div className="space-y-2">
                  {analytics.milestones_reached.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <span className="text-green-800 font-medium">{milestone.milestone}</span>
                        <span className="text-green-600 text-sm ml-2">
                          {formatDate(milestone.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {analytics.predictions && (
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-medium text-purple-900 mb-2">AI Predictions</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-800">
                      Expected full healing: {formatDate(analytics.predictions.expected_full_healing)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTarget className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-800">
                      Confidence: {Math.round(analytics.predictions.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Prediction */}
      {timeline && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Healing Timeline</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Days Remaining */}
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <FiClock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {timeline.predicted_healing_days}
                </div>
                <div className="text-blue-800 font-medium">Days to Full Healing</div>
                <div className="text-blue-600 text-sm mt-1">
                  ({timeline.confidence_interval.min}-{timeline.confidence_interval.max} day range)
                </div>
              </div>

              {/* Success Probability */}
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <FiTarget className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(timeline.success_probability * 100)}%
                </div>
                <div className="text-green-800 font-medium">Success Probability</div>
                <div className="text-green-600 text-sm mt-1">
                  Based on current progress
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {timeline.risk_factors && timeline.risk_factors.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Risk Factors to Monitor</h4>
                <ul className="space-y-1">
                  {timeline.risk_factors.map((risk, index) => (
                    <li key={index} className="text-yellow-800 text-sm flex items-start space-x-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Daily Care */}
            {recommendations.daily_care && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Daily Care Routine</h4>
                <div className="space-y-2">
                  {recommendations.daily_care.map((care, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span className="text-blue-800">{care}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {recommendations.lifestyle && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lifestyle Recommendations</h4>
                <div className="space-y-2">
                  {recommendations.lifestyle.map((lifestyle, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-green-800">{lifestyle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Signs */}
            {recommendations.warning_signs && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Warning Signs to Watch</h4>
                <div className="space-y-2">
                  {recommendations.warning_signs.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span className="text-red-800">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;















