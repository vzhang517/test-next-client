import Authenticated from '@/_components/Authenticated';
import Loading from '@/_components/Loading';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
export default async function Home({
  params,
}: {
  params: Promise<{ auth_code: string, redirect_to_box_url: string }>}) {

  try {

    const { auth_code, redirect_to_box_url } = await params;
    console.log('auth_code:', auth_code);
    console.log('redirect_to_box_url:', redirect_to_box_url);

    if (!params || !auth_code || !redirect_to_box_url) {
      throw new Error(`No authorization code or logout URL received from Box`);
    }

    // Do a box api call with auth code to check that it is valid
    const response = await fetch('/api/auth/box-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        auth_code: auth_code,
        redirect_to_box_url: redirect_to_box_url
        }),
    });


    // if code is not valid, throw an error
    if (!response.ok) {
      throw new Error(`Failed to authenticate with Box. Error: ${response.status} ${response.statusText}`);
    }

    else {
      return (
      <Suspense fallback={<Loading />}>
        <Authenticated />
      </Suspense>);
    }

    
  } catch (error: any) {
    return(
    <Suspense fallback={<Loading />}>
      <AppError error={error} />
    </Suspense>);
  }
    
}