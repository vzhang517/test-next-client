'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { authenticateWithBox } from '@/src/app/cookies';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';
import router from 'next/router';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

        await authenticateWithBox(authCode, logoutURL);

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
  }, []);

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