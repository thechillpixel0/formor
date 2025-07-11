import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, Mail, Hash, ChevronRight, Brain, Award, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, shuffleArray, formatTime } from '../utils';
import { User as UserType, Response, Question } from '../types';

const AttemptForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState(storage.getForm(formId!));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<UserType>({
    id: generateId(),
    name: '',
    email: '',
    roll: ''
  });
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentStep, setCurrentStep] = useState<'identity' | 'form' | 'results'>('identity');
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    maxScore: number;
    correctAnswers: number;
    totalQuestions: number;
    results: Array<{
      question: Question;
      userAnswer: string | number;
      isCorrect: boolean;
      correctAnswer?: string | number;
    }>;
  } | null>(null);

  useEffect(() => {
    if (!formId) {
      navigate('/home');
      return;
    }

    // First ensure the form exists on this device
    if (!storage.ensureFormExists(formId)) {
      // If form doesn't exist and can't be loaded, show error
      setForm(null);
      return;
    }
    
    const formData = storage.getForm(formId);
    if (!formData) {
      setForm(null);
      return;
    }

    setForm(formData);
    const formQuestions = storage.getQuestions(formId);
    const questionsToShow = formData.shuffle ? shuffleArray(formQuestions) : formQuestions;
    setQuestions(questionsToShow);

    if (formData.timer) {
      setTimeLeft(formData.timer);
    }
  }, [formId, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentStep === 'form' && form?.timer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentStep, form?.timer, timeLeft]);

  if (!form || !formId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600 mb-4">
            This form is not available on this device. Please use the correct sharing link provided by the form creator.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your Own Forms
          </button>
        </div>
      </div>
    );
  }

  if (form.status !== 'published') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600 mb-4">This form is currently in draft mode and not available for responses.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const startForm = () => {
    if (!user.name.trim() || !user.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if user already took this quiz and retakes are not allowed
    if (form.type === 'quiz' && !form.allowRetake) {
      const existingResponse = storage.getResponses(formId).find(r => {
        const responseUser = storage.getUser(r.userId);
        return responseUser?.email === user.email;
      });
      
      if (existingResponse) {
        alert('You have already taken this quiz and retakes are not allowed.');
        return;
      }
    }

    storage.saveUser(user);
    setStartTime(Date.now());
    setCurrentStep('form');
  };

  const updateAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateQuizResults = () => {
    if (form.type !== 'quiz') return null;

    let score = 0;
    let correctAnswers = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const results = questions.map(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'mcq' || question.type === 'dropdown' || question.type === 'true_false') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'rating') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'short_text' || question.type === 'paragraph') {
        // For text questions, we'll mark as correct if there's an answer (manual grading needed)
        isCorrect = Boolean(userAnswer && userAnswer.toString().trim());
      }

      if (isCorrect) {
        score += question.points;
        correctAnswers++;
      }

      return {
        question,
        userAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer
      };
    });

    return {
      score,
      maxScore,
      correctAnswers,
      totalQuestions: questions.length,
      results
    };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const results = calculateQuizResults();
      
      const response: Response = {
        id: generateId(),
        formId: form.id,
        userId: user.id,
        answers,
        score: results?.score,
        maxScore: results?.maxScore,
        correctAnswers: results?.correctAnswers,
        totalQuestions: results?.totalQuestions,
        timeTaken,
        submittedAt: new Date().toISOString()
      };

      storage.saveResponse(response);

      // Auto-generate certificate if enabled and user passed
      if (form.type === 'quiz' && form.certificateEnabled && results) {
        const percentage = (results.score / results.maxScore) * 100;
        const passingScore = form.passingScore || 60;
        
        if (percentage >= passingScore) {
          // Mark response as certificate eligible
          const updatedResponse = { ...response, certificateGenerated: true, passed: true };
          storage.saveResponse(updatedResponse);
        }
      }
      // Send notification to admin (in a real app, this would be an API call)
      const adminNotification = {
        id: generateId(),
        type: 'new_response',
        formId: form.id,
        formTitle: form.title,
        userName: user.name,
        userEmail: user.email,
        submittedAt: response.submittedAt,
        score: results?.score,
        maxScore: results?.maxScore,
        isQuiz: form.type === 'quiz'
      };
      
      // Store notification for admin dashboard
      const notifications = JSON.parse(localStorage.getItem('formora_notifications') || '[]');
      notifications.unshift(adminNotification);
      localStorage.setItem('formora_notifications', JSON.stringify(notifications.slice(0, 50))); // Keep last 50

      if (form.type === 'quiz' && form.showResults && results) {
        setQuizResults(results);
        setCurrentStep('results');
      } else { // Always navigate to Thanks page if not showing results immediately
        navigate('/thanks', { 
          state: { 
            formTitle: form.title, 
            userName: user.name,
            submittedAt: response.submittedAt,
            isQuiz: form.type === 'quiz',
            score: results?.score,
            maxScore: results?.maxScore
          } 
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (form.requireAll) {
      return questions.every(q => q.required ? answers[q.id] !== undefined && answers[q.id] !== '' : true);
    }
    return Object.keys(answers).length > 0;
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id];

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your answer..."
            required={question.required}
          />
        );

      case 'paragraph':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your detailed answer..."
            required={question.required}
          />
        );

      case 'mcq':
      case 'true_false':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                  value === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  required={question.required}
                />
                <span className={`text-gray-700 flex-1 ${value === option ? 'font-medium text-blue-900' : ''}`}>
                  {option}
                </span>
                {value === option && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'rating':
        return (
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <label key={rating} className="cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={rating}
                  checked={value === rating}
                  onChange={(e) => updateAnswer(question.id, parseInt(e.target.value))}
                  className="sr-only"
                  required={question.required}
                />
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-all ${
                  value === rating
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg transform scale-110'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  {rating}
                </div>
              </label>
            ))}
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-3">
            <input
              type="file"
              accept={question.fileUploadConfig?.allowedFormats?.join(',') || '.pdf,.jpg,.png'}
              multiple={question.fileUploadConfig?.multiple || false}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                
                // Check file size
                const maxSize = (question.fileUploadConfig?.maxFileSize || 5) * 1024 * 1024;
                const oversizedFiles = files.filter(file => file.size > maxSize);
                if (oversizedFiles.length > 0) {
                  alert(`Some files are too large. Maximum size is ${question.fileUploadConfig?.maxFileSize || 5}MB`);
                  return;
                }
                
                // For demo purposes, just store file names
                const fileNames = files.map(file => file.name).join(', ');
                updateAnswer(question.id, fileNames);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={question.required}
            />
            <div className="text-sm text-gray-500">
              Max size: {question.fileUploadConfig?.maxFileSize || 5}MB • 
              Allowed: {question.fileUploadConfig?.allowedFormats?.join(', ') || '.pdf, .jpg, .png'}
              {question.fileUploadConfig?.multiple && ' • Multiple files allowed'}
            </div>
            {value && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                Selected: {value}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === 'identity') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border max-w-md w-full">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {form.type === 'quiz' ? (
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <div className="bg-green-100 p-3 rounded-full">
                  <ClipboardList className="h-8 w-8 text-green-600" />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Created by {form.createdBy}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline h-4 w-4 mr-1" />
                Roll No / ID
              </label>
              <input
                type="text"
                value={user.roll}
                onChange={(e) => setUser(prev => ({ ...prev, roll: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your roll number or ID"
              />
            </div>
          </div>

          <button
            onClick={startForm}
            className={`w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-md transition-colors font-medium ${
              form.type === 'quiz' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <span>Start {form.type === 'quiz' ? 'Quiz' : 'Survey'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          {form.timer && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  This {form.type} has a {formatTime(form.timer)} time limit
                </span>
              </div>
            </div>
          )}

          {form.type === 'quiz' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <Award className="h-4 w-4" />
                <span className="text-sm">
                  Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'results' && quizResults) {
    const percentage = Math.round((quizResults.score / quizResults.maxScore) * 100);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Results Header */}
            <div className="p-6 border-b border-gray-200 text-center">
              <div className="mb-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Award className={`h-8 w-8 ${
                    percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
                <p className="text-gray-600">Here are your results, {user.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{quizResults.score}</div>
                  <div className="text-sm text-blue-800">Points Earned</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{quizResults.maxScore}</div>
                  <div className="text-sm text-gray-800">Total Points</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{quizResults.correctAnswers}</div>
                  <div className="text-sm text-green-800">Correct Answers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-purple-800">Score Percentage</div>
                </div>
              </div>
            </div>

            {/* Question Results */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Review</h2>
              <div className="space-y-6">
                {quizResults.results.map((result, index) => (
                  <div key={result.question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {result.question.text}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          {result.question.points} pts
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Your Answer: </span>
                        <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {result.userAnswer || 'No answer'}
                        </span>
                      </div>
                      
                      {result.correctAnswer && !result.isCorrect && (
                        <div>
                          <span className="font-medium text-gray-700">Correct Answer: </span>
                          <span className="text-green-600">{result.correctAnswer}</span>
                        </div>
                      )}

                      {result.question.explanation && (
                        <div className="bg-blue-50 p-3 rounded-md mt-2">
                          <span className="font-medium text-blue-800">Explanation: </span>
                          <span className="text-blue-700">{result.question.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/thanks', { 
                  state: { 
                    formTitle: form.title, 
                    userName: user.name,
                    submittedAt: new Date().toISOString(),
                    isQuiz: true,
                    score: quizResults.score,
                    maxScore: quizResults.maxScore
                  } 
                })}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
              {form.allowRetake && (
                <button
                  onClick={() => {
                    setAnswers({});
                    setCurrentStep('form');
                    setStartTime(Date.now());
                    if (form.timer) setTimeLeft(form.timer);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                <p className="text-gray-600">Welcome, {user.name}</p>
                {form.type === 'quiz' && (
                  <p className="text-sm text-blue-600 mt-1">
                    Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
                  </p>
                )}
              </div>
              {form.timer && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-medium text-gray-900">
                      {index + 1}. {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h2>
                    {form.type === 'quiz' && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">{question.points} pts</span>
                      </div>
                    )}
                  </div>
                  {question.source && (
                    <p className="text-sm text-gray-500">Topic: {question.source}</p>
                  )}
                </div>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length} of {questions.length} questions answered
                {form.requireAll && (
                  <span className="text-red-500 ml-2">
                    (All required questions must be answered)
                  </span>
                )}
              </p>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className={`px-8 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg ${
                  form.type === 'quiz' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${form.type === 'quiz' ? 'Quiz' : 'Survey'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptForm;