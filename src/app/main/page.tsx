'use client';

import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import AppError from '@/_components/Error';
import Loading from './loading';
import { getUserCookies } from '@/src/app/cookies'
import { useState, useEffect, Suspense } from 'react';

function MainPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialSection, setInitialSection] = useState('recertification');
  useEffect(() => {
    try {
      async function handleUserCheck() {

        const userId = await getUserCookies('user_id');
        const userName = await getUserCookies('user_name');
        if (!userId || !userName) {
          throw new Error('User ID or user name not found');
        }
        const authenticatedUser = await checkAdmin(userId, userName);
        setUser(authenticatedUser);
        if (!user) {
          throw new Error('User not found');
        }

        // Set default section based on user role
        authenticatedUser.isAdmin ? setInitialSection('admin') : setInitialSection('recertification');

      }

    } catch (error: any) {
      console.error('Error in MainPageContent:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AppError error={error} />
    );
  }
  return (
    <Suspense fallback={<Loading />}>
      <MainPageClient user={user} initialSection={initialSection} />
    </Suspense>
  )
}

export default function MainPage() {
  return (
    <Suspense fallback={
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
      <MainPageContent />
    </Suspense>
  );
}
