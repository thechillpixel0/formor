import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, Copy, Eye, Star, Download, Tag, Users } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import { FormTemplate } from '../types';

const Library: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>(storage.getFormTemplates());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string>('');

  const forms = storage.getForms();
  const categories = ['all', 'quiz', 'survey', 'feedback', 'assessment', 'registration'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const saveToLibrary = () => {
    if (!selectedForm) return;

    const form = storage.getForm(selectedForm);
    const questions = storage.getQuestions(selectedForm);
    
    if (!form) return;

    const template: FormTemplate = {
      id: generateId(),
      name: form.title,
      description: form.description || 'No description provided',
      category: form.type,
      tags: [form.type, form.createdBy],
      form: {
        title: form.title,
        description: form.description,
        type: form.type,
        timer: form.timer,
        shuffle: form.shuffle,
        requireAll: form.requireAll,
        showResults: form.showResults,
        allowRetake: form.allowRetake,
        passingScore: form.passingScore,
        certificateEnabled: form.certificateEnabled,
        status: 'draft',
        createdBy: 'Template'
      },
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        explanation: q.explanation,
        source: q.source,
        order: q.order,
        required: q.required,
        fileUploadConfig: q.fileUploadConfig
      })),
      isPublic: true,
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    storage.saveFormTemplate(template);
    setTemplates([...templates, template]);
    setShowCreateModal(false);
    setSelectedForm('');
  };

  const cloneTemplate = (templateId: string) => {
    const template = storage.getFormTemplate(templateId);
    if (!template) return;

    // Create new form from template
    const newForm = {
      ...template.form,
      id: generateId(),
      title: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newQuestions = template.questions.map((q, index) => ({
      ...q,
      id: generateId(),
      formId: newForm.id,
      order: index
    }));

    storage.saveForm(newForm);
    storage.saveQuestions(newQuestions);

    // Update usage count
    const updatedTemplate = { ...template, usageCount: template.usageCount + 1 };
    storage.saveFormTemplate(updatedTemplate);
    setTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t));

    alert('Template cloned successfully! You can find it in your forms list.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Library</h1>
          <p className="text-gray-600 mt-1">Reusable form templates and community contributions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Save to Library</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.category === 'quiz' ? 'bg-blue-100 text-blue-800' :
                  template.category === 'survey' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {template.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Used {template.usageCount} times</span>
                </div>
                <div className="flex items-center space-x-1">
                  {template.isPublic ? (
                    <>
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Public</span>
                    </>
                  ) : (
                    <span>Private</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <div>By {template.createdBy}</div>
                <div>{template.questions.length} questions</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => cloneTemplate(template.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Copy className="h-4 w-4" />
                  <span>Clone</span>
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start building your template library by saving your first form'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Save First Template</span>
            </button>
          )}
        </div>
      )}

      {/* Save to Library Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Form to Library</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Form
                </label>
                <select
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a form...</option>
                  {forms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveToLibrary}
                disabled={!selectedForm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;