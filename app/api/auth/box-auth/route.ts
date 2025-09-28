import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen';
import {ConsoleLogger} from '@aws-amplify/core';
const logger = new ConsoleLogger('test');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('body:', body);
    console.log('body:', body);
    const authCode = body.auth_code;
    console.log('authCode:', authCode);

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
    console.log('OAuth config created');
    
    console.log('Creating BoxOAuth...');
    const oauth = new BoxOAuth({ config: config });
    console.log('BoxOAuth created');

    // Exchange authorization code for access token
    console.log('Exchanging auth code for token...');
    const tokenResponse = await oauth.getTokensAuthorizationCodeGrant(authCode);
    console.log('Token exchange successful');

    console.log('Creating BoxClient...');
    const client = new BoxClient({ auth: oauth });
    console.log('BoxClient created');

    // Get user information from Box API
    console.log('Getting user info...');
    const userResponse = await client.users.getUserMe();
    console.log('User info retrieved');

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: userResponse.id,
        name: userResponse.name,
        login: userResponse.login,
        email: userResponse.login, // Box uses login as email
      }
    });

    // Set authentication cookies
    // response.cookies.set('box_access_token', tokenResponse.accessToken!, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    //   maxAge: 3600 // 1 hour
    // });
    
    // response.cookies.set('box_refresh_token', tokenResponse.refreshToken!, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 3600 // 7 days
    // });
    
    // response.cookies.set('box_user', JSON.stringify({
    //   id: userResponse.id,
    //   name: userResponse.name,
    //   login: userResponse.login,
    //   email: userResponse.login,
    // }), {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    //   maxAge: 3600 // 1 hour
    // });

    return response;

  } catch (error) {
    console.error('Box authentication error:', error);
    return NextResponse.json(
      { error: 'Error during user authentication' },
      { status: 500 }
    );
  }
}
