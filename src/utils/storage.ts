import { Form, Question, Response, User, AdminUser, BrandSettings, ActivityLog, ExportRequest, Certificate, FormTemplate, FormVersion, AIInsight, Recommendation, Workflow, Collection, ResponseTag } from '../types';

class StorageManager {
  private getKey(type: string): string {
    return `formora_${type}`;
  }

  // Universal form sharing methods
  exportFormData(formId: string): string {
    const form = this.getForm(formId);
    const questions = this.getQuestions(formId);
    
    if (!form) return '';
    
    const formData = {
      form,
      questions,
      timestamp: new Date().toISOString()
    };
    
    return btoa(JSON.stringify(formData));
  }

  importFormData(encodedData: string): boolean {
    try {
      const formData = JSON.parse(atob(encodedData));
      
      // Save form and questions to current device
      this.saveForm(formData.form);
      formData.questions.forEach((question: any) => {
        this.saveQuestion(question);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import form data:', error);
      return false;
    }
  }

  // Check if form exists, if not try to load from URL
  ensureFormExists(formId: string): boolean {
    const form = this.getForm(formId);
    if (form) return true;
    
    // Try to load from URL parameters or shared data
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
      return this.importFormData(sharedData);
    }
    
    return false;
  }

  // Forms
  getForms(): Form[] {
    const data = localStorage.getItem(this.getKey('forms'));
    return data ? JSON.parse(data) : [];
  }

  saveForm(form: Form): void {
    const forms = this.getForms();
    const index = forms.findIndex(f => f.id === form.id);
    if (index >= 0) {
      forms[index] = form;
    } else {
      forms.push(form);
    }
    localStorage.setItem(this.getKey('forms'), JSON.stringify(forms));
  }

  getForm(id: string): Form | null {
    const forms = this.getForms();
    return forms.find(f => f.id === id) || null;
  }

  deleteForm(id: string): void {
    const forms = this.getForms().filter(f => f.id !== id);
    localStorage.setItem(this.getKey('forms'), JSON.stringify(forms));
  }

  // Questions
  getQuestions(formId: string): Question[] {
    const data = localStorage.getItem(this.getKey('questions'));
    const questions: Question[] = data ? JSON.parse(data) : [];
    return questions.filter(q => q.formId === formId).sort((a, b) => a.order - b.order);
  }

  saveQuestion(question: Question): void {
    const questions = this.getAllQuestions();
    const index = questions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      questions[index] = question;
    } else {
      questions.push(question);
    }
    localStorage.setItem(this.getKey('questions'), JSON.stringify(questions));
  }

  saveQuestions(questions: Question[]): void {
    const allQuestions = this.getAllQuestions();
    const otherQuestions = allQuestions.filter(q => 
      !questions.some(newQ => newQ.id === q.id)
    );
    const updatedQuestions = [...otherQuestions, ...questions];
    localStorage.setItem(this.getKey('questions'), JSON.stringify(updatedQuestions));
  }

  getAllQuestions(): Question[] {
    const data = localStorage.getItem(this.getKey('questions'));
    return data ? JSON.parse(data) : [];
  }

  deleteQuestion(id: string): void {
    const questions = this.getAllQuestions().filter(q => q.id !== id);
    localStorage.setItem(this.getKey('questions'), JSON.stringify(questions));
  }

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(this.getKey('users'));
    return data ? JSON.parse(data) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(this.getKey('users'), JSON.stringify(users));
  }

  getUser(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // Responses
  getResponses(formId?: string): Response[] {
    const data = localStorage.getItem(this.getKey('responses'));
    const responses: Response[] = data ? JSON.parse(data) : [];
    return formId ? responses.filter(r => r.formId === formId) : responses;
  }

  saveResponse(response: Response): void {
    const responses = this.getResponses();
    const index = responses.findIndex(r => r.id === response.id);
    if (index >= 0) {
      responses[index] = response;
    } else {
      responses.push(response);
    }
    localStorage.setItem(this.getKey('responses'), JSON.stringify(responses));
  }

  getResponse(id: string): Response | null {
    const responses = this.getResponses();
    return responses.find(r => r.id === id) || null;
  }

  // Admin Users
  getAdminUsers(): AdminUser[] {
    const data = localStorage.getItem(this.getKey('admin_users'));
    return data ? JSON.parse(data) : [];
  }

  saveAdminUser(user: AdminUser): void {
    const users = this.getAdminUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(this.getKey('admin_users'), JSON.stringify(users));
  }

  getAdminUser(id: string): AdminUser | null {
    const users = this.getAdminUsers();
    return users.find(u => u.id === id) || null;
  }

  deleteAdminUser(id: string): void {
    const users = this.getAdminUsers().filter(u => u.id !== id);
    localStorage.setItem(this.getKey('admin_users'), JSON.stringify(users));
  }

  // Brand Settings
  getBrandSettings(): BrandSettings {
    const data = localStorage.getItem(this.getKey('brand_settings'));
    return data ? JSON.parse(data) : {
      brandName: 'Formora',
      primaryColor: '#2563eb',
      showPoweredBy: true
    };
  }

  saveBrandSettings(settings: BrandSettings): void {
    localStorage.setItem(this.getKey('brand_settings'), JSON.stringify(settings));
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    const data = localStorage.getItem(this.getKey('activity_logs'));
    return data ? JSON.parse(data) : [];
  }

  saveActivityLog(log: ActivityLog): void {
    const logs = this.getActivityLogs();
    logs.unshift(log); // Add to beginning
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }
    localStorage.setItem(this.getKey('activity_logs'), JSON.stringify(logs));
  }

  // Export Requests
  getExportRequests(): ExportRequest[] {
    const data = localStorage.getItem(this.getKey('export_requests'));
    return data ? JSON.parse(data) : [];
  }

  saveExportRequest(request: ExportRequest): void {
    const requests = this.getExportRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    localStorage.setItem(this.getKey('export_requests'), JSON.stringify(requests));
  }

  // Certificates
  getCertificates(): Certificate[] {
    const data = localStorage.getItem(this.getKey('certificates'));
    return data ? JSON.parse(data) : [];
  }

  saveCertificate(certificate: Certificate): void {
    const certificates = this.getCertificates();
    const index = certificates.findIndex(c => c.id === certificate.id);
    if (index >= 0) {
      certificates[index] = certificate;
    } else {
      certificates.push(certificate);
    }
    localStorage.setItem(this.getKey('certificates'), JSON.stringify(certificates));
  }

  getCertificate(formId: string): Certificate | null {
    const certificates = this.getCertificates();
    return certificates.find(c => c.formId === formId) || null;
  }

  deleteCertificate(id: string): void {
    const certificates = this.getCertificates().filter(c => c.id !== id);
    localStorage.setItem(this.getKey('certificates'), JSON.stringify(certificates));
  }

  // Form Templates
  getFormTemplates(): FormTemplate[] {
    const data = localStorage.getItem(this.getKey('form_templates'));
    return data ? JSON.parse(data) : [];
  }

  saveFormTemplate(template: FormTemplate): void {
    const templates = this.getFormTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(this.getKey('form_templates'), JSON.stringify(templates));
  }

  getFormTemplate(id: string): FormTemplate | null {
    const templates = this.getFormTemplates();
    return templates.find(t => t.id === id) || null;
  }

  deleteFormTemplate(id: string): void {
    const templates = this.getFormTemplates().filter(t => t.id !== id);
    localStorage.setItem(this.getKey('form_templates'), JSON.stringify(templates));
  }

  // Form Versions
  getFormVersions(formId: string): FormVersion[] {
    const data = localStorage.getItem(this.getKey('form_versions'));
    const versions: FormVersion[] = data ? JSON.parse(data) : [];
    return versions.filter(v => v.formId === formId).sort((a, b) => b.version - a.version);
  }

  saveFormVersion(version: FormVersion): void {
    const versions = this.getAllFormVersions();
    const index = versions.findIndex(v => v.id === version.id);
    if (index >= 0) {
      versions[index] = version;
    } else {
      versions.push(version);
    }
    localStorage.setItem(this.getKey('form_versions'), JSON.stringify(versions));
  }

  getAllFormVersions(): FormVersion[] {
    const data = localStorage.getItem(this.getKey('form_versions'));
    return data ? JSON.parse(data) : [];
  }

  // AI Insights
  getAIInsights(formId: string): AIInsight[] {
    const data = localStorage.getItem(this.getKey('ai_insights'));
    const insights: AIInsight[] = data ? JSON.parse(data) : [];
    return insights.filter(i => i.formId === formId);
  }

  saveAIInsight(insight: AIInsight): void {
    const insights = this.getAllAIInsights();
    insights.push(insight);
    localStorage.setItem(this.getKey('ai_insights'), JSON.stringify(insights));
  }

  getAllAIInsights(): AIInsight[] {
    const data = localStorage.getItem(this.getKey('ai_insights'));
    return data ? JSON.parse(data) : [];
  }

  // Recommendations
  getRecommendations(formId: string): Recommendation[] {
    const data = localStorage.getItem(this.getKey('recommendations'));
    const recommendations: Recommendation[] = data ? JSON.parse(data) : [];
    return recommendations.filter(r => r.formId === formId);
  }

  saveRecommendation(recommendation: Recommendation): void {
    const recommendations = this.getAllRecommendations();
    recommendations.push(recommendation);
    localStorage.setItem(this.getKey('recommendations'), JSON.stringify(recommendations));
  }

  getAllRecommendations(): Recommendation[] {
    const data = localStorage.getItem(this.getKey('recommendations'));
    return data ? JSON.parse(data) : [];
  }

  // Workflows
  getWorkflows(): Workflow[] {
    const data = localStorage.getItem(this.getKey('workflows'));
    return data ? JSON.parse(data) : [];
  }

  saveWorkflow(workflow: Workflow): void {
    const workflows = this.getWorkflows();
    const index = workflows.findIndex(w => w.id === workflow.id);
    if (index >= 0) {
      workflows[index] = workflow;
    } else {
      workflows.push(workflow);
    }
    localStorage.setItem(this.getKey('workflows'), JSON.stringify(workflows));
  }

  getWorkflow(id: string): Workflow | null {
    const workflows = this.getWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  deleteWorkflow(id: string): void {
    const workflows = this.getWorkflows().filter(w => w.id !== id);
    localStorage.setItem(this.getKey('workflows'), JSON.stringify(workflows));
  }

  // Collections
  getCollections(): Collection[] {
    const data = localStorage.getItem(this.getKey('collections'));
    return data ? JSON.parse(data) : [];
  }

  saveCollection(collection: Collection): void {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === collection.id);
    if (index >= 0) {
      collections[index] = collection;
    } else {
      collections.push(collection);
    }
    localStorage.setItem(this.getKey('collections'), JSON.stringify(collections));
  }

  getCollection(id: string): Collection | null {
    const collections = this.getCollections();
    return collections.find(c => c.id === id) || null;
  }

  deleteCollection(id: string): void {
    const collections = this.getCollections().filter(c => c.id !== id);
    localStorage.setItem(this.getKey('collections'), JSON.stringify(collections));
  }

  // Response Tags
  getResponseTags(responseId?: string): ResponseTag[] {
    const data = localStorage.getItem(this.getKey('response_tags'));
    const tags: ResponseTag[] = data ? JSON.parse(data) : [];
    return responseId ? tags.filter(t => t.responseId === responseId) : tags;
  }

  saveResponseTag(tag: ResponseTag): void {
    const tags = this.getResponseTags();
    tags.push(tag);
    localStorage.setItem(this.getKey('response_tags'), JSON.stringify(tags));
  }

  deleteResponseTag(id: string): void {
    const tags = this.getResponseTags().filter(t => t.id !== id);
    localStorage.setItem(this.getKey('response_tags'), JSON.stringify(tags));
  }
}

export const storage = new StorageManager();