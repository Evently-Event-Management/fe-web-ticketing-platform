'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative w-40 h-40 mb-8">
        <Image
          src="/images/logo-high.png"
          alt="Ticketly Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
        Something went wrong
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        We&#39;re sorry, but we encountered an unexpected error while processing your request.
      </p>
      
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
        <Button 
          onClick={reset}
          size="lg"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      {/* Optional error details for development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-muted rounded-md max-w-full overflow-auto text-left">
          <p className="font-mono text-sm opacity-70">{error.message}</p>
        </div>
      )}
    </div>
  );
}