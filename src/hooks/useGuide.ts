import { useState, useEffect } from 'react';

interface GuideStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  optional?: boolean;
}

export const useGuide = (steps: GuideStep[], storageKey: string) => {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`guide_completed_${storageKey}`);
    setIsCompleted(!!completed);
  }, [storageKey]);

  const resetGuide = () => {
    localStorage.removeItem(`guide_completed_${storageKey}`);
    setIsCompleted(false);
  };

  const markCompleted = () => {
    localStorage.setItem(`guide_completed_${storageKey}`, 'true');
    setIsCompleted(true);
  };

  return {
    isCompleted,
    resetGuide,
    markCompleted
  };
};

// Predefined guide steps for different pages
export const createFormGuideSteps: GuideStep[] = [
  {
    id: 'form-title',
    target: 'input[placeholder="Enter form title..."]',
    title: 'Start with a Title',
    content: 'Give your form a clear, descriptive title that tells users what to expect.',
    position: 'bottom',
    action: 'Click here and type a title for your form'
  },
  {
    id: 'form-type',
    target: 'input[value="quiz"]',
    title: 'Choose Form Type',
    content: 'Select "Quiz" for scored assessments or "Survey" for feedback collection.',
    position: 'right',
    action: 'Choose the type that matches your needs'
  },
  {
    id: 'add-question',
    target: 'textarea[placeholder="Enter your question..."]',
    title: 'Add Your First Question',
    content: 'Write a clear, specific question. Be concise but provide enough context.',
    position: 'top',
    action: 'Type your first question here'
  },
  {
    id: 'question-type',
    target: 'select',
    title: 'Select Question Type',
    content: 'Choose the best format for your question. Multiple choice is great for quizzes, while text fields work well for open-ended responses.',
    position: 'left'
  },
  {
    id: 'add-options',
    target: 'button:has(svg)',
    title: 'Add Answer Options',
    content: 'For multiple choice questions, add all possible answers. Make sure one is clearly correct for quizzes.',
    position: 'top',
    optional: true
  },
  {
    id: 'bulk-import',
    target: 'button:contains("Bulk Import")',
    title: 'Bulk Import (Advanced)',
    content: 'Save time by importing multiple questions at once using our special format.',
    position: 'left',
    optional: true
  },
  {
    id: 'publish',
    target: 'button:contains("Publish")',
    title: 'Publish Your Form',
    content: 'When ready, publish your form to make it available for responses.',
    position: 'bottom'
  }
];

export const dashboardGuideSteps: GuideStep[] = [
  {
    id: 'create-button',
    target: 'a[href="/create"]',
    title: 'Create New Forms',
    content: 'Start here to create your first quiz or survey.',
    position: 'bottom',
    action: 'Click to create a new form'
  },
  {
    id: 'form-cards',
    target: '.bg-white.p-4.rounded-lg.shadow-sm',
    title: 'Your Forms',
    content: 'Each card shows a form you\'ve created with key statistics and quick actions.',
    position: 'top'
  },
  {
    id: 'analytics-button',
    target: 'a:contains("Analytics")',
    title: 'View Analytics',
    content: 'Click here to see detailed insights about responses, scores, and user behavior.',
    position: 'top'
  },
  {
    id: 'notifications',
    target: 'button:has(svg[data-lucide="bell"])',
    title: 'Notifications',
    content: 'Stay updated with new responses and important alerts.',
    position: 'bottom'
  }
];

export const analyticsGuideSteps: GuideStep[] = [
  {
    id: 'stats-overview',
    target: '.grid.grid-cols-1.md\\:grid-cols-4',
    title: 'Key Metrics',
    content: 'Get a quick overview of your form\'s performance with these key statistics.',
    position: 'bottom'
  },
  {
    id: 'charts',
    target: '.recharts-wrapper',
    title: 'Visual Analytics',
    content: 'Charts help you understand patterns in responses and identify trends.',
    position: 'top'
  },
  {
    id: 'individual-responses',
    target: 'button:has(svg[data-lucide="eye"])',
    title: 'Individual Responses',
    content: 'Click to view detailed responses from specific users.',
    position: 'left'
  },
  {
    id: 'export-tools',
    target: 'a:contains("Export Tools")',
    title: 'Export Data',
    content: 'Download your data in various formats for further analysis.',
    position: 'bottom'
  }
];