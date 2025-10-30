'use client';

import { useState, useEffect } from 'react';

interface EmailTemplatesProps {
  userId: string;
  isAdmin: boolean;
}

interface EmailTemplateList {
  id: string;
  name: string;
}

interface EmailTemplateDetails {
  id: number;
  name: string;
  description: string;
  status: string;
  subject: string;
  body: string;
  box_file_id: number;
}

export default function EmailTemplates({ userId, isAdmin }: EmailTemplatesProps) {
  const [templates, setTemplates] = useState<EmailTemplateList[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateDetails, setTemplateDetails] = useState<EmailTemplateDetails | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    body: '',
    box_file_id: '',
  });

  // Fetch templates list on component load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        setError(null);

        const response = await fetch('/api/list-email-templates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('response:', response);

        const data = await response.json();
        setTemplates(data || []);
        setIsLoadingTemplates(false);
      } catch (error) {
        console.error('Error fetching email templates:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch email templates');
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch template details when a template is selected
  useEffect(() => {
    if (!selectedTemplateId || selectedTemplateId === '') {
      setTemplateDetails(null);
      setFormData({
        name: '',
        description: '',
        subject: '',
        body: '',
        box_file_id: '',
      });
      return;
    }

    const fetchTemplateDetails = async () => {
      try {
        setIsLoadingDetails(true);
        setError(null);

        const params = new URLSearchParams({
          templateId: selectedTemplateId,
          userId: userId
        });

        const response = await fetch(`/api/get-email-template?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTemplateDetails(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          subject: data.subject || '',
          body: data.body || '',
          box_file_id: data.box_file_id?.toString() || '',
        });
        setIsLoadingDetails(false);
      } catch (error) {
        console.error('Error fetching email template details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch email template details');
        setIsLoadingDetails(false);
      }
    };

    fetchTemplateDetails();
  }, [selectedTemplateId]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    // Refresh the component by refetching templates and clearing selection
    setSelectedTemplateId('');
    setTemplateDetails(null);
    setFormData({
      name: '',
      description: '',
      subject: '',
      body: '',
      box_file_id: '',
    });
    
    // Refetch templates
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        setError(null);

        const response = await fetch('/api/list-email-templates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTemplates(data || []);
        setIsLoadingTemplates(false);
      } catch (error) {
        console.error('Error fetching email templates:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch email templates');
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      const updateData = {
        'templateId': templateDetails?.id?.toString() || '',
        'name': formData.name,
        'description': formData.description,
        'subject': formData.subject,
        'emailBody': formData.body,
        'boxFileId': formData.box_file_id,
      };

      console.log('updateData:');
      console.log(updateData);

      const response = await fetch('/api/email-template-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Template updated successfully:', data);
      
      setIsUpdating(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error updating email template:', error);
      setError(error instanceof Error ? error.message : 'Failed to update email template');
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
          <p className="text-sm text-gray-500 mt-1">Manage email templates</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Template Selection Dropdown */}
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoadingTemplates}
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State for Template Details */}
          {isLoadingDetails && selectedTemplateId && selectedTemplateId !== '' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading template details...</p>
            </div>
          )}

          {/* Template Details Form */}
          {!isLoadingDetails && templateDetails && (
            <div className="space-y-4">

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter template name"
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter template description"
                />
              </div>

              {/* Status Field (non-editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-sm text-gray-900">{templateDetails.status}</span>
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Body Field */}
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <textarea
                  id="body"
                  rows={8}
                  value={formData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter email body"
                />
              </div>

              {/* Box File ID Field */}
              <div>
                <label htmlFor="box_file_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Box File ID
                </label>
                <input
                  type="text"
                  id="box_file_id"
                  value={formData.box_file_id}
                  onChange={(e) => handleInputChange('box_file_id', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter box file ID"
                />
              </div>

              {/* Update Button */}
              <div className="pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Success</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Email template has been updated successfully.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleSuccessOk}
                  className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
