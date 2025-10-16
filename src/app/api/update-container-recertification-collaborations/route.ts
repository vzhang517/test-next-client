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

    const updateResponse = await fetch('https://nav.ossoccer.com/update-container-recertification-collaborations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      throw new Error(`Update API error! status: ${updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    console.log('Update API response:', updateResult);

    // Second API call to confirm recertification
    const confirmData = {
      'user-id': userId,
      'container-id': containerId
    };

    console.log('Sending confirm data to API:', confirmData);

    const confirmResponse = await fetch('https://nav.ossoccer.com/confirm-container-recertification/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmData),
    });

    if (!confirmResponse.ok) {
      throw new Error(`Confirm API error! status: ${confirmResponse.status}`);
    }

    const confirmResult = await confirmResponse.json();
    console.log('Confirm API response:', confirmResult);

    return NextResponse.json({
      success: true,
      updateResult,
      confirmResult
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
