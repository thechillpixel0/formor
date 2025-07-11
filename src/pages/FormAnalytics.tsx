import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Users, Clock, BarChart3, Eye, Flag, Award, Brain, ClipboardList, FileText, User, CheckCircle, XCircle, Lightbulb, Settings, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { storage } from '../utils/storage';
import { formatDate, formatTime, downloadJSON } from '../utils';

const FormAnalytics: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [flaggedResponses, setFlaggedResponses] = useState<Set<string>>(new Set());

  if (!formId) {
    return <div>Form not found</div>;
  }

  const form = storage.getForm(formId);
  const questions = storage.getQuestions(formId);
  const responses = storage.getResponses(formId);

  if (!form) {
    return <div>Form not found</div>;
  }

  const users = responses.map(r => storage.getUser(r.userId)).filter(Boolean);
  const avgTime = responses.length > 0 
    ? Math.round(responses.reduce((sum, r) => sum + r.timeTaken, 0) / responses.length)
    : 0;

  const avgScore = form.type === 'quiz' && responses.length > 0
    ? Math.round(responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length)
    : null;

  const maxScore = form.type === 'quiz' 
    ? questions.reduce((sum, q) => sum + q.points, 0)
    : null;

  const toggleFlag = (responseId: string) => {
    const newFlagged = new Set(flaggedResponses);
    if (newFlagged.has(responseId)) {
      newFlagged.delete(responseId);
    } else {
      newFlagged.add(responseId);
    }
    setFlaggedResponses(newFlagged);
  };

  const getQuestionAnalytics = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;

    const answers = responses.map(r => r.answers[questionId]).filter(Boolean);
    
    if (question.type === 'mcq' || question.type === 'dropdown' || question.type === 'true_false') {
      const counts: Record<string, number> = {};
      answers.forEach(answer => {
        counts[answer as string] = (counts[answer as string] || 0) + 1;
      });
      
      return {
        type: 'categorical',
        data: Object.entries(counts).map(([option, count]) => ({
          name: option,
          value: count,
          isCorrect: form.type === 'quiz' ? option === question.correctAnswer : undefined
        }))
      };
    }
    
    if (question.type === 'rating') {
      const counts: Record<number, number> = {};
      answers.forEach(answer => {
        const rating = answer as number;
        counts[rating] = (counts[rating] || 0) + 1;
      });
      
      const average = answers.length > 0 
        ? (answers.reduce((sum, a) => sum + (a as number), 0) / answers.length).toFixed(1)
        : 0;
      
      return {
        type: 'rating',
        average,
        data: Object.entries(counts).map(([rating, count]) => ({
          name: `${rating} Star${rating !== '1' ? 's' : ''}`,
          value: count,
          isCorrect: form.type === 'quiz' ? parseInt(rating) === question.correctAnswer : undefined
        }))
      };
    }
    
    return {
      type: 'text',
      responses: answers.map((answer, index) => ({
        id: responses[index].id,
        user: storage.getUser(responses[index].userId),
        answer: answer as string,
        submittedAt: responses[index].submittedAt
      }))
    };
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const downloadResponse = (responseId: string) => {
    const response = responses.find(r => r.id === responseId);
    if (!response) return;

    const user = storage.getUser(response.userId);
    const detailedResponse = {
      form: form.title,
      formType: form.type,
      user: user,
      submittedAt: response.submittedAt,
      timeTaken: response.timeTaken,
      ...(form.type === 'quiz' && {
        score: response.score,
        maxScore: response.maxScore,
        percentage: response.maxScore ? Math.round((response.score || 0) / response.maxScore * 100) : 0
      }),
      answers: Object.entries(response.answers).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          question: question?.text || 'Unknown Question',
          answer,
          source: question?.source || 'Unknown',
          ...(form.type === 'quiz' && question?.correctAnswer && {
            correctAnswer: question.correctAnswer,
            isCorrect: answer === question.correctAnswer
          })
        };
      })
    };

    downloadJSON(detailedResponse, `response-${user?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`);
  };

  // Score distribution for quizzes
  const getScoreDistribution = () => {
    if (form.type !== 'quiz' || !maxScore) return [];
    
    const ranges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    const distribution = ranges.map(range => ({ range, count: 0 }));
    
    responses.forEach(response => {
      if (response.score !== undefined && response.maxScore) {
        const percentage = (response.score / response.maxScore) * 100;
        if (percentage <= 20) distribution[0].count++;
        else if (percentage <= 40) distribution[1].count++;
        else if (percentage <= 60) distribution[2].count++;
        else if (percentage <= 80) distribution[3].count++;
        else distribution[4].count++;
      }
    });
    
    return distribution;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              {form.type === 'quiz' ? (
                <Brain className="h-6 w-6 text-blue-600" />
              ) : (
                <ClipboardList className="h-6 w-6 text-green-600" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            </div>
            <p className="text-gray-600">Analytics & Responses • Created by {form.createdBy}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/dashboard/${formId}/insights`}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </Link>
          <Link
            to={`/recommendations/${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Recommendations</span>
          </Link>
          <Link
            to={`/dashboard/${formId}/tools`}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Wrench className="h-4 w-4" />
            <span>Bulk Tools</span>
          </Link>
          <Link
            to={`/certificate-editor/${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>Certificate</span>
          </Link>
          <Link
            to={`/form-logic/${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Logic</span>
          </Link>
          <Link
            to={`/notifications/${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>
          <Link
            to={`/custom-endpage/${formId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>End Page</span>
          </Link>
          <Link
            to={`/dashboard/${formId}/exports`}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export Tools</span>
          </Link>
          <Link
            to={`/dashboard`}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Exit</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(avgTime)}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {form.type === 'quiz' ? 'Avg. Score' : 'Total Points'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {form.type === 'quiz' && avgScore !== null 
                  ? `${avgScore}%` 
                  : maxScore || 0
                }
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quiz Score Distribution */}
      {form.type === 'quiz' && responses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getScoreDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Response Timeline */}
      {responses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Timeline</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responses.map((r, index) => ({
                name: `Response ${index + 1}`,
                time: r.timeTaken,
                score: form.type === 'quiz' && r.maxScore ? Math.round((r.score || 0) / r.maxScore * 100) : null
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#10B981" 
                  name="Time (seconds)"
                />
                {form.type === 'quiz' && (
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    name="Score (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Question Analytics */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Question Analytics</h2>
        
        {questions.map(question => {
          const analytics = getQuestionAnalytics(question.id);
          if (!analytics) return null;

          return (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{question.text}</h3>
                  {form.type === 'quiz' && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">{question.points} pts</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">Topic: {question.source}</p>
                {form.type === 'quiz' && question.correctAnswer && (
                  <p className="text-sm text-green-600">Correct Answer: {question.correctAnswer}</p>
                )}
              </div>

              {analytics.type === 'categorical' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          fill={(entry: any) => form.type === 'quiz' && entry.isCorrect ? '#10B981' : '#3B82F6'}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.data.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={form.type === 'quiz' && entry.isCorrect ? '#10B981' : COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {analytics.type === 'rating' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">{analytics.average}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar 
                            dataKey="value" 
                            fill={(entry: any) => form.type === 'quiz' && entry.isCorrect ? '#10B981' : '#10B981'}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.data.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={form.type === 'quiz' && entry.isCorrect ? '#10B981' : COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {analytics.type === 'text' && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.responses.map((response, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{response.user?.name}</span>
                        <span className="text-sm text-gray-500">{formatDate(response.submittedAt)}</span>
                      </div>
                      <p className="text-gray-700">{response.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Individual Responses */}
      {responses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Responses</h2>
          
          <div className="space-y-4">
            {responses.map(response => {
              const user = storage.getUser(response.userId);
              const isExpanded = selectedResponse === response.id;
              const isFlagged = flaggedResponses.has(response.id);
              const percentage = form.type === 'quiz' && response.maxScore 
                ? Math.round((response.score || 0) / response.maxScore * 100) 
                : null;

              return (
                <div key={response.id} className="border rounded-lg">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${isFlagged ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                        {form.type === 'quiz' && percentage !== null && (
                          <div className={`text-sm font-medium ${
                            percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            Score: {response.score}/{response.maxScore} ({percentage}%)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{formatDate(response.submittedAt)}</span>
                      <span className="text-sm text-gray-600">({formatTime(response.timeTaken)})</span>
                      <button
                        onClick={() => toggleFlag(response.id)}
                        className={`p-1 rounded ${isFlagged ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadResponse(response.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedResponse(isExpanded ? null : response.id)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/dashboard/${formId}/user/${response.userId}`}
                        className="p-1 text-purple-600 hover:text-purple-700"
                      >
                        <User className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="space-y-4">
                        {questions.map(question => {
                          const answer = response.answers[question.id];
                          if (!answer) return null;

                          const isCorrect = form.type === 'quiz' && question.correctAnswer 
                            ? answer === question.correctAnswer 
                            : null;

                          return (
                            <div key={question.id}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-gray-900">{question.text}</div>
                                {form.type === 'quiz' && isCorrect !== null && (
                                  <div className={`flex items-center space-x-1 ${
                                    isCorrect ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {isCorrect ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                    <span className="text-sm">{question.points} pts</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-gray-700 bg-white p-2 rounded border">
                                {answer}
                              </div>
                              {form.type === 'quiz' && !isCorrect && question.correctAnswer && (
                                <div className="text-sm text-green-600 mt-1">
                                  Correct answer: {question.correctAnswer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormAnalytics;