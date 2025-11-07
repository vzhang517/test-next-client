import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {

    let apiUrl = `https://nav.ossoccer.com/get_csrf_token/`;
    

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