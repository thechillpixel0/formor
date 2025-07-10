import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, GitBranch, Clock, User, RotateCcw, Eye, Plus } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, formatDate } from '../utils';
import { FormVersion } from '../types';

const VersionControl: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null);

  const form = storage.getForm(formId!);
  const questions = storage.getQuestions(formId!);

  useEffect(() => {
    if (formId) {
      const formVersions = storage.getFormVersions(formId);
      setVersions(formVersions);
    }
  }, [formId]);

  const createVersion = () => {
    if (!form || !versionName.trim()) return;

    const newVersion: FormVersion = {
      id: generateId(),
      formId: form.id,
      version: versions.length + 1,
      name: versionName,
      description: versionDescription,
      formData: { ...form },
      questionsData: [...questions],
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      isActive: false
    };

    storage.saveFormVersion(newVersion);
    setVersions([newVersion, ...versions]);
    setShowCreateModal(false);
    setVersionName('');
    setVersionDescription('');
  };

  const rollbackToVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version || !form) return;

    if (confirm(`Are you sure you want to rollback to version ${version.version}? This will overwrite the current form.`)) {
      // Update form with version data
      const updatedForm = {
        ...version.formData,
        id: form.id,
        updatedAt: new Date().toISOString()
      };

      // Update questions with version data
      const updatedQuestions = version.questionsData.map(q => ({
        ...q,
        id: generateId(),
        formId: form.id
      }));

      storage.saveForm(updatedForm);
      storage.saveQuestions(updatedQuestions);

      // Mark version as active
      const updatedVersions = versions.map(v => ({
        ...v,
        isActive: v.id === versionId
      }));
      updatedVersions.forEach(v => storage.saveFormVersion(v));
      setVersions(updatedVersions);

      alert('Form rolled back successfully!');
    }
  };

  const compareVersions = (version1Id: string, version2Id: string) => {
    setSelectedVersions([version1Id, version2Id]);
  };

  const getVersionDiff = (version1: FormVersion, version2: FormVersion) => {
    const diffs = [];

    // Compare form properties
    if (version1.formData.title !== version2.formData.title) {
      diffs.push(`Title: "${version1.formData.title}" → "${version2.formData.title}"`);
    }
    if (version1.formData.description !== version2.formData.description) {
      diffs.push(`Description changed`);
    }
    if (version1.questionsData.length !== version2.questionsData.length) {
      diffs.push(`Questions: ${version1.questionsData.length} → ${version2.questionsData.length}`);
    }

    return diffs;
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
            <h1 className="text-3xl font-bold text-gray-900">Version Control</h1>
            <p className="text-gray-600">{form.title}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Create Snapshot</span>
        </button>
      </div>

      {/* Current Version */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Current Version</h2>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                LIVE
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(form.updatedAt)}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Title</div>
              <div className="font-medium text-gray-900">{form.title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium text-gray-900">{form.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Questions</div>
              <div className="font-medium text-gray-900">{questions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
          <p className="text-gray-600 mt-1">Track changes and rollback when needed</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {versions.map(version => (
            <div key={version.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${version.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">v{version.version}: {version.name}</h3>
                      {version.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{version.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{version.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* View version details */}}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {!version.isActive && (
                    <button
                      onClick={() => rollbackToVersion(version.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Version Details */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Questions</div>
                  <div className="font-medium">{version.questionsData.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Type</div>
                  <div className="font-medium">{version.formData.type}</div>
                </div>
                <div>
                  <div className="text-gray-600">Timer</div>
                  <div className="font-medium">{version.formData.timer ? `${version.formData.timer}s` : 'None'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="font-medium">{version.formData.status}</div>
                </div>
              </div>
            </div>
          ))}
          
          {versions.length === 0 && (
            <div className="p-12 text-center">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Versions Yet</h3>
              <p className="text-gray-600 mb-4">Create your first snapshot to start tracking changes</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Snapshot</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Version Snapshot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Name *
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Added new questions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what changed in this version..."
                />
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
                onClick={createVersion}
                disabled={!versionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;