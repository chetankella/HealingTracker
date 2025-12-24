import { useState } from 'react';
import Layout from '../../components/Layout';
import PatientCard from '../../components/PatientCard';
import { FiAlertTriangle, FiClock, FiTrendingDown, FiUsers, FiFilter, FiSearch } from 'react-icons/fi';

const HelpNeeded = () => {
  // State for managing patients who need help
  const [patients, setPatients] = useState([
    {
      id: 2,
      name: "Rajesh Kumar",
      village: "Jaipur",
      lastUpdate: "2024-01-10T08:15:00Z",
      healingProgress: 45,
      status: "needs_attention",
      avatar: null,
      urgency: "high",
      issues: ["Slow healing progress", "Missed medication", "Pain levels increasing"],
      lastContact: "2024-01-08T14:30:00Z"
    },
    {
      id: 4,
      name: "Vikram Singh",
      village: "Delhi",
      lastUpdate: "2024-01-09T14:20:00Z",
      healingProgress: 25,
      status: "critical",
      avatar: null,
      urgency: "critical",
      issues: ["Severe pain", "Infection risk", "Non-compliance with treatment"],
      lastContact: "2024-01-07T10:15:00Z"
    },
    {
      id: 7,
      name: "Meera Joshi",
      village: "Pune",
      lastUpdate: "2024-01-09T16:45:00Z",
      healingProgress: 35,
      status: "needs_attention",
      avatar: null,
      urgency: "medium",
      issues: ["Exercise compliance low", "Dietary concerns"],
      lastContact: "2024-01-08T09:20:00Z"
    },
    {
      id: 8,
      name: "Arjun Reddy",
      village: "Hyderabad",
      lastUpdate: "2024-01-10T11:30:00Z",
      healingProgress: 40,
      status: "needs_attention",
      avatar: null,
      urgency: "high",
      issues: ["Wound not healing", "Fever symptoms", "Reduced mobility"],
      lastContact: "2024-01-09T15:45:00Z"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Filter patients based on search and urgency
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || patient.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  // Count patients by urgency
  const urgencyCounts = {
    total: patients.length,
    critical: patients.filter(p => p.urgency === 'critical').length,
    high: patients.filter(p => p.urgency === 'high').length,
    medium: patients.filter(p => p.urgency === 'medium').length
  };

  // Calculate time since last contact
  const getTimeSinceContact = (lastContact) => {
    const now = new Date();
    const contactTime = new Date(lastContact);
    const diffHours = Math.floor((now - contactTime) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout userType="doctor" userName="Dr. Priya Patel" hospitalName="City General Hospital">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center xl:text-left">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-2">
            Patients Needing Help
          </h1>
          <p className="text-gray-600 text-lg xl:text-xl">
            Monitor patients who require immediate attention or follow-up
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{urgencyCounts.critical}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiTrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{urgencyCounts.high}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{urgencyCounts.medium}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{urgencyCounts.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search patients by name or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Urgency Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.village} </p>
                        <p className="text-xs text-gray-500">
                          Last contact: {getTimeSinceContact(patient.lastContact)}
                        </p>
                      </div>
                    </div>

                    {/* Urgency Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(patient.urgency)}`}>
                      {patient.urgency.charAt(0).toUpperCase() + patient.urgency.slice(1)} Priority
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Issues Identified:</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.issues.map((issue, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress and Actions */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Healing Progress:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${patient.healingProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{patient.healingProgress}%</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Contact Patient
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                        Schedule Visit
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HelpNeeded;
