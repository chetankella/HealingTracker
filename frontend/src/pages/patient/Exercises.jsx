import Layout from '../../components/Layout';
import { 
  FiPlay, 
  FiClock, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiCoffee, 
  FiDroplet, 
  FiHeart,
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiZap
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import Lottie from 'lottie-react';

const Exercises = () => {
  const [dietPlan, setDietPlan] = useState(null);
  const [nutritionTips, setNutritionTips] = useState(null);
  const [currentPatientId] = useState('patient_001');
  const [lottieData, setLottieData] = useState(null);
  const [singleLegHipRotationLottieData, setSingleLegHipRotationLottieData] = useState(null);
  const [breatheLottieData, setBreatheLottieData] = useState(null);
  const [jumpingJackLottieData, setJumpingJackLottieData] = useState(null);
  const [shoulderStretchLottieData, setShoulderStretchLottieData] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());

  useEffect(() => {
    loadDietPlan();
    loadLottieData();
    loadSingleLegHipRotationLottieData();
    loadBreatheLottieData();
    loadJumpingJackLottieData();
    loadShoulderStretchLottieData();
    
    // Load completed exercises from localStorage
    const completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '[]');
    setCompletedExercises(new Set(completedExercises));
  }, []);

  const loadLottieData = async () => {
    try {
      const response = await fetch('/gifs/Squat Reach.json');
      const data = await response.json();
      setLottieData(data);
    } catch (error) {
      console.error('Failed to load Lottie animation:', error);
    }
  };

  const loadSingleLegHipRotationLottieData = async () => {
    try {
      const response = await fetch('/gifs/Single Leg Hip Rotation.json');
      const data = await response.json();
      setSingleLegHipRotationLottieData(data);
    } catch (error) {
      console.error('Failed to load Single Leg Hip Rotation Lottie animation:', error);
    }
  };

  const loadBreatheLottieData = async () => {
    try {
      const response = await fetch('/gifs/Breathe.json');
      const data = await response.json();
      setBreatheLottieData(data);
    } catch (error) {
      console.error('Failed to load Breathe Lottie animation:', error);
    }
  };

  const loadJumpingJackLottieData = async () => {
    try {
      const response = await fetch('/gifs/Jumping Jack.json');
      const data = await response.json();
      setJumpingJackLottieData(data);
    } catch (error) {
      console.error('Failed to load Jumping Jack Lottie animation:', error);
    }
  };

  const loadShoulderStretchLottieData = async () => {
    try {
      const response = await fetch('/gifs/Shoulder Stretch.json');
      const data = await response.json();
      setShoulderStretchLottieData(data);
    } catch (error) {
      console.error('Failed to load Shoulder Stretch Lottie animation:', error);
    }
  };

  const loadDietPlan = async () => {
    try {
      const [dietData, nutritionData] = await Promise.all([
        aiService.getDietPlan(currentPatientId, 'active'),
        aiService.getNutritionRecommendations(currentPatientId, 85)
      ]);
      setDietPlan(dietData);
      setNutritionTips(nutritionData);
    } catch (error) {
      console.error('Failed to load diet plan:', error);
    }
  };

  const exercises = [
    {
      id: 1,
      title: "Single Leg Hip Rotation",
      duration: "5 minutes",
      difficulty: "Beginner",
      completed: false,
      description: "Slow, controlled hip rotation movements to improve flexibility and reduce stiffness.",
      gifPath: "/gifs/Single Leg Hip Rotation.json",
      isLottie: true,
      instructions: [
        "Stand on one leg with support if needed",
        "Slowly rotate your hip in small circles",
        "Hold each position for 5 seconds",
        "Repeat 10 times in each direction",
        "Switch legs and repeat"
      ]
    },
    {
      id: 2,
      title: "Breathing & Relaxation",
      duration: "8 minutes",
      difficulty: "Beginner",
      completed: false,
      description: "Deep breathing exercises to promote healing and reduce stress.",
      gifPath: "/gifs/Breathe.json",
      isLottie: true,
      instructions: [
        "Lie down in a comfortable position",
        "Place one hand on chest, one on belly",
        "Breathe slowly through your nose",
        "Focus on expanding your belly, not chest"
      ]
    },
    {
      id: 3,
      title: "Light Stretching",
      duration: "10 minutes",
      difficulty: "Intermediate",
      completed: false,
      description: "Gentle stretches to improve circulation and prevent muscle tightness.",
      gifPath: "/gifs/Shoulder Stretch.json",
      isLottie: true,
      instructions: [
        "Warm up with 2 minutes of gentle movement",
        "Hold each stretch for 15-30 seconds",
        "Never stretch to the point of pain",
        "Focus on gradual, sustained stretches"
      ]
    },
    {
      id: 4,
      title: "Strengthening Basics",
      duration: "12 minutes",
      difficulty: "Intermediate",
      completed: false,
      description: "Basic strengthening exercises to rebuild muscle tone gradually.",
      gifPath: "/gifs/Jumping Jack.json",
      isLottie: true,
      instructions: [
        "Start with body weight only",
        "Focus on proper form over speed",
        "Rest 30 seconds between exercises",
        "Stop if you feel any sharp pain"
      ]
    },
    {
      id: 5,
      title: "Squat Reach",
      duration: "8 minutes",
      difficulty: "Intermediate",
      completed: false,
      description: "Dynamic squat movement with reaching motion to improve balance and coordination.",
      gifPath: "/gifs/Squat Reach.json",
      isLottie: true,
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower into a squat position",
        "Reach forward with both arms",
        "Return to standing position",
        "Repeat 10-15 times"
      ]
    }
  ];

  const completedCount = exercises.filter(ex => completedExercises.has(ex.id)).length;
  const totalCount = exercises.length;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markExerciseCompleted = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
  };

  return (
    <Layout userType="patient" userName="Arjun Sharma">
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
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Exercise Program</h1>
          <p className="text-green-100 mb-4">
            Follow your personalized healing exercises to speed up recovery
          </p>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
              <div className="text-sm text-green-100">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">7</div>
              <div className="text-sm text-green-100">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm text-green-100">Weekly Progress</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daily Progress</h2>
            <span className="text-sm text-gray-600">{completedCount} of {totalCount} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id}
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                completedExercises.has(exercise.id)
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {/* Exercise GIF - Top of Card */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                {exercise.isLottie ? (
                  exercise.id === 1 && singleLegHipRotationLottieData ? (
                    <Lottie 
                      animationData={singleLegHipRotationLottieData}
                      className="w-full h-full"
                      loop={true}
                      autoplay={true}
                    />
                  ) : exercise.id === 2 && breatheLottieData ? (
                    <Lottie 
                      animationData={breatheLottieData}
                      className="w-full h-full"
                      loop={true}
                      autoplay={true}
                    />
                  ) : exercise.id === 3 && shoulderStretchLottieData ? (
                    <Lottie 
                      animationData={shoulderStretchLottieData}
                      className="w-full h-full"
                      loop={true}
                      autoplay={true}
                    />
                  ) : exercise.id === 4 && jumpingJackLottieData ? (
                    <Lottie 
                      animationData={jumpingJackLottieData}
                      className="w-full h-full"
                      loop={true}
                      autoplay={true}
                    />
                  ) : exercise.id === 5 && lottieData ? (
                    <Lottie 
                      animationData={lottieData}
                      className="w-full h-full"
                      loop={true}
                      autoplay={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <FiActivity className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-gray-600">Loading Animation...</p>
                      </div>
                    </div>
                  )
                ) : (
                  <img 
                    src={exercise.gifPath} 
                    alt={`${exercise.title} demonstration`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Exercise Content - Below GIF */}
              <div className="p-6">
                {/* Exercise Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                      {completedExercises.has(exercise.id) && (
                        <FiCheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                    
                    {/* Exercise Meta */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiClock className="h-4 w-4" />
                        <span>{exercise.duration}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Link to={`/patient/exercises/${exercise.id}`}>
                  <button 
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      completedExercises.has(exercise.id)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {completedExercises.has(exercise.id) ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FiAward className="h-4 w-4" />
                        <span>View Exercise</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FiActivity className="h-4 w-4" />
                        <span>Start Exercise</span>
                      </div>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Diet Plan for Recovery */}
        {dietPlan && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recovery Diet Plan</h2>
                  <p className="text-gray-600 text-sm">Nutrition recommendations to support your healing journey</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Daily Meals */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Meal Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiStar className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium text-gray-900">Breakfast</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {dietPlan.daily_meals.breakfast.map((meal, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{meal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiTarget className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Lunch</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {dietPlan.daily_meals.lunch.map((meal, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{meal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiZap className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Dinner</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {dietPlan.daily_meals.dinner.map((meal, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{meal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiActivity className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-gray-900">Snacks</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {dietPlan.daily_meals.snacks.map((snack, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{snack}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hydration */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiDroplet className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Hydration Goals</h4>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Daily Goal:</strong> {dietPlan.hydration.daily_goal} of water</p>
                  <ul className="space-y-1 mt-2">
                    {dietPlan.hydration.timing.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recovery Tips */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recovery Nutrition Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dietPlan.recovery_tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-green-800 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Recommendations */}
        {nutritionTips && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiStar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personalized Nutrition Recommendations</h2>
                  <p className="text-gray-600 text-sm">Based on your current healing progress (85%)</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Priority Foods</h4>
                <div className="flex flex-wrap gap-2">
                  {nutritionTips.priority_foods.map((food, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Recommendations</h4>
                <ul className="space-y-2">
                  {nutritionTips.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <span className="text-purple-800 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="bg-blue-50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Great job on your progress! 🎉
          </h3>
          <p className="text-blue-700">
            Consistency is key to healing. Keep up the excellent work with your daily exercises and nutrition.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Exercises;
