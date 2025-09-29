import Authenticated from '@/_components/Authenticated';
import Loading from '@/src/app/main/loading';
import AppError from '@/_components/Error';
import { Suspense } from 'react';
import { BoxClient, BoxOAuth, OAuthConfig } from 'box-typescript-sdk-gen';
import { cookies } from 'next/headers'

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

    // Do a box api call with auth code to check that it is valid
    const config = new OAuthConfig({
      clientId: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
    });

    if (!config.clientId || !config.clientSecret) {
      throw new Error('Client ID and client secret are required')
    }

    console.log('OAuth config created', config);

    console.log('Creating BoxOAuth...');
    const oauth = new BoxOAuth({ config: config });
    console.log('BoxOAuth created');

    // Exchange authorization code for access token
    console.log('Exchanging auth code for token...');
    await oauth.getTokensAuthorizationCodeGrant(auth_code);
    console.log('Token exchange successful');

    console.log('Creating BoxClient...');
    const client = new BoxClient({ auth: oauth });
    console.log('BoxClient created');

    // Get user information from Box API
    console.log('Getting user info...');
    const userResponse = await client.users.getUserMe();
    console.log('User info retrieved');

    const cookieStore = await cookies()
    const oneDayFromNow = new Date();
    await oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    await cookieStore.set('auth_code', auth_code, { path: '/', expires: oneDayFromNow }); // 1 day
    const accessCookie = await cookieStore.get('auth_code');
    await console.log('accessCookie page:', accessCookie);
    await cookieStore.set('redirect_to_box_url', redirect_to_box_url, { path: '/', expires: oneDayFromNow });
    await cookieStore.set('user_id', userResponse.id, { path: '/', expires: oneDayFromNow });
    const userIDCookie = await cookieStore.get('user_id');
    console.log('userIDCookie page:', userIDCookie);
    await cookieStore.set('user_name', userResponse.name || '', { path: '/', expires: oneDayFromNow });  // 1 day
    const userNameCookie = await cookieStore.get('user_name');
    console.log('userNameCookie page:', userNameCookie);

    if (accessCookie && userIDCookie && userNameCookie) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <Suspense fallback={<Loading />}>
              <Authenticated />
            </Suspense>
          </div> </div>
      )
    }
    else {
      throw new Error('Error authenticating with Box')
    }

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