import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '404 | Page Not Found | Ticketly',
  description: 'The page you are looking for does not exist.',
};

export default function NotFoundPage() {
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
      
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Page Not Found</h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link href="/events">
            Browse Events
          </Link>
        </Button>
      </div>
    </div>
  );
}