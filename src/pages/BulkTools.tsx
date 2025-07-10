import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Trash2, Tag, Users, FileText, Filter, Search, CheckCircle, X } from 'lucide-react';
import { storage } from '../utils/storage';
import { exportToCSV, formatDate, generateId } from '../utils';
import { ResponseTag } from '../types';

const BulkTools: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  if (!formId) return <div>Form not found</div>;

  const form = storage.getForm(formId);
  const questions = storage.getQuestions(formId);
  const allResponses = storage.getResponses(formId);
  const allTags = storage.getResponseTags();

  if (!form) return <div>Form not found</div>;

  // Filter responses
  const filteredResponses = allResponses.filter(response => {
    const user = storage.getUser(response.userId);
    const responseTags = allTags.filter(tag => tag.responseId === response.id);
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userMatch = user?.name.toLowerCase().includes(searchLower) || 
                       user?.email.toLowerCase().includes(searchLower);
      const answerMatch = Object.values(response.answers).some(answer => 
        answer.toString().toLowerCase().includes(searchLower)
      );
      if (!userMatch && !answerMatch) return false;
    }
    
    // Tag filter
    if (filterTag) {
      const hasTag = responseTags.some(tag => tag.tag === filterTag);
      if (!hasTag) return false;
    }
    
    return true;
  });

  const toggleResponseSelection = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const selectAllResponses = () => {
    if (selectedResponses.size === filteredResponses.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(filteredResponses.map(r => r.id)));
    }
  };

  const bulkExportSelected = () => {
    const selectedResponseData = filteredResponses.filter(r => selectedResponses.has(r.id));
    
    const csvData = selectedResponseData.map(response => {
      const user = storage.getUser(response.userId);
      const responseTags = allTags.filter(tag => tag.responseId === response.id);
      
      const row: any = {
        'Name': user?.name || 'Unknown',
        'Email': user?.email || 'Unknown',
        'Roll/ID': user?.roll || '',
        'Submitted At': formatDate(response.submittedAt),
        'Time Taken (seconds)': response.timeTaken,
        'Tags': responseTags.map(tag => tag.tag).join(', ')
      };
      
      if (form.type === 'quiz') {
        row['Score'] = response.score || 0;
        row['Max Score'] = response.maxScore || 0;
        row['Percentage'] = response.maxScore ? Math.round((response.score || 0) / response.maxScore * 100) : 0;
      }
      
      questions.forEach(question => {
        row[`Q: ${question.text}`] = response.answers[question.id] || '';
      });
      
      return row;
    });
    
    exportToCSV(csvData, `${form.title}-selected-responses-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const bulkDeleteSelected = () => {
    if (selectedResponses.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedResponses.size} selected responses? This action cannot be undone.`)) {
      // In a real app, you would delete from the backend
      alert(`${selectedResponses.size} responses would be deleted. (Demo mode - no actual deletion)`);
      setSelectedResponses(new Set());
    }
  };

  const addTagToSelected = () => {
    if (!newTag.name.trim() || selectedResponses.size === 0) return;

    selectedResponses.forEach(responseId => {
      const tag: ResponseTag = {
        id: generateId(),
        responseId,
        tag: newTag.name,
        color: newTag.color,
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
      };
      storage.saveResponseTag(tag);
    });

    setShowTagModal(false);
    setNewTag({ name: '', color: '#3B82F6' });
    setSelectedResponses(new Set());
    
    // Force re-render by updating state
    window.location.reload();
  };

  const getResponseTags = (responseId: string) => {
    return allTags.filter(tag => tag.responseId === responseId);
  };

  const uniqueTags = [...new Set(allTags.map(tag => tag.tag))];

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
            <h1 className="text-3xl font-bold text-gray-900">Bulk Tools</h1>
            <p className="text-gray-600">{form.title} • Manage multiple responses</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredResponses.length} of {allResponses.length} responses
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedResponses.size === filteredResponses.length && filteredResponses.length > 0}
                onChange={selectAllResponses}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({selectedResponses.size} selected)
              </span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={bulkExportSelected}
              disabled={selectedResponses.size === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Selected</span>
            </button>
            
            <button
              onClick={() => setShowTagModal(true)}
              disabled={selectedResponses.size === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Tag className="h-4 w-4" />
              <span>Add Tag</span>
            </button>
            
            <button
              onClick={bulkDeleteSelected}
              disabled={selectedResponses.size === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>

        {/* Response List */}
        <div className="space-y-2">
          {filteredResponses.map(response => {
            const user = storage.getUser(response.userId);
            const responseTags = getResponseTags(response.id);
            const percentage = form.type === 'quiz' && response.maxScore 
              ? Math.round((response.score || 0) / response.maxScore * 100) 
              : null;

            return (
              <div key={response.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedResponses.has(response.id)}
                  onChange={() => toggleResponseSelection(response.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="text-sm font-medium text-gray-900">{formatDate(response.submittedAt)}</div>
                  </div>
                  
                  {form.type === 'quiz' && percentage !== null && (
                    <div>
                      <div className="text-sm text-gray-600">Score</div>
                      <div className={`text-sm font-medium ${
                        percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {response.score}/{response.maxScore} ({percentage}%)
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-600">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {responseTags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.tag}
                        </span>
                      ))}
                      {responseTags.length === 0 && (
                        <span className="text-sm text-gray-400">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredResponses.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterTag 
                  ? 'Try adjusting your search or filters'
                  : 'No responses have been submitted yet'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tag to Selected Responses</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600 mb-2">Preview:</div>
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: newTag.color }}
                >
                  {newTag.name || 'Tag Name'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTagModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTagToSelected}
                disabled={!newTag.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Tag to {selectedResponses.size} Response{selectedResponses.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkTools;