import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { generateId } from '../utils';
import { Plus, Trash2, GripVertical, CheckCircle, Award, Copy, Upload, X } from 'lucide-react';

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
    options: ['Option 1', 'Option 2'],
    correctAnswer: '',
    points: 1,
    explanation: '',
    source: '',
    required: true
  });

  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const questionTypes: { value: QuestionType; label: string; description: string }[] = [
    { value: 'mcq', label: 'Multiple Choice', description: 'Single correct answer from multiple options' },
    { value: 'true_false', label: 'True/False', description: 'Simple true or false question' },
    { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown menu' },
    { value: 'short_text', label: 'Short Text', description: 'Brief text response' },
    { value: 'paragraph', label: 'Paragraph', description: 'Long text response' },
    { value: 'rating', label: 'Rating (1-5)', description: 'Rate on a scale of 1 to 5' },
    { value: 'file_upload', label: 'File Upload', description: 'Upload documents or images' }
  ];

  const addQuestion = () => {
    if (!newQuestion.text?.trim()) {
      alert('Please enter a question text');
      return;
    }

    // Validate options for choice-based questions
    if ((newQuestion.type === 'mcq' || newQuestion.type === 'dropdown') && 
        (!newQuestion.options || newQuestion.options.filter(opt => opt.trim()).length < 2)) {
      alert('Please provide at least 2 options');
      return;
    }

    // Validate correct answer for quiz mode
    if (isQuizMode && (newQuestion.type === 'mcq' || newQuestion.type === 'dropdown' || newQuestion.type === 'true_false')) {
      if (!newQuestion.correctAnswer) {
        alert('Please select the correct answer');
        return;
      }
    }

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
    
    // Reset form but keep type and some defaults
    setNewQuestion({
      text: '',
      type: newQuestion.type,
      options: newQuestion.type === 'mcq' || newQuestion.type === 'dropdown' ? ['Option 1', 'Option 2'] : 
               newQuestion.type === 'true_false' ? ['True', 'False'] : [],
      correctAnswer: '',
      points: 1,
      explanation: '',
      source: newQuestion.source,
      required: true
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onQuestionsChange(
      questions.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      onQuestionsChange(questions.filter(q => q.id !== id));
    }
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const duplicated = {
        ...question,
        id: generateId(),
        text: `${question.text} (Copy)`,
        order: questions.length
      };
      onQuestionsChange([...questions, duplicated]);
    }
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    // Update order
    newQuestions.forEach((q, i) => q.order = i);
    onQuestionsChange(newQuestions);
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
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
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.trim().split('\n');
    const newQuestions: Question[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Parse different formats
      let questionText = '';
      let options: string[] = [];
      let correctAnswer = '';

      // Format: "Question? a) Option1 b) Option2 c) Option3 *d) CorrectOption"
      if (trimmedLine.includes(')')) {
        const parts = trimmedLine.split(/[a-z]\)/);
        questionText = parts[0].trim();
        
        for (let i = 1; i < parts.length; i++) {
          const option = parts[i].trim();
          if (option.startsWith('*')) {
            const cleanOption = option.substring(1).trim();
            options.push(cleanOption);
            correctAnswer = cleanOption;
          } else if (option) {
            options.push(option);
          }
        }
      } else {
        // Simple format: just the question
        questionText = trimmedLine;
        options = ['Option 1', 'Option 2', 'Option 3'];
      }

      if (questionText) {
        const question: Question = {
          id: generateId(),
          formId,
          text: questionText,
          type: options.length > 0 ? 'mcq' : 'short_text',
          options,
          correctAnswer: isQuizMode ? correctAnswer : undefined,
          points: isQuizMode ? 1 : 0,
          explanation: '',
          source: '',
          order: questions.length + newQuestions.length,
          required: true
        };
        newQuestions.push(question);
      }
    });

    if (newQuestions.length > 0) {
      onQuestionsChange([...questions, ...newQuestions]);
      setBulkText('');
      setShowBulkImport(false);
      alert(`Successfully imported ${newQuestions.length} questions!`);
    }
  };

  const needsOptions = (type: QuestionType) => {
    return type === 'mcq' || type === 'dropdown';
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
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                </div>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => duplicateQuestion(question.id)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Duplicate question"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your question..."
                  rows={2}
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
                    } else if (needsOptions(newType) && question.options.length === 0) {
                      updates.options = ['Option 1', 'Option 2'];
                    } else if (!needsOptions(newType) && newType !== 'true_false') {
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
                        {question.type !== 'true_false' && question.options.length > 2 && (
                          <button
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Question</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBulkImport(!showBulkImport)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>

        {showBulkImport && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Bulk Import Questions</h4>
            <p className="text-sm text-gray-600 mb-3">
              Enter questions one per line. Format: "Question? a) Option1 b) Option2 *c) CorrectOption"
              <br />Use * to mark the correct answer for quiz mode.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What is 2+2? a) 3 b) *4 c) 5&#10;What is the capital of France? a) London b) *Paris c) Berlin"
            />
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Import Questions
              </button>
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={newQuestion.text || ''}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question..."
              rows={2}
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
                  updates.options = ['Option 1', 'Option 2'];
                } else {
                  updates.options = [];
                }
                
                setNewQuestion({ ...newQuestion, ...updates });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value} title={type.description}>
                  {type.label}
                </option>
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

          {(needsOptions(newQuestion.type || 'mcq') || newQuestion.type === 'true_false') && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(newQuestion.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[optionIndex] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${optionIndex + 1}`}
                      disabled={newQuestion.type === 'true_false'}
                    />
                    {isQuizMode && (
                      <label className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name="new-correct"
                          checked={newQuestion.correctAnswer === option}
                          onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: option })}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </label>
                    )}
                    {newQuestion.type !== 'true_false' && (newQuestion.options?.length || 0) > 2 && (
                      <button
                        onClick={() => {
                          const newOptions = (newQuestion.options || []).filter((_, index) => index !== optionIndex);
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {newQuestion.type !== 'true_false' && (
                  <button
                    onClick={() => {
                      const newOptions = [...(newQuestion.options || []), `Option ${(newQuestion.options?.length || 0) + 1}`];
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>
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