import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Ensure Authorization header is preserved and passed through
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    console.log('🔐 Middleware: Authorization header preserved');
  }
  
  // For API routes, ensure headers are accessible
  const response = NextResponse.next();
  
  if (authHeader) {
    response.headers.set('x-auth-header-debug', 'present');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/requests/:path*',
    '/api/products/:path*',
    '/api/auctions/:path*',
  ],
};
