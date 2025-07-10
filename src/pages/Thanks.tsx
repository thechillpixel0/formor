import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Award, Brain, ClipboardList } from 'lucide-react';
import { formatDate } from '../utils';

const Thanks: React.FC = () => {
  const location = useLocation();
  const { formTitle, userName, submittedAt, isQuiz, score, maxScore } = location.state || {};

  const percentage = score && maxScore ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
        <div className="mb-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isQuiz 
              ? percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              : 'bg-green-100'
          }`}>
            {isQuiz ? (
              <Award className={`h-8 w-8 ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank you{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Your {isQuiz ? 'quiz' : 'survey'} has been successfully submitted.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
          {formTitle && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isQuiz ? (
                  <><Brain className="inline h-4 w-4 mr-1" />Quiz:</>
                ) : (
                  <><ClipboardList className="inline h-4 w-4 mr-1" />Survey:</>
                )}
              </span>
              <span className="font-medium text-gray-900">{formTitle}</span>
            </div>
          )}
          {submittedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-medium text-gray-900">{formatDate(submittedAt)}</span>
            </div>
          )}
          {isQuiz && score !== undefined && maxScore !== undefined && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium text-gray-900">{score} / {maxScore}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Percentage:</span>
                <span className={`font-medium ${
                  percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentage}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className={`p-4 rounded-lg mb-6 ${isQuiz ? 'bg-blue-50' : 'bg-green-50'}`}>
          <p className={`text-sm ${isQuiz ? 'text-blue-800' : 'text-green-800'}`}>
            {isQuiz 
              ? percentage >= 70 
                ? "Excellent work! You've demonstrated great knowledge."
                : percentage >= 50
                ? "Good effort! Keep practicing to improve your score."
                : "Don't worry, learning is a process. Keep studying and try again!"
              : "We value your feedback and appreciate the time you took to complete this survey."
            }
          </p>
        </div>

        <Link
          to="/home"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default Thanks;