'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';
import router from 'next/router';
import { useSetCookie, useGetCookie } from 'cookies-next/client'

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setCookie = useSetCookie();
  const getCookie = useGetCookie();

  useEffect(() => {
    const handleBoxAuthentication = async () => {
      try {

        const authCode = searchParams.get('auth_code');
        const logoutURL = searchParams.get('redirect_to_box_url');

        if (!authCode || !logoutURL) {
          setError('No authorization code or logout URL received from Box');
          setIsLoading(false);
          return;
        }

        const userResponse = await fetch('/api/auth/box-auth', {
          method: 'POST',
          body: JSON.stringify({auth_code: authCode}),
        });

        const userData = await userResponse.json();

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

        setCookie('auth_code',authCode, { path: '/', expires: oneHourFromNow });
        setCookie('redirect_to_box_url',logoutURL, { path: '/', expires: oneDayFromNow });

        console.log('authCode cookie',getCookie('auth_code'));
        console.log('logoutURL cookie', getCookie('redirect_to_box_url'));


        setCookie('user_id',userData.id, { path: '/', expires: oneHourFromNow });
        setCookie('user_name',userData.name || '', { path: '/', expires: oneHourFromNow });

        // Set authenticated state to show success message
        setIsAuthenticated(true);
        setIsLoading(false);

        
      } catch (error) {
        console.error('Box authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
      }
    };
    router.push('/main');

    handleBoxAuthentication();
  }, [setCookie, getCookie]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        {isLoading ? (
          // Loading state
          <AuthenticatingLoading />
        ) : error ? (
          // Error state
          <AppError error={error} />
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense 
      fallback={
        <AuthenticatingLoading />
      }>
      <HomeContent />
    </Suspense>
  );
}