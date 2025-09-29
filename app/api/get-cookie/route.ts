import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const COOKIE_NAME = request.nextUrl.searchParams.get('cookie_name');
    console.log('COOKIE_NAME:', COOKIE_NAME);
    if (!COOKIE_NAME) {
      throw new Error('Cookie name not provided');
    }
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie) {
      throw new Error('Cookie not found');
    }

    // Use request.cookies in middleware context
    // const cookie = request.cookies.get(COOKIE_NAME);
    // if (!cookie) {
    //   throw new Error('Cookie not found');
    // }

    // Return success response
    return new NextResponse(JSON.stringify({ cookie_value: cookie.value }), {
    status: 200,
    headers: {
        'Content-Type': 'application/json',
    },
    });

  } catch (error:any) {
    console.error('Cookie error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
