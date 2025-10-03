'use client';

import { useState, useEffect } from 'react';

interface Container {
  id: string;
  name: string;
  dueDate: string;
  status: 'Overdue' | 'Incomplete' | 'Recertified';
}

interface ContainerOwnerDashboardProps {
  userId: string;
  isAdmin: boolean;
}

export default function ContainerOwnerDashboard({ userId, isAdmin }: ContainerOwnerDashboardProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Overdue' | 'Incomplete' | 'Recertified'>('All');

  // Mock data - in a real app, this would come from an API
  const mockContainers: Container[] = [
    { id: '89230984875', name: 'Production Database Container', dueDate: '2024-01-15', status: 'Overdue' },
    { id: '45893405968', name: 'Development Environment', dueDate: '2024-02-20', status: 'Incomplete' },
    { id: '93840985493', name: 'Staging Server Container', dueDate: '2024-01-30', status: 'Recertified' },
    { id: '29381029383', name: 'Test Environment', dueDate: '2024-03-10', status: 'Incomplete' },
    { id: '22338903238', name: 'Backup Storage Container', dueDate: '2024-01-10', status: 'Overdue' },
    { id: '56273646452', name: 'Monitoring System', dueDate: '2024-02-15', status: 'Recertified' },
    { id: '98984290909', name: 'Security Scanner', dueDate: '2024-01-25', status: 'Overdue' },
    { id: '89237862387', name: 'Log Aggregator', dueDate: '2024-03-05', status: 'Incomplete' },
    { id: '83472094712', name: 'Production Database Container', dueDate: '2024-01-15', status: 'Overdue' },
    { id: '85238409275', name: 'Development Environment', dueDate: '2024-02-20', status: 'Incomplete' },
    { id: '72873847763', name: 'Staging Server Container', dueDate: '2024-01-30', status: 'Recertified' },
    { id: '73028478090', name: 'Test Environment', dueDate: '2024-03-10', status: 'Incomplete' },
    { id: '80099003472', name: 'Backup Storage Container', dueDate: '2024-01-10', status: 'Overdue' },
    { id: '38793047762', name: 'Monitoring System', dueDate: '2024-02-15', status: 'Recertified' },
    { id: '83352676777', name: 'Security Scanner', dueDate: '2024-01-25', status: 'Overdue' },
    { id: '83948823512', name: 'Log Aggregator', dueDate: '2024-03-05', status: 'Incomplete' },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setContainers(mockContainers);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
            <h2 className="text-lg font-medium text-gray-900">Container Status Tracker</h2>
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
                  Container ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContainers.map((container) => (
                <tr key={container.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {container.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {container.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {container.dueDate}
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

        {filteredContainers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No containers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'All' ? 'No containers available.' : `No containers with status "${filter}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
