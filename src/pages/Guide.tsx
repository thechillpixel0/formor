import React from 'react';
import { BookText, Plus, BarChart3, Settings, BookOpen, Lightbulb, Award, Bell, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Guide: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Formora User Guide
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your comprehensive guide to creating, managing, and analyzing forms with Formora.
        </p>
      </div>

      {/* Getting Started */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BookText className="h-6 w-6 text-blue-600" />
          <span>Getting Started</span>
        </h2>
        <p className="text-gray-700 mb-4">
          Formora allows you to easily create interactive quizzes and surveys. Follow these steps to begin:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Navigate to the <Link to="/create" className="text-blue-600 hover:underline">Create</Link> page.</li>
          <li>Fill in your form's title, description, and choose its type (Quiz or Survey).</li>
          <li>Add questions manually or use the bulk upload feature.</li>
          <li>Configure question types, options, correct answers (for quizzes), and points.</li>
          <li>Save your form as a draft or publish it directly.</li>
        </ol>
        <Link to="/create" className="inline-flex items-center space-x-2 px-4 py-2 mt-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create Your First Form</span>
        </Link>
      </div>

      {/* Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <span>Dashboard & Analytics</span>
          </h2>
          <p className="text-gray-700 mb-4">
            The <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link> is your central hub for managing all your forms and viewing their performance.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>View total responses, average completion times, and average scores.</li>
            <li>Access detailed analytics for each form, including question-level insights.</li>
            <li>Filter forms by type (Quizzes or Surveys).</li>
            <li>Monitor recent activity and notifications.</li>
          </ul>
          <Link to="/dashboard" className="inline-flex items-center space-x-2 px-4 py-2 mt-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <BarChart3 className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span>Form Library</span>
          </h2>
          <p className="text-gray-700 mb-4">
            The <Link to="/library" className="text-blue-600 hover:underline">Form Library</Link> allows you to save and reuse your forms as templates.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Save any of your existing forms as a reusable template.</li>
            <li>Clone templates to quickly create new forms based on existing designs.</li>
            <li>Search and filter templates by category and tags.</li>
          </ul>
          <Link to="/library" className="inline-flex items-center space-x-2 px-4 py-2 mt-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Explore Library</span>
          </Link>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-6 w-6 text-orange-600" />
          <span>Advanced Features</span>
        </h2>
        <p className="text-gray-700 mb-4">
          Formora offers powerful tools to customize your forms and manage responses:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">AI Insights & Recommendations</h3>
              <p className="text-sm text-gray-600">
                Get AI-powered analysis of your responses and suggestions for improvement.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Certificate Editor</h3>
              <p className="text-sm text-gray-600">
                Design and enable custom certificates for quiz completions.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-600">
                Configure email notifications and success banners for submissions.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Custom End Page</h3>
              <p className="text-sm text-gray-600">
                Design a personalized thank you page after form completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sharing Forms */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing Your Forms</h2>
        <p className="text-gray-700 mb-4">
          Once you've created a form, you can easily share it with others:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Publish your form from the Create page or Form Summary.</li>
          <li>Copy the universal sharing link from the Form Summary page.</li>
          <li>Share the link via email, social media, or any other method.</li>
          <li>Recipients can access and complete the form on any device.</li>
          <li>View responses and analytics in your Dashboard.</li>
        </ol>
      </div>

      {/* Tips and Best Practices */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips and Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">For Quizzes:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Set clear point values for each question</li>
              <li>Provide explanations for correct answers</li>
              <li>Use a mix of question types for engagement</li>
              <li>Enable certificates for motivation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">For Surveys:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Keep questions clear and concise</li>
              <li>Use rating scales for quantitative feedback</li>
              <li>Include open-ended questions for insights</li>
              <li>Test your survey before sharing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-6 w-6 text-gray-600" />
          <span>Customization</span>
        </h2>
        <p className="text-gray-700 mb-4">
          Personalize your Formora experience from the <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link> page:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Customize your brand name, logo, and primary color</li>
          <li>Toggle the "Powered by Formora" footer</li>
          <li>Preview changes before applying them</li>
        </ul>
        <Link to="/settings" className="inline-flex items-center space-x-2 px-4 py-2 mt-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Settings className="h-4 w-4" />
          <span>Customize Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Guide;