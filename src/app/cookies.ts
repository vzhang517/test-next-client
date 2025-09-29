'use server'

import { BoxClient, BoxOAuth, OAuthConfig } from 'box-typescript-sdk-gen';
import { cookies } from 'next/headers';

export async function authenticateWithBox(auth_code: string, redirect_to_box_url: string) {
        try {
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
        }
        catch (error) {
                console.error('Box Autheication Error:', error);
                throw new Error('Error authenticating with Box')
        }
}

export async function getUserCookies(cookieName: string) {
        try {
                const cookieStore = await cookies()

                const cookie = cookieStore.get(cookieName);
                if (!cookie) {
                throw new Error('Cookie not found');
                }
                return cookie.value;
        }
        catch (error) {
                console.error('Box Autheication Error:', error);
                throw new Error('Error authenticating with Box')
        }
        
      }