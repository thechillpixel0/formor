import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, formatDate } from '../utils';
import { AIInsight } from '../types';

const Insights: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = storage.getForm(formId!);
  const responses = storage.getResponses(formId!);
  const questions = storage.getQuestions(formId!);

  useEffect(() => {
    if (formId) {
      const formInsights = storage.getAIInsights(formId);
      setInsights(formInsights);
    }
  }, [formId]);

  const generateInsights = async () => {
    if (!form || responses.length === 0) return;

    setIsGenerating(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newInsights: AIInsight[] = [];

    // Trend Analysis
    if (responses.length >= 5) {
      const recentResponses = responses.slice(-5);
      const avgTime = recentResponses.reduce((sum, r) => sum + r.timeTaken, 0) / recentResponses.length;
      
      newInsights.push({
        id: generateId(),
        formId: form.id,
        type: 'trend',
        title: 'Response Time Trend',
        description: `Average completion time is ${Math.round(avgTime)} seconds. Recent responses show ${avgTime > 120 ? 'longer' : 'shorter'} completion times.`,
        data: { avgTime, trend: avgTime > 120 ? 'increasing' : 'decreasing' },
        confidence: 0.85,
        generatedAt: new Date().toISOString()
      });
    }

    // Pattern Detection
    if (form.type === 'quiz' && responses.length >= 3) {
      const scores = responses.map(r => r.score || 0);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const maxScore = responses[0]?.maxScore || 100;
      const percentage = (avgScore / maxScore) * 100;

      newInsights.push({
        id: generateId(),
        formId: form.id,
        type: 'pattern',
        title: 'Performance Pattern',
        description: `Average score is ${Math.round(percentage)}%. ${percentage >= 70 ? 'Most users are performing well' : percentage >= 50 ? 'Mixed performance levels detected' : 'Users may need additional support'}.`,
        data: { avgScore, percentage, pattern: percentage >= 70 ? 'high' : percentage >= 50 ? 'medium' : 'low' },
        confidence: 0.78,
        generatedAt: new Date().toISOString()
      });
    }

    // Anomaly Detection
    const responseTimes = responses.map(r => r.timeTaken);
    const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
    const outliers = responseTimes.filter(t => t > avgResponseTime * 2 || t < avgResponseTime * 0.3);

    if (outliers.length > 0) {
      newInsights.push({
        id: generateId(),
        formId: form.id,
        type: 'anomaly',
        title: 'Response Time Anomalies',
        description: `${outliers.length} responses have unusual completion times. This might indicate technical issues or user confusion.`,
        data: { outliers: outliers.length, avgTime: avgResponseTime },
        confidence: 0.72,
        generatedAt: new Date().toISOString()
      });
    }

    // Text Analysis Summary
    const textResponses = responses.flatMap(r => 
      Object.entries(r.answers)
        .filter(([questionId, answer]) => {
          const question = questions.find(q => q.id === questionId);
          return question && (question.type === 'short_text' || question.type === 'paragraph') && typeof answer === 'string';
        })
        .map(([, answer]) => answer as string)
    );

    if (textResponses.length > 0) {
      // Simple keyword extraction
      const words = textResponses.join(' ').toLowerCase().split(/\s+/);
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        if (word.length > 3) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });

      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      newInsights.push({
        id: generateId(),
        formId: form.id,
        type: 'summary',
        title: 'Common Themes',
        description: `Most frequently mentioned topics: ${topWords.join(', ')}. These themes appear consistently across responses.`,
        data: { topWords, totalResponses: textResponses.length },
        confidence: 0.65,
        generatedAt: new Date().toISOString()
      });
    }

    // Save insights
    newInsights.forEach(insight => storage.saveAIInsight(insight));
    setInsights([...newInsights, ...insights]);
    setIsGenerating(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'pattern': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'anomaly': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'summary': return <FileText className="h-5 w-5 text-green-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-50 border-blue-200';
      case 'pattern': return 'bg-purple-50 border-purple-200';
      case 'anomaly': return 'bg-yellow-50 border-yellow-200';
      case 'summary': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
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
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">{form.title} • {responses.length} responses analyzed</p>
          </div>
        </div>
        <button
          onClick={generateInsights}
          disabled={isGenerating || responses.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Insights'}</span>
        </button>
      </div>

      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Insights</p>
              <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.filter(i => i.type === 'anomaly').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {insights.length > 0 ? formatDate(insights[0].generatedAt) : 'Never'}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map(insight => (
          <div key={insight.id} className={`bg-white rounded-lg shadow-sm border p-6 ${getInsightColor(insight.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  
                  {/* Insight Data Visualization */}
                  {insight.type === 'trend' && insight.data.trend && (
                    <div className="bg-white p-3 rounded-md border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Trend:</span>
                        <span className={`text-sm font-medium ${
                          insight.data.trend === 'increasing' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {insight.data.trend === 'increasing' ? '↗ Increasing' : '↘ Decreasing'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {insight.type === 'pattern' && insight.data.pattern && (
                    <div className="bg-white p-3 rounded-md border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Performance Level:</span>
                        <span className={`text-sm font-medium ${
                          insight.data.pattern === 'high' ? 'text-green-600' :
                          insight.data.pattern === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {insight.data.pattern.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {insight.type === 'summary' && insight.data.topWords && (
                    <div className="bg-white p-3 rounded-md border">
                      <div className="text-sm text-gray-600 mb-2">Top Keywords:</div>
                      <div className="flex flex-wrap gap-1">
                        {insight.data.topWords.map((word: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Confidence</div>
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(insight.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatDate(insight.generatedAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {insights.length === 0 && !isGenerating && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Yet</h3>
            <p className="text-gray-600 mb-4">
              {responses.length === 0 
                ? 'Collect some responses first to generate insights'
                : 'Generate AI-powered insights from your form responses'
              }
            </p>
            {responses.length > 0 && (
              <button
                onClick={generateInsights}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                <span>Generate First Insights</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>AI Insights Disclaimer:</strong> These insights are generated using local pattern recognition and should be used as guidance only. All analysis is performed locally without sending data to external services.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;