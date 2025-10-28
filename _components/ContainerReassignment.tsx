'use client';

import { useState } from 'react';

interface ContainerReassignmentProps {
  userId: string;
  isAdmin: boolean;
}

interface ContainerInfo {
  containerRecertificationId: string;
  dueDate: string;
  status: 'Incomplete' | 'Recertified' | 'Overdue';
  primaryContainerOwner: string;
}

export default function ContainerReassignment({ userId, isAdmin }: ContainerReassignmentProps) {
  const [searchContainerId, setSearchContainerId] = useState<string>('');
  const [confirmedContainerId, setConfirmedContainerId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [containerInfo, setContainerInfo] = useState<ContainerInfo | null>(null);

  const getContainerInfo = async (containerId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const params = new URLSearchParams({
        containerId: containerId,
        userId: userId
      });

      const response = await fetch(`/api/list-container-ownership?${params.toString()}`, {
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
      const transformedData: ContainerInfo = data.container.map((item: any) => ({
        containerRecertificationId: item.id?.toString() || '',
        dueDate: item.due_date || '',
        status: item.collaborator_type || 'Status Unknown',
        primaryContainerOwner: item.primary_container_owner || '',
      }));

      setContainerInfo(transformedData);
      setConfirmedContainerId(containerId); // Only update confirmed container ID after successful response
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching container collaborations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch collaboration data');
      setContainerInfo(null);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchContainerId && searchContainerId.trim()) {
      setHasSearched(true);
      getContainerInfo(searchContainerId.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'Recertified':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header and Search Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Reassignment</h1>
            <p className="text-gray-600">Search and view container information for reassignment</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Reassignment</h1>
          <p className="text-gray-600">Search and view container recertification information for reassignment</p>
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
                <h3 className="text-base font-semibold text-blue-900 mb-1">Currently Viewing</h3>
                <div className="flex items-center space-x-2">
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

      {/* Container Information Section */}
      {containerInfo && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Container Information</h2>
            <p className="text-sm text-gray-500 mt-1">Details for container reassignment</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Container Recertification ID */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Container Recertification ID
                </label>
                <div className="flex items-center space-x-3">
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md w-fit">
                    <span className="text-sm font-mono text-gray-900">
                      {containerInfo.containerRecertificationId}
                    </span>
                  </div>
                  {containerInfo.status === 'Overdue' && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Due Date
                </label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md w-fit">
                  <span className="text-sm text-gray-900">
                    {formatDate(containerInfo.dueDate)}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(containerInfo.status)}`}>
                    {containerInfo.status}
                  </span>
                </div>
              </div>

              {/* Primary Container Owner */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Primary Container Owner
                </label>
                <div className="flex items-center space-x-3">
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md w-fit">
                    <span className="text-sm text-gray-900">
                      {containerInfo.primaryContainerOwner}
                    </span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error or Empty State */}
      {!containerInfo && hasSearched && !error && (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No container recertification found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No container recertification information is available for this container ID.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-red-900">Error loading container recertification</h3>
            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Search for a container ID</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter a container ID above to view the container's recertification information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
