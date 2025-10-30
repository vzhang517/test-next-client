import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    console.log('body:', body);
    const { templateId, name, description, subject, emailBody, boxFileId } = body;

    console.log('templateId:', templateId);
    console.log('name:', name);
    console.log('description:', description);
    console.log('subject:', subject);
    console.log('emailBody:', emailBody);
    console.log('boxFileId:', boxFileId);


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
      'subject-line': subject || '',
      'email-body': emailBody || '',
      'box-file-id': boxFileId || '',
    };

    console.log('updateData:');
    console.log(updateData);


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