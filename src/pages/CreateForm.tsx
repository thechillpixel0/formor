import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Save, Send, Upload, Edit3, Brain, ClipboardList } from 'lucide-react';
import { Form, Question } from '../types';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import QuestionBuilder from '../components/QuestionBuilder';
import BulkUpload from '../components/BulkUpload';

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formId: paramFormId } = useParams();
  const editFormId = searchParams.get('edit');
  const actualFormId = paramFormId || editFormId;
  const isEditing = Boolean(actualFormId);

  const [form, setForm] = useState<Form>({
    id: generateId(),
    title: '',
    description: '',
    type: 'quiz',
    timer: 0,
    shuffle: false,
    requireAll: true,
    showResults: true,
    allowRetake: false,
    status: 'draft',
    createdBy: 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && actualFormId) {
      const existingForm = storage.getForm(actualFormId);
      if (existingForm) {
        setForm(existingForm);
        setQuestions(storage.getQuestions(actualFormId));
      }
    }
  }, [isEditing, actualFormId]);

  const handleFormChange = (field: keyof Form, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleQuestionsImport = (importedQuestions: Question[]) => {
    setQuestions(prev => [...prev, ...importedQuestions]);
    setActiveTab('manual');
  };

  const saveForm = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate quiz questions have correct answers
    if (form.type === 'quiz') {
      const invalidQuestions = questions.filter(q => 
        (q.type === 'mcq' || q.type === 'dropdown' || q.type === 'true_false' || q.type === 'rating') && 
        !q.correctAnswer
      );
      
      if (invalidQuestions.length > 0) {
        alert(`Please set correct answers for all quiz questions. Missing: ${invalidQuestions.length} question(s)`);
        return;
      }
    }

    setIsSaving(true);

    try {
      const updatedForm = {
        ...form,
        status,
        updatedAt: new Date().toISOString()
      };

      storage.saveForm(updatedForm);
      storage.saveQuestions(questions);

      if (status === 'published') {
        navigate(`/form/${form.id}/summary`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update your form' : 'Build your quiz or survey with custom questions'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => saveForm('draft')}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => saveForm('published')}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Form Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="Enter form title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Type
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="quiz"
                  checked={form.type === 'quiz'}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">Quiz (with scoring)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="survey"
                  checked={form.type === 'survey'}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <ClipboardList className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Survey (no scoring)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timer (seconds)
            </label>
            <input
              type="number"
              value={form.timer || ''}
              onChange={(e) => handleFormChange('timer', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0 for no timer"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created By
            </label>
            <input
              type="text"
              value={form.createdBy}
              onChange={(e) => handleFormChange('createdBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name..."
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.shuffle}
                onChange={(e) => handleFormChange('shuffle', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Shuffle Questions</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.requireAll}
                onChange={(e) => handleFormChange('requireAll', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require All Questions</span>
            </label>

            {form.type === 'quiz' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.passingScore || 60}
                    onChange={(e) => handleFormChange('passingScore', parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="60"
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.certificateEnabled}
                    onChange={(e) => handleFormChange('certificateEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Certificate Generation</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.showResults}
                    onChange={(e) => handleFormChange('showResults', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show Results After Completion</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.allowRetake}
                    onChange={(e) => handleFormChange('allowRetake', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow Multiple Attempts</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            {form.type === 'quiz' && questions.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Total Points: <span className="font-medium text-blue-600">{totalPoints}</span>
              </p>
            )}
          </div>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>Manual</span>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        {activeTab === 'manual' ? (
          <QuestionBuilder
            questions={questions}
            onQuestionsChange={setQuestions}
            formId={form.id}
            isQuizMode={form.type === 'quiz'}
          />
        ) : (
          <BulkUpload
            onQuestionsImport={handleQuestionsImport}
            formId={form.id}
          />
        )}
      </div>

      {questions.length > 0 && (
        <div className={`p-4 rounded-lg ${form.type === 'quiz' ? 'bg-blue-50' : 'bg-green-50'}`}>
          <p className={form.type === 'quiz' ? 'text-blue-800' : 'text-green-800'}>
            <span className="font-medium">{questions.length}</span> questions added to your {form.type}
            {form.type === 'quiz' && (
              <span> • <span className="font-medium">{totalPoints}</span> total points</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateForm;