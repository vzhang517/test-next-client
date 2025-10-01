import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen';
import { cookies } from 'next/headers';
import { getCookie, setCookie} from 'cookies-next/server';

export async function POST(req: NextRequest) {
  try {
    const res = new NextResponse();
    const body = await req.json();
    console.log('body:', body);
    const authCode = body.auth_code;
    console.log('authCode:', authCode);
    const logoutURL = body.redirect_to_box_url;
    console.log('logoutURL:', logoutURL);

    if (!authCode) { 
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    console.log('Creating OAuth config...');
    const config = new OAuthConfig({
      clientId: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
    });

    if (!config.clientId || !config.clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and client secret are required' },
        { status: 400 }
      );
    }

    console.log('OAuth config created', config);
    
    console.log('Creating BoxOAuth...');
    const oauth = new BoxOAuth({ config: config });
    console.log('BoxOAuth created');

    // Exchange authorization code for access token
    console.log('Exchanging auth code for token...');
    await oauth.getTokensAuthorizationCodeGrant(authCode);
    console.log('Token exchange successful');

    console.log('Creating BoxClient...');
    const client = new BoxClient({ auth: oauth });
    console.log('BoxClient created');

    // Get user information from Box API
    console.log('Getting user info...');
    const userResponse = await client.users.getUserMe();
    console.log('User info retrieved');

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    await setCookie('auth_code', authCode, { res, req });
    console.log('auth_code cookie', await getCookie('auth_code', { res, req }));

    await setCookie('redirect_to_box_url', logoutURL, { res, req });

    await setCookie('user_id', userResponse.id, { res, req });
    console.log('user_id cookie', await getCookie('user_id', { res, req }));

    await setCookie('user_name', userResponse.name || '', { res, req });

    // await setCookie('auth_code', authCode, { cookies });
    // console.log('auth_code cookie', await getCookie('auth_code', { res, req }));
    // await getCookie('auth_code', { cookies });
    // await setCookie('redirect_to_box_url', logoutURL, { cookies });
    // await getCookie('redirect_to_box_url', { cookies });
    // await setCookie('user_id', userResponse.id, { cookies });
    // await getCookie('user_id', { cookies });
    // await setCookie('user_name', userResponse.name || '', { cookies });
    // await getCookie('user_name', { cookies });

    // Create response with user data
    return res;

  } catch (error) {
    console.error('Box authentication error:', error);
    return NextResponse.json(
      { error: 'Error during user authentication' },
      { status: 500 }
    );
  }
}
