import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import Loading from '@/_components/Loading';
import AppError from '@/_components/Error';
import { Suspense } from 'react';

export default async function MainPageContent() {
  try {

    const userIDParam = new URLSearchParams();
    userIDParam.append('cookie_name', 'user_id');
    const userIDFetchUrl = `https://main.d1bol0p5uacib.amplifyapp.com/api/get-cookie?${userIDParam.toString()}`;
    const userIDReponse = await fetch(userIDFetchUrl);


    const userNameParam = new URLSearchParams();
    userNameParam.append('cookie_name', 'user_name');
    const userNameFetchUrl = `https://main.d1bol0p5uacib.amplifyapp.com/api/get-cookie?${userNameParam.toString()}`;
    const userNameReponse = await fetch(userNameFetchUrl);

    // const userId = await document.cookie.split('; ').find(row => row.startsWith('user_id='))?.split('=')[1];
    // const userName = await document.cookie.split('; ').find(row => row.startsWith('user_name='))?.split('=')[1];

    if (!userIDReponse.ok || !userNameReponse.ok) {
      throw new Error('Error with User Check');
    }
    
    const userIDJson = await userIDReponse.json();
    const userId = userIDJson.cookie_value;
    const userNameJson = await userNameReponse.json();
    const userName = userNameJson.user_name;

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
