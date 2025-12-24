import { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiCamera, 
  FiUpload, 
  FiX, 
  FiEye, 
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const AddPatientForm = ({ isOpen, onClose, onAddPatient }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Medical Information
    condition: '',
    admissionDate: '',
    expectedRecovery: '',
    riskLevel: 'Low',
    allergies: '',
    medications: '',
    medicalHistory: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Additional Details
    patientCategory: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [woundImage, setWoundImage] = useState(null);
  const [woundImagePreview, setWoundImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWoundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWoundImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setWoundImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword',
      'dateOfBirth', 'gender', 'address', 'condition', 'admissionDate', 'patientCategory'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Date validation
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    if (formData.admissionDate && new Date(formData.admissionDate) > new Date()) {
      newErrors.admissionDate = 'Admission date cannot be in the future';
    }

    if (formData.expectedRecovery && new Date(formData.expectedRecovery) < new Date(formData.admissionDate)) {
      newErrors.expectedRecovery = 'Expected recovery date must be after admission date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const patientData = {
        ...formData,
        id: `patient_${Date.now()}`,
        name: `${formData.firstName} ${formData.lastName}`,
        profileImage: imagePreview,
        woundImage: woundImagePreview,
        currentHealingScore: 0,
        status: 'new',
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      onAddPatient(patientData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
      dateOfBirth: '', gender: '', address: '', city: '', state: '', zipCode: '', country: '',
      condition: '', admissionDate: '', expectedRecovery: '', riskLevel: 'Low', allergies: '',
      medications: '', medicalHistory: '', emergencyContact: '', emergencyPhone: '',
      patientCategory: '', notes: ''
    });
    setErrors({});
    setProfileImage(null);
    setImagePreview(null);
    setWoundImage(null);
    setWoundImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
                <p className="text-gray-600">Enter patient details to create a new profile</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Image */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                  <FiCamera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <FiUpload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-600">Upload a clear photo of the patient</p>
            </div>
          </div>

          {/* Wound Image */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {woundImagePreview ? (
                <img
                  src={woundImagePreview}
                  alt="Wound preview"
                  className="w-24 h-24 rounded-lg object-cover border-4 border-red-200"
                />
              ) : (
                <div className="w-24 h-24 bg-red-50 rounded-lg flex items-center justify-center border-4 border-red-200">
                  <FiCamera className="h-8 w-8 text-red-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                <FiUpload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWoundImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Current Wound Image</h3>
              <p className="text-sm text-gray-600">Upload a clear photo of the current wound/condition</p>
              <p className="text-xs text-red-600 mt-1">This will serve as the baseline for healing progress tracking</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="patient@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Medical Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Condition *
                </label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.condition ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Post-surgical wound healing"
                />
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.condition}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.admissionDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.admissionDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.admissionDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Recovery Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="date"
                    name="expectedRecovery"
                    value={formData.expectedRecovery}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expectedRecovery ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.expectedRecovery && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.expectedRecovery}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List any known allergies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List current medications"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Relevant medical history"
              />
            </div>

            {/* Wound Photo Tips */}
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                <FiCamera className="h-4 w-4 mr-2" />
                Tips for Taking Good Wound Photos
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Ensure good lighting - natural light works best</li>
                <li>• Keep the camera steady and focus on the wound area</li>
                <li>• Clean the wound area before taking the photo</li>
                <li>• Include a ruler or coin for size reference if possible</li>
                <li>• Take photos from multiple angles if the wound is complex</li>
                <li>• Avoid shadows and reflections on the wound</li>
              </ul>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patient Category & Treatment Plan */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Patient Category & Treatment Plan
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Category *
              </label>
              <select
                name="patientCategory"
                value={formData.patientCategory}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.patientCategory ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Patient Category</option>
                <option value="post_surgical">Post-Surgical Recovery</option>
                <option value="chronic_wound">Chronic Wound Management</option>
                <option value="diabetic_foot">Diabetic Foot Care</option>
                <option value="burn_injury">Burn Injury Recovery</option>
                <option value="pressure_sore">Pressure Sore Treatment</option>
                <option value="trauma_wound">Trauma Wound Healing</option>
                <option value="infection_management">Infection Management</option>
                <option value="rehabilitation">Physical Rehabilitation</option>
              </select>
              {errors.patientCategory && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="h-4 w-4 mr-1" />
                  {errors.patientCategory}
                </p>
              )}
            </div>

            {/* Treatment Plan Preview */}
            {formData.patientCategory && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <FiCheckCircle className="h-5 w-5 mr-2" />
                  Treatment Plan for {formData.patientCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exercise Plan */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Exercise Plan</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      {formData.patientCategory === 'post_surgical' && (
                        <>
                          <p>• Gentle range of motion exercises</p>
                          <p>• Breathing exercises for recovery</p>
                          <p>• Gradual strengthening program</p>
                          <p>• Frequency: 2-3 times daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'chronic_wound' && (
                        <>
                          <p>• Circulation improvement exercises</p>
                          <p>• Gentle stretching routines</p>
                          <p>• Mobility enhancement activities</p>
                          <p>• Frequency: Daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'diabetic_foot' && (
                        <>
                          <p>• Foot and ankle exercises</p>
                          <p>• Circulation improvement routines</p>
                          <p>• Balance and stability training</p>
                          <p>• Frequency: Daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'burn_injury' && (
                        <>
                          <p>• Range of motion exercises</p>
                          <p>• Scar tissue mobilization</p>
                          <p>• Functional movement training</p>
                          <p>• Frequency: 3-4 times daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'pressure_sore' && (
                        <>
                          <p>• Positioning and turning exercises</p>
                          <p>• Gentle mobility routines</p>
                          <p>• Pressure relief activities</p>
                          <p>• Frequency: Every 2 hours</p>
                        </>
                      )}
                      {formData.patientCategory === 'trauma_wound' && (
                        <>
                          <p>• Gradual mobility restoration</p>
                          <p>• Strength building exercises</p>
                          <p>• Functional recovery training</p>
                          <p>• Frequency: 2-3 times daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'infection_management' && (
                        <>
                          <p>• Rest and recovery focus</p>
                          <p>• Gentle breathing exercises</p>
                          <p>• Minimal mobility maintenance</p>
                          <p>• Frequency: As tolerated</p>
                        </>
                      )}
                      {formData.patientCategory === 'rehabilitation' && (
                        <>
                          <p>• Comprehensive exercise program</p>
                          <p>• Strength and endurance training</p>
                          <p>• Functional movement patterns</p>
                          <p>• Frequency: Daily intensive</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Diet Plan */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Diet Plan</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      {formData.patientCategory === 'post_surgical' && (
                        <>
                          <p>• High-protein recovery diet</p>
                          <p>• Anti-inflammatory foods</p>
                          <p>• Vitamin C for collagen synthesis</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'chronic_wound' && (
                        <>
                          <p>• Protein-rich healing diet</p>
                          <p>• Zinc and vitamin supplements</p>
                          <p>• Blood sugar management</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'diabetic_foot' && (
                        <>
                          <p>• Diabetic-friendly meal plan</p>
                          <p>• Blood sugar control focus</p>
                          <p>• Circulation-supporting foods</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'burn_injury' && (
                        <>
                          <p>• High-calorie recovery diet</p>
                          <p>• Protein for tissue repair</p>
                          <p>• Vitamin E for skin health</p>
                          <p>• Hydration: 10-12 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'pressure_sore' && (
                        <>
                          <p>• Protein and calorie dense</p>
                          <p>• Vitamin C and zinc rich</p>
                          <p>• Pressure sore prevention foods</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'trauma_wound' && (
                        <>
                          <p>• High-protein healing diet</p>
                          <p>• Anti-inflammatory foods</p>
                          <p>• Recovery-supporting nutrients</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'infection_management' && (
                        <>
                          <p>• Immune-boosting diet</p>
                          <p>• Anti-inflammatory foods</p>
                          <p>• Probiotic-rich foods</p>
                          <p>• Hydration: 10-12 glasses daily</p>
                        </>
                      )}
                      {formData.patientCategory === 'rehabilitation' && (
                        <>
                          <p>• Balanced nutrition plan</p>
                          <p>• Energy-supporting foods</p>
                          <p>• Muscle recovery nutrients</p>
                          <p>• Hydration: 8-10 glasses daily</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Schedule */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">AI Analysis Schedule</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      {formData.patientCategory === 'post_surgical' && (
                        <>
                          <p>• Daily photo uploads</p>
                          <p>• Weekly progress reports</p>
                          <p>• Healing score tracking</p>
                          <p>• Risk assessment alerts</p>
                        </>
                      )}
                      {formData.patientCategory === 'chronic_wound' && (
                        <>
                          <p>• Every 2 days photo uploads</p>
                          <p>• Bi-weekly progress reports</p>
                          <p>• Healing trend analysis</p>
                          <p>• Infection monitoring</p>
                        </>
                      )}
                      {formData.patientCategory === 'diabetic_foot' && (
                        <>
                          <p>• Daily photo uploads</p>
                          <p>• Weekly progress reports</p>
                          <p>• Circulation assessment</p>
                          <p>• Infection risk alerts</p>
                        </>
                      )}
                      {formData.patientCategory === 'burn_injury' && (
                        <>
                          <p>• Twice daily photo uploads</p>
                          <p>• Daily progress reports</p>
                          <p>• Scar development tracking</p>
                          <p>• Healing rate analysis</p>
                        </>
                      )}
                      {formData.patientCategory === 'pressure_sore' && (
                        <>
                          <p>• Daily photo uploads</p>
                          <p>• Weekly progress reports</p>
                          <p>• Pressure point monitoring</p>
                          <p>• Healing progression tracking</p>
                        </>
                      )}
                      {formData.patientCategory === 'trauma_wound' && (
                        <>
                          <p>• Daily photo uploads</p>
                          <p>• Weekly progress reports</p>
                          <p>• Recovery milestone tracking</p>
                          <p>• Functional improvement analysis</p>
                        </>
                      )}
                      {formData.patientCategory === 'infection_management' && (
                        <>
                          <p>• Twice daily photo uploads</p>
                          <p>• Daily progress reports</p>
                          <p>• Infection spread monitoring</p>
                          <p>• Treatment response tracking</p>
                        </>
                      )}
                      {formData.patientCategory === 'rehabilitation' && (
                        <>
                          <p>• Weekly photo uploads</p>
                          <p>• Bi-weekly progress reports</p>
                          <p>• Functional improvement tracking</p>
                          <p>• Recovery milestone analysis</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Doctor Review Schedule */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Doctor Review Schedule</h5>
                    <div className="text-sm text-blue-800 space-y-1">
                      {formData.patientCategory === 'post_surgical' && (
                        <>
                          <p>• Weekly in-person visits</p>
                          <p>• Daily remote monitoring</p>
                          <p>• Bi-weekly progress reviews</p>
                          <p>• Monthly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'chronic_wound' && (
                        <>
                          <p>• Bi-weekly in-person visits</p>
                          <p>• Weekly remote monitoring</p>
                          <p>• Monthly progress reviews</p>
                          <p>• Quarterly treatment plans</p>
                        </>
                      )}
                      {formData.patientCategory === 'diabetic_foot' && (
                        <>
                          <p>• Weekly in-person visits</p>
                          <p>• Daily remote monitoring</p>
                          <p>• Bi-weekly progress reviews</p>
                          <p>• Monthly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'burn_injury' && (
                        <>
                          <p>• Twice weekly in-person visits</p>
                          <p>• Daily remote monitoring</p>
                          <p>• Weekly progress reviews</p>
                          <p>• Bi-weekly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'pressure_sore' && (
                        <>
                          <p>• Weekly in-person visits</p>
                          <p>• Daily remote monitoring</p>
                          <p>• Bi-weekly progress reviews</p>
                          <p>• Monthly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'trauma_wound' && (
                        <>
                          <p>• Weekly in-person visits</p>
                          <p>• Daily remote monitoring</p>
                          <p>• Bi-weekly progress reviews</p>
                          <p>• Monthly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'infection_management' && (
                        <>
                          <p>• Daily in-person visits</p>
                          <p>• Continuous remote monitoring</p>
                          <p>• Daily progress reviews</p>
                          <p>• Weekly treatment adjustments</p>
                        </>
                      )}
                      {formData.patientCategory === 'rehabilitation' && (
                        <>
                          <p>• Bi-weekly in-person visits</p>
                          <p>• Weekly remote monitoring</p>
                          <p>• Monthly progress reviews</p>
                          <p>• Quarterly treatment plans</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or special considerations"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <FiCheckCircle className="h-4 w-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;
