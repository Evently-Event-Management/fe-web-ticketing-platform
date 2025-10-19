import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the maintenance mode is enabled via environment variable
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  
  // If maintenance mode is active, redirect all requests to the maintenance page
  // except for the maintenance page itself to avoid infinite redirects
  if (maintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    // Create a new URL for the maintenance page on the same domain
    const maintenanceUrl = new URL('/maintenance', request.url);
    
    // Return a redirect response to the maintenance page
    return NextResponse.redirect(maintenanceUrl);
  }
  
  // Continue with the request normally if maintenance mode is not enabled
  return NextResponse.next();
}

// Apply the middleware to all routes except for specific paths like static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. /images/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|categories/).*)',
  ],
};