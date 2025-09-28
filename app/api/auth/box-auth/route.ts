import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen';
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const body = await request.json();
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


    await cookieStore.set('auth_code', authCode, { path: '/', expires: 1 }); // 1 day
    const accessCookie = cookieStore.get('auth_code');
    console.log('accessCookie page:', accessCookie);
    await cookieStore.set('redirect_to_box_url', logoutURL, { path: '/', expires: 7 }); // 7 days
    await cookieStore.set('user_id', userResponse.id, { path: '/', expires: 1 });
    const userIDCookie = cookieStore.get('user_id');
    console.log('userIDCookie page:', userIDCookie);
    await cookieStore.set('user_name', userResponse.name || '', { path: '/', expires: 1 });  // 1 day
    const userNameCookie = cookieStore.get('user_name');
    console.log('userNameCookie page:', userNameCookie);

    // Create response with user data
    const response = NextResponse.json({
      200: 'success'
    });

   
    return response;

  } catch (error) {
    console.error('Box authentication error:', error);
    return NextResponse.json(
      { error: 'Error during user authentication' },
      { status: 500 }
    );
  }
}
