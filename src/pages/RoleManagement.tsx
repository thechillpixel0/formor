import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Shield, Users, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import { AdminUser, Permission } from '../types';

const RoleManagement: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(storage.getAdminUsers());
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [] as Permission[]
  });

  const defaultPermissions: Permission[] = [
    { action: 'view', resource: 'forms', granted: false },
    { action: 'create', resource: 'forms', granted: false },
    { action: 'edit', resource: 'forms', granted: false },
    { action: 'delete', resource: 'forms', granted: false },
    { action: 'view', resource: 'responses', granted: false },
    { action: 'export', resource: 'responses', granted: false },
    { action: 'view', resource: 'analytics', granted: false },
    { action: 'edit', resource: 'settings', granted: false },
    { action: 'view', resource: 'certificates', granted: false },
    { action: 'edit', resource: 'certificates', granted: false },
    { action: 'manage_users', resource: 'settings', granted: false }
  ];

  const roleDefinitions = {
    owner: {
      name: 'Owner',
      description: 'Full access to everything',
      permissions: defaultPermissions.map(p => ({ ...p, granted: true }))
    },
    editor: {
      name: 'Editor',
      description: 'Can create and edit forms, view responses',
      permissions: defaultPermissions.map(p => ({
        ...p,
        granted: ['view', 'create', 'edit'].includes(p.action) && ['forms', 'responses', 'analytics'].includes(p.resource)
      }))
    },
    viewer: {
      name: 'Viewer',
      description: 'Can only view forms and responses',
      permissions: defaultPermissions.map(p => ({
        ...p,
        granted: p.action === 'view' && ['forms', 'responses', 'analytics'].includes(p.resource)
      }))
    },
    reviewer: {
      name: 'Reviewer',
      description: 'Can view all responses and add comments',
      permissions: defaultPermissions.map(p => ({
        ...p,
        granted: p.action === 'view' && ['forms', 'responses', 'analytics'].includes(p.resource)
      }))
    },
    manager: {
      name: 'Manager',
      description: 'Can edit forms but not delete them',
      permissions: defaultPermissions.map(p => ({
        ...p,
        granted: ['view', 'create', 'edit'].includes(p.action) && p.action !== 'delete'
      }))
    }
  };

  const updateUserRole = (userId: string, newRole: string, permissions?: Permission[]) => {
    const updatedUsers = adminUsers.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as any, permissions: permissions || undefined }
        : user
    );
    setAdminUsers(updatedUsers);
    
    updatedUsers.forEach(user => storage.saveAdminUser(user));
  };

  const createCustomRole = () => {
    if (!newRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    // For demo purposes, we'll just show the role creation
    alert(`Custom role "${newRole.name}" would be created with the selected permissions.`);
    setShowCreateRole(false);
    setNewRole({ name: '', permissions: [] });
  };

  const togglePermission = (index: number) => {
    const updatedPermissions = [...newRole.permissions];
    if (updatedPermissions[index]) {
      updatedPermissions[index] = { ...updatedPermissions[index], granted: !updatedPermissions[index].granted };
    } else {
      updatedPermissions[index] = { ...defaultPermissions[index], granted: true };
    }
    setNewRole({ ...newRole, permissions: updatedPermissions });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Team</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateRole(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Default Roles */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Default Roles</h2>
          <p className="text-gray-600 mt-1">Pre-defined roles with standard permissions</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(roleDefinitions).map(([key, role]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Permissions:</div>
                  {role.permissions.filter(p => p.granted).slice(0, 3).map((permission, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>{permission.action} {permission.resource}</span>
                    </div>
                  ))}
                  {role.permissions.filter(p => p.granted).length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{role.permissions.filter(p => p.granted).length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Role Assignments */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Role Assignments</h2>
          <p className="text-gray-600 mt-1">Assign roles to team members</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {adminUsers.map(user => (
            <div key={user.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                  <option value="custom">Custom</option>
                </select>
                
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'manager' ? 'bg-green-100 text-green-800' :
                  user.role === 'reviewer' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <Shield className="h-3 w-3" />
                  <span>{user.role}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Permission Matrix</h2>
          <p className="text-gray-600 mt-1">Overview of permissions by role</p>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-900">Permission</th>
                {Object.entries(roleDefinitions).map(([key, role]) => (
                  <th key={key} className="text-center py-2 px-3 font-medium text-gray-900">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defaultPermissions.map((permission, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">
                    {permission.action} {permission.resource}
                  </td>
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <td key={key} className="text-center py-2 px-3">
                      {role.permissions[index]?.granted ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Custom Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter role name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {defaultPermissions.map((permission, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissions[index]?.granted || false}
                        onChange={() => togglePermission(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {permission.action} {permission.resource}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRole(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCustomRole}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;