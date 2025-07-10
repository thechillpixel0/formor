import React, { useState } from 'react';
import { Plus, FolderOpen, Users, Lock, Globe, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, formatDate } from '../utils';
import { Collection } from '../types';

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>(storage.getCollections());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    formIds: [] as string[],
    accessLevel: 'private' as 'public' | 'team' | 'private',
    allowedUsers: [] as string[]
  });

  const forms = storage.getForms();
  const adminUsers = storage.getAdminUsers();

  const createCollection = () => {
    if (!newCollection.name.trim()) return;

    const collection: Collection = {
      id: generateId(),
      name: newCollection.name,
      description: newCollection.description,
      formIds: newCollection.formIds,
      accessLevel: newCollection.accessLevel,
      allowedUsers: newCollection.allowedUsers,
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveCollection(collection);
    setCollections([...collections, collection]);
    setShowCreateModal(false);
    resetForm();
  };

  const updateCollection = () => {
    if (!editingCollection || !newCollection.name.trim()) return;

    const updatedCollection: Collection = {
      ...editingCollection,
      name: newCollection.name,
      description: newCollection.description,
      formIds: newCollection.formIds,
      accessLevel: newCollection.accessLevel,
      allowedUsers: newCollection.allowedUsers,
      updatedAt: new Date().toISOString()
    };

    storage.saveCollection(updatedCollection);
    setCollections(collections.map(c => c.id === updatedCollection.id ? updatedCollection : c));
    setEditingCollection(null);
    resetForm();
  };

  const deleteCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      storage.deleteCollection(collectionId);
      setCollections(collections.filter(c => c.id !== collectionId));
    }
  };

  const resetForm = () => {
    setNewCollection({
      name: '',
      description: '',
      formIds: [],
      accessLevel: 'private',
      allowedUsers: []
    });
  };

  const startEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollection({
      name: collection.name,
      description: collection.description,
      formIds: collection.formIds,
      accessLevel: collection.accessLevel,
      allowedUsers: collection.allowedUsers
    });
    setShowCreateModal(true);
  };

  const toggleFormSelection = (formId: string) => {
    setNewCollection(prev => ({
      ...prev,
      formIds: prev.formIds.includes(formId)
        ? prev.formIds.filter(id => id !== formId)
        : [...prev.formIds, formId]
    }));
  };

  const toggleUserAccess = (userId: string) => {
    setNewCollection(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.includes(userId)
        ? prev.allowedUsers.filter(id => id !== userId)
        : [...prev.allowedUsers, userId]
    }));
  };

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public': return <Globe className="h-4 w-4 text-green-600" />;
      case 'team': return <Users className="h-4 w-4 text-blue-600" />;
      case 'private': return <Lock className="h-4 w-4 text-gray-600" />;
      default: return <Lock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccessColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-1">Organize and share groups of forms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 truncate">{collection.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  {getAccessIcon(collection.accessLevel)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessColor(collection.accessLevel)}`}>
                    {collection.accessLevel}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {collection.description || 'No description'}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{collection.formIds.length} forms</span>
                <span>By {collection.createdBy}</span>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <div>Created: {formatDate(collection.createdAt)}</div>
                <div>Updated: {formatDate(collection.updatedAt)}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {/* View collection */}}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => startEdit(collection)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCollection(collection.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections Yet</h3>
          <p className="text-gray-600 mb-4">Create your first collection to organize your forms</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Collection</span>
          </button>
        </div>
      )}

      {/* Create/Edit Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter collection name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe this collection..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <select
                  value={newCollection.accessLevel}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Private - Only you can access</option>
                  <option value="team">Team - Selected team members can access</option>
                  <option value="public">Public - Anyone with link can access</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forms ({newCollection.formIds.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {forms.map(form => (
                    <label key={form.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={newCollection.formIds.includes(form.id)}
                        onChange={() => toggleFormSelection(form.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{form.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        form.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {form.type}
                      </span>
                    </label>
                  ))}
                  {forms.length === 0 && (
                    <div className="text-sm text-gray-500 py-2">No forms available</div>
                  )}
                </div>
              </div>
              
              {newCollection.accessLevel === 'team' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members ({newCollection.allowedUsers.length} selected)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {adminUsers.map(user => (
                      <label key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={newCollection.allowedUsers.includes(user.id)}
                          onChange={() => toggleUserAccess(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <span className="text-xs text-gray-500">({user.email})</span>
                      </label>
                    ))}
                    {adminUsers.length === 0 && (
                      <div className="text-sm text-gray-500 py-2">No team members available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCollection(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCollection ? updateCollection : createCollection}
                disabled={!newCollection.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingCollection ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;