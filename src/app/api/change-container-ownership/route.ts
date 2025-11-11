import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    console.log('body:', body);
    const { 'user-id': userId, 'container-id': containerId, newOwnerId, newOwnerLogin } = body;


    if (!userId || !containerId || !newOwnerId || !newOwnerLogin) {
      console.log('Missing required fields: userId, containerId, newOwnerId, newOwnerLogin');
      console.log('userId:', userId);
      console.log('containerId:', containerId);
      console.log('newOwnerId:', newOwnerId);
      console.log('newOwnerLogin:', newOwnerLogin);
      return NextResponse.json(
        { error: 'Missing required fields: userId, containerId, newOwnerId, newOwnerLogin' },
        { status: 400 }
      );
    }

    const updateData = {
      'container-id': containerId || '',
      'user-id': userId || '',
      'owner-id': newOwnerId || '',
      'owner-email': newOwnerLogin || '',
    };


    const updateResponse = await fetch('${process.env.API_URL}/change_container_ownership/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    console.log('updateResponse:');
    console.log(updateResponse);


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
    console.error('Error changing container ownership in api:', error);
    return NextResponse.json(
      { error: 'Failed to change container ownership' },
      { status: 500 }
    );
  }
}