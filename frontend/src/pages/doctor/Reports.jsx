import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { FiFileText, FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiFilter, FiSearch, FiBarChart, FiPieChart } from 'react-icons/fi';
import aiService from '../../services/aiService';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      patientName: "Priya Sharma",
      patientId: 1,
      reportType: "Weekly Progress",
      date: "2024-01-10T10:30:00Z",
      healingScore: 85,
      status: "improving",
      summary: "Patient shows consistent improvement with 15% healing progress this week",
      recommendations: ["Continue current exercise routine", "Monitor pain levels", "Schedule follow-up in 1 week"],
      attachments: ["progress_chart.pdf", "exercise_log.xlsx"]
    },
    {
      id: 2,
      patientName: "Rajesh Kumar",
      patientId: 2,
      reportType: "Critical Assessment",
      date: "2024-01-09T14:20:00Z",
      healingScore: 25,
      status: "critical",
      summary: "Patient requires immediate attention due to slow healing and increased pain",
      recommendations: ["Increase pain medication", "Schedule immediate consultation", "Consider alternative treatment"],
      attachments: ["assessment_report.pdf", "pain_log.xlsx"]
    },
    {
      id: 3,
      patientName: "Anita Patel",
      patientId: 3,
      reportType: "Monthly Summary",
      date: "2024-01-08T16:45:00Z",
      healingScore: 92,
      status: "stable",
      summary: "Excellent progress with patient nearing full recovery",
      recommendations: ["Gradually reduce medication", "Continue light exercises", "Prepare discharge plan"],
      attachments: ["monthly_summary.pdf", "recovery_timeline.xlsx"]
    },
    {
      id: 4,
      patientName: "Vikram Singh",
      patientId: 4,
      reportType: "Emergency Report",
      date: "2024-01-07T10:15:00Z",
      healingScore: 20,
      status: "critical",
      summary: "Patient shows signs of infection and requires urgent medical intervention",
      recommendations: ["Immediate antibiotic treatment", "Hospital admission", "Specialist consultation"],
      attachments: ["emergency_report.pdf", "lab_results.pdf"]
    },
    {
      id: 5,
      patientName: "Sunita Gupta",
      patientId: 5,
      reportType: "Weekly Progress",
      date: "2024-01-06T12:00:00Z",
      healingScore: 78,
      status: "improving",
      summary: "Steady progress with good compliance to treatment plan",
      recommendations: ["Continue current regimen", "Increase exercise intensity", "Monitor for any setbacks"],
      attachments: ["progress_chart.pdf", "exercise_log.xlsx"]
    }
  ];

  useEffect(() => {
    // Load reports and analytics
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from API
        setReports(mockReports);
        
        // Load analytics data
        const analyticsData = await aiService.getAnalytics(1); // Using patient 1 as example
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter reports based on search and date
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportType.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const reportDate = new Date(report.date);
      const now = new Date();
      const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'needs_attention': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'stable': return 'text-green-600 bg-green-50 border-green-200';
      case 'improving': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout userType="doctor" userName="Dr. Priya Patel" hospitalName="City General Hospital">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="doctor" userName="Dr. Priya Patel" hospitalName="City General Hospital">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center xl:text-left">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-2">
            Patient Reports & Analytics
          </h1>
          <p className="text-gray-600 text-lg xl:text-xl">
            Comprehensive reports and analytics for patient care management
          </p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Healing Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.average_healing_rate}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiBarChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Improvement</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.total_improvement}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPieChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress Trend</p>
                  <p className="text-2xl font-bold text-purple-600 capitalize">{analytics.progress_trend}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-orange-600">{reports.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search reports by patient name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    {/* Report Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.reportType}</p>
                      <p className="text-sm text-gray-500 mb-3">{formatDate(report.date)}</p>
                      <p className="text-gray-700 mb-3">{report.summary}</p>
                      
                      {/* Healing Score */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-600">Healing Score:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              report.healingScore >= 80 ? 'bg-green-500' :
                              report.healingScore >= 60 ? 'bg-blue-500' :
                              report.healingScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${report.healingScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{report.healingScore}%</span>
                      </div>

                      {/* Recommendations */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {report.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Attachments */}
                      {report.attachments && report.attachments.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Attachments:</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.attachments.map((attachment, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                {attachment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <FiFileText className="h-4 w-4" />
                        <span>View Full Report</span>
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <FiDownload className="h-4 w-4" />
                        <span>Download PDF</span>
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                        <FiCalendar className="h-4 w-4" />
                        <span>Schedule Follow-up</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedReport.patientName}</h3>
                    <p className="text-gray-600">{selectedReport.reportType}</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedReport.date)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700">{selectedReport.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Download Report
                    </button>
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Schedule Follow-up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
