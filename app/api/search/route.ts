import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchType = searchParams.get('searchType');
    const value = searchParams.get('value');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pageNumber = searchParams.get('PageNumber');
    const exportParam = searchParams.get('export');
    const userId = searchParams.get('userId');

    console.log('search route userId:', userId);


    if (!searchType || !value || !pageNumber) {
      return NextResponse.json(
        { error: 'missing required parameters: searchType, value, pageNumber' },
        { status: 400 }
      );
    }

    // Check if value is an email address (contains @ symbol)
    const isEmail = value.includes('@');
    const encodedValue = isEmail ? encodeURIComponent(value) : value;

    // Build the API URL with parameters
    let apiUrl = `${process.env.API_URL}/search/?search-type=${searchType}&value=${encodedValue}&user-id=${userId}&page=${pageNumber}&offset=250`;
  

    if (startDate) {
      apiUrl += `&start-date=${startDate}`;
    }

    if (endDate) {
      apiUrl += `&end-date=${endDate}`;
    }

    // Add export parameter if present
    if (exportParam == 'true') {
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

    console.log('search API route data:', data);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error Searching via api:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}