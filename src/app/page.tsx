'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Authenticated from '@/_components/Authenticated';
import AppError from '@/_components/Error';
import AuthenticatingLoading from '@/_components/AuthenticatingLoading';


function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const handleBoxAuthentication = async () => {
      try {
        // Check if there's an existing session that has expired

        // const authCode = searchParams.get('auth_code');
        // const logoutURL = searchParams.get('redirect_to_box_url');
        
        // if (!authCode || !logoutURL) {
        //   setError('No authorization code or logout URL received from Box');
        //   setIsLoading(false);
        //   return;
        // }

        // //fetch user info from Box
        // const userResponse = await fetch('/api/auth/box-auth', {
        //   method: 'POST',
        //   body: JSON.stringify({auth_code: authCode}),
        // });

        // if (!userResponse.ok) {
        //   setError('Failed to authenticate with Box');
        //   setIsLoading(false);
        //   return;
        // }

        // const userData = await userResponse.json();

        // sessionStorage.setItem('userID', userData.id);
        // sessionStorage.setItem('userName', userData.name);

        sessionStorage.setItem('userID', '12345');
        sessionStorage.setItem('userName', 'John Doe');

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