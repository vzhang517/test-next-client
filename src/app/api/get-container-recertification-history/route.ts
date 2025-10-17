import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const containerId = searchParams.get('containerId');
    const isAdmin = searchParams.get('isAdmin');
    const exportParam = searchParams.get('export');

    if (!userId || !containerId || !isAdmin) {
      return NextResponse.json(
        { error: 'missing required parameter' },
        { status: 400 }
      );
    }

    // Build the API URL with parameters
    let apiUrl = `https://nav.ossoccer.com/get_container_recertification_history/?container-id=${containerId}&user-id=${userId}&is-admin=${isAdmin}`;
    
    // Add export parameter if present
    if (exportParam === 'true') {
      apiUrl += '&export=true';
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

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching container history from api:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container history data' },
      { status: 500 }
    );
  }
}