import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import CreateForm from './pages/CreateForm';
import FormSummary from './pages/FormSummary';
import AttemptForm from './pages/AttemptForm';
import Thanks from './pages/Thanks';
import Dashboard from './pages/Dashboard';
import FormAnalytics from './pages/FormAnalytics';
import ExportTools from './pages/ExportTools';
import UserDetail from './pages/UserDetail';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import CertificateEditor from './pages/CertificateEditor';
import FormLogic from './pages/FormLogic';
import NotificationSettings from './pages/NotificationSettings';
import CustomEndPage from './pages/CustomEndPage';
import RoleManagement from './pages/RoleManagement';
import Library from './pages/Library';
import VersionControl from './pages/VersionControl';
import Insights from './pages/Insights';
import Recommendations from './pages/Recommendations';
import WorkflowBuilder from './pages/WorkflowBuilder';
import BulkTools from './pages/BulkTools';
import Collections from './pages/Collections';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Public form attempt routes - no layout */}
        <Route path="/form/:formId" element={<AttemptForm />} />
        <Route path="/attempt/:formId" element={<AttemptForm />} />
        <Route path="/thanks" element={<Thanks />} />
        
        {/* Admin routes with layout */}
        <Route path="/home" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/create" element={
          <Layout>
            <CreateForm />
          </Layout>
        } />
        <Route path="/edit/:formId" element={
          <Layout>
            <CreateForm />
          </Layout>
        } />
        <Route path="/form/:formId/summary" element={
          <Layout>
            <FormSummary />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/dashboard/:formId" element={
          <Layout>
            <FormAnalytics />
          </Layout>
        } />
        <Route path="/dashboard/:formId/exports" element={
          <Layout>
            <ExportTools />
          </Layout>
        } />
        <Route path="/dashboard/:formId/user/:userId" element={
          <Layout>
            <UserDetail />
          </Layout>
        } />
        <Route path="/admin/users" element={
          <Layout>
            <AdminUsers />
          </Layout>
        } />
        <Route path="/admin/roles" element={
          <Layout>
            <RoleManagement />
          </Layout>
        } />
        <Route path="/library" element={
          <Layout>
            <Library />
          </Layout>
        } />
        <Route path="/versions/:formId" element={
          <Layout>
            <VersionControl />
          </Layout>
        } />
        <Route path="/dashboard/:formId/insights" element={
          <Layout>
            <Insights />
          </Layout>
        } />
        <Route path="/recommendations/:formId" element={
          <Layout>
            <Recommendations />
          </Layout>
        } />
        <Route path="/workflow-builder" element={
          <Layout>
            <WorkflowBuilder />
          </Layout>
        } />
        <Route path="/dashboard/:formId/tools" element={
          <Layout>
            <BulkTools />
          </Layout>
        } />
        <Route path="/collections" element={
          <Layout>
            <Collections />
          </Layout>
        } />
        <Route path="/certificate-editor/:formId" element={
          <Layout>
            <CertificateEditor />
          </Layout>
        } />
        <Route path="/form-logic/:formId" element={
          <Layout>
            <FormLogic />
          </Layout>
        } />
        <Route path="/notifications/:formId" element={
          <Layout>
            <NotificationSettings />
          </Layout>
        } />
        <Route path="/custom-endpage/:formId" element={
          <Layout>
            <CustomEndPage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={
          <Layout>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;