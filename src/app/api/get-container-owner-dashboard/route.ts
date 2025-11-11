import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const column = searchParams.get('column');
    const order = searchParams.get('order');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build the API URL with sorting parameters
    let apiUrl = `${process.env.API_URL}/get_container_owner_dashboard/?user-id=${userId}`;
    
    if (column) {
      apiUrl += `&column=${column}`;
    }
    if (order) {
      apiUrl += `&order=${order}`;
    }

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

    console.log('container owner dashboard API route data:', data);

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