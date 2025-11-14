import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {

    let apiUrl = `${process.env.API_URL}/get_csrf_token/`;
    

    console.log('apiUrl:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const cookieStore = await cookies()

    cookieStore.set('csrfToken', data.csrfToken);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
    },
    });
  } catch (error) {
    console.error('Error fetching csrf token from api:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate client' },
      { status: 500 }
    );
  }
}