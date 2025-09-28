import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie, setAuthCookie } from '@/lib/cookies';
import { useSearchParams, useRouter } from 'next/navigation';
export async function middleware(request: NextRequest) {
  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    return NextResponse.next();
  }

  const searchParams = useSearchParams();
  const authCode = searchParams.get('auth_code');
  console.log('authCode:', authCode);
  const logoutURL = searchParams.get('redirect_to_box_url');
  console.log('logoutURL:', logoutURL);

  if (!authCode || !logoutURL) {
    const url = new URL('/', request.url);
    url.searchParams.set('status', 'failed');
    return NextResponse.redirect(url);
  }

  try {

    const res = NextResponse.next()
    const authCodeCookie = await getAuthCookie('auth_code', request)
    const logoutURLCookie = await getAuthCookie('redirect_to_box_url', request)

    if (!authCodeCookie || !logoutURLCookie) {
      setAuthCookie(res, authCode, logoutURL)
    }

    return res

  } catch (error) {
    console.error('Box authentication error:', error);
    const url = new URL('/', request.url);
    url.searchParams.set('status', 'failed');
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/main/:path*"],
}