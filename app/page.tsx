'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { setCookie } from '@/lib/cookies';
import {ConsoleLogger} from '@aws-amplify/core';
const logger = new ConsoleLogger('test');
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleBoxAuthentication = async () => {
      try {

          const currentUrl = window.location.href;
          const urlParams = new URLSearchParams(currentUrl.split('?')[1] || '');
          
          // Try to get from properly formatted params first
          let authCode = await urlParams.get('auth_code');
          logger.info('authCode:', authCode);
          console.log('authCode:', authCode);
          let logoutURL = await urlParams.get('redirect_to_box_url');
          logger.info('logoutURL:', logoutURL);
          console.log('logoutURL:', logoutURL);
          // If still not found, try manual parsing for escaped backslashes
          if (!authCode || !logoutURL) {
            const urlString = await currentUrl.split('?')[1] || '';
            logger.info('Manual parsing URL string:', urlString);
            const paramPairs = await urlString.split('&');
            logger.info('Parameter pairs:', paramPairs);
            
            for (const pair of paramPairs) {
              // Handle both = and \= separators
              const separator = await pair.includes('\\=') ? '\\=' : '=';
              const [key, value] = await pair.split(separator);
              logger.info(`Processing pair: ${pair}, key: ${key}, value: ${value}`);
              
              if (key === 'auth_code' && !authCode) {
                authCode = await decodeURIComponent(value);
                logger.info('Found authCode:', authCode);
              } else if (key === 'redirect_to_box_url' && !logoutURL) {
                logoutURL = await decodeURIComponent(value);
                logger.info('Found logoutURL:', logoutURL);
              }
            }
          
        }
        
        if (!authCode || !logoutURL) {
          setError('No authorization code or logout URL received from Box');
          setIsLoading(false);
          return;
        }

        setCookie('auth_code', authCode, { expires: 1 }); // 1 day
        setCookie('redirect_to_box_url', logoutURL, { expires: 7 }); // 7 days

        // Do a box api call with auth code to check that it is valid
        const response = await fetch('/api/auth/box-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ auth_code: authCode }),
        });

        const userData = await response.json();

        setCookie('user_id', userData.id, { expires: 1 });
        setCookie('user_name', userData.name, { expires: 1 });  // 1 day

        // if code is not valid, throw an error
        if (!userData.ok) {
          throw new Error(userData.error || 'Failed to authenticate with Box');
        }
        
        // Redirect to main page
        router.push(`/main`)

        
      } catch (error) {
        console.error('Box authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
      }
    };

    handleBoxAuthentication();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        {isLoading ? (
          // Loading state
          <>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Authenticating...</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we verify your credentials.
              </p>
            </div>
          </>
        ) : error ? (
          // Error state
          <>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Authentication Failed</h3>
              <p className="text-sm">{error}</p>
              <p className="mt-2 text-sm text-gray-500">
                auth_code not detected
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Please close the integration and restart in Box to try again.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
              <p className="mt-2 text-sm text-gray-500">
                Initializing application...
              </p>
            </div>
          </div>
        </div>
      }>
      <HomeContent />
    </Suspense>
  );
}