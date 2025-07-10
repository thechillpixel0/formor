import React, { useState } from 'react';
import { Plus, Mail, Shield, Trash2, Clock, UserCheck } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId, formatDate } from '../utils';
import { AdminUser, ActivityLog } from '../types';

const AdminUsers: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(storage.getAdminUsers());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(storage.getActivityLogs());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'viewer' as 'owner' | 'editor' | 'viewer',
    formAccess: [] as string[]
  });

  const forms = storage.getForms();

  const handleInvite = () => {
    if (!inviteForm.email.trim() || !inviteForm.name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if user already exists
    if (adminUsers.some(user => user.email === inviteForm.email)) {
      alert('User with this email already exists');
      return;
    }

    const newUser: AdminUser = {
      id: generateId(),
      email: inviteForm.email,
      name: inviteForm.name,
      role: inviteForm.role,
      formAccess: inviteForm.role === 'owner' ? forms.map(f => f.id) : inviteForm.formAccess,
      invitedBy: 'Current Admin',
      invitedAt: new Date().toISOString()
    };

    storage.saveAdminUser(newUser);
    setAdminUsers([...adminUsers, newUser]);

    // Log the activity
    const log: ActivityLog = {
      id: generateId(),
      userId: 'current-admin',
      action: 'invite_user',
      details: `Invited ${newUser.name} (${newUser.email}) as ${newUser.role}`,
      timestamp: new Date().toISOString()
    };
    storage.saveActivityLog(log);
    setActivityLogs([log, ...activityLogs]);

    setShowInviteModal(false);
    setInviteForm({
      email: '',
      name: '',
      role: 'viewer',
      formAccess: []
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to remove ${user.name}?`)) {
      storage.deleteAdminUser(userId);
      setAdminUsers(adminUsers.filter(u => u.id !== userId));

      // Log the activity
      const log: ActivityLog = {
        id: generateId(),
        userId: 'current-admin',
        action: 'remove_user',
        details: `Removed ${user.name} (${user.email})`,
        timestamp: new Date().toISOString()
      };
      storage.saveActivityLog(log);
      setActivityLogs([log, ...activityLogs]);
    }
  };

  const updateUserRole = (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    const user = adminUsers.find(u => u.id === userId);
    if (!user) return;

    const updatedUser = {
      ...user,
      role: newRole,
      formAccess: newRole === 'owner' ? forms.map(f => f.id) : user.formAccess
    };

    storage.saveAdminUser(updatedUser);
    setAdminUsers(adminUsers.map(u => u.id === userId ? updatedUser : u));

    // Log the activity
    const log: ActivityLog = {
      id: generateId(),
      userId: 'current-admin',
      action: 'update_role',
      details: `Changed ${user.name}'s role to ${newRole}`,
      timestamp: new Date().toISOString()
    };
    storage.saveActivityLog(log);
    setActivityLogs([log, ...activityLogs]);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Shield className="h-4 w-4" />;
      case 'editor': return <UserCheck className="h-4 w-4" />;
      case 'viewer': return <UserCheck className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage collaborators and their access permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <p className="text-gray-600 mt-1">{adminUsers.length} members</p>
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
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    Invited {formatDate(user.invitedAt)} by {user.invitedBy}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Access to {user.formAccess.length} form{user.formAccess.length !== 1 ? 's' : ''}
                </div>
                
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span>{user.role}</span>
                </span>
                
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          {adminUsers.length === 0 && (
            <div className="p-12 text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-4">Invite collaborators to help manage your forms</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Invite First User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 mt-1">Team management actions and changes</p>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {activityLogs.slice(0, 20).map(log => (
            <div key={log.id} className="p-4 flex items-center space-x-3">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">{log.details}</div>
                <div className="text-xs text-gray-500">{formatDate(log.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {activityLogs.length === 0 && (
            <div className="p-8 text-center">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer - Can view dashboards only</option>
                  <option value="editor">Editor - Can create and edit forms</option>
                  <option value="owner">Owner - Full access to everything</option>
                </select>
              </div>
              
              {inviteForm.role !== 'owner' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Access
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {forms.map(form => (
                      <label key={form.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={inviteForm.formAccess.includes(form.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInviteForm(prev => ({
                                ...prev,
                                formAccess: [...prev.formAccess, form.id]
                              }));
                            } else {
                              setInviteForm(prev => ({
                                ...prev,
                                formAccess: prev.formAccess.filter(id => id !== form.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{form.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;