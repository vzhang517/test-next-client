'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';
import { getCookie, setCookie } from 'cookies-next/client';


export default function Home() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const logoutURL = searchParams.get('redirect_to_box_url');
  const authCode = searchParams.get('auth_code');
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds
  const oneDayFromNow = new Date();
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

  try {
    setCookie('redirect_to_box_url', logoutURL, { path: '/', expires: oneDayFromNow });
  } catch (error) {
    console.error('Error setting redirect_to_box_url cookie:', error);
  }

  setCookie('auth_code', authCode, { path: '/', expires: oneHourFromNow });
  console.log('logoutURL cookie', getCookie('redirect_to_box_url'));
  console.log('authCode cookie', getCookie('auth_code'));

  useEffect(() => {
    const handleBoxAuthentication = async () => {
      try {

        const authCode = getCookie('auth_code');
        console.log('authCode in useEffect', authCode);

        if (!authCode || !logoutURL) {
          setError('No authorization code or logout URL received from Box');
          setIsLoading(false);
          return;
        }

        //fetch user info from Box
        const userResponse = await fetch('/api/auth/box-auth', {
          method: 'POST',
          body: JSON.stringify({ auth_code: authCode }),
        });

        if (!userResponse.ok) {
          setError('Failed to authenticate with Box');
          setIsLoading(false);
          return;
        }

        const userData = await userResponse.json();
        setCookie('user_id', userData.id, { path: '/', expires: oneDayFromNow });
        setCookie('user_name', userData.name || '', { path: '/', expires: oneDayFromNow });
        console.log('userID cookie', getCookie('user_id'));
        console.log('userName cookie', getCookie('user_name'));

        // Set authenticated state to show success message
        setIsAuthenticated(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Box authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
      }
    };

    handleBoxAuthentication();
  }, [searchParams]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          {isLoading ? (
            // Loading state
            <AuthenticatingLoading />
          ) : error ? (
            // Error state
            <AppError error={error} />
          ) : isAuthenticated ? (
            // Authenticated state
            <Authenticated />
          )
            : null}
        </div>
      </div>
  );
}