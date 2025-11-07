import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, containerId, recertificationId, collaborations } = body;

    if (!userId || !containerId || !recertificationId || !collaborations) {
      return NextResponse.json(
        { error: 'Missing required fields: user-id, container-id, recertification-id, and collaborations' },
        { status: 400 }
      );
    }

    // First API call to update collaborations
    const updateData = {
      'user-id': userId,
      'container-id': containerId,
      'recertification-id': recertificationId,
      'collaborations': collaborations
    };

    console.log('Sending update data to API:', updateData);

    let tokenUrl = `https://nav.ossoccer.com/get_csrf_token/`;
    

    console.log('apiUrl:', tokenUrl);

    const csrfTokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!csrfTokenResponse.ok) {
      throw new Error(`Token fetch error! status: ${csrfTokenResponse.status}`);
    }

    const csrfToken = await csrfTokenResponse.json();
    console.log('csrfToken:', csrfToken.csrfToken);

    const updateResponse = await fetch('https://nav.ossoccer.com/update_container_collaborations/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken.csrfToken,
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
