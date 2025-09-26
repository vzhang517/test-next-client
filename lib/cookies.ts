/**
 * Cookie utility functions for managing authentication data
 */

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(
  name: string, 
  value: string, 
  options: {
    expires?: number; // in days
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  const {
    expires = 7, // default 7 days
    path = '/',
    secure = true,
    sameSite = 'strict'
  } = options;

  const date = new Date();
  date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
  const expiresStr = date.toUTCString();

  let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expiresStr}; path=${path}; samesite=${sameSite}`;
  
  if (secure) {
    cookieString += '; secure';
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Remove a cookie by setting it to expire in the past
 */
export function removeCookie(name: string, path: string = '/'): void {
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  removeCookie('user_id');
  removeCookie('user_name');
  removeCookie('redirect_to_box_url');
  removeCookie('auth_code');
}
