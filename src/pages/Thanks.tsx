import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { CheckCircle, Home, Award, Brain, ClipboardList, Download } from 'lucide-react';
import { formatDate } from '../utils';
import { storage } from '../utils/storage';

const Thanks: React.FC = () => {
  const location = useLocation();
  const { formId } = useParams();
  const { formTitle, userName, submittedAt, isQuiz, score, maxScore } = location.state || {};

  const percentage = score && maxScore ? Math.round((score / maxScore) * 100) : 0;
  
  // Check if certificate is available
  const form = formId ? storage.getForm(formId) : null;
  const canDownloadCertificate = form?.type === 'quiz' && 
                                form?.certificateEnabled && 
                                percentage >= (form?.passingScore || 60);

  const downloadCertificate = () => {
    if (!canDownloadCertificate || !userName) return;
    
    // Create a simple certificate (in a real app, this would generate a proper PDF)
    const certificateData = {
      recipientName: userName,
      formTitle: formTitle || 'Quiz',
      score: `${score}/${maxScore}`,
      percentage: `${percentage}%`,
      date: new Date().toLocaleDateString(),
      passed: percentage >= (form?.passingScore || 60)
    };
    
    // For demo, just show an alert. In production, generate actual PDF
    alert(`Certificate generated for ${userName}!\nScore: ${score}/${maxScore} (${percentage}%)\nDate: ${certificateData.date}`);
  };

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
          {canDownloadCertificate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Certificate:</span>
              <span className="font-medium text-green-600">Available</span>
            </div>
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

        <div className="flex flex-col space-y-3">
          {canDownloadCertificate && (
            <button
              onClick={downloadCertificate}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Certificate</span>
            </button>
          )}
          <Link
            to="/home"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thanks;