import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Filter, Calendar, Clock, Tag, Search } from 'lucide-react';
import { storage } from '../utils/storage';
import { exportToCSV, generatePDF, formatDate, generateId } from '../utils';
import { ExportRequest } from '../types';

const ExportTools: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    timeRange: { min: '', max: '' },
    source: '',
    searchText: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!formId) return <div>Form not found</div>;

  const form = storage.getForm(formId);
  const questions = storage.getQuestions(formId);
  const allResponses = storage.getResponses(formId);
  const brandSettings = storage.getBrandSettings();

  if (!form) return <div>Form not found</div>;

  // Apply filters
  const filteredResponses = allResponses.filter(response => {
    const user = storage.getUser(response.userId);
    
    // Date range filter
    if (filters.dateRange.start && new Date(response.submittedAt) < new Date(filters.dateRange.start)) {
      return false;
    }
    if (filters.dateRange.end && new Date(response.submittedAt) > new Date(filters.dateRange.end)) {
      return false;
    }
    
    // Time range filter
    if (filters.timeRange.min && response.timeTaken < parseInt(filters.timeRange.min)) {
      return false;
    }
    if (filters.timeRange.max && response.timeTaken > parseInt(filters.timeRange.max)) {
      return false;
    }
    
    // Source filter
    if (filters.source) {
      const hasSourceMatch = questions.some(q => 
        q.source.toLowerCase().includes(filters.source.toLowerCase()) &&
        response.answers[q.id]
      );
      if (!hasSourceMatch) return false;
    }
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const userMatch = user?.name.toLowerCase().includes(searchLower) || 
                       user?.email.toLowerCase().includes(searchLower);
      const answerMatch = Object.values(response.answers).some(answer => 
        answer.toString().toLowerCase().includes(searchLower)
      );
      if (!userMatch && !answerMatch) return false;
    }
    
    return true;
  });

  const exportCSV = async (type: 'raw' | 'summary') => {
    setIsExporting(true);
    
    try {
      if (type === 'raw') {
        const csvData = filteredResponses.map(response => {
          const user = storage.getUser(response.userId);
          const row: any = {
            'Name': user?.name || 'Unknown',
            'Email': user?.email || 'Unknown',
            'Roll/ID': user?.roll || '',
            'Submitted At': formatDate(response.submittedAt),
            'Time Taken (seconds)': response.timeTaken,
          };
          
          if (form.type === 'quiz') {
            row['Score'] = response.score || 0;
            row['Max Score'] = response.maxScore || 0;
            row['Percentage'] = response.maxScore ? Math.round((response.score || 0) / response.maxScore * 100) : 0;
          }
          
          questions.forEach(question => {
            row[`Q: ${question.text}`] = response.answers[question.id] || '';
          });
          
          return row;
        });
        
        exportToCSV(csvData, `${form.title}-responses-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // Summary export with aggregated data
        const summaryData = questions.map(question => {
          const answers = filteredResponses.map(r => r.answers[question.id]).filter(Boolean);
          
          if (question.type === 'mcq' || question.type === 'dropdown' || question.type === 'true_false') {
            const counts: Record<string, number> = {};
            answers.forEach(answer => {
              counts[answer as string] = (counts[answer as string] || 0) + 1;
            });
            
            return {
              'Question': question.text,
              'Type': question.type,
              'Source': question.source,
              'Total Responses': answers.length,
              'Most Common Answer': Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, ''),
              'Response Distribution': Object.entries(counts).map(([option, count]) => `${option}: ${count}`).join('; ')
            };
          } else if (question.type === 'rating') {
            const ratings = answers.map(a => Number(a));
            const average = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : '0';
            
            return {
              'Question': question.text,
              'Type': question.type,
              'Source': question.source,
              'Total Responses': answers.length,
              'Average Rating': average,
              'Response Distribution': [1,2,3,4,5].map(rating => 
                `${rating}: ${ratings.filter(r => r === rating).length}`
              ).join('; ')
            };
          } else {
            return {
              'Question': question.text,
              'Type': question.type,
              'Source': question.source,
              'Total Responses': answers.length,
              'Sample Responses': answers.slice(0, 3).join('; ')
            };
          }
        });
        
        exportToCSV(summaryData, `${form.title}-summary-${new Date().toISOString().split('T')[0]}.csv`);
      }
      
      // Log the export
      const exportRequest: ExportRequest = {
        id: generateId(),
        formId,
        type: 'csv',
        filters: filters.dateRange.start || filters.timeRange.min || filters.source || filters.searchText ? filters : undefined,
        status: 'completed',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };
      storage.saveExportRequest(exportRequest);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a temporary element for PDF generation
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${brandSettings.primaryColor}; margin-bottom: 10px;">${form.title}</h1>
          <p style="color: #666; margin-bottom: 5px;">${form.description || ''}</p>
          <p style="color: #666; font-size: 14px;">Generated on ${formatDate(new Date().toISOString())}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 2px solid ${brandSettings.primaryColor}; padding-bottom: 10px;">Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: ${brandSettings.primaryColor};">${filteredResponses.length}</div>
              <div style="color: #666; font-size: 14px;">Total Responses</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: ${brandSettings.primaryColor};">${questions.length}</div>
              <div style="color: #666; font-size: 14px;">Questions</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: ${brandSettings.primaryColor};">
                ${filteredResponses.length > 0 ? Math.round(filteredResponses.reduce((sum, r) => sum + r.timeTaken, 0) / filteredResponses.length) : 0}s
              </div>
              <div style="color: #666; font-size: 14px;">Avg. Time</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 2px solid ${brandSettings.primaryColor}; padding-bottom: 10px;">Questions Overview</h2>
          ${questions.map((question, index) => `
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 10px;">${index + 1}. ${question.text}</h3>
              <div style="display: flex; gap: 20px; font-size: 14px; color: #666;">
                <span><strong>Type:</strong> ${question.type}</span>
                <span><strong>Source:</strong> ${question.source}</span>
                ${form.type === 'quiz' ? `<span><strong>Points:</strong> ${question.points}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        ${brandSettings.showPoweredBy ? `
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
            Generated by ${brandSettings.brandName}
          </div>
        ` : ''}
      `;
      
      document.body.appendChild(element);
      await generatePDF(element, `${form.title}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.removeChild(element);
      
      // Log the export
      const exportRequest: ExportRequest = {
        id: generateId(),
        formId,
        type: 'pdf',
        filters: filters.dateRange.start || filters.timeRange.min || filters.source || filters.searchText ? filters : undefined,
        status: 'completed',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };
      storage.saveExportRequest(exportRequest);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      timeRange: { min: '', max: '' },
      source: '',
      searchText: ''
    });
  };

  const sources = [...new Set(questions.map(q => q.source).filter(Boolean))];

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
            <h1 className="text-3xl font-bold text-gray-900">Export Tools</h1>
            <p className="text-gray-600">{form.title} • {filteredResponses.length} responses</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Time Range (seconds)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min time"
                value={filters.timeRange.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, min: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="number"
                placeholder="Max time"
                value={filters.timeRange.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, max: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Source/Topic
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All sources</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Search Text
            </label>
            <input
              type="text"
              placeholder="Search in responses..."
              value={filters.searchText}
              onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredResponses.length} of {allResponses.length} responses
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Raw Data CSV</h3>
              <p className="text-sm text-gray-600">Complete response data with user details</p>
            </div>
          </div>
          <button
            onClick={() => exportCSV('raw')}
            disabled={isExporting || filteredResponses.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Raw CSV</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Summary CSV</h3>
              <p className="text-sm text-gray-600">Aggregated data with response counts</p>
            </div>
          </div>
          <button
            onClick={() => exportCSV('summary')}
            disabled={isExporting || filteredResponses.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Summary CSV</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PDF Report</h3>
              <p className="text-sm text-gray-600">Formatted report with charts and summary</p>
            </div>
          </div>
          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Generating export...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTools;