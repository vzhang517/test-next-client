import { NextRequest, NextResponse } from 'next/server';


export async function getAuthCookie(COOKIE_NAME: string, request: NextRequest) {

        const cookie = request.cookies.get(COOKIE_NAME);
        return cookie?.value;

}