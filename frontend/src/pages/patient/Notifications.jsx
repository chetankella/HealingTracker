import Layout from '../../components/Layout';
import { FiBell, FiClock, FiCheckCircle, FiArrowLeft, FiAlertTriangle, FiInfo, FiHeart, FiCoffee, FiDroplet } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Time for your afternoon medication',
      message: 'Take your prescribed antibiotics with food',
      time: '2 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'nutrition',
      title: 'Hydration reminder',
      message: 'You\'ve had 4 glasses of water today. Aim for 8-10 glasses for optimal healing',
      time: '3 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'nutrition',
      title: 'Meal time reminder',
      message: 'Time for your recovery snack! Consider apple slices with almond butter',
      time: '4 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'progress',
      title: 'Great progress this week!',
      message: 'Your healing rate has improved by 12% compared to last week',
      time: '4 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'nutrition',
      title: 'Protein intake reminder',
      message: 'Include lean protein in your next meal to support tissue repair',
      time: '5 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: 6,
      type: 'appointment',
      title: 'Upcoming appointment reminder',
      message: 'You have an appointment with Dr. Smith tomorrow at 2:30 PM',
      time: '6 hours ago',
      read: true,
      priority: 'high'
    },
    {
      id: 7,
      type: 'exercise',
      title: 'Daily exercises completed!',
      message: 'Congratulations on completing all your exercises today',
      time: '1 day ago',
      read: true,
      priority: 'low'
    },
    {
      id: 8,
      type: 'analysis',
      title: 'AI analysis report ready',
      message: 'Your latest photo analysis shows excellent healing progress',
      time: '1 day ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 9,
      type: 'nutrition',
      title: 'Vitamin C reminder',
      message: 'Don\'t forget your daily vitamin C supplement for collagen synthesis',
      time: '1 day ago',
      read: true,
      priority: 'low'
    },
    {
      id: 10,
      type: 'reminder',
      title: 'Photo update reminder',
      message: 'Please upload a progress photo for your weekly check-in',
      time: '2 days ago',
      read: true,
      priority: 'medium'
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder': return FiClock;
      case 'progress': return FiHeart;
      case 'appointment': return FiBell;
      case 'exercise': return FiCheckCircle;
      case 'analysis': return FiInfo;
      case 'nutrition': return FiHeart;
      default: return FiBell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'border-red-200 bg-red-50';
    switch (type) {
      case 'reminder': return 'border-orange-200 bg-orange-50';
      case 'progress': return 'border-green-200 bg-green-50';
      case 'appointment': return 'border-blue-200 bg-blue-50';
      case 'exercise': return 'border-purple-200 bg-purple-50';
      case 'analysis': return 'border-indigo-200 bg-indigo-50';
      case 'nutrition': return 'border-emerald-200 bg-emerald-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type, priority) => {
    if (priority === 'high') return 'text-red-600';
    switch (type) {
      case 'reminder': return 'text-orange-600';
      case 'progress': return 'text-green-600';
      case 'appointment': return 'text-blue-600';
      case 'exercise': return 'text-purple-600';
      case 'analysis': return 'text-indigo-600';
      case 'nutrition': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = notifications.filter(n => 
    n.time.includes('hour') || n.time.includes('minute')
  ).length;

  return (
    <Layout userType="patient" userName="John Martinez">
      <div className="space-y-6">
        {/* Back Button */}
        <Link 
          to="/patient"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-blue-100 mb-4">
            Stay updated with your healing journey and important reminders
          </p>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-sm text-blue-100">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{todayCount}</div>
              <div className="text-sm text-blue-100">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-blue-100">Total</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Mark All Read</div>
                <div className="text-sm text-gray-600">Clear all notifications</div>
              </div>
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiBell className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Settings</div>
                <div className="text-sm text-gray-600">Manage preferences</div>
              </div>
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiAlertTriangle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Priority Only</div>
                <div className="text-sm text-gray-600">Show important only</div>
              </div>
            </div>
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div 
                  key={notification.id}
                  className={`p-6 transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                      <Icon className={`h-5 w-5 ${getIconColor(notification.type, notification.priority)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            {notification.priority === 'high' && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{notification.time}</span>
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Mark as read
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Medication Reminders</div>
                <div className="text-sm text-gray-600">Get notified when it's time to take medication</div>
              </div>
              <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Exercise Reminders</div>
                <div className="text-sm text-gray-600">Daily reminders for your exercise routine</div>
              </div>
              <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Progress Updates</div>
                <div className="text-sm text-gray-600">Notifications about your healing progress</div>
              </div>
              <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Appointment Reminders</div>
                <div className="text-sm text-gray-600">Reminders for upcoming appointments</div>
              </div>
              <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Nutrition Reminders</div>
                <div className="text-sm text-gray-600">Meal timing and hydration reminders</div>
              </div>
              <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Supplement Reminders</div>
                <div className="text-sm text-gray-600">Daily vitamin and supplement notifications</div>
              </div>
              <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

