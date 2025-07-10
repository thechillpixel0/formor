import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2, Eye, ExternalLink } from 'lucide-react';
import { storage } from '../utils/storage';
import { CustomEndPage as CustomEndPageType } from '../types';

const CustomEndPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [endPage, setEndPage] = useState<CustomEndPageType>({
    enabled: false,
    heading: 'Thank You!',
    message: 'Your response has been submitted successfully.',
    ctaButtons: [],
    showScore: true,
    showCertificateDownload: true
  });
  const [showPreview, setShowPreview] = useState(false);

  const form = storage.getForm(formId!);

  useEffect(() => {
    if (form?.customEndPage) {
      setEndPage(form.customEndPage);
    }
  }, [form]);

  const saveEndPage = () => {
    if (!form) return;

    const updatedForm = {
      ...form,
      customEndPage: endPage,
      updatedAt: new Date().toISOString()
    };

    storage.saveForm(updatedForm);
    alert('Custom end page saved successfully!');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEndPage(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const addCTAButton = () => {
    setEndPage(prev => ({
      ...prev,
      ctaButtons: [
        ...prev.ctaButtons,
        { text: 'Learn More', url: 'https://example.com', type: 'primary' }
      ]
    }));
  };

  const updateCTAButton = (index: number, updates: Partial<typeof endPage.ctaButtons[0]>) => {
    setEndPage(prev => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((btn, i) => 
        i === index ? { ...btn, ...updates } : btn
      )
    }));
  };

  const removeCTAButton = (index: number) => {
    setEndPage(prev => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index)
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">Custom End Page</h1>
            <p className="text-gray-600">{form.title}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={saveEndPage}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Page</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Page Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={endPage.enabled}
                    onChange={(e) => setEndPage(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable custom end page</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Replace the default thank you page with a custom design
                </p>
              </div>
            </div>
          </div>

          {endPage.enabled && (
            <>
              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading
                    </label>
                    <input
                      type="text"
                      value={endPage.heading}
                      onChange={(e) => setEndPage(prev => ({ ...prev, heading: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Thank You!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={endPage.message}
                      onChange={(e) => setEndPage(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your response has been submitted successfully."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <div className="flex items-center space-x-4">
                      {endPage.image && (
                        <img 
                          src={endPage.image} 
                          alt="End page" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {endPage.image && (
                        <button
                          onClick={() => setEndPage(prev => ({ ...prev, image: undefined }))}
                          className="text-red-600 hover:text-red-700 text-sm transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Display Options</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={endPage.showScore}
                        onChange={(e) => setEndPage(prev => ({ ...prev, showScore: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Show score (for quizzes)</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={endPage.showCertificateDownload}
                        onChange={(e) => setEndPage(prev => ({ ...prev, showCertificateDownload: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Show certificate download</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Call-to-Action Buttons</h2>
                  <button
                    onClick={addCTAButton}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Button</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {endPage.ctaButtons.map((button, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Button {index + 1}</h4>
                        <button
                          onClick={() => removeCTAButton(index)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={button.text}
                            onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Learn More"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL
                          </label>
                          <input
                            type="url"
                            value={button.url}
                            onChange={(e) => updateCTAButton(index, { url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button Style
                          </label>
                          <select
                            value={button.type}
                            onChange={(e) => updateCTAButton(index, { type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="primary">Primary (Blue)</option>
                            <option value="secondary">Secondary (Gray)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {endPage.ctaButtons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No buttons added yet. Click "Add Button" to create one.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        {showPreview && endPage.enabled && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            
            <div className="border rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center space-y-6">
                {endPage.image && (
                  <img 
                    src={endPage.image} 
                    alt="End page" 
                    className="w-24 h-24 object-cover rounded-full mx-auto"
                  />
                )}
                
                <h1 className="text-3xl font-bold text-gray-900">{endPage.heading}</h1>
                
                <p className="text-gray-600 max-w-md mx-auto">{endPage.message}</p>
                
                {endPage.showScore && form.type === 'quiz' && (
                  <div className="bg-white rounded-lg p-4 inline-block">
                    <div className="text-sm text-gray-600">Your Score</div>
                    <div className="text-2xl font-bold text-blue-600">85/100 (85%)</div>
                  </div>
                )}
                
                {endPage.showCertificateDownload && (
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Download Certificate
                  </button>
                )}
                
                {endPage.ctaButtons.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {endPage.ctaButtons.map((button, index) => (
                      <a
                        key={index}
                        href={button.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                          button.type === 'primary'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        <span>{button.text}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomEndPage;