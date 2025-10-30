import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const userId = searchParams.get('userId');
    
    if (!templateId || !userId) {
      return NextResponse.json(
        { error: 'Template ID and User ID are required' },
        { status: 400 }
      );
    }

    
    let apiUrl = `https://nav.ossoccer.com/get_email_template/${templateId}/?user-id=${userId}`;
    

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
    console.error('Error fetching email template from api:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    );
  }
}