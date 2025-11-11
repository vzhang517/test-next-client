import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Build the API URL with parameters
    let apiUrl = `${process.env.API_URL}/admin_check/?user-id=${userId}`;

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

    console.log('data:', data);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Admin Check Failed:', error);
    return NextResponse.json(
      { error: 'Failed to check if user is admin' },
      { status: 500 }
    );
  }
}