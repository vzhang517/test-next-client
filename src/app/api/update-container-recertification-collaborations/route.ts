import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 'user-id': userId, 'container-id': containerId, collaborations } = body;

    if (!userId || !containerId || !collaborations) {
      return NextResponse.json(
        { error: 'Missing required fields: user-id, container-id, and collaborations' },
        { status: 400 }
      );
    }

    // First API call to update collaborations
    const updateData = {
      'user-id': userId,
      'container-id': containerId,
      'collaborations': collaborations
    };

    console.log('Sending update data to API:', updateData);

    const updateResponse = await fetch('https://nav.ossoccer.com/update_container_recertification_collaborations/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      throw new Error(`Update API error! status: ${updateResponse.status}`);
    }

    return NextResponse.json({
      success: true
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in update-container-recertification-collaborations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update container recertification collaborations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
