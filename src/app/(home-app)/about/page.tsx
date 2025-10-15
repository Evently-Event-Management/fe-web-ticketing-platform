import { Metadata } from 'next';
import Image from 'next/image';
import { CheckCircle, Users, Calendar, Clock } from 'lucide-react';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'About Us | Ticketly',
  description: 'Learn about Ticketly, the premier platform for seamless event ticketing and management in Sri Lanka.',
};

export default function AboutPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-chart-2/20 blur-3xl"></div>
          <div className="absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-chart-3/20 blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              About Ticketly
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The premier platform for seamless event ticketing and management in Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Ticketly, we&#39;re on a mission to transform the way events are experienced in Sri Lanka.
                We believe everyone deserves seamless access to extraordinary experiences, from concerts and 
                theater performances to sports events and workshops.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform connects event organizers with audiences, providing powerful tools for 
                event management while delivering a frictionless ticket purchasing experience for attendees.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop" 
                alt="Concert event" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Ticketly</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-muted-foreground">
                State-of-the-art security ensures your payment and personal information are always protected.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Powerful Admin Tools</h3>
              <p className="text-muted-foreground">
                Event organizers get robust management tools to handle everything from seating to analytics.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Diverse Events</h3>
              <p className="text-muted-foreground">
                From concerts to workshops, sports to theater - find and manage any type of event.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground">
                Receive your tickets instantly via email with our paperless e-ticket system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Team</h2>
            <p className="text-lg text-muted-foreground">
              Ticketly is built by a passionate team dedicated to creating the best event experience platform in Sri Lanka.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team member cards can be added here when you have actual team information */}
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww" 
                  alt="Team Member" 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">John Doe</h3>
              <p className="text-muted-foreground">Chief Executive Officer</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d29tYW4lMjBwcm9mZXNzaW9uYWx8ZW58MHx8MHx8fDA%3D" 
                  alt="Team Member" 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Jane Smith</h3>
              <p className="text-muted-foreground">Chief Technology Officer</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D" 
                  alt="Team Member" 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">David Johnson</h3>
              <p className="text-muted-foreground">Head of Operations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Ticketly?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join thousands of event attendees and organizers who trust Ticketly for their event needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/events" 
                className="inline-flex items-center justify-center rounded-md bg-background px-8 py-3 text-sm font-medium text-primary shadow transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Browse Events
              </Link>
              <Link 
                href="/manage/organization" 
                className="inline-flex items-center justify-center rounded-md border border-primary-foreground bg-transparent px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Create Your Event
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}