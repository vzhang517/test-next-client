import Authenticated from '@/_components/Authenticated';
import Loading from '@/src/app/main/loading';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
import { authenticateWithBox } from '@/lib/cookies';
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_code?: string, redirect_to_box_url?: string }>;
}) {

  try {
    const params = await searchParams;
    const auth_code = params.auth_code;
    const redirect_to_box_url = params.redirect_to_box_url;

    console.log('auth_code:', auth_code);
    console.log('redirect_to_box_url:', redirect_to_box_url);

    if (!auth_code || !redirect_to_box_url) {
      throw new Error(`No authorization code or logout URL received from Box`);
    }
    await authenticateWithBox(auth_code, redirect_to_box_url);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <Suspense fallback={<Loading />}>
            <Authenticated />
          </Suspense>
        </div>
      </div>
    )

  } catch (error: any) {
    console.error('Error in Home:', error);
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