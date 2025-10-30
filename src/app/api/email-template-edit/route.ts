import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    console.log('body:', body);
    const { 'template-id': templateId, name, description, subject, 'body': emailBody, boxFileId } = body;


    if (!templateId || templateId === '') {
        return NextResponse.json(
          { error: 'Email Template is required' },
          { status: 400 }
        );
    }

    const updateData = {
      'template-id': templateId || '',
      'template-name': name || '',
      'template-desc': description || '',
      'subject': subject || '',
      'subject-line': emailBody || '',
      'box-file-id': boxFileId || '',
    };


    const updateResponse = await fetch('https://nav.ossoccer.com/email_template_edit/', {
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
    console.error('Error editing email template in api:', error);
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}