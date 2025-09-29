import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Loading from './loading';

export default async function MainPageContent() {
  try {

    async function getUserCookies() {
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
        <Suspense fallback={<Loading />}>
        <MainPageClient user={authenticatedUser} initialSection={initialSection} />
        </Suspense>
      )
    }
      await getUserCookies();

  } catch (error: any) {
    console.error('Error in MainPageContent:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <Suspense fallback={<Loading />}>
            <AppError error={error} />
          </Suspense>
        </div>
      </div>)
  }
}
