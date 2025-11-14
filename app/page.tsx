'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';
import { useSearchParams } from 'next/navigation';


function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    
    const handleBoxAuthentication = async () => {
      try {
        //Check if there's an existing session that has expired

        const authCode = searchParams.get('auth_code');
        
        if (!authCode) {
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


        // sessionStorage.setItem('userID', '45342655132');
        // sessionStorage.setItem('userName', 'Erik Lane');
        

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
  }, []);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return <AuthenticatingLoading />;
  }

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