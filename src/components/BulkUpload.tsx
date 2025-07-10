import React, { useState } from 'react';
import { Upload, Download, Eye, Check } from 'lucide-react';
import { BulkQuestion, Question, QuestionType } from '../types';
import { generateId, parseCSV } from '../utils';

interface BulkUploadProps {
  onQuestionsImport: (questions: Question[]) => void;
  formId: string;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onQuestionsImport, formId }) => {
  const [uploadedQuestions, setUploadedQuestions] = useState<BulkQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let questions: BulkQuestion[] = [];

        if (file.type === 'application/json') {
          questions = JSON.parse(content);
        } else if (file.type === 'text/csv') {
          const parsed = parseCSV(content);
          questions = parsed.map(row => ({
            question: row.question || '',
            type: (row.type || 'short_text') as QuestionType,
            options: row.options ? row.options.split('|') : [],
            correctAnswer: row.correctAnswer || undefined,
            points: parseInt(row.points) || 1,
            explanation: row.explanation || '',
            source: row.source || ''
          }));
        }

        setUploadedQuestions(questions);
        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        question: "What is the capital of France?",
        type: "mcq",
        options: "Paris|London|Berlin|Madrid",
        correctAnswer: "Paris",
        points: "2",
        explanation: "Paris is the capital and largest city of France.",
        source: "Geography"
      },
      {
        question: "The Earth is flat.",
        type: "true_false",
        options: "True|False",
        correctAnswer: "False",
        points: "1",
        explanation: "The Earth is approximately spherical in shape.",
        source: "Science"
      },
      {
        question: "Describe the water cycle",
        type: "paragraph",
        options: "",
        correctAnswer: "Evaporation, condensation, precipitation, collection",
        points: "3",
        explanation: "The water cycle involves evaporation, condensation, precipitation, and collection.",
        source: "Science"
      }
    ];

    const csvContent = [
      'question,type,options,correctAnswer,points,explanation,source',
      ...template.map(q => `"${q.question}","${q.type}","${q.options}","${q.correctAnswer}","${q.points}","${q.explanation}","${q.source}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formora-quiz-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmImport = () => {
    const questions: Question[] = uploadedQuestions.map((q, index) => ({
      id: generateId(),
      formId,
      text: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation,
      source: q.source,
      order: index,
      required: true
    }));

    onQuestionsImport(questions);
    setUploadedQuestions([]);
    setShowPreview(false);
  };

  const editQuestion = (index: number, field: keyof BulkQuestion, value: any) => {
    const updated = [...uploadedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setUploadedQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setUploadedQuestions(uploadedQuestions.filter((_, i) => i !== index));
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Preview Uploaded Questions ({uploadedQuestions.length})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmImport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Confirm Import</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {uploadedQuestions.map((question, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => editQuestion(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => editQuestion(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="short_text">Short Text</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => editQuestion(index, 'points', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source/Topic
                  </label>
                  <input
                    type="text"
                    value={question.source}
                    onChange={(e) => editQuestion(index, 'source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {(question.type === 'mcq' || question.type === 'dropdown') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options (separated by |)
                    </label>
                    <input
                      type="text"
                      value={question.options.join('|')}
                      onChange={(e) => editQuestion(index, 'options', e.target.value.split('|'))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Option 1|Option 2|Option 3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={question.correctAnswer || ''}
                    onChange={(e) => editQuestion(index, 'correctAnswer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation
                  </label>
                  <input
                    type="text"
                    value={question.explanation || ''}
                    onChange={(e) => editQuestion(index, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={() => removeQuestion(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Upload Questions</h3>
        <p className="text-gray-600">Upload questions from CSV or JSON file</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="w-full max-w-md">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or JSON files</p>
            </div>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </button>
          
          <button
            onClick={() => setShowPreview(true)}
            disabled={uploadedQuestions.length === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Processing file...</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">File Format Requirements:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSV: question, type, options (separated by |), correctAnswer, points, explanation, source</li>
          <li>• JSON: Array of objects with question, type, options, correctAnswer, points, explanation, source</li>
          <li>• Supported types: mcq, true_false, dropdown, short_text, paragraph, rating</li>
          <li>• For quiz mode: include correctAnswer and points fields</li>
          <li>• For survey mode: correctAnswer and points are optional</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkUpload;