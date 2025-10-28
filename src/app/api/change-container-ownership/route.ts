import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const containerId = searchParams.get('containerId');
    const newOwnerId = searchParams.get('newOwnerId');
    const newOwnerLogin = searchParams.get('newOwnerLogin');

    if (!containerId) {
      return NextResponse.json(
        { error: 'container ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      'container-id': containerId || '',
      'user-id': userId || '',
      'owner-id': newOwnerId || '',
      'owner-email': newOwnerLogin || '',
    };


    const updateResponse = await fetch('https://nav.ossoccer.com/change_container_ownership/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });


    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    const data = await updateResponse.json();

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