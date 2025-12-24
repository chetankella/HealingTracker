import { useState } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiInfo, 
  FiActivity,
  FiTarget,
  FiClock,
  FiHeart
} from 'react-icons/fi';

const AnalysisResults = ({ analysisData, onNewAnalysis }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysisData) {
    return null;
  }

  const {
    healing_score,
    wound_area,
    inflammation_level,
    infection_risk,
    healing_stage,
    recommendations,
    confidence_score,
    visual_features,
    timestamp,
    patient_id
  } = analysisData;

  // Helper functions for styling based on values
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getInflammationColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStageInfo = (stage) => {
    const stages = {
      acute: { color: 'red', description: 'Initial injury phase', icon: FiAlertCircle },
      inflammatory: { color: 'orange', description: 'Inflammatory response', icon: FiActivity },
      proliferative: { color: 'blue', description: 'Tissue building phase', icon: FiTrendingUp },
      healing: { color: 'green', description: 'Active healing', icon: FiHeart },
      maturation: { color: 'purple', description: 'Final healing stage', icon: FiTarget },
      infected: { color: 'red', description: 'Infection detected', icon: FiAlertCircle },
      severe_infection: { color: 'red', description: 'Severe infection - URGENT', icon: FiAlertCircle }
    };
    return stages[stage?.toLowerCase()] || stages.healing;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiInfo },
    { id: 'details', label: 'Details', icon: FiActivity },
    { id: 'enhanced', label: 'Enhanced Analysis', icon: FiTarget },
    { id: 'recommendations', label: 'Recommendations', icon: FiCheckCircle }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">AI Analysis Results</h3>
            <p className="text-purple-100 text-sm">
              Analysis completed on {new Date(timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(healing_score)}%</div>
            <div className="text-purple-100 text-sm">Healing Score</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${getScoreColor(healing_score)}`}>
                <div className="text-2xl font-bold mb-1">{Math.round(healing_score)}%</div>
                <div className="text-sm opacity-80">Healing Progress</div>
                <div className="text-xs opacity-60 mt-1">Enhanced AI Analysis</div>
              </div>
              
              <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-600">
                <div className="text-2xl font-bold mb-1">{wound_area?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm opacity-80">Area (cm²)</div>
                <div className="text-xs opacity-60 mt-1">Precise Measurement</div>
              </div>
              
              <div className={`p-4 rounded-xl border ${getInflammationColor(inflammation_level)}`}>
                <div className="text-lg font-bold mb-1 capitalize">{inflammation_level || 'Unknown'}</div>
                <div className="text-sm opacity-80">Inflammation</div>
                <div className="text-xs opacity-60 mt-1">Color Analysis</div>
              </div>
              
              <div className={`p-4 rounded-xl border ${getRiskColor(infection_risk)}`}>
                <div className="text-lg font-bold mb-1 capitalize">{infection_risk || 'Unknown'}</div>
                <div className="text-sm opacity-80">Infection Risk</div>
                <div className="text-xs opacity-60 mt-1">Multi-factor Assessment</div>
              </div>
            </div>

            {/* Healing Stage */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                {(() => {
                  const stageInfo = getStageInfo(healing_stage);
                  const Icon = stageInfo.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg bg-${stageInfo.color}-100`}>
                        <Icon className={`h-5 w-5 text-${stageInfo.color}-600`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {healing_stage || 'Unknown'} Stage
                        </div>
                        <div className="text-sm text-gray-600">{stageInfo.description}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <FiTarget className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Analysis Confidence</div>
                  <div className="text-sm text-blue-600">AI model certainty level</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((confidence_score || 0.85) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
            
            {/* Visual Features */}
            {visual_features && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-medium text-gray-900 mb-3">Visual Features Detected</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {visual_features.area_cm2 && (
                    <div>
                      <span className="text-gray-600">Area:</span>
                      <span className="ml-2 font-medium">{visual_features.area_cm2.toFixed(2)} cm²</span>
                    </div>
                  )}
                  {visual_features.brightness !== undefined && (
                    <div>
                      <span className="text-gray-600">Brightness:</span>
                      <span className="ml-2 font-medium">{Math.round(visual_features.brightness)}/255</span>
                    </div>
                  )}
                  {visual_features.redness_ratio !== undefined && (
                    <div>
                      <span className="text-gray-600">Redness Ratio:</span>
                      <span className="ml-2 font-medium">{visual_features.redness_ratio.toFixed(2)}</span>
                    </div>
                  )}
                  {visual_features.mean_red !== undefined && (
                    <div>
                      <span className="text-gray-600">Red Level:</span>
                      <span className="ml-2 font-medium">{Math.round(visual_features.mean_red)}</span>
                    </div>
                  )}
                  {visual_features.mean_green !== undefined && (
                    <div>
                      <span className="text-gray-600">Green Level:</span>
                      <span className="ml-2 font-medium">{Math.round(visual_features.mean_green)}</span>
                    </div>
                  )}
                  {visual_features.mean_blue !== undefined && (
                    <div>
                      <span className="text-gray-600">Blue Level:</span>
                      <span className="ml-2 font-medium">{Math.round(visual_features.mean_blue)}</span>
                    </div>
                  )}
                  {visual_features.texture_variance && (
                    <div>
                      <span className="text-gray-600">Contrast:</span>
                      <span className="ml-2 font-medium">{Math.round(visual_features.texture_variance)}</span>
                    </div>
                  )}
                  {visual_features.edge_density !== undefined && (
                    <div>
                      <span className="text-gray-600">Edge Density:</span>
                      <span className="ml-2 font-medium">{(visual_features.edge_density * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {visual_features.circularity && (
                    <div>
                      <span className="text-gray-600">Circularity:</span>
                      <span className="ml-2 font-medium">{visual_features.circularity.toFixed(3)}</span>
                    </div>
                  )}
                </div>
                
                {/* Image Dimensions */}
                {visual_features.image_dimensions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Image Resolution: </span>
                    <span className="font-medium text-sm">
                      {visual_features.image_dimensions.width} × {visual_features.image_dimensions.height} pixels
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Timestamp and ID */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h5 className="font-medium text-blue-900 mb-3">Analysis Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Patient ID:</span>
                  <span className="font-mono text-blue-800">{patient_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Timestamp:</span>
                  <span className="text-blue-800">{new Date(timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Model Confidence:</span>
                  <span className="text-blue-800">{Math.round((confidence_score || 0.85) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enhanced' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Enhanced AI Analysis</h4>
            
            {/* Medical Analysis */}
            {analysisData.medical_analysis && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTarget className="mr-2 text-blue-600" />
                  Medical Tissue Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analysisData.medical_analysis.tissue_composition?.granulation_percentage || '0'}%
                    </div>
                    <div className="text-sm text-red-800">Granulation Tissue</div>
                    <div className="text-xs text-red-600 mt-1">Red, beefy, moist</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysisData.medical_analysis.tissue_composition?.slough_percentage || '0'}%
                    </div>
                    <div className="text-sm text-yellow-800">Slough</div>
                    <div className="text-xs text-yellow-600 mt-1">Dead tissue</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {analysisData.medical_analysis.tissue_composition?.necrotic_percentage || '0'}%
                    </div>
                    <div className="text-sm text-gray-800">Necrotic</div>
                    <div className="text-xs text-gray-600 mt-1">Black/brown tissue</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.medical_analysis.tissue_composition?.healthy_tissue_percentage || '0'}%
                    </div>
                    <div className="text-sm text-green-800">Healthy</div>
                    <div className="text-xs text-green-600 mt-1">Epithelialization</div>
                  </div>
                </div>
                
                {/* Medical Calculation */}
                {analysisData.medical_analysis.medical_calculation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Medical Calculation</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Base Granulation</div>
                        <div className="text-lg font-bold text-red-600">
                          +{analysisData.medical_analysis.medical_calculation.base_granulation || '0'}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Epithelialization</div>
                        <div className="text-lg font-bold text-green-600">
                          +{analysisData.medical_analysis.medical_calculation.epithelialization_bonus || '0'}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Necrotic Penalty</div>
                        <div className="text-lg font-bold text-red-600">
                          -{analysisData.medical_analysis.medical_calculation.necrotic_penalty || '0'}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Slough Penalty</div>
                        <div className="text-lg font-bold text-yellow-600">
                          -{analysisData.medical_analysis.medical_calculation.slough_penalty || '0'}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">Final Medical %</div>
                        <div className="text-lg font-bold text-blue-600">
                          {analysisData.medical_analysis.medical_calculation.medical_percentage || '0'}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Score Breakdown */}
            {analysisData.analysis_details?.score_breakdown && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h5 className="font-semibold text-gray-900 mb-4">Healing Score Breakdown</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{analysisData.analysis_details.score_breakdown.base_score || 50}</div>
                    <div className="text-xs text-gray-600">Base Score</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">{analysisData.analysis_details.score_breakdown.color_score?.toFixed(1) || '0'}</div>
                    <div className="text-xs text-gray-600">Color Analysis</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{analysisData.analysis_details.score_breakdown.texture_score?.toFixed(1) || '0'}</div>
                    <div className="text-xs text-gray-600">Texture Analysis</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{analysisData.analysis_details.score_breakdown.shape_score?.toFixed(1) || '0'}</div>
                    <div className="text-xs text-gray-600">Shape Analysis</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-red-600">{analysisData.analysis_details.score_breakdown.size_score?.toFixed(1) || '0'}</div>
                    <div className="text-xs text-gray-600">Size Analysis</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{analysisData.analysis_details.score_breakdown.external_score?.toFixed(1) || '0'}</div>
                    <div className="text-xs text-gray-600">External API</div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Color Analysis */}
            {analysisData.analysis_details?.color_analysis && (
              <div className="bg-green-50 rounded-xl p-4">
                <h5 className="font-medium text-green-900 mb-3">Advanced Color Analysis</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Red Percentage:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.red_percentage?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-green-700">Yellow Percentage:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.yellow_percentage?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-green-700">Green Percentage:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.green_percentage?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-green-700">Inflammation Index:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.inflammation_index?.toFixed(2) || '0'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CRITICAL: Infection Indicators */}
            {analysisData.analysis_details?.color_analysis?.infection_indicators && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h5 className="font-medium text-red-900 mb-3 flex items-center">
                  <FiAlertCircle className="h-5 w-5 mr-2" />
                  Infection Indicators
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={analysisData.analysis_details.color_analysis.infection_indicators.slough_percentage > 5 ? 'text-red-800 font-bold' : 'text-red-700'}>
                    <span>Slough/Exudate:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.infection_indicators.slough_percentage?.toFixed(1) || '0'}%</span>
                    {analysisData.analysis_details.color_analysis.infection_indicators.slough_percentage > 5 && (
                      <span className="ml-2 text-red-600">⚠️ HIGH</span>
                    )}
                  </div>
                  <div className={analysisData.analysis_details.color_analysis.infection_indicators.necrosis_percentage > 1 ? 'text-red-800 font-bold' : 'text-red-700'}>
                    <span>Necrotic Tissue:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.infection_indicators.necrosis_percentage?.toFixed(1) || '0'}%</span>
                    {analysisData.analysis_details.color_analysis.infection_indicators.necrosis_percentage > 1 && (
                      <span className="ml-2 text-red-600">⚠️ HIGH</span>
                    )}
                  </div>
                  <div className={analysisData.analysis_details.color_analysis.infection_indicators.purulent_exudate > 0.5 ? 'text-red-800 font-bold' : 'text-red-700'}>
                    <span>Purulent Exudate:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.infection_indicators.purulent_exudate?.toFixed(1) || '0'}%</span>
                    {analysisData.analysis_details.color_analysis.infection_indicators.purulent_exudate > 0.5 && (
                      <span className="ml-2 text-red-600">⚠️ PRESENT</span>
                    )}
                  </div>
                  <div className={analysisData.analysis_details.color_analysis.infection_indicators.total_infection_score > 8 ? 'text-red-800 font-bold' : 'text-red-700'}>
                    <span>Total Infection Score:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.color_analysis.infection_indicators.total_infection_score?.toFixed(1) || '0'}</span>
                    {analysisData.analysis_details.color_analysis.infection_indicators.total_infection_score > 8 && (
                      <span className="ml-2 text-red-600">🚨 CRITICAL</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Texture Analysis */}
            {analysisData.analysis_details?.texture_analysis && (
              <div className="bg-purple-50 rounded-xl p-4">
                <h5 className="font-medium text-purple-900 mb-3">Texture Analysis</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Texture Complexity:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.texture_analysis.texture_complexity?.toFixed(3) || '0'}</span>
                  </div>
                  <div>
                    <span className="text-purple-700">Edge Density:</span>
                    <span className="ml-2 font-medium">{(analysisData.analysis_details.texture_analysis.edge_density * 100)?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-purple-700">Gradient Mean:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.texture_analysis.gradient_mean?.toFixed(1) || '0'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Wound Segmentation */}
            {analysisData.analysis_details?.segmentation && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h5 className="font-medium text-orange-900 mb-3">Wound Segmentation</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-orange-700">Wound Percentage:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.segmentation.wound_percentage?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Circularity:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.segmentation.circularity?.toFixed(3) || '0'}</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Solidity:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.segmentation.solidity?.toFixed(3) || '0'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* External API Analysis */}
            {analysisData.analysis_details?.external_analysis && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <h5 className="font-medium text-indigo-900 mb-3">External AI Validation</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-indigo-700">Overall Confidence:</span>
                    <span className="ml-2 font-medium">{(analysisData.analysis_details.external_analysis.overall_confidence * 100)?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-700">Medical Relevance:</span>
                    <span className="ml-2 font-medium">{(analysisData.analysis_details.external_analysis.overall_medical_relevance * 100)?.toFixed(1) || '0'}%</span>
                  </div>
                  <div>
                    <span className="text-indigo-700">APIs Used:</span>
                    <span className="ml-2 font-medium">{analysisData.analysis_details.external_analysis.api_count || '0'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Recommendations</h4>
            
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-green-800">{recommendation}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiInfo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific recommendations available for this analysis.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Analysis ID: {analysisData.analysis_id || 'N/A'}
          </div>
          <button
            onClick={onNewAnalysis}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
