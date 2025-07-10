import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Bell, MessageSquare } from 'lucide-react';
import { storage } from '../utils/storage';
import { NotificationSettings } from '../types';

const NotificationSettingsPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailOnSubmission: false,
    emailSubject: 'Thank you for your submission',
    emailBody: 'Dear {{name}},\n\nThank you for completing {{formTitle}}.\n\nBest regards,\nThe Team',
    adminNotification: true,
    successBanner: {
      enabled: true,
      message: 'Thank you for your submission!',
      type: 'success'
    }
  });

  const form = storage.getForm(formId!);

  useEffect(() => {
    if (form?.notificationSettings) {
      setSettings(form.notificationSettings);
    }
  }, [form]);

  const saveSettings = () => {
    if (!form) return;

    const updatedForm = {
      ...form,
      notificationSettings: settings,
      updatedAt: new Date().toISOString()
    };

    storage.saveForm(updatedForm);
    alert('Notification settings saved successfully!');
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
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">{form.title}</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.emailOnSubmission}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailOnSubmission: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Send email to user on submission</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Automatically send a confirmation email when users submit the form
              </p>
            </div>

            {settings.emailOnSubmission && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={settings.emailSubject}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailSubject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thank you for your submission"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body
                  </label>
                  <textarea
                    value={settings.emailBody}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailBody: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email content..."
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium mb-1">Available variables:</p>
                    <ul className="space-y-1">
                      <li><code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> - User's name</li>
                      <li><code className="bg-gray-100 px-1 rounded">{'{{email}}'}</code> - User's email</li>
                      <li><code className="bg-gray-100 px-1 rounded">{'{{formTitle}}'}</code> - Form title</li>
                      <li><code className="bg-gray-100 px-1 rounded">{'{{score}}'}</code> - Quiz score (if applicable)</li>
                      <li><code className="bg-gray-100 px-1 rounded">{'{{maxScore}}'}</code> - Maximum score (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.adminNotification}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminNotification: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Send notification to admin</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Receive notifications when users submit responses
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Success Banner</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.successBanner.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    successBanner: { ...prev.successBanner, enabled: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show success banner</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Display a banner message after successful form submission
              </p>
            </div>

            {settings.successBanner.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Message
                  </label>
                  <input
                    type="text"
                    value={settings.successBanner.message}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      successBanner: { ...prev.successBanner, message: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thank you for your submission!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Type
                  </label>
                  <select
                    value={settings.successBanner.type}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      successBanner: { ...prev.successBanner, type: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="success">Success (Green)</option>
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                  </select>
                </div>

                {/* Banner Preview */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className={`p-3 rounded-md ${
                    settings.successBanner.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    settings.successBanner.type === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                    'bg-yellow-50 border border-yellow-200 text-yellow-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>{settings.successBanner.message}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Email Preview */}
      {settings.emailOnSubmission && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Preview</h2>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Subject:</div>
              <div className="font-medium">{settings.emailSubject}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Body:</div>
              <div className="whitespace-pre-wrap text-gray-800">
                {settings.emailBody
                  .replace(/\{\{name\}\}/g, 'John Doe')
                  .replace(/\{\{email\}\}/g, 'john@example.com')
                  .replace(/\{\{formTitle\}\}/g, form.title)
                  .replace(/\{\{score\}\}/g, '85')
                  .replace(/\{\{maxScore\}\}/g, '100')
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsPage;