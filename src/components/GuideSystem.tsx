import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, ChevronRight, ChevronLeft, Lightbulb, Target, CheckCircle } from 'lucide-react';

interface GuideStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  optional?: boolean;
}

interface GuideSystemProps {
  steps: GuideStep[];
  onComplete?: () => void;
  autoStart?: boolean;
  storageKey: string;
}

const GuideSystem: React.FC<GuideSystemProps> = ({ 
  steps, 
  onComplete, 
  autoStart = false, 
  storageKey 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has completed this guide before
    const completed = localStorage.getItem(`guide_completed_${storageKey}`);
    const userLevel = localStorage.getItem('user_experience_level') || 'beginner';
    
    if (!completed && (autoStart || userLevel === 'beginner')) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
      }, 1000);
    }
  }, [autoStart, storageKey]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      scrollToTarget(steps[currentStep].target);
      highlightTarget(steps[currentStep].target);
    }
  }, [isActive, currentStep, steps]);

  const scrollToTarget = (target: string) => {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  };

  const highlightTarget = (target: string) => {
    // Remove previous highlights
    document.querySelectorAll('.guide-highlight').forEach(el => {
      el.classList.remove('guide-highlight');
    });

    const element = document.querySelector(target);
    if (element) {
      element.classList.add('guide-highlight');
      
      // Add pulsing effect
      const style = document.createElement('style');
      style.textContent = `
        .guide-highlight {
          position: relative;
          z-index: 1001;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5) !important;
          border-radius: 8px !important;
          animation: guidePulse 2s infinite;
        }
        
        @keyframes guidePulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
        }
        
        .guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          pointer-events: none;
        }
        
        .guide-tooltip {
          position: fixed;
          z-index: 1002;
          max-width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
        }
        
        .guide-hint-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1003;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .guide-hint-button:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .guide-progress {
          background: linear-gradient(90deg, #3b82f6 0%, #3b82f6 var(--progress, 0%), #e5e7eb var(--progress, 0%), #e5e7eb 100%);
        }
      `;
      
      if (!document.querySelector('#guide-styles')) {
        style.id = 'guide-styles';
        document.head.appendChild(style);
      }
    }
  };

  const getTooltipPosition = (target: string) => {
    const element = document.querySelector(target);
    if (!element) return { top: 0, left: 0 };

    const rect = element.getBoundingClientRect();
    const step = steps[currentStep];
    
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - 10;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        break;
    }

    return { top, left };
  };

  const nextStep = () => {
    const step = steps[currentStep];
    setCompletedSteps(prev => new Set([...prev, step.id]));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    localStorage.setItem(`guide_completed_${storageKey}`, 'true');
    setIsActive(false);
    cleanup();
  };

  const completeGuide = () => {
    localStorage.setItem(`guide_completed_${storageKey}`, 'true');
    setIsActive(false);
    cleanup();
    onComplete?.();
  };

  const cleanup = () => {
    document.querySelectorAll('.guide-highlight').forEach(el => {
      el.classList.remove('guide-highlight');
    });
    
    const style = document.querySelector('#guide-styles');
    if (style) {
      style.remove();
    }
  };

  const startGuide = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowHint(false);
  };

  if (!isActive && !showHint) {
    return (
      <button
        className="guide-hint-button"
        onClick={() => setShowHint(true)}
        title="Need help? Click for interactive guide"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  if (showHint && !isActive) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Start an interactive guide to learn how to use this page effectively.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={startGuide}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Start Guide
                </button>
                <button
                  onClick={() => setShowHint(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const position = getTooltipPosition(step.target);
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div ref={overlayRef} className="guide-overlay" />
      
      {/* Tooltip */}
      <div
        className="guide-tooltip"
        style={{
          top: position.top,
          left: position.left,
          transform: step.position === 'top' ? 'translate(-50%, -100%)' :
                    step.position === 'bottom' ? 'translate(-50%, 0%)' :
                    step.position === 'left' ? 'translate(-100%, -50%)' :
                    'translate(0%, -50%)'
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={skipGuide}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div 
              className="guide-progress h-1 rounded-full transition-all duration-300"
              style={{ '--progress': `${progress}%` } as any}
            />
          </div>

          {/* Content */}
          <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{step.content}</p>

          {/* Action hint */}
          {step.action && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Try it:</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">{step.action}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {step.optional && (
                <button
                  onClick={nextStep}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                {currentStep === steps.length - 1 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuideSystem;