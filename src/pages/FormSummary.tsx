import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Share2, Play, ArrowLeft, Clock, Users, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { formatDate } from '../utils';

const FormSummary: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  if (!formId) {
    return <div>Form not found</div>;
  }

  const form = storage.getForm(formId);
  const questions = storage.getQuestions(formId);
  const responses = storage.getResponses(formId);

  if (!form) {
    return <div>Form not found</div>;
  }

  const shareUrl = `${window.location.origin}/attempt/${formId}`;
  const editUrl = `${window.location.origin}/edit/${formId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const launchForm = () => {
    if (form.status === 'draft') {
      const updatedForm = {
        ...form,
        status: 'published' as const,
        updatedAt: new Date().toISOString()
      };
      storage.saveForm(updatedForm);
    }
    navigate(`/dashboard/${formId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/create?edit=${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={launchForm}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>Launch</span>
          </button>
        </div>
      </div>

      {/* Form Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-600 mt-1">{form.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            form.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {form.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">{questions.length} Questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">{responses.length} Responses</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-600">
              {form.timer ? `${form.timer}s timer` : 'No timer'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Created:</strong> {formatDate(form.createdAt)}
          </div>
          <div>
            <strong>Last Updated:</strong> {formatDate(form.updatedAt)}
          </div>
          <div>
            <strong>Question Shuffle:</strong> {form.shuffle ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <strong>Require All:</strong> {form.requireAll ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Share for Responses */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-900 mb-3">Share for Responses</h2>
          <p className="text-sm text-green-700 mb-3">Share this link for people to fill out your form</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Edit Link */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Edit Form</h2>
          <p className="text-sm text-blue-700 mb-3">Use this link to edit your form</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(editUrl)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions Preview</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {index + 1}. {question.text}
                </h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {question.type}
                </span>
              </div>
              
              {question.source && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Source:</strong> {question.source}
                </p>
              )}
              
              {question.options.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {question.options.map((option, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormSummary;