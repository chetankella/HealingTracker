import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetails from './pages/doctor/PatientDetails';
import HelpNeeded from './pages/doctor/HelpNeeded';
import Reports from './pages/doctor/Reports';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import Exercises from './pages/patient/Exercises';
import ExerciseDetail from './pages/patient/ExerciseDetail';
import Analysis from './pages/patient/Analysis';
import Notifications from './pages/patient/Notifications';

// Landing page component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-200 shadow-sm">
              <img 
                src="/anits_logo.jpg" 
                alt="ANITS Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Healing Tracker
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              AI-powered healing progress tracking for patients and healthcare providers
            </p>
            <p className="text-lg text-blue-600 font-medium">
              ANITS Medical System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Doctor Portal */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Doctor Portal</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Monitor patient progress, view AI analysis, and manage treatment plans
                </p>
                <a 
                  href="/doctor"
                  className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Access Doctor Portal
                </a>
              </div>
            </div>

            {/* Patient Portal */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Patient Portal</h3>
                <p className="text-green-100 mb-4 text-sm">
                  Track your healing journey, complete exercises, and get AI insights
                </p>
                <a 
                  href="/patient"
                  className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  Access Patient Portal
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Analysis</h3>
                  <p className="text-sm text-gray-600">Advanced computer vision analyzes healing progress from photos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">Real-time monitoring of healing milestones and recovery rates</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Exercise Programs</h3>
                  <p className="text-sm text-gray-600">Personalized rehabilitation exercises with video guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patient/:id" element={<PatientDetails />} />
          <Route path="/doctor/help-needed" element={<HelpNeeded />} />
          <Route path="/doctor/reports" element={<Reports />} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/exercises" element={<Exercises />} />
          <Route path="/patient/exercises/:exerciseId" element={<ExerciseDetail />} />
          <Route path="/patient/analysis" element={<Analysis />} />
          <Route path="/patient/notifications" element={<Notifications />} />
          
          {/* Redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;