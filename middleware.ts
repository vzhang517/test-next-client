import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // For all other paths, check for authentication
  console.log('Checking for auth cookie...');
  const accessCookie = request.cookies.get('auth_code');
  if (!accessCookie) {
    // If no auth cookie, redirect to the root
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*"],
}