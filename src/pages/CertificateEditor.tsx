import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Download, Upload, Move, Type, Image as ImageIcon, Palette } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import { Certificate, CertificateTemplate } from '../types';

const CertificateEditor: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate>({
    id: generateId(),
    name: 'Default Certificate',
    layout: {
      title: { text: 'Certificate of Completion', x: 50, y: 20, fontSize: 32, color: '#1f2937' },
      recipientName: { x: 50, y: 40, fontSize: 24, color: '#374151' },
      score: { x: 50, y: 55, fontSize: 18, color: '#6b7280', show: true },
      date: { x: 50, y: 70, fontSize: 16, color: '#6b7280' },
      formTitle: { x: 50, y: 85, fontSize: 20, color: '#374151' }
    }
  });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState({
    recipientName: 'John Doe',
    score: '85',
    maxScore: '100',
    date: new Date().toLocaleDateString(),
    formTitle: 'Sample Quiz'
  });

  const form = storage.getForm(formId!);

  useEffect(() => {
    if (formId) {
      const existingCert = storage.getCertificate(formId);
      if (existingCert) {
        setCertificate(existingCert);
        setTemplate(existingCert.template);
      }
      
      if (form) {
        setPreviewData(prev => ({ ...prev, formTitle: form.title }));
      }
    }
  }, [formId, form]);

  const handleSave = () => {
    if (!formId) return;

    const certData: Certificate = {
      id: certificate?.id || generateId(),
      formId,
      template,
      createdAt: certificate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveCertificate(certData);
    setCertificate(certData);
    alert('Certificate template saved successfully!');
  };

  const handleImageUpload = (type: 'background' | 'logo' | 'signature', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTemplate(prev => ({
        ...prev,
        [`${type}Image`]: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateElementPosition = (element: string, x: number, y: number) => {
    setTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [element]: {
          ...prev.layout[element as keyof typeof prev.layout],
          x,
          y
        }
      }
    }));
  };

  const updateElementStyle = (element: string, property: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [element]: {
          ...prev.layout[element as keyof typeof prev.layout],
          [property]: value
        }
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Certificate Editor</h1>
            <p className="text-gray-600">{form.title}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Certificate Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate Preview</h2>
            
            <div 
              className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
              style={{
                backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Logo */}
              {template.logoImage && (
                <img
                  src={template.logoImage}
                  alt="Logo"
                  className="absolute w-16 h-16 object-contain"
                  style={{ top: '10px', left: '10px' }}
                />
              )}

              {/* Title */}
              <div
                className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 p-2 rounded"
                style={{
                  left: `${template.layout.title.x}%`,
                  top: `${template.layout.title.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${template.layout.title.fontSize}px`,
                  color: template.layout.title.color,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
                onClick={() => setSelectedElement('title')}
              >
                {template.layout.title.text}
              </div>

              {/* Recipient Name */}
              <div
                className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 p-2 rounded"
                style={{
                  left: `${template.layout.recipientName.x}%`,
                  top: `${template.layout.recipientName.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${template.layout.recipientName.fontSize}px`,
                  color: template.layout.recipientName.color,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
                onClick={() => setSelectedElement('recipientName')}
              >
                {previewData.recipientName}
              </div>

              {/* Score */}
              {template.layout.score.show && (
                <div
                  className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 p-2 rounded"
                  style={{
                    left: `${template.layout.score.x}%`,
                    top: `${template.layout.score.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${template.layout.score.fontSize}px`,
                    color: template.layout.score.color,
                    textAlign: 'center'
                  }}
                  onClick={() => setSelectedElement('score')}
                >
                  Score: {previewData.score}/{previewData.maxScore} ({Math.round((parseInt(previewData.score) / parseInt(previewData.maxScore)) * 100)}%)
                </div>
              )}

              {/* Date */}
              <div
                className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 p-2 rounded"
                style={{
                  left: `${template.layout.date.x}%`,
                  top: `${template.layout.date.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${template.layout.date.fontSize}px`,
                  color: template.layout.date.color,
                  textAlign: 'center'
                }}
                onClick={() => setSelectedElement('date')}
              >
                {previewData.date}
              </div>

              {/* Form Title */}
              <div
                className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 p-2 rounded"
                style={{
                  left: `${template.layout.formTitle.x}%`,
                  top: `${template.layout.formTitle.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${template.layout.formTitle.fontSize}px`,
                  color: template.layout.formTitle.color,
                  textAlign: 'center'
                }}
                onClick={() => setSelectedElement('formTitle')}
              >
                {previewData.formTitle}
              </div>

              {/* Signature */}
              {template.signatureImage && (
                <img
                  src={template.signatureImage}
                  alt="Signature"
                  className="absolute w-32 h-16 object-contain"
                  style={{ bottom: '20px', right: '20px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Template Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Background</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('background', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature
                </label>
                <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload Signature</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('signature', e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Element Editor */}
          {selectedElement && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit {selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}
              </h3>
              
              <div className="space-y-4">
                {selectedElement === 'title' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Text
                    </label>
                    <input
                      type="text"
                      value={template.layout.title.text}
                      onChange={(e) => updateElementStyle('title', 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={template.layout[selectedElement as keyof typeof template.layout].x}
                      onChange={(e) => updateElementPosition(selectedElement, parseInt(e.target.value), template.layout[selectedElement as keyof typeof template.layout].y)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y Position (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={template.layout[selectedElement as keyof typeof template.layout].y}
                      onChange={(e) => updateElementPosition(selectedElement, template.layout[selectedElement as keyof typeof template.layout].x, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={template.layout[selectedElement as keyof typeof template.layout].fontSize}
                    onChange={(e) => updateElementStyle(selectedElement, 'fontSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={template.layout[selectedElement as keyof typeof template.layout].color}
                    onChange={(e) => updateElementStyle(selectedElement, 'color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>

                {selectedElement === 'score' && (
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={template.layout.score.show}
                        onChange={(e) => updateElementStyle('score', 'show', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show Score</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={previewData.recipientName}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
                  </label>
                  <input
                    type="number"
                    value={previewData.score}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, score: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={previewData.maxScore}
                    onChange={(e) => setPreviewData(prev => ({ ...prev, maxScore: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateEditor;