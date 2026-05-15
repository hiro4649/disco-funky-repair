import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a referral URL
  const url = request.nextUrl.clone();
  
  if (url.pathname.startsWith('/r/')) {
    // Extract referral code from the path
    const referralCode = url.pathname.split('/r/')[1];
    
    if (referralCode) {
      // Set the referral cookie
      const response = NextResponse.next();
      response.cookies.set('ref', referralCode, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/r/:path*',
  ],
};