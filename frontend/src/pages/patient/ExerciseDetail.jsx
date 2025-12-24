import Layout from '../../components/Layout';
import { 
  FiPlay, 
  FiClock, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiPause, 
  FiRotateCcw,
  FiActivity,
  FiTarget,
  FiZap,
  FiHeart,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const ExerciseDetail = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lottieData, setLottieData] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  // Exercise data (same as in Exercises.jsx)
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
      ],
      benefits: [
        "Improves hip flexibility",
        "Reduces stiffness in hip joints",
        "Enhances balance and stability",
        "Strengthens supporting muscles"
      ],
      tips: [
        "Start slowly and gradually increase range of motion",
        "Use a wall or chair for support if needed",
        "Focus on smooth, controlled movements",
        "Stop if you feel any sharp pain"
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
      ],
      benefits: [
        "Reduces stress and anxiety",
        "Improves oxygen flow to muscles",
        "Promotes relaxation and healing",
        "Enhances mental clarity"
      ],
      tips: [
        "Find a quiet, comfortable space",
        "Close your eyes to focus better",
        "Breathe naturally, don't force it",
        "Practice daily for best results"
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
      ],
      benefits: [
        "Improves flexibility and range of motion",
        "Reduces muscle tension",
        "Enhances blood circulation",
        "Prevents injury"
      ],
      tips: [
        "Warm up before stretching",
        "Hold stretches, don't bounce",
        "Breathe deeply during stretches",
        "Listen to your body"
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
      ],
      benefits: [
        "Builds muscle strength",
        "Improves endurance",
        "Enhances bone density",
        "Boosts metabolism"
      ],
      tips: [
        "Focus on proper form",
        "Start with fewer repetitions",
        "Gradually increase intensity",
        "Rest between sets"
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
      ],
      benefits: [
        "Improves balance and coordination",
        "Strengthens legs and core",
        "Enhances functional movement",
        "Increases stability"
      ],
      tips: [
        "Keep your back straight",
        "Don't let knees go past toes",
        "Engage your core muscles",
        "Move slowly and controlled"
      ]
    }
  ];

  useEffect(() => {
    const foundExercise = exercises.find(ex => ex.id === parseInt(exerciseId));
    if (foundExercise) {
      setExercise(foundExercise);
      setTimeRemaining(parseInt(foundExercise.duration) * 60); // Convert minutes to seconds
      loadLottieData(foundExercise.gifPath);
    }
  }, [exerciseId]);

  // Timer countdown effect
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setIsCompleted(true);
            // Auto-complete when timer reaches 0
            handleCompleteExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
        setTimerInterval(null);
      };
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [isPlaying, timeRemaining]);

  // Update current step based on timer progress
  useEffect(() => {
    if (exercise && timeRemaining > 0) {
      const totalTime = exercise.duration * 60;
      const elapsed = totalTime - timeRemaining;
      const stepDuration = totalTime / exercise.instructions.length;
      const currentStepIndex = Math.min(Math.floor(elapsed / stepDuration), exercise.instructions.length - 1);
      setCurrentStep(currentStepIndex);
    }
  }, [timeRemaining, exercise]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const loadLottieData = async (gifPath) => {
    try {
      const response = await fetch(gifPath);
      const data = await response.json();
      setLottieData(data);
    } catch (error) {
      console.error('Failed to load Lottie animation:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartExercise = () => {
    setIsPlaying(true);
  };

  const handlePauseExercise = () => {
    setIsPlaying(false);
  };

  const handleCompleteExercise = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    
    // Clear any running timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Play completion sound (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {
        // Ignore if audio fails to play
      });
    } catch (error) {
      // Ignore audio errors
    }
    
    // Here you would typically save the completion to your backend
    console.log(`Exercise ${exercise.title} completed!`);
    
    // Notify parent component about completion
    // This could be done through a callback prop or context
    // For now, we'll use localStorage to persist completion
    const completedExercises = JSON.parse(localStorage.getItem('completedExercises') || '[]');
    if (!completedExercises.includes(exercise.id)) {
      completedExercises.push(exercise.id);
      localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    }
  };

  const handleResetExercise = () => {
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setTimeRemaining(parseInt(exercise.duration) * 60);
    
    // Clear any running timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <Layout userType="patient" userName="Arjun Sharma">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercise Not Found</h2>
            <Link to="/patient/exercises" className="text-blue-600 hover:text-blue-800">
              Back to Exercises
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType="patient" userName="Arjun Sharma">
      <div className="space-y-6">
        {/* Back Button */}
        <Link 
          to="/patient/exercises"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercises
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exercise Animation - Left Side */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-96 bg-gray-100">
                {lottieData ? (
                  <Lottie 
                    animationData={lottieData}
                    className="w-full h-full"
                    loop={true}
                    autoplay={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-lg text-gray-600">Loading Animation...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exercise Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className={`text-4xl font-bold transition-colors ${
                    timeRemaining <= 60 ? 'text-red-600' : 
                    timeRemaining <= 180 ? 'text-yellow-600' : 
                    'text-gray-900'
                  }`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                    {isPlaying ? (
                      <>
                        <FiActivity className="h-4 w-4 text-green-500" />
                        <span>Timer Running</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <FiAward className="h-4 w-4 text-green-500" />
                        <span>Exercise Completed</span>
                      </>
                    ) : (
                      <>
                        <FiPause className="h-4 w-4 text-yellow-500" />
                        <span>Timer Paused</span>
                      </>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        timeRemaining <= 60 ? 'bg-red-500' : 
                        timeRemaining <= 180 ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${exercise ? ((exercise.duration * 60 - timeRemaining) / (exercise.duration * 60)) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {!isCompleted ? (
                    <>
                      {!isPlaying ? (
                        <button
                          onClick={handleStartExercise}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <FiPlay className="h-5 w-5" />
                          <span>Start Exercise</span>
                        </button>
                      ) : (
                        <button
                          onClick={handlePauseExercise}
                          className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                        >
                          <FiPause className="h-5 w-5" />
                          <span>Pause</span>
                        </button>
                      )}
                      
                      <button
                        onClick={handleCompleteExercise}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <FiAward className="h-5 w-5" />
                        <span>Complete</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-green-600 text-lg font-semibold flex items-center justify-center space-x-2">
                        <FiAward className="h-6 w-6" />
                        <span>Exercise Completed!</span>
                      </div>
                      <button
                        onClick={handleResetExercise}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <FiRefreshCw className="h-5 w-5" />
                        <span>Reset Exercise</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Details - Right Side */}
          <div className="space-y-6">
            {/* Exercise Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
                  <p className="text-gray-600 mb-4">{exercise.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiClock className="h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                    index === currentStep && isPlaying 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : index < currentStep 
                        ? 'bg-green-50' 
                        : 'bg-gray-50'
                  }`}>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full min-w-[24px] text-center ${
                      index === currentStep && isPlaying
                        ? 'bg-blue-500 text-white'
                        : index < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`transition-colors ${
                      index === currentStep && isPlaying 
                        ? 'text-blue-900 font-medium' 
                        : index < currentStep 
                          ? 'text-green-800' 
                          : 'text-gray-700'
                    }`}>
                      {instruction}
                    </span>
                    {index === currentStep && isPlaying && (
                      <span className="text-blue-500 text-sm flex items-center space-x-1">
                        <FiActivity className="h-3 w-3" />
                        <span>Current Step</span>
                      </span>
                    )}
                    {index < currentStep && (
                      <span className="text-green-500 text-sm flex items-center space-x-1">
                        <FiCheckCircle className="h-3 w-3" />
                        <span>Done</span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiTrendingUp className="h-5 w-5 text-green-500" />
                <span>Benefits</span>
              </h3>
              <ul className="space-y-3">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FiTarget className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiStar className="h-5 w-5 text-blue-500" />
                <span>Tips</span>
              </h3>
              <ul className="space-y-3">
                {exercise.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FiZap className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExerciseDetail;
