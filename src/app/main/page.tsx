import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

export default async function MainPageContent() {
  try {

    async function getUserCookies(auth_code: string, redirect_to_box_url: string) {
      "use server"
      const cookieStore = await cookies()


      const userId = await cookieStore.get('user_id');
      const userName = await cookieStore.get('user_name');
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
      await getUserCookies(auth_code, redirect_to_box_url);
    }

  } catch (error: any) {
    console.error('Error in MainPageContent:', error);
    return (
      <AppError error={error} />
    );
  }
}
