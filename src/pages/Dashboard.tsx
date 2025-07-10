import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, BarChart3, Clock, Users, FileText, Brain, ClipboardList, Award, Bell, X } from 'lucide-react';
import { storage } from '../utils/storage';
import { formatDate } from '../utils';

const Dashboard: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'quiz' | 'survey'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const forms = storage.getForms().filter(form => 
    filterType === 'all' || form.type === filterType
  );
  
  // Get and manage notifications
  const [notifications, setNotifications] = useState(() => 
    JSON.parse(localStorage.getItem('formora_notifications') || '[]')
  );
  
  const markAsRead = (notificationId: string) => {
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('formora_notifications', JSON.stringify(updated));
  };
  
  const clearNotification = (notificationId: string) => {
    const updated = notifications.filter((n: any) => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem('formora_notifications', JSON.stringify(updated));
  };

  const getFormStats = (formId: string) => {
    const responses = storage.getResponses(formId);
    const questions = storage.getQuestions(formId);
    const form = storage.getForm(formId);
    
    const avgTime = responses.length > 0 
      ? Math.round(responses.reduce((sum, r) => sum + r.timeTaken, 0) / responses.length)
      : 0;

    const avgScore = form?.type === 'quiz' && responses.length > 0
      ? Math.round(responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length)
      : null;

    return {
      responseCount: responses.length,
      questionCount: questions.length,
      avgTime,
      avgScore
    };
  };

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
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
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and analyze your quizzes and surveys</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {notifications.filter((n: any) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter((n: any) => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification: any) => (
                    <div key={notification.id} className={`p-3 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New response from {notification.userName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {notification.formTitle}
                            {notification.isQuiz && notification.score !== undefined && (
                              <span className="ml-2 text-blue-600">
                                Score: {notification.score}/{notification.maxScore}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notification.submittedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Link
            to="/create"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Form</span>
          </Link>
        </div>
      </div>
      
      {/* Recent Activity Summary */}
      {notifications.filter((n: any) => !n.read).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              You have {notifications.filter((n: any) => !n.read).length} new response(s)
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All Forms
        </button>
        <button
          onClick={() => setFilterType('quiz')}
          className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === 'quiz'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>Quizzes</span>
        </button>
        <button
          onClick={() => setFilterType('survey')}
          className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === 'survey'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Surveys</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => {
          const stats = getFormStats(form.id);
          
          return (
            <div key={form.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {form.type === 'quiz' ? (
                    <Brain className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ClipboardList className="h-5 w-5 text-green-600" />
                  )}
                  <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{form.title}</h3>
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

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.responseCount}</div>
                  <div className="text-xs text-gray-500">Responses</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{stats.questionCount}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    {form.type === 'quiz' ? (
                      <Award className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">
                    {form.type === 'quiz' && stats.avgScore !== null 
                      ? `${stats.avgScore}%` 
                      : `${stats.avgTime}s`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.type === 'quiz' ? 'Avg Score' : 'Avg Time'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div>Created by {form.createdBy}</div>
                <div>Created: {formatDate(form.createdAt)}</div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Link
                  to={`/form/${form.id}/summary`}
                  className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span>View</span>
                </Link>
                <Link
                  to={`/dashboard/${form.id}`}
                  className={`flex-1 text-center px-3 py-2 text-white rounded-md transition-colors text-sm flex items-center justify-center ${
                    form.type === 'quiz' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>Analytics</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;