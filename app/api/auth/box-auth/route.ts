import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authCode = body.auth_code;

    if (!authCode) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    const config = new OAuthConfig({
      clientId: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
    });
    const oauth = new BoxOAuth({ config: config });

    // Exchange authorization code for access token
    const tokenResponse = await oauth.getTokensAuthorizationCodeGrant(authCode);

    const client = new BoxClient({ auth: oauth });

    // Get user information from Box API
    const userResponse = await client.users.getUserMe();

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
