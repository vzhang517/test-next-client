import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check if this is a browser navigation request (has text/html in Accept header)
    const acceptHeader = request.headers.get('accept') || '';
    const isBrowserNavigation = acceptHeader.includes('text/html');

    if (isBrowserNavigation) {
      // Redirect browser navigation requests to the main page
      return NextResponse.redirect(new URL('/main', request.url));
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}