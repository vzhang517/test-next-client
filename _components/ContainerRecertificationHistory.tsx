'use client';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/lib/NavigationContext';

interface ContainerRecertificationHistoryProps {
  userId: string;
  isAdmin: boolean;
}

interface RecertificationHistoryEntry {
  id: number;
  recertificationId: number;
  actorId: number;
  objectId: number;
  objectType: string;
  actionTaken: string;
  priorValue: string;
  newValue: string;
  comment: string;
  createdAt: string;
}

export default function ContainerRecertificationHistory({ userId, isAdmin }: ContainerRecertificationHistoryProps) {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchContainerId, setSearchContainerId] = useState<string>('');
  const [confirmedContainerId, setConfirmedContainerId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const { selectedContainerId, setSelectedContainerId } = useNavigation();
  const [historyEntries, setHistoryEntries] = useState<RecertificationHistoryEntry[]>([]);

  // Auto-search when a container ID is selected from the dashboard
  useEffect(() => {
    if (selectedContainerId) {
      const containerIdString = String(selectedContainerId);
      setSearchContainerId(containerIdString);
      setHasSearched(true);
      getContainerHistory(containerIdString);
      // Clear the selected container ID after using it
      setSelectedContainerId(null);
    }
  }, [selectedContainerId, setSelectedContainerId]);

  const getContainerHistory = async (containerId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const params = new URLSearchParams({
        containerId: containerId,
        userId: userId,
        isAdmin: isAdmin.toString()
      });

      const response = await fetch(`/api/get-container-recertification-history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Container history data:', data);
      
      // Transform the API data to match our interface
      const transformedData: RecertificationHistoryEntry[] = data?.map((item: any) => ({
        id: item.id || 0,
        recertificationId: item.recertification_id || 0,
        actorId: item.actor_id || 0,
        objectId: item.object_id || 0,
        objectType: item.object_type || 'Unknown',
        actionTaken: item.action_taken || 'Unknown',
        priorValue: item.prior_value || '',
        newValue: item.new_value || '',
        comment: item.comment || '',
        createdAt: item.created_at || ''
      })) || [];

      setHistoryEntries(transformedData);
      setConfirmedContainerId(containerId);
      
      // Auto-expand the most recent year if there are entries
      if (transformedData.length > 0) {
        const years = transformedData
          .filter(entry => entry.createdAt)
          .map(entry => entry.createdAt.split('-')[0])
          .filter(year => year && year.length === 4);
        
        if (years.length > 0) {
          const mostRecentYear = years.sort((a, b) => b.localeCompare(a))[0];
          setExpandedYears(new Set([mostRecentYear]));
        }
      }
      
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching container history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch history data');
      setHistoryEntries([]);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchContainerId && searchContainerId.trim()) {
      setHasSearched(true);
      getContainerHistory(searchContainerId.trim());
    }
  };

  const handleGenerateReport = async () => {
    if (!confirmedContainerId) {
      alert('Please search for a container first.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      const params = new URLSearchParams({
        containerId: confirmedContainerId,
        user: userId,
        isAdmin: isAdmin.toString(),
        export: 'true'
      });

      const response = await fetch(`/api/get-container-recertification-history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report, seach for a containerID again to restart');
    } finally {
      setIsLoading(false);
    }
  };

  // Group entries by year
  const groupedEntries = historyEntries.reduce((acc, entry) => {
    if (entry.createdAt) {
      const year = entry.createdAt.split('-')[0];
      if (year && year.length === 4) { // Ensure we have a valid year
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(entry);
      }
    }
    return acc;
  }, {} as Record<string, RecertificationHistoryEntry[]>);

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const toggleYearExpansion = (year: string) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'delete collaboration':
        return 'bg-yellow-100 text-yellow-800';
      case 'update collaboration':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getObjectTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'collaboration':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header and Search Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Recertification History</h1>
            <p className="text-gray-600">View historical audit logs for container recertifications</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Recertification History</h1>
          <p className="text-gray-600">View historical changes and actions for containers</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-blue-900 mb-1">Currently Viewing History</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-700">Container ID:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-900 font-mono text-sm rounded border border-blue-200">
                    {confirmedContainerId}
                  </span>
                  {/* <span className="text-sm font-medium text-blue-700">Container Name:</span> */}
                  {/* <span className="px-2 py-1 bg-blue-100 text-blue-900 font-mono text-sm rounded border border-blue-200">
                    {confirmedContainerName}
                  </span> */}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Container Recertification History Records</h2>
              <p className="text-sm text-gray-500 mt-1">Records are grouped by year</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={handleGenerateReport}
                disabled={!confirmedContainerId || isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
        {/* Error or Empty State */}
        {(historyEntries.length === 0 || error || !hasSearched) && (
          <div className="text-center py-12">
            {!hasSearched ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Search for a container ID</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter a container ID above to view recertification history.
                </p>
              </>
            ) : error ? (
              <>
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-red-900">Error loading history</h3>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No recertification history is available for this container.
                </p>
              </>
            )}
          </div>
        )}

        {/* Grouped History by Year */}
        {historyEntries.length > 0 && !error && hasSearched && (
          <div className="space-y-4">
            {sortedYears.map((year) => (
            <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Year Header */}
              <div 
                className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleYearExpansion(year)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedYears.has(year) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {year}
                    </h3>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                      {groupedEntries[year].length} {groupedEntries[year].length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Year Content */}
              {expandedYears.has(year) && (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recertification ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actor ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Object ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Object Type
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action Taken
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prior Value
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Value
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comment
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedEntries[year].map((entry, index) => (
                          <tr key={`${entry.id}-${index}`} className="hover:bg-gray-50">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{entry.id}</div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.recertificationId}</div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.actorId}</div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.objectId}</div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getObjectTypeColor(entry.objectType)}`}>
                                {entry.objectType}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.actionTaken)}`}>
                                {entry.actionTaken}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.priorValue}>
                                {entry.priorValue}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.newValue}>
                                {entry.newValue}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate" title={entry.comment}>
                                {entry.comment}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.createdAt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

