import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/cookies';
export async function middleware(request: NextRequest) {
  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  console.log('pathname:', pathname);

  try {

    // if (pathname === '/') {
    //   const authCode = request.nextUrl.searchParams.get('auth_code');
    //   console.log('authCode:', authCode);
    //   const logoutURL = request.nextUrl.searchParams.get('redirect_to_box_url');
    //   console.log('logoutURL:', logoutURL);

    //   if (!authCode || !logoutURL) {
    //     const url = new URL('/', request.url);
    //     url.searchParams.set('status', 'failed');
    //     return NextResponse.redirect(url);
    //   }

    //   const authCodeCookie = await getAuthCookie('auth_code', request)
    //   const logoutURLCookie = await getAuthCookie('redirect_to_box_url', request)

    //   if (!authCodeCookie || !logoutURLCookie) {
    //     const response = await fetch('/api/auth/box-auth', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         auth_code: authCode,
    //         redirect_to_box_url: logoutURL
    //       }),
    //     });

    //     // if code is not valid, throw an error
    //     if (!response.ok) {
    //       throw new Error(`Failed to authenticate with Box. Error: ${response.status} ${response.statusText}`);
    //     }
    //   }

    //   return NextResponse.next()

    // }
    if (pathname.startsWith('/main')) {
      const authCodeCookie = await getAuthCookie('auth_code', request)
      console.log('authCodeCookie:', authCodeCookie);
      const logoutURLCookie = await getAuthCookie('redirect_to_box_url', request)
      console.log('logoutURLCookie:', logoutURLCookie);
      
      if (!authCodeCookie || !logoutURLCookie) {
        const url = new URL('/', request.url);
        url.searchParams.set('status', 'failed');
        return NextResponse.redirect(url);
      }

    }
  } catch (error) {
    console.error('Box authentication error:', error);
    const url = new URL('/', request.url);
    url.searchParams.set('status', 'failed');
    return NextResponse.redirect(url);
  }

}