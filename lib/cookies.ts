import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig } from 'box-typescript-sdk-gen';

export async function setAuthCookie(res: NextResponse, authCode: string, logoutURL: string) {
    try {

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


        res.cookies.set('auth_code', authCode, {
            path: '/',
            maxAge: 24 * 60 * 60, // 1 day in seconds
            httpOnly: false, // Allow client-side access
            secure: true,
            sameSite: 'strict'
        });

        res.cookies.set('redirect_to_box_url', logoutURL, {
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            httpOnly: false,
            secure: true,
            sameSite: 'strict'
        });

        res.cookies.set('user_id', userResponse.id, {
            path: '/',
            maxAge: 24 * 60 * 60, // 1 day in seconds
            httpOnly: false,
            secure: true,
            sameSite: 'strict'
        });

        res.cookies.set('user_name', userResponse.name || '', {
            path: '/',
            maxAge: 24 * 60 * 60, // 1 day in seconds
            httpOnly: false,
            secure: true,
            sameSite: 'strict'
        });


    } catch (error) {
        throw new Error(`Failed to authenticate with Box`);
    }
}

export async function getAuthCookie(COOKIE_NAME: string, request: NextRequest) {

        const cookie = request.cookies.get(COOKIE_NAME);
        return cookie?.value;

}