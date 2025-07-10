import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Brain, ClipboardList, Users, Clock, Shield, Award } from 'lucide-react';
import { storage } from '../utils/storage';

const Home: React.FC = () => {
  const forms = storage.getForms();
  const responses = storage.getResponses();

  const stats = {
    totalForms: forms.length,
    totalResponses: responses.length,
    quizzes: forms.filter(f => f.type === 'quiz').length,
    surveys: forms.filter(f => f.type === 'survey').length,
    publishedForms: forms.filter(f => f.status === 'published').length,
    draftForms: forms.filter(f => f.status === 'draft').length
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Formora
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create engaging quizzes and surveys with ease. Build interactive content, 
          track responses, and analyze results with our modern platform.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/create"
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Quiz/Survey</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
            </div>
            <ClipboardList className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.quizzes}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.surveys}</p>
            </div>
            <ClipboardList className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
            <Users className="h-8 w-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Quizzes</h3>
          <p className="text-gray-600">
            Create scored quizzes with multiple question types, automatic grading, and detailed results
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Surveys</h3>
          <p className="text-gray-600">
            Build comprehensive surveys for feedback collection and data gathering
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-teal-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-gray-600">
            Real-time dashboards with charts, individual response views, and detailed scoring
          </p>
        </div>
      </div>

      {/* Recent Forms */}
      {forms.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.slice(0, 6).map(form => {
              const responses = storage.getResponses(form.id);
              const avgScore = form.type === 'quiz' && responses.length > 0
                ? Math.round(responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length)
                : null;

              return (
                <div key={form.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {form.type === 'quiz' ? (
                        <Brain className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ClipboardList className="h-5 w-5 text-green-600" />
                      )}
                      <h3 className="font-semibold text-gray-900 truncate">{form.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {form.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {form.createdBy}</span>
                    <span>{responses.length} responses</span>
                  </div>

                  {form.type === 'quiz' && avgScore !== null && (
                    <div className="flex items-center space-x-1 text-sm text-blue-600 mb-4">
                      <Award className="h-4 w-4" />
                      <span>Avg Score: {avgScore}%</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      to={`/form/${form.id}/summary`}
                      className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/dashboard/${form.id}`}
                      className={`flex-1 text-center px-3 py-2 text-white rounded-md transition-colors text-sm ${
                        form.type === 'quiz' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Analytics
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {forms.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Forms Yet</h2>
          <p className="text-gray-600 mb-6">Create your first quiz or survey to get started</p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Form</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;