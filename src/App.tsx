import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Guide from './pages/Guide';
import Library from './pages/Library';
import VersionControl from './pages/VersionControl';
import Insights from './pages/Insights';
import Recommendations from './pages/Recommendations';
import WorkflowBuilder from './pages/WorkflowBuilder';
import BulkTools from './pages/BulkTools';
import Collections from './pages/Collections';

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Public form attempt routes - no layout */}
        <Route path="/form/:formId" element={<AttemptForm />} />
        <Route path="/attempt/:formId" element={<AttemptForm />} />
        <Route path="/f/:formId" element={<AttemptForm />} />
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
        <Route path="/library" element={
          <Layout>
            <Library />
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
        <Route path="/dashboard/:formId/tools" element={
          <Layout>
            <BulkTools />
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
        <Route path="/guide" element={
          <Layout>
            <Guide />
          </Layout>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;