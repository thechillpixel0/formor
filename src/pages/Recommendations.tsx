import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, TrendingUp, Users, FileText, Plus, CheckCircle, X } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, formatDate } from '../utils';
import { Recommendation } from '../types';

const Recommendations: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = storage.getForm(formId!);
  const responses = storage.getResponses(formId!);
  const questions = storage.getQuestions(formId!);

  useEffect(() => {
    if (formId) {
      const formRecommendations = storage.getRecommendations(formId);
      setRecommendations(formRecommendations);
    }
  }, [formId]);

  const generateRecommendations = async () => {
    if (!form || responses.length === 0) return;

    setIsGenerating(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRecommendations: Recommendation[] = [];

    // Follow-up form recommendation
    if (form.type === 'quiz' && responses.length >= 5) {
      const avgScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length;
      const maxScore = responses[0]?.maxScore || 100;
      const avgPercentage = (avgScore / maxScore) * 100;

      if (avgPercentage < 70) {
        newRecommendations.push({
          id: generateId(),
          formId: form.id,
          type: 'follow_up_form',
          title: 'Create Remedial Quiz',
          description: `Average score is ${Math.round(avgPercentage)}%. Consider creating a follow-up quiz focusing on areas where students struggled.`,
          actionUrl: '/create',
          priority: 'high',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Improvement recommendations
    if (responses.length >= 3) {
      const avgTime = responses.reduce((sum, r) => sum + r.timeTaken, 0) / responses.length;
      
      if (avgTime > 300) { // More than 5 minutes
        newRecommendations.push({
          id: generateId(),
          formId: form.id,
          type: 'improvement',
          title: 'Optimize Question Clarity',
          description: `Average completion time is ${Math.round(avgTime / 60)} minutes. Consider simplifying questions or adding clearer instructions.`,
          priority: 'medium',
          createdAt: new Date().toISOString()
        });
      }

      // Check for questions with no responses
      const unansweredQuestions = questions.filter(q => 
        !responses.some(r => r.answers[q.id])
      );

      if (unansweredQuestions.length > 0) {
        newRecommendations.push({
          id: generateId(),
          formId: form.id,
          type: 'improvement',
          title: 'Review Unanswered Questions',
          description: `${unansweredQuestions.length} questions have no responses. Consider making them optional or reviewing their relevance.`,
          priority: 'medium',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Certificate recommendation
    if (form.type === 'quiz' && !form.certificateEnabled && responses.length >= 5) {
      newRecommendations.push({
        id: generateId(),
        formId: form.id,
        type: 'certificate',
        title: 'Enable Certificates',
        description: 'Your quiz has good engagement. Consider enabling certificates to motivate participants and provide completion recognition.',
        actionUrl: `/certificate-editor/${formId}`,
        priority: 'low',
        createdAt: new Date().toISOString()
      });
    }

    // Action recommendations
    if (responses.length >= 10) {
      newRecommendations.push({
        id: generateId(),
        formId: form.id,
        type: 'action',
        title: 'Export Response Data',
        description: 'You have substantial response data. Consider exporting for deeper analysis or backup purposes.',
        actionUrl: `/dashboard/${formId}/exports`,
        priority: 'low',
        createdAt: new Date().toISOString()
      });
    }

    // Save recommendations
    newRecommendations.forEach(rec => storage.saveRecommendation(rec));
    setRecommendations([...newRecommendations, ...recommendations]);
    setIsGenerating(false);
  };

  const dismissRecommendation = (recommendationId: string) => {
    setRecommendations(recommendations.filter(r => r.id !== recommendationId));
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'follow_up_form': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'improvement': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'action': return <Users className="h-5 w-5 text-purple-600" />;
      case 'certificate': return <CheckCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!form) {
    return <div>Form not found</div>;
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
            <p className="text-gray-600">{form.title} • AI-powered suggestions</p>
          </div>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={isGenerating || responses.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Lightbulb className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Recommendations'}</span>
        </button>
      </div>

      {/* Recommendations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
            <Lightbulb className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'high').length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Improvements</p>
              <p className="text-2xl font-bold text-green-600">
                {recommendations.filter(r => r.type === 'improvement').length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actions</p>
              <p className="text-2xl font-bold text-purple-600">
                {recommendations.filter(r => r.type === 'action').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map(recommendation => (
          <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getRecommendationIcon(recommendation.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {recommendation.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{recommendation.description}</p>
                  <div className="text-xs text-gray-500">
                    Generated {formatDate(recommendation.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {recommendation.actionUrl && (
                  <Link
                    to={recommendation.actionUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Take Action
                  </Link>
                )}
                <button
                  onClick={() => dismissRecommendation(recommendation.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {recommendations.length === 0 && !isGenerating && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              {responses.length === 0 
                ? 'Collect some responses first to get personalized recommendations'
                : 'Generate AI-powered recommendations to improve your form'
              }
            </p>
            {responses.length > 0 && (
              <button
                onClick={generateRecommendations}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Generate First Recommendations</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recommendation Categories */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-blue-900">Follow-up Forms</div>
              <div className="text-sm text-blue-700">Create additional content</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-900">Improvements</div>
              <div className="text-sm text-green-700">Enhance form quality</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-purple-900">Actions</div>
              <div className="text-sm text-purple-700">Next steps to take</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-medium text-yellow-900">Features</div>
              <div className="text-sm text-yellow-700">Enable new capabilities</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;