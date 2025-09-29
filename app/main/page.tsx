'use server';

import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import Loading from '@/_components/Loading';
import AppError from '@/_components/Error';
import { Suspense } from 'react';

export default async function MainPageContent() {
  try {

    const userIDReponse = await fetch('/api/get-cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookie_name: 'user_id',
      }),
    });

    const userIDJson = await userIDReponse.json();
    const userId = userIDJson.cookie_value;

    const userNameReponse = await fetch('/api/get-cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookie_name: 'user_name',
      }),
    });
    const userNameJson = await userNameReponse.json();
    const userName = userNameJson.user_name;

    // const userId = await document.cookie.split('; ').find(row => row.startsWith('user_id='))?.split('=')[1];
    // const userName = await document.cookie.split('; ').find(row => row.startsWith('user_name='))?.split('=')[1];

    if (!userId || !userName) {
      throw new Error('Error with User Check');
    }

    // Authenticate user
    const authenticatedUser = await checkAdmin(userId, userName);

    // Set default section based on user role
    const initialSection = authenticatedUser.isAdmin ? 'admin' : 'recertification';

    return (
      <Suspense fallback={<Loading />}>
        <MainPageClient user={authenticatedUser} initialSection={initialSection} />
      </Suspense>
    )

  } catch (error: any) {
    console.error('Error in MainPageContent:', error);
    return (
      <AppError error={error} />
    );
  }
}
