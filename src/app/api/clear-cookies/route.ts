import { NextRequest, NextResponse } from 'next/server';
import { BoxClient, BoxOAuth, OAuthConfig} from 'box-typescript-sdk-gen'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {

    const cookieStore = await cookies()
    cookieStore.delete('auth_code')
    cookieStore.delete('user_id')
    cookieStore.delete('user_name')

    // Return success response
    return NextResponse.json({
      200: 'success'
    });

  } catch (error) {
    console.error('Cookie error:', error);
    return NextResponse.json(
      { error: 'Error grabbing user cookies' },
      { status: 500 }
    );
  }
}
