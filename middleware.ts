import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/login' || 
    path === '/' || 
    path === '/today' || 
    path.startsWith('/api/socket');
  
  // Define admin paths that require authentication
  const isAdminPath = path.startsWith('/admin');
  
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is already logged in and tries to access login page, redirect to admin dashboard
    if (path === '/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // For other public paths, allow access
    return NextResponse.next();
  }
  
  if (isAdminPath && !token) {
    // If user is not logged in and tries to access admin pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For all other cases, continue
  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/today', '/api/socket'],
};