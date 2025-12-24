import { useState } from 'react';
import Layout from '../../components/Layout';
import NavigationCard from '../../components/NavigationCard';
import PatientCard from '../../components/PatientCard';
import AddPatientForm from '../../components/AddPatientForm';
import { FiUsers, FiAlertTriangle, FiFileText, FiSearch, FiFilter, FiPlus } from 'react-icons/fi';

const DoctorDashboard = () => {
  // State for managing patients and form
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Priya Sharma",
      village: "Varanasi",
      lastUpdate: "2024-01-10T10:30:00Z",
      healingProgress: 85,
      status: "improving",
      avatar: null
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      village: "Jaipur",
      lastUpdate: "2024-01-10T08:15:00Z",
      healingProgress: 45,
      status: "needs_attention",
      avatar: null
    },
    {
      id: 3,
      name: "Anita Patel",
      village: "Ahmedabad",
      lastUpdate: "2024-01-09T16:45:00Z",
      healingProgress: 92,
      status: "stable",
      avatar: null
    },
    {
      id: 4,
      name: "Vikram Singh",
      village: "Delhi",
      lastUpdate: "2024-01-09T14:20:00Z",
      healingProgress: 25,
      status: "critical",
      avatar: null
    },
    {
      id: 5,
      name: "Sunita Gupta",
      village: "Mumbai",
      lastUpdate: "2024-01-10T12:00:00Z",
      healingProgress: 78,
      status: "improving",
      avatar: null
    },
    {
      id: 6,
      name: "Ravi Verma",
      village: "Bangalore",
      lastUpdate: "2024-01-10T09:30:00Z",
      healingProgress: 63,
      status: "stable",
      avatar: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count patients by status
  const patientCounts = {
    total: patients.length,
    critical: patients.filter(p => p.status === 'critical').length,
    needsAttention: patients.filter(p => p.status === 'needs_attention').length,
    stable: patients.filter(p => p.status === 'stable').length,
    improving: patients.filter(p => p.status === 'improving').length
  };

  const helpNeededCount = patientCounts.critical + patientCounts.needsAttention;

  // Handle adding new patient
  const handleAddPatient = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setIsAddPatientOpen(false);
  };

  return (
    <Layout userType="doctor" userName="Dr. Priya Patel" hospitalName="City General Hospital">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center xl:text-left">
          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-2">
            Welcome back, Dr. Patel
          </h1>
          <p className="text-gray-600 text-lg xl:text-xl">
            Monitor your patients' healing progress and provide timely care
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <NavigationCard
            icon={FiUsers}
            label="All Patients"
            link="/doctor"
            count={patientCounts.total}
            color="blue"
          />
          <NavigationCard
            icon={FiAlertTriangle}
            label="Help Needed"
            link="/doctor/help-needed"
            count={helpNeededCount}
            color="orange"
          />
          <NavigationCard
            icon={FiFileText}
            label="Reports"
            link="/doctor/reports"
            count={12}
            color="green"
          />
        </div>

        {/* Patients Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">Patient Overview</h2>
              
              {/* Add Patient Button and Search/Filter */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Add Patient Button */}
                <button
                  onClick={() => setIsAddPatientOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Add Patient</span>
                </button>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="critical">Critical</option>
                    <option value="needs_attention">Needs Attention</option>
                    <option value="stable">Stable</option>
                    <option value="improving">Improving</option>
                  </select>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Grid */}
          <div className="p-6">
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiUsers className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No patients assigned to you yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{patientCounts.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{patientCounts.needsAttention}</div>
            <div className="text-sm text-gray-600">Need Attention</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{patientCounts.stable}</div>
            <div className="text-sm text-gray-600">Stable</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{patientCounts.improving}</div>
            <div className="text-sm text-gray-600">Improving</div>
          </div>
        </div>

        {/* Add Patient Form Modal */}
        <AddPatientForm
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
          onAddPatient={handleAddPatient}
        />
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
