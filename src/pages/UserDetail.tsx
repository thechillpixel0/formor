import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Clock, Calendar, Award, User, Mail, Hash } from 'lucide-react';
import { storage } from '../utils/storage';
import { formatDate, formatTime, generatePDF } from '../utils';

const UserDetail: React.FC = () => {
  const { formId, userId } = useParams<{ formId: string; userId: string }>();

  if (!formId || !userId) {
    return <div>Invalid parameters</div>;
  }

  const form = storage.getForm(formId);
  const questions = storage.getQuestions(formId);
  const response = storage.getResponses(formId).find(r => r.userId === userId);
  const user = storage.getUser(userId);
  const brandSettings = storage.getBrandSettings();

  if (!form || !response || !user) {
    return <div>Data not found</div>;
  }

  const percentage = form.type === 'quiz' && response.maxScore 
    ? Math.round((response.score || 0) / response.maxScore * 100) 
    : null;

  const downloadResponsePDF = async () => {
    try {
      // Create a temporary element for PDF generation
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${brandSettings.primaryColor}; margin-bottom: 10px;">${form.title}</h1>
          <h2 style="color: #333; margin-bottom: 20px;">Individual Response Report</h2>
        </div>
        
        <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #333; margin-bottom: 15px;">Participant Information</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div><strong>Name:</strong> ${user.name}</div>
            <div><strong>Email:</strong> ${user.email}</div>
            <div><strong>Roll/ID:</strong> ${user.roll || 'Not provided'}</div>
            <div><strong>Submitted:</strong> ${formatDate(response.submittedAt)}</div>
            <div><strong>Time Taken:</strong> ${formatTime(response.timeTaken)}</div>
            ${form.type === 'quiz' && response.score !== undefined ? `
              <div><strong>Score:</strong> ${response.score}/${response.maxScore} (${percentage}%)</div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid ${brandSettings.primaryColor}; padding-bottom: 10px;">Responses</h3>
          ${questions.map((question, index) => {
            const answer = response.answers[question.id];
            if (!answer) return '';
            
            const isCorrect = form.type === 'quiz' && question.correctAnswer 
              ? answer === question.correctAnswer 
              : null;
            
            return `
              <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <h4 style="color: #333; margin: 0;">${index + 1}. ${question.text}</h4>
                  ${form.type === 'quiz' && isCorrect !== null ? `
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; ${
                      isCorrect 
                        ? 'background: #dcfce7; color: #166534;' 
                        : 'background: #fef2f2; color: #dc2626;'
                    }">
                      ${isCorrect ? '✓ Correct' : '✗ Incorrect'} (${question.points} pts)
                    </span>
                  ` : ''}
                </div>
                <div style="margin-bottom: 10px;">
                  <strong>Source:</strong> ${question.source}
                </div>
                <div style="background: white; padding: 10px; border-radius: 4px; border-left: 4px solid ${brandSettings.primaryColor};">
                  <strong>Answer:</strong> ${answer}
                </div>
                ${form.type === 'quiz' && !isCorrect && question.correctAnswer ? `
                  <div style="margin-top: 10px; padding: 10px; background: #dcfce7; border-radius: 4px;">
                    <strong>Correct Answer:</strong> ${question.correctAnswer}
                  </div>
                ` : ''}
                ${form.type === 'quiz' && question.explanation ? `
                  <div style="margin-top: 10px; padding: 10px; background: #eff6ff; border-radius: 4px;">
                    <strong>Explanation:</strong> ${question.explanation}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        ${brandSettings.showPoweredBy ? `
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
            Generated by ${brandSettings.brandName}
          </div>
        ` : ''}
      `;
      
      document.body.appendChild(element);
      await generatePDF(element, `${form.title}-${user.name}-response.pdf`);
      document.body.removeChild(element);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/dashboard/${formId}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Analytics</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Individual Response</h1>
            <p className="text-gray-600">{form.title} • {user.name}</p>
          </div>
        </div>
        <button
          onClick={downloadResponsePDF}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* User Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Participant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium text-gray-900">{user.name}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium text-gray-900">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Hash className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm text-gray-600">Roll/ID</div>
              <div className="font-medium text-gray-900">{user.roll || 'Not provided'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Submitted</div>
              <div className="font-medium text-gray-900">{formatDate(response.submittedAt)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Time Taken</div>
              <div className="font-medium text-gray-900">{formatTime(response.timeTaken)}</div>
            </div>
          </div>
          {form.type === 'quiz' && response.score !== undefined && (
            <>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="font-medium text-gray-900">{response.score}/{response.maxScore}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Percentage</div>
                  <div className={`font-medium ${
                    percentage! >= 70 ? 'text-green-600' : percentage! >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {percentage}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailed Responses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Responses</h2>
        <div className="space-y-6">
          {questions.map((question, index) => {
            const answer = response.answers[question.id];
            if (!answer) return null;

            const isCorrect = form.type === 'quiz' && question.correctAnswer 
              ? answer === question.correctAnswer 
              : null;

            return (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {index + 1}. {question.text}
                  </h3>
                  {form.type === 'quiz' && isCorrect !== null && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {question.points} pts
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-600">Source: </span>
                  <span className="text-sm font-medium text-gray-900">{question.source}</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Response:</div>
                  <div className="text-gray-900">{answer}</div>
                </div>

                {form.type === 'quiz' && !isCorrect && question.correctAnswer && (
                  <div className="bg-green-50 p-3 rounded-md mb-3">
                    <div className="text-sm font-medium text-green-800 mb-1">Correct Answer:</div>
                    <div className="text-green-700">{question.correctAnswer}</div>
                  </div>
                )}

                {form.type === 'quiz' && question.explanation && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                    <div className="text-blue-700">{question.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;