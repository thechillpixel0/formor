import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronDown, ChevronUp } from 'lucide-react';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  trigger: string; // CSS selector
  priority: 'low' | 'medium' | 'high';
}

interface ContextualHelpProps {
  tips: HelpTip[];
  page: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ tips, page }) => {
  const [activeTips, setActiveTips] = useState<HelpTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  useEffect(() => {
    // Load dismissed tips from localStorage
    const dismissed = localStorage.getItem(`dismissed_tips_${page}`);
    if (dismissed) {
      setDismissedTips(new Set(JSON.parse(dismissed)));
    }

    // Check which tips should be shown based on DOM elements
    const checkTips = () => {
      const relevantTips = tips.filter(tip => {
        if (dismissedTips.has(tip.id)) return false;
        
        const element = document.querySelector(tip.trigger);
        return element !== null;
      });

      setActiveTips(relevantTips.slice(0, 3)); // Show max 3 tips at once
    };

    // Initial check
    checkTips();

    // Check periodically for dynamic content
    const interval = setInterval(checkTips, 2000);

    return () => clearInterval(interval);
  }, [tips, page, dismissedTips]);

  const dismissTip = (tipId: string) => {
    const newDismissed = new Set([...dismissedTips, tipId]);
    setDismissedTips(newDismissed);
    localStorage.setItem(`dismissed_tips_${page}`, JSON.stringify([...newDismissed]));
    setActiveTips(activeTips.filter(tip => tip.id !== tipId));
  };

  const toggleExpanded = (tipId: string) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  if (activeTips.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 space-y-2 max-w-sm">
      {activeTips.map(tip => (
        <div
          key={tip.id}
          className={`bg-white rounded-lg shadow-lg border-l-4 ${
            tip.priority === 'high' ? 'border-red-500' :
            tip.priority === 'medium' ? 'border-yellow-500' :
            'border-blue-500'
          } transition-all duration-300 ease-in-out`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  tip.priority === 'high' ? 'text-red-500' :
                  tip.priority === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <button
                    onClick={() => toggleExpanded(tip.id)}
                    className="text-left w-full"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                      {expandedTip === tip.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedTip === tip.id && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {tip.content}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => dismissTip(tip.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Predefined tips for different pages
export const createFormTips: HelpTip[] = [
  {
    id: 'form-title-tip',
    title: 'Make your title descriptive',
    content: 'A good title helps users understand what your form is about. Be specific and clear.',
    trigger: 'input[placeholder*="title"]',
    priority: 'medium'
  },
  {
    id: 'question-type-tip',
    title: 'Choose the right question type',
    content: 'Multiple choice works great for quizzes, while text fields are perfect for open-ended feedback.',
    trigger: 'select',
    priority: 'low'
  },
  {
    id: 'bulk-import-tip',
    title: 'Save time with bulk import',
    content: 'If you have many questions, use the bulk import feature to add them all at once.',
    trigger: 'button:contains("Bulk Import")',
    priority: 'low'
  }
];

export const dashboardTips: HelpTip[] = [
  {
    id: 'first-form-tip',
    title: 'Create your first form',
    content: 'Start by clicking the "Create Form" button to build your first quiz or survey.',
    trigger: 'a[href="/create"]',
    priority: 'high'
  },
  {
    id: 'analytics-tip',
    title: 'View detailed analytics',
    content: 'Click on any form card to see response analytics, charts, and individual submissions.',
    trigger: '.bg-white.p-4.rounded-lg.shadow-sm',
    priority: 'medium'
  }
];

export default ContextualHelp;