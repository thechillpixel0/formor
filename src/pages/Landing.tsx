import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Brain,
  BarChart3,
  Users,
  Monitor,
  Smartphone,
  Globe,
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Formora</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link to="/home" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Create Stunning
                <span className="text-blue-600 block">Quizzes & Surveys</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Build engaging forms with advanced analytics, real-time insights, and beautiful design. 
                Perfect for education, business, and research.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/create" className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg">
                  <span>Start Creating</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/home" className="inline-flex items-center justify-center space-x-2 bg-white text-gray-900 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 font-semibold text-lg">
                  <span>View Demo</span>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-gray-900">Sample Quiz</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">What is the capital of France?</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" className="text-blue-600" />
                          <span className="text-gray-700">Paris</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" className="text-blue-600" />
                          <span className="text-gray-700">London</span>
                        </label>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                      Submit Answer
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-3 rounded-full shadow-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Design Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Works perfectly on any device</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Your forms look great and work flawlessly on desktop, tablet, and mobile devices.
            </p>
            <div className="flex justify-center items-center space-x-8 lg:space-x-16">
              <div className="text-center">
                <Monitor className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                <div className="text-blue-100">Desktop</div>
              </div>
              <div className="text-center">
                <Smartphone className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                <div className="text-blue-100">Mobile</div>
              </div>
              <div className="text-center">
                <Globe className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                <div className="text-blue-100">Anywhere</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust Formora for their form creation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create" className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg">
              <span>Create Your First Form</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/home" className="inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-200 font-semibold text-lg">
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-6 space-x-2">
            <ClipboardList className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">Formora</span>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            The most intuitive and beautiful way to build quizzes and surveys.
          </p>
          <div className="text-sm text-gray-500">
            Made with 💙 by <span className="text-blue-400 font-semibold">Aftab Alam</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
