import React, { useState } from 'react';
import { Save, Upload, Palette, Eye, EyeOff } from 'lucide-react';
import { storage } from '../utils/storage';
import { BrandSettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<BrandSettings>(storage.getBrandSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      storage.saveBrandSettings(settings);
      alert('Settings saved successfully!');
      // Reload the page to apply new branding
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Logo file must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSettings(prev => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      const defaultSettings: BrandSettings = {
        brandName: 'Formora',
        primaryColor: '#2563eb',
        showPoweredBy: true
      };
      setSettings(defaultSettings);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Customize your platform appearance and branding</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Preview Banner */}
      {previewMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Preview Mode</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            You're seeing how your changes will look. Save to apply them permanently.
          </p>
        </div>
      )}

      {/* Branding Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Brand Identity</h2>
          <p className="text-gray-600 mt-1">Customize your platform's visual identity</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your brand name"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will replace "Formora" throughout the platform
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              {settings.logoUrl && (
                <div className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG • Max 1MB</p>
              </div>
              {settings.logoUrl && (
                <button
                  onClick={() => setSettings(prev => ({ ...prev, logoUrl: undefined }))}
                  className="text-red-600 hover:text-red-700 text-sm transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#2563eb"
                />
              </div>
              <div className="flex space-x-2">
                {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSettings(prev => ({ ...prev, primaryColor: color }))}
                    className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This color will be used for buttons, links, and accents
            </p>
          </div>

          {/* Show Powered By */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showPoweredBy}
                onChange={(e) => setSettings(prev => ({ ...prev, showPoweredBy: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show "Powered by Formora" footer</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-6">
              Display attribution in the footer of your forms
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          <p className="text-gray-600 mt-1">See how your branding will look</p>
        </div>
        
        <div className="p-6">
          <div 
            className="border border-gray-200 rounded-lg overflow-hidden"
            style={previewMode ? { '--primary-color': settings.primaryColor } as any : {}}
          >
            {/* Preview Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center space-x-2">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.brandName} className="h-8 w-8" />
                ) : (
                  <Palette className="h-8 w-8" style={{ color: settings.primaryColor }} />
                )}
                <span className="text-xl font-bold text-gray-900">{settings.brandName}</span>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Quiz</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-medium text-gray-900 mb-2">What is the capital of France?</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="preview" className="text-blue-600" />
                      <span>Paris</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="preview" className="text-blue-600" />
                      <span>London</span>
                    </label>
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-white rounded-md transition-colors"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Submit Quiz
                </button>
              </div>
            </div>
            
            {/* Preview Footer */}
            {settings.showPoweredBy && (
              <div className="bg-white border-t p-4 text-center">
                <p className="text-sm text-gray-500">
                  Powered by <span className="font-medium">Formora</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Settings</h2>
          <p className="text-gray-600 mb-4">
            Reset all customizations back to default Formora branding
          </p>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;