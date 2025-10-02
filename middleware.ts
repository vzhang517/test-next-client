import { NextRequest, NextResponse } from 'next/server';
export async function middleware(request: NextRequest) {

  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    return NextResponse.next();
  }


    //   const authCodeCookie = await getAuthCookie('auth_code', request)
    //   const logoutURLCookie = await getAuthCookie('redirect_to_box_url', request)

      const authCode = sessionStorage.getItem('auth_code');
      if (!authCode) {
        const response = await fetch('/api/auth/box-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_code: authCode
          }),
        });

        // if code is not valid, throw an error
        if (!response.ok) {
          return NextResponse.redirect(new URL('/signout', request.url))
        }
      }

}

export const config = {
  matcher: '/main',
}