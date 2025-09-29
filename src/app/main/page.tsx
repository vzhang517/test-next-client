import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

export default async function MainPageContent() {
  try {

    const cookieStore = await cookies()


    const userId = cookieStore.get('user_id');
    const userName = cookieStore.get('user_name');
    if (!userId || !userName) {
      throw new Error('User ID or user name not found');
    }

    // Authenticate user
    const authenticatedUser = await checkAdmin(userId.value, userName.value);

    // Set default section based on user role
    const initialSection = authenticatedUser.isAdmin ? 'admin' : 'recertification';

    return (
        <MainPageClient user={authenticatedUser} initialSection={initialSection} />
    )

  } catch (error: any) {
    console.error('Error in MainPageContent:', error);
    return (
      <AppError error={error} />
    );
  }
}
