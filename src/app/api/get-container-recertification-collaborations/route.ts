import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const containerId = searchParams.get('containerId');

    if (!containerId) {
      return NextResponse.json(
        { error: 'container ID is required' },
        { status: 400 }
      );
    }

    // Build the API URL with sorting parameters
    let apiUrl = `https://nav.ossoccer.com/container/${containerId}/collaborations/`;

    

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
    console.error('Error fetching container owner dashboard from api:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container owner dashboard data' },
      { status: 500 }
    );
  }
}