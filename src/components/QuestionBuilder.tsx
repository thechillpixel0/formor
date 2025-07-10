import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { generateId } from '../utils';
import { Plus, Trash2, GripVertical, CheckCircle, Award } from 'lucide-react';

interface QuestionBuilderProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  formId: string;
  isQuizMode: boolean;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onQuestionsChange,
  formId,
  isQuizMode
}) => {
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'mcq',
    options: [''],
    correctAnswer: '',
    points: 1,
    explanation: '',
    source: '',
    required: true
  });

  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'short_text', label: 'Short Text' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'file_upload', label: 'File Upload' }
  ];

  const addQuestion = () => {
    if (!newQuestion.text?.trim()) return;

    const question: Question = {
      id: generateId(),
      formId,
      text: newQuestion.text,
      type: newQuestion.type as QuestionType,
      options: newQuestion.options || [],
      correctAnswer: isQuizMode ? newQuestion.correctAnswer : undefined,
      points: isQuizMode ? (newQuestion.points || 1) : 0,
      explanation: isQuizMode ? newQuestion.explanation : undefined,
      source: newQuestion.source || '',
      order: questions.length,
      required: newQuestion.required || false
    };

    onQuestionsChange([...questions, question]);
    setNewQuestion({
      text: '',
      type: 'mcq',
      options: [''],
      correctAnswer: '',
      points: 1,
      explanation: '',
      source: '',
      required: true
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onQuestionsChange(
      questions.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, '']
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const needsOptions = (type: QuestionType) => {
    return type === 'mcq' || type === 'dropdown';
  };

  const needsFileConfig = (type: QuestionType) => {
    return type === 'file_upload';
  };

  const getTrueFalseOptions = () => ['True', 'False'];

  return (
    <div className="space-y-6">
      {/* Existing Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">
                  Question {index + 1}
                </span>
                {isQuizMode && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">{question.points} pts</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => {
                    const newType = e.target.value as QuestionType;
                    const updates: Partial<Question> = { type: newType };
                    
                    if (newType === 'true_false') {
                      updates.options = getTrueFalseOptions();
                    } else if (!needsOptions(newType)) {
                      updates.options = [];
                    }
                    
                    updateQuestion(question.id, updates);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source/Topic
                </label>
                <input
                  type="text"
                  value={question.source}
                  onChange={(e) => updateQuestion(question.id, { source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Math, Science, History"
                />
              </div>

              {isQuizMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {(needsOptions(question.type) || question.type === 'true_false') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {(question.type === 'true_false' ? getTrueFalseOptions() : question.options).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Option ${optionIndex + 1}`}
                          disabled={question.type === 'true_false'}
                        />
                        {isQuizMode && (
                          <label className="flex items-center space-x-1">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === option}
                              onChange={() => updateQuestion(question.id, { correctAnswer: option })}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </label>
                        )}
                        {question.type !== 'true_false' && (
                          <button
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.type !== 'true_false' && (
                      <button
                        onClick={() => addOption(question.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isQuizMode && question.type === 'rating' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer (1-5)
                  </label>
                  <select
                    value={question.correctAnswer || ''}
                    onChange={(e) => updateQuestion(question.id, { correctAnswer: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select correct rating...</option>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              )}

              {isQuizMode && (question.type === 'short_text' || question.type === 'paragraph') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Correct Answer
                  </label>
                  <input
                    type="text"
                    value={question.correctAnswer || ''}
                    onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a sample correct answer for reference..."
                  />
                </div>
              )}

              {isQuizMode && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>
              )}

              {needsFileConfig(question.type) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload Settings
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max File Size (MB)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={question.fileUploadConfig?.maxFileSize || 5}
                        onChange={(e) => updateQuestion(question.id, {
                          fileUploadConfig: {
                            ...question.fileUploadConfig,
                            maxFileSize: parseInt(e.target.value) || 5,
                            allowedFormats: question.fileUploadConfig?.allowedFormats || ['.pdf', '.jpg', '.png'],
                            multiple: question.fileUploadConfig?.multiple || false
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Allowed Formats</label>
                      <input
                        type="text"
                        value={question.fileUploadConfig?.allowedFormats?.join(', ') || '.pdf, .jpg, .png'}
                        onChange={(e) => updateQuestion(question.id, {
                          fileUploadConfig: {
                            ...question.fileUploadConfig,
                            maxFileSize: question.fileUploadConfig?.maxFileSize || 5,
                            allowedFormats: e.target.value.split(',').map(f => f.trim()),
                            multiple: question.fileUploadConfig?.multiple || false
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder=".pdf, .jpg, .png"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={question.fileUploadConfig?.multiple || false}
                          onChange={(e) => updateQuestion(question.id, {
                            fileUploadConfig: {
                              ...question.fileUploadConfig,
                              maxFileSize: question.fileUploadConfig?.maxFileSize || 5,
                              allowedFormats: question.fileUploadConfig?.allowedFormats || ['.pdf', '.jpg', '.png'],
                              multiple: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Multiple files</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Question */}
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <input
              type="text"
              value={newQuestion.text || ''}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={newQuestion.type || 'mcq'}
              onChange={(e) => {
                const newType = e.target.value as QuestionType;
                const updates: Partial<Question> = { type: newType };
                
                if (newType === 'true_false') {
                  updates.options = getTrueFalseOptions();
                } else if (needsOptions(newType)) {
                  updates.options = [''];
                } else {
                  updates.options = [];
                }
                
                if (needsFileConfig(newType)) {
                  updates.fileUploadConfig = {
                    maxFileSize: 5,
                    allowedFormats: ['.pdf', '.jpg', '.png'],
                    multiple: false
                  };
                }
                
                if (needsFileConfig(newType)) {
                  updates.fileUploadConfig = {
                    maxFileSize: 5,
                    allowedFormats: ['.pdf', '.jpg', '.png'],
                    multiple: false
                  };
                }
                
                setNewQuestion({ ...newQuestion, ...updates });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source/Topic
            </label>
            <input
              type="text"
              value={newQuestion.source || ''}
              onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Math, Science, History"
            />
          </div>

          {isQuizMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                value={newQuestion.points || 1}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={addQuestion}
            disabled={!newQuestion.text?.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionBuilder;