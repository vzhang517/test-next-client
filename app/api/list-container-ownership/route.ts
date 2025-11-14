import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const containerId = searchParams.get('containerId');
    const includeEditor = searchParams.get('includeEditor');

    if (!containerId) {
      return NextResponse.json(
        { error: 'container ID is required' },
        { status: 400 }
      );
    }

    // Build the API URL with sorting parameters
    let apiUrl = `${process.env.API_URL}/list_container_ownership/?container-id=${containerId}&user-id=${userId}`;

    // Add export parameter if present
    if (includeEditor === 'true') {
      apiUrl += '&include-editor=true';
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
    console.error('Error fetching the list of container owners from api:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container owners' },
      { status: 500 }
    );
  }
}