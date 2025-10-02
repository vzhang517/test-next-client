'use client';

import { useEffect } from 'react';


export default function SignoutScreen() {
  useEffect(() => {
   
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">You have been signed out</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your session has expired or there was an error
          </p>
          <p className="mt-1 text-xs text-gray-400">
            You have been automatically signed out for security reasons. Please close the window and restart the integration from Box.
          </p>
        </div>
      </div>
    </div>
  );
}
