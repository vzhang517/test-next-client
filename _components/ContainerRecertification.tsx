'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/NavigationContext';

interface ContainerRecertificationProps {
  userId: string;
  isAdmin: boolean;
}

interface CollaborationRecord {
  id: string;
  collaborator: string;
  collaboratorType: 'Managed' | 'External';
  permissionLevel: 'co-owner' | 'editor' | 'viewer' | 'previewer' | 'uploader' | 'previewer_uploader' | 'viewer_uploader' | 'delete';
  collaborationId: string;
  invitedDate: string;
  path: string;
  isSelected?: boolean;
}


export default function ContainerRecertification({ userId, isAdmin }: ContainerRecertificationProps) {
  const [collaborations, setCollaborations] = useState<CollaborationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchContainerId, setSearchContainerId] = useState<string>('');
  const [confirmedContainerName, setConfirmedContainerName] = useState<string>('');
  const [confirmedContainerId, setConfirmedContainerId] = useState<string>('');
  const [confirmedRecertificationId, setConfirmedRecertificationId] = useState<string>('');
  const [confirmedRecertificationStatus, setConfirmedRecertificationStatus] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isCertified, setIsCertified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [updatedCollaborationsCount, setUpdatedCollaborationsCount] = useState<number>(0);
  const router = useRouter();
  const { selectedContainerId, selectedRecertificationId, setSelectedContainerId, setSelectedRecertificationId } = useNavigation();

  // Auto-search when a container ID is selected from the dashboard
  useEffect(() => {
    console.log('in collaboration recertification selectedContainerId:', selectedContainerId);
    console.log('in collaboration recertification selectedRecertificationId:', selectedRecertificationId);
    if (selectedContainerId && selectedRecertificationId) {
      console.log('selectedContainerId:', selectedContainerId);
      const containerIdString = String(selectedContainerId);
      const recertificationIdString = String(selectedRecertificationId);
      setSearchContainerId(containerIdString);
      setConfirmedRecertificationId(recertificationIdString);
      setHasSearched(true);
      getContainerCollaborations(containerIdString);
      // Clear the selected container ID after using it
      setSelectedContainerId(null);
      setSelectedRecertificationId(null);
    }
  }, [selectedContainerId, selectedRecertificationId, setSelectedContainerId, setSelectedRecertificationId]);

  const getContainerCollaborations = async (containerId: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const params = new URLSearchParams({
        containerId: containerId,
        userId: userId
      });

      // Add recertificationId as optional parameter if it exists
      if (confirmedRecertificationId && confirmedRecertificationId.trim()) {
        params.append('recertificationId', confirmedRecertificationId.trim());
      }

      const response = await fetch(`/api/get-container-recertification-collaborations?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Container collaborations data:', data);

      // Transform the API data to match our interface
      const transformedData: CollaborationRecord[] = data.collaborations.map((item: any) => ({
        id: item.id?.toString() || '',
        collaborator: item.collaborator_name || 'Unknown User',
        collaboratorType: item.collaborator_type || 'External',
        permissionLevel: mapPermissionLevel(item.collaborator_permission || ''),
        collaborationId: item.collaboration_id?.toString() || '',
        invitedDate: item.invited_date || '',
        path: item.path || 'Unknown Path'
      }));

      setConfirmedContainerName(data.container.folder_name)
      setConfirmedRecertificationId(data.container.recertification_id);
      setConfirmedRecertificationStatus(data.container.recertification_status);
      setCollaborations(transformedData);
      setConfirmedContainerId(containerId); // Only update confirmed container ID after successful response
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching container collaborations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch collaboration data');
      setCollaborations([]);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchContainerId && searchContainerId.trim()) {
      setHasSearched(true);
      getContainerCollaborations(searchContainerId.trim());
    }
  };

  const handleSubmit = async () => {
    // Check if either certification is checked OR at least one collaboration is selected
    const selectedCollaborations = collaborations.filter(collab => collab.isSelected);

    if (!isCertified && selectedCollaborations.length === 0) {
      alert('Please either certify this container or select at least one collaboration to update.');
      return;
    }

    if (!confirmedContainerId) {
      alert('Please search for a container first.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Always update collaborations if any are selected
      if (selectedCollaborations.length > 0) {
        const updateCollaborationsData = {
          'userId': parseInt(userId),
          'containerId': parseInt(confirmedContainerId),
          'recertificationId': parseInt(confirmedRecertificationId),
          'collaborations': selectedCollaborations.map(collab => [
            collab.collaborationId,
            collab.permissionLevel
          ])
        };

        const collaborationsResponse = await fetch('/api/update-container-collaborations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateCollaborationsData),
        });

        if (!collaborationsResponse.ok) {
          throw new Error(`HTTP error! status: ${collaborationsResponse.status}`);
        }

      }

      // If certified, also call the recertification route
      if (isCertified) {
        const updateRecertificationData = {
          'userId': parseInt(userId),
          'containerId': parseInt(confirmedContainerId),
          'recertificationId': parseInt(confirmedRecertificationId)
        };

        const recertificationResponse = await fetch('/api/update-container-recertification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateRecertificationData),
        });

        if (!recertificationResponse.ok) {
          throw new Error(`HTTP error! status: ${recertificationResponse.status}`);
        }

      }

      // Check if this was a collaboration-only submission (no certification)
      if (!isCertified && selectedCollaborations.length > 0) {
        // Show popup with number of collaborations updated
        setUpdatedCollaborationsCount(selectedCollaborations.length);
        setShowSuccessPopup(true);
      } else {
        // Navigate to RecertificationComplete component for certified submissions
        router.push('/recertification-complete');
      }
    }
    catch (error) {
      console.error('Error submitting recertification:', error);
      alert('Failed to submit recertification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapPermissionLevel = (permission: string): 'co-owner' | 'editor' | 'viewer' | 'previewer' | 'uploader' | 'previewer_uploader' | 'viewer_uploader' | 'delete' => {
    const lowerPermission = permission?.toLowerCase() || '';

    if (lowerPermission.includes('owner') || lowerPermission.includes('admin')) {
      return 'co-owner';
    } else if (lowerPermission.includes('edit') || lowerPermission.includes('write')) {
      return 'editor';
    } else if (lowerPermission.includes('view') && lowerPermission.includes('upload')) {
      return 'viewer_uploader';
    } else if (lowerPermission.includes('preview') && lowerPermission.includes('upload')) {
      return 'previewer_uploader';
    } else if (lowerPermission.includes('view') || lowerPermission.includes('read')) {
      return 'viewer';
    } else if (lowerPermission.includes('preview')) {
      return 'previewer';
    } else if (lowerPermission.includes('upload')) {
      return 'uploader';
    } else if (lowerPermission.includes('delete')) {
      return 'delete';
    } else {
      return 'viewer'; // Default fallback
    }
  };

  const handlePermissionChange = (id: string, newPermission: 'co-owner' | 'editor' | 'viewer' | 'previewer' | 'uploader' | 'previewer_uploader' | 'viewer_uploader' | 'delete') => {
    setCollaborations(prev =>
      prev.map(collab =>
        collab.id === id
          ? { ...collab, permissionLevel: newPermission }
          : collab
      )
    );
  };

  const handleCheckboxChange = (id: string) => {
    setCollaborations(prev =>
      prev.map(collab =>
        collab.id === id
          ? { ...collab, isSelected: !collab.isSelected }
          : collab
      )
    );
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    // Refresh the component with the same container ID
    if (confirmedContainerId) {
      getContainerCollaborations(confirmedContainerId);
    }
  };

  const getCollaboratorTypeColor = (type: string) => {
    return type === 'Managed'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header and Search Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Recertification</h1>
            <p className="text-gray-600">Manage collaboration access and permissions</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header, Search, and Current Container Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Recertification</h1>
          <p className="text-gray-600">Manage collaboration access and permissions</p>
          {confirmedRecertificationStatus && confirmedRecertificationStatus !== 'Incomplete' && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Container may have been recertified recently and cannot be recertified again, please contact your admin
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="containerId" className="block text-sm font-medium text-gray-700 mb-2">
              Container ID
            </label>
            <input
              type="text"
              id="containerId"
              value={searchContainerId}
              onChange={(e) => setSearchContainerId(e.target.value)}
              placeholder="Enter container ID to search..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!searchContainerId || !searchContainerId.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Current Container Display */}
        {confirmedContainerId && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900 mb-1">Currently Recertifying</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-700">Container Name:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-900 font-mono text-sm rounded border border-blue-200">
                    {confirmedContainerName}
                  </span>
                  <span className="text-sm font-medium text-blue-700">Container ID:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-900 font-mono text-sm rounded border border-blue-200">
                    {confirmedContainerId}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collaborations Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Collaboration Records</h2>
              <p className="text-sm text-gray-500 mt-1">Select and update collaboration permissions</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collaborator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collaborator Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collaboration ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invited Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                  Path
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collaborations.map((collaboration) => (
                <tr key={collaboration.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={collaboration.isSelected || false}
                      onChange={() => handleCheckboxChange(collaboration.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {collaboration.collaborator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCollaboratorTypeColor(collaboration.collaboratorType)}`}>
                      {collaboration.collaboratorType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={collaboration.permissionLevel}
                      onChange={(e) => handlePermissionChange(collaboration.id, e.target.value as 'co-owner' | 'editor' | 'viewer' | 'previewer' | 'uploader' | 'previewer_uploader' | 'viewer_uploader' | 'delete')}
                      className="text-sm text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="co-owner">Co-Owner</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="previewer">Previewer</option>
                      <option value="uploader">Uploader</option>
                      <option value="previewer_uploader">Previewer Uploader</option>
                      <option value="viewer_uploader">Viewer Uploader</option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {collaboration.collaborationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(collaboration.invitedDate)}
                  </td>
                  <td className="px-6 py-4 min-w-0 text-sm text-gray-900 whitespace-nowrap" title={collaboration.path}>
                    {collaboration.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Error or Empty State */}
        {(collaborations.length === 0 || error || !hasSearched) && (
          <div className="text-center py-12">
            {!hasSearched ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Search for a container ID</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter a container ID above to view collaboration records.
                </p>
              </>
            ) : error ? (
              <>
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-red-900">Error loading collaborations</h3>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No collaborations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No collaboration records are available for this container.
                </p>
              </>
            )}
          </div>
        )}

        {/* Visual Spacer */}
        <div className="border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="certify"
                checked={isCertified}
                onChange={(e) => setIsCertified(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="certify" className="ml-2 text-sm text-gray-700">
                I certify this container
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={(!isCertified && collaborations.filter(collab => collab.isSelected).length === 0) || isSubmitting || (confirmedRecertificationStatus !== '' && confirmedRecertificationStatus !== 'Incomplete')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Collaborations Updated Successfully
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {updatedCollaborationsCount} collaboration{updatedCollaborationsCount !== 1 ? 's' : ''} {updatedCollaborationsCount !== 1 ? 'were' : 'was'} updated successfully.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handlePopupClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

