import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Zap, Settings } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import { ConditionalRule } from '../types';

const FormLogic: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [rules, setRules] = useState<ConditionalRule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);

  const form = storage.getForm(formId!);
  const questions = storage.getQuestions(formId!);

  useEffect(() => {
    if (form?.conditionalLogic) {
      setRules(form.conditionalLogic);
    }
  }, [form]);

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: generateId(),
      condition: {
        type: 'score',
        operator: 'greater_than',
        value: 80
      },
      action: {
        type: 'show_message',
        value: 'Congratulations! You passed!'
      }
    };
    setRules([...rules, newRule]);
    setShowAddRule(false);
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const saveRules = () => {
    if (!form) return;

    const updatedForm = {
      ...form,
      conditionalLogic: rules,
      updatedAt: new Date().toISOString()
    };

    storage.saveForm(updatedForm);
    alert('Logic rules saved successfully!');
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
            <h1 className="text-3xl font-bold text-gray-900">Form Logic</h1>
            <p className="text-gray-600">{form.title}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddRule(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
          <button
            onClick={saveRules}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={rule.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Rule {index + 1}</h3>
              </div>
              <button
                onClick={() => deleteRule(rule.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">When (Condition)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Type
                  </label>
                  <select
                    value={rule.condition.type}
                    onChange={(e) => updateRule(rule.id, {
                      condition: { ...rule.condition, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="score">Score</option>
                    <option value="question_answer">Question Answer</option>
                    <option value="completion">Form Completion</option>
                  </select>
                </div>

                {rule.condition.type === 'question_answer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question
                    </label>
                    <select
                      value={rule.condition.questionId || ''}
                      onChange={(e) => updateRule(rule.id, {
                        condition: { ...rule.condition, questionId: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a question</option>
                      {questions.map(q => (
                        <option key={q.id} value={q.id}>{q.text}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operator
                  </label>
                  <select
                    value={rule.condition.operator}
                    onChange={(e) => updateRule(rule.id, {
                      condition: { ...rule.condition, operator: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="equals">Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type={rule.condition.type === 'score' ? 'number' : 'text'}
                    value={rule.condition.value}
                    onChange={(e) => updateRule(rule.id, {
                      condition: { ...rule.condition, value: rule.condition.type === 'score' ? parseInt(e.target.value) : e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={rule.condition.type === 'score' ? 'e.g., 80' : 'e.g., Yes'}
                  />
                </div>
              </div>

              {/* Action */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Then (Action)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Type
                  </label>
                  <select
                    value={rule.action.type}
                    onChange={(e) => updateRule(rule.id, {
                      action: { ...rule.action, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="show_message">Show Message</option>
                    <option value="redirect">Redirect to URL</option>
                    <option value="skip_question">Skip Question</option>
                    <option value="send_email">Send Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {rule.action.type === 'show_message' ? 'Message' :
                     rule.action.type === 'redirect' ? 'URL' :
                     rule.action.type === 'skip_question' ? 'Question to Skip' :
                     'Email Template'}
                  </label>
                  {rule.action.type === 'skip_question' ? (
                    <select
                      value={rule.action.value}
                      onChange={(e) => updateRule(rule.id, {
                        action: { ...rule.action, value: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a question</option>
                      {questions.map(q => (
                        <option key={q.id} value={q.id}>{q.text}</option>
                      ))}
                    </select>
                  ) : rule.action.type === 'show_message' ? (
                    <textarea
                      value={rule.action.value}
                      onChange={(e) => updateRule(rule.id, {
                        action: { ...rule.action, value: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the message to display"
                    />
                  ) : (
                    <input
                      type="text"
                      value={rule.action.value}
                      onChange={(e) => updateRule(rule.id, {
                        action: { ...rule.action, value: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={rule.action.type === 'redirect' ? 'https://example.com' : 'Email template'}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Rule Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Rule:</strong> When {rule.condition.type === 'score' ? 'score' : rule.condition.type === 'question_answer' ? 'question answer' : 'form completion'} {rule.condition.operator.replace('_', ' ')} "{rule.condition.value}", then {rule.action.type.replace('_', ' ')} "{rule.action.value}"
              </p>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Logic Rules</h3>
            <p className="text-gray-600 mb-4">Add conditional logic to make your forms more interactive</p>
            <button
              onClick={() => setShowAddRule(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Rule</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Rule</h3>
            <p className="text-gray-600 mb-4">
              Create conditional logic to make your form more interactive and personalized.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddRule(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormLogic;