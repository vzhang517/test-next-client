import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const body = await request.json();
    const COOKIE_NAME = body.cookie_name;
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

  } catch (error) {
    console.error('Cookie error:', error);
    return NextResponse.json(
      { error: 'Error grabbing user cookies' },
      { status: 500 }
    );
  }
}
