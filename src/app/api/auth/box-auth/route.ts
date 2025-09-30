import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen';

export async function POST(request: NextRequest) {
  try {
    console.log('testing api');
    const body = await request.json();
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

    console.log('userResponse in route', userResponse);

    // Create response with user data
    return new NextResponse(JSON.stringify(userResponse), {
      status: 200,
      headers: {
          'Content-Type': 'application/json',
      },
      });

  } catch (error) {
    console.error('Box authentication error:', error);
    return NextResponse.json(
      { error: 'Error during user authentication' },
      { status: 500 }
    );
  }
}
