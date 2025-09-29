'use server';

import Authenticated from '@/components/Authenticated';
import Loading from '@/components/Loading';
import AppError from '@/components/Error';
import { Suspense } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams}) {

  try {

    const authInfo = await searchParams;
    console.log('searchParams:', authInfo);

    const authCode = (await searchParams).auth_code;
    const logoutURL = (await searchParams).redirect_to_box_url;

    if (!searchParams || !authCode || !logoutURL) {
      throw new Error(`No authorization code or logout URL received from Box`);
    }

    // Do a box api call with auth code to check that it is valid
    const response = await fetch('/api/auth/box-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        auth_code: authCode,
        redirect_to_box_url: logoutURL
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