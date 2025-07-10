import React, { useState } from 'react';
import { Plus, Save, Play, Pause, Trash2, Settings, ArrowRight, Clock, Mail, FileText, GitBranch } from 'lucide-react';
import { storage } from '../utils/storage';
import { generateId } from '../utils';
import { Workflow, WorkflowStep } from '../types';

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(storage.getWorkflows());
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  const forms = storage.getForms();

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const newWorkflow: Workflow = {
      id: generateId(),
      name: newWorkflowName,
      description: newWorkflowDescription,
      steps: [],
      isActive: false,
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkflow(newWorkflow);
    setWorkflows([...workflows, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setShowCreateModal(false);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
  };

  const addStep = (type: 'form' | 'delay' | 'condition' | 'action') => {
    if (!selectedWorkflow) return;

    const newStep: WorkflowStep = {
      id: generateId(),
      type,
      order: selectedWorkflow.steps.length,
      ...(type === 'form' && { formId: forms[0]?.id }),
      ...(type === 'delay' && { delay: 1 }),
      ...(type === 'action' && { 
        action: { 
          type: 'email', 
          config: { 
            subject: 'Thank you!', 
            body: 'Thank you for completing our form.' 
          } 
        } 
      })
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep],
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkflow(updatedWorkflow);
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkflow(updatedWorkflow);
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  };

  const deleteStep = (stepId: string) => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(step => step.id !== stepId),
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkflow(updatedWorkflow);
    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  };

  const toggleWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const updatedWorkflow = {
      ...workflow,
      isActive: !workflow.isActive,
      updatedAt: new Date().toISOString()
    };

    storage.saveWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === workflowId ? updatedWorkflow : w));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(updatedWorkflow);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'delay': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'condition': return <GitBranch className="h-5 w-5 text-purple-600" />;
      case 'action': return <Mail className="h-5 w-5 text-green-600" />;
      default: return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Builder</h1>
          <p className="text-gray-600 mt-1">Create automated sequences and follow-up actions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflows List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Workflows</h2>
            <p className="text-gray-600 mt-1">{workflows.length} workflows created</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {workflows.map(workflow => (
              <div 
                key={workflow.id} 
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedWorkflow?.id === workflow.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflow(workflow.id);
                      }}
                      className={`p-1 rounded ${
                        workflow.isActive 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                <div className="text-xs text-gray-500">
                  {workflow.steps.length} steps • Created by {workflow.createdBy}
                </div>
              </div>
            ))}
            
            {workflows.length === 0 && (
              <div className="p-8 text-center">
                <GitBranch className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No workflows yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Builder */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedWorkflow.name}</h2>
                    <p className="text-gray-600">{selectedWorkflow.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addStep('form')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Form
                    </button>
                    <button
                      onClick={() => addStep('delay')}
                      className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Add Delay
                    </button>
                    <button
                      onClick={() => addStep('action')}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Add Action
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {selectedWorkflow.steps.length === 0 ? (
                  <div className="text-center py-12">
                    <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Steps Yet</h3>
                    <p className="text-gray-600 mb-4">Add your first step to start building the workflow</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStepIcon(step.type)}
                              <span className="font-medium text-gray-900 capitalize">
                                {step.type}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteStep(step.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {step.type === 'form' && (
                            <select
                              value={step.formId || ''}
                              onChange={(e) => updateStep(step.id, { formId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select a form</option>
                              {forms.map(form => (
                                <option key={form.id} value={form.id}>{form.title}</option>
                              ))}
                            </select>
                          )}
                          
                          {step.type === 'delay' && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="1"
                                value={step.delay || 1}
                                onChange={(e) => updateStep(step.id, { delay: parseInt(e.target.value) || 1 })}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-sm text-gray-600">days</span>
                            </div>
                          )}
                          
                          {step.type === 'action' && step.action && (
                            <div className="space-y-2">
                              <select
                                value={step.action.type}
                                onChange={(e) => updateStep(step.id, {
                                  action: { ...step.action!, type: e.target.value as any }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="email">Send Email</option>
                                <option value="redirect">Redirect</option>
                                <option value="certificate">Generate Certificate</option>
                              </select>
                              
                              {step.action.type === 'email' && (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Email subject"
                                    value={step.action.config?.subject || ''}
                                    onChange={(e) => updateStep(step.id, {
                                      action: {
                                        ...step.action!,
                                        config: { ...step.action!.config, subject: e.target.value }
                                      }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <textarea
                                    placeholder="Email body"
                                    value={step.action.config?.body || ''}
                                    onChange={(e) => updateStep(step.id, {
                                      action: {
                                        ...step.action!,
                                        config: { ...step.action!.config, body: e.target.value }
                                      }
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {index < selectedWorkflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Workflow</h3>
              <p className="text-gray-600">Choose a workflow from the list to start editing</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Workflow</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this workflow does..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWorkflow}
                disabled={!newWorkflowName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;