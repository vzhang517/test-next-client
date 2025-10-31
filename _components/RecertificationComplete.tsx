'use client';

import { useRouter } from 'next/navigation';

export default function RecertificationComplete() {
  const router = useRouter();

  const handleOK = () => {
    router.push('/main');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recertification Complete
          </h2>
          
          <p className="text-gray-600 mb-8">
            Your container recertification has been successfully submitted and processed. 
            All collaboration updates have been applied.
          </p>

          {/* OK Button */}
          <button
            onClick={handleOK}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}
