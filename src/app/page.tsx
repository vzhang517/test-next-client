'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';
import { getCookie, setCookie } from 'cookies-next/client';


function HomeContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();


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

        //fetch user info from Box
        const userResponse = await fetch('/api/auth/box-auth', {
          method: 'POST',
          body: JSON.stringify({auth_code: authCode}),
        });

        if (!userResponse.ok) {
          setError('Failed to authenticate with Box');
          setIsLoading(false);
          return;
        }

        const userData = await userResponse.json();

        sessionStorage.setItem('userID', userData.id);
        sessionStorage.setItem('userName', userData.name);

        // Set authenticated state to show success message
        setIsAuthenticated(true);
        setIsLoading(false);
        router.push('/main');

      } catch (error) {
        console.error('Box authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
      }
    };

    handleBoxAuthentication();
  }, []);

  return (
    <>
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
    </>
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