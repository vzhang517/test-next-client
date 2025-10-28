'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/lib/NavigationContext';

interface Container {
  container_folder_id: string;
  folder_name: string;
  due_date: string;
  status: 'Overdue' | 'Incomplete' | 'Recertified';
  container_recertification_id: string;
}

interface ContainerOwnerDashboardProps {
  userId: string;
  isAdmin: boolean;
}

export default function ContainerOwnerDashboard({ userId }: ContainerOwnerDashboardProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Overdue' | 'Incomplete' | 'Recertified'>('All');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const isRequestInProgress = useRef(false);
  const { navigateToRecertification, navigateToRecertificationHistory } = useNavigation();

  useEffect(() => {
    const getContainerOwnerDashboard = async () => {
      // Prevent multiple simultaneous requests
      if (isRequestInProgress.current) {
        return;
      }

      try {
        isRequestInProgress.current = true;
        setError(null); // Clear any previous errors
        setIsLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams({
          user: userId
        });
        
        if (sortColumn) {
          params.append('column', sortColumn);
          params.append('order', sortOrder);
        }

        const containerOwnerDashboard = await fetch(`/api/get-container-owner-dashboard?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!containerOwnerDashboard.ok) {
          throw new Error(`HTTP error! status: ${containerOwnerDashboard.status}`);
        }

        const containerOwnerDashboardData = await containerOwnerDashboard.json();
        console.log('containerOwnerDashboardData:', containerOwnerDashboardData);
        setContainers(containerOwnerDashboardData);
        setIsLoading(false);

      } catch (error) {
        console.error('Error fetching container owner dashboard:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch container data');
        setContainers([]); // Clear containers on error
        setIsLoading(false);
      } finally {
        isRequestInProgress.current = false;
      }
    };

    getContainerOwnerDashboard();
  }, [userId, sortColumn, sortOrder]);

  const filteredContainers = filter === 'All' 
    ? containers 
    : containers.filter(container => container.status === filter);

  const getStatusBadge = (status: Container['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'Overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Incomplete':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Recertified':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusCounts = () => {
    const counts = containers.reduce((acc, container) => {
      acc[container.status] = (acc[container.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      overdue: counts.Overdue || 0,
      incomplete: counts.Incomplete || 0,
      recertified: counts.Recertified || 0,
      total: containers.length
    };
  };

  const statusCounts = getStatusCounts();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different column, set it as the new sort column with ascending order
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleRowClick = (containerId: string, containerRecertificationId: string) => {
    navigateToRecertification(containerId, containerRecertificationId);
  };

  const handleHistoryClick = (e: React.MouseEvent, containerId: string) => {
    e.stopPropagation(); // Prevent row click
    navigateToRecertificationHistory(containerId);
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Container Owner Dashboard</h1>
        <p className="text-gray-600">Track container recertification status</p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Incomplete</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.incomplete}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recertified</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.recertified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Container Status Tracker</h2>
              <p className="text-sm text-gray-500 mt-1">Click on any row to start recertification</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="All">All Status</option>
                <option value="Overdue">Overdue</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Recertified">Recertified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('container_folder_id')}
                    className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  >
                    <span>Container ID</span>
                    {getSortIcon('container_folder_id')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  >
                    <span>Container Name</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('due_date')}
                    className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  >
                    <span>Due Date</span>
                    {getSortIcon('due_date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                  >
                    <span>Status</span>
                    {getSortIcon('status')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContainers.map((container) => (
                <tr 
                  key={container.container_folder_id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleRowClick(container.container_folder_id, container.container_recertification_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{container.container_folder_id}</span>
                      <button
                        onClick={(e) => handleHistoryClick(e, container.container_folder_id)}
                        className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150"
                        title="View History"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {container.folder_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {container.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(container.status)}>
                      {container.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(filteredContainers.length === 0 || error) && (
          <div className="text-center py-12">
            {error ? (
              <>
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-red-900">Error fetching or loading containers</h3>
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No containers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'All' ? 'No containers.' : `No containers with status "${filter}".`}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
