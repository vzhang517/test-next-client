'use client';

import { useState } from 'react';

interface SearchProps {
  userId: string;
  isAdmin: boolean;
}

type SearchType = 'User' | 'Status';
type StatusValue = 'Incomplete' | 'Overdue' | 'Recertified';

interface SearchResults {
  [key: string]: any;
}

export default function Search({ userId, isAdmin }: SearchProps) {
  const [searchType, setSearchType] = useState<SearchType>('User');
  const [value, setValue] = useState<string>('');
  const [statusValue, setStatusValue] = useState<StatusValue>('Incomplete');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [results, setResults] = useState<SearchResults[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPageNumber(1); // Reset to page 1 on new search
      setHasNext(false);
      setHasPrevious(false);

      const searchValue = searchType === 'User' ? value : statusValue;
      console.log('searchValue:', searchValue);

          // Check if value is an email address (contains @ symbol)
      const isEmail = searchValue.includes('@');
      const encodedValue = isEmail ? encodeURIComponent(searchValue) : searchValue;
      console.log('encodedValue:', encodedValue);

      if (!searchValue) {
        setError('Please enter a value for the search');
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        searchType: searchType,
        value: encodedValue,
        userId: userId,
        PageNumber: '1',
      });

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('data:', data);
      
      // Handle array or object response
      if (Array.isArray(data)) {
        setResults(data);
        setHasNext(false);
        setHasPrevious(false);
      } else if (data.results || data.data) {
        setResults(data.results || data.data || []);
        // Extract pagination info if available
        if (data.pagination) {
          setHasNext(data.pagination.has_next || false);
          setHasPrevious(data.pagination.has_previous || false);
        } else {
          setHasNext(false);
          setHasPrevious(false);
        }
      } else if (typeof data === 'object') {
        // If it's an object, try to find array values
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayKeys.length > 0) {
          setResults(data[arrayKeys[0]]);
        } else {
          setResults([data]);
        }
        // Extract pagination info if available
        if (data.pagination) {
          setHasNext(data.pagination.has_next || false);
          setHasPrevious(data.pagination.has_previous || false);
        } else {
          setHasNext(false);
          setHasPrevious(false);
        }
      } else {
        setResults([]);
        setHasNext(false);
        setHasPrevious(false);
      }

      setHasSearched(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error performing search:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      setError(null);

      const searchValue = searchType === 'User' ? value : statusValue;

      if (!searchValue) {
        setError('Please enter a value for the search');
        setIsGeneratingReport(false);
        return;
      }

      // Check if value is an email address (contains @ symbol)
      const isEmail = searchValue.includes('@');
      const encodedValue = isEmail ? encodeURIComponent(searchValue) : searchValue;

      const params = new URLSearchParams({
        searchType: searchType,
        value: encodedValue,
        userId: userId,
        PageNumber: '1',
        export: 'true',
      });

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle the response - could be a file download or JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Report generated:', data);
      } else {
        // If it's a file, trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-report-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setIsGeneratingReport(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report, start a new search to restart');
      setIsGeneratingReport(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1) return;

    try {
      setIsLoading(true);
      setError(null);

      const searchValue = searchType === 'User' ? value : statusValue;
      
      // Check if value is an email address (contains @ symbol)
      const isEmail = searchValue.includes('@');
      const encodedValue = isEmail ? encodeURIComponent(searchValue) : searchValue;

      const params = new URLSearchParams({
        searchType: searchType,
        value: encodedValue,
        PageNumber: newPage.toString(),
      });

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle array or object response
      if (Array.isArray(data)) {
        setResults(data);
        setHasNext(false);
        setHasPrevious(false);
      } else if (data.results || data.data) {
        setResults(data.results || data.data || []);
        // Extract pagination info if available
        if (data.pagination) {
          setHasNext(data.pagination.has_next || false);
          setHasPrevious(data.pagination.has_previous || false);
        } else {
          setHasNext(false);
          setHasPrevious(false);
        }
      } else if (typeof data === 'object') {
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayKeys.length > 0) {
          setResults(data[arrayKeys[0]]);
        } else {
          setResults([data]);
        }
        // Extract pagination info if available
        if (data.pagination) {
          setHasNext(data.pagination.has_next || false);
          setHasPrevious(data.pagination.has_previous || false);
        } else {
          setHasNext(false);
          setHasPrevious(false);
        }
      } else {
        setResults([]);
        setHasNext(false);
        setHasPrevious(false);
      }

      setPageNumber(newPage);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching page:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch page');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };


  const renderResults = () => {
    if (results.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      );
    }

    // Define columns based on search type
    const userIDColumns = [
      'id',
      'collaborator_name',
      'collaborator_login',
      'owner_name',
      'owner_login',
      'path_ids',
      'item_id',
      'item_type',
      'collaborator_permission',
      'invited_date',
      'collaboration_id',
    ];

    const statusColumns = [
      'container_folder_id',
      'status',
      'primary_container_owner_id',
      'due_date',
      'completed_date',
      'next_recert_date'
    ];

    const columns = searchType === 'User' ? userIDColumns : statusColumns;

    // Helper function to format column header
    const formatColumnHeader = (key: string) => {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Helper function to get cell value
    const getCellValue = (result: SearchResults, key: string) => {
      // Try different possible key formats (snake_case, camelCase, etc.)
      const possibleKeys = [
        key,
        key.replace(/_/g, ''),
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        key.toLowerCase(),
        key.toUpperCase()
      ];

      for (const possibleKey of possibleKeys) {
        if (result[possibleKey] !== undefined && result[possibleKey] !== null) {
          return result[possibleKey];
        }
      }

      // Also check if the key exists in any case variation
      const actualKey = Object.keys(result).find(
        k => k.toLowerCase() === key.toLowerCase()
      );

      if (actualKey) {
        return result[actualKey];
      }

      return '';
    };

    // Check if a value is a date
    const isDateValue = (value: any, columnName: string): boolean => {
      // Check if column name suggests it's a date
      if (columnName.toLowerCase().includes('date') && value) {
        return true;
      }
      
      if (typeof value !== 'string') return false;
      // Check for date patterns
      return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}\/\d{2}\/\d{2}/.test(value);
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {formatColumnHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => {
                  const cellValue = getCellValue(result, column);
                  const displayValue = isDateValue(cellValue, column)
                    ? formatDate(String(cellValue))
                    : String(cellValue ?? '');

                  return (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Search Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600 mb-6">Search containers by User ID or Status</p>
        
        <div className="space-y-4">
          {/* First Row: Search Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Type */}
            <div>
              <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-2">
                Search Type*
              </label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value as SearchType);
                  setValue('');
                  setStatusValue('Incomplete');
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="User">User</option>
                <option value="Status">Status</option>
              </select>
            </div>

            {/* Value Field */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Value*
              </label>
              {searchType === 'User' ? (
                <input
                  type="text"
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter User Email ex: john.doe@example.com or Group Name ex: Finance Team"
                />
              ) : (
                <select
                  id="statusValue"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value as StatusValue)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Incomplete">Incomplete</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Recertified">Recertified</option>
                </select>
              )}
            </div>
          </div>

          {/* Second Row: Start Date, End Date, and Search Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm font-medium"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || isGeneratingReport || !!error || results.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-red-900">Error performing search</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {renderResults()}
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={!hasPrevious || isLoading}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-sm text-gray-700 px-4">
                    Page {pageNumber}
                  </div>
                  <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={!hasNext || isLoading}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

