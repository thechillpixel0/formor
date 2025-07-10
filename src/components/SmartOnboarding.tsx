import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Sparkles, Target, Users, BarChart3 } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href?: string;
  completed?: boolean;
}

const SmartOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'create-first-form',
      title: 'Create Your First Form',
      description: 'Start by creating a quiz or survey to collect responses from your audience.',
      icon: <Target className="h-6 w-6" />,
      action: 'Create Form',
      href: '/create'
    },
    {
      id: 'customize-settings',
      title: 'Customize Your Settings',
      description: 'Personalize your platform with your brand colors, logo, and preferences.',
      icon: <Sparkles className="h-6 w-6" />,
      action: 'Go to Settings',
      href: '/settings'
    },
    {
      id: 'collect-responses',
      title: 'Share and Collect Responses',
      description: 'Share your form link and start collecting valuable responses from users.',
      icon: <Users className="h-6 w-6" />,
      action: 'View Forms'
    },
    {
      id: 'analyze-data',
      title: 'Analyze Your Data',
      description: 'Use our powerful analytics to understand patterns and insights in your data.',
      icon: <BarChart3 className="h-6 w-6" />,
      action: 'View Analytics',
      href: '/dashboard'
    }
  ];

  useEffect(() => {
    // Check if user is new and should see onboarding
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    const userLevel = localStorage.getItem('user_experience_level');
    
    if (!hasSeenOnboarding && (!userLevel || userLevel === 'beginner')) {
      setShowOnboarding(true);
    }

    // Load completed steps
    const completed = localStorage.getItem('onboarding_steps');
    if (completed) {
      setCompletedSteps(new Set(JSON.parse(completed)));
    }
  }, []);

  const markStepCompleted = (stepId: string) => {
    const newCompleted = new Set([...completedSteps, stepId]);
    setCompletedSteps(newCompleted);
    localStorage.setItem('onboarding_steps', JSON.stringify([...newCompleted]));
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_experience_level', 'experienced');
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  const completedCount = completedSteps.size;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Formora!</h2>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip for now
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Let's get you started with a quick tour of the key features.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {completedCount} of {steps.length} steps completed
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep && !isCompleted;
              
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : isCurrent 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-700'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      
                      {!isCompleted && (
                        <div className="mt-3">
                          {step.href ? (
                            <a
                              href={step.href}
                              onClick={() => markStepCompleted(step.id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              <span>{step.action}</span>
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => markStepCompleted(step.id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              <span>Mark Complete</span>
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {completedCount === steps.length && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-2">Congratulations!</h3>
              <p className="text-green-600 text-sm mb-4">
                You've completed the onboarding process. You're ready to create amazing forms!
              </p>
              <button
                onClick={completeOnboarding}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartOnboarding;