'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import {motion, AnimatePresence} from 'framer-motion';
import {Bell, Eye, Tag, Loader2} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {EventBasicInfoDTO} from "@/types/event";
import {cn} from '@/lib/utils';
import {subscribeToEntity, unsubscribeFromEntity, checkSubscriptionStatus} from '@/lib/subscriptionUtils';
import {toast} from 'sonner';

interface NetflixHeroProps {
  event: EventBasicInfoDTO;
  viewCount?: number;
}

export function NetflixHero({ event, viewCount }: NetflixHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const { title, coverPhotos, organization, category } = event;
  
  // Default to at least one image
  const images = coverPhotos && coverPhotos.length > 0 
    ? coverPhotos 
    : ['/logo-1.png']; // fallback

  // Auto rotate images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    let active = true;

    const loadSubscriptionStatus = async () => {
      try {
        const status = await checkSubscriptionStatus(event.id, 'event');
        if (active) {
          setIsSubscribed(status);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status for hero:', error);
      }
    };

    void loadSubscriptionStatus();

    return () => {
      active = false;
    };
  }, [event.id]);

  const toggleFollow = async () => {
    if (followPending) return;
    setFollowPending(true);

    try {
      if (isSubscribed) {
        const success = await unsubscribeFromEntity({id: event.id, type: 'event', name: event.title});
        if (success) {
          setIsSubscribed(false);
          toast.success(`Unfollowed ${event.title}`);
        }
      } else {
        const success = await subscribeToEntity({id: event.id, type: 'event', name: event.title});
        if (success) {
          setIsSubscribed(true);
          toast.success(`Following ${event.title}`);
        }
      }
    } catch (error) {
      console.error('Failed to toggle event follow state:', error);
      toast.error('Unable to update reminders right now. Please try again.');
    } finally {
      setFollowPending(false);
    }
  };

  const handleBuyTickets = () => {
        toast.info("Please select a session below to continue", {
            description: "Choose an available session for this event",
            duration: 3000,
        });

        // Scroll to sessions section
        const sessionsSection = document.getElementById('sessions-section');
        if (sessionsSection) {
            sessionsSection.scrollIntoView({behavior: 'smooth'});
        }
    };

  return (
    <section className="relative w-full h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden netflix-vignette">
      {/* Background images with fade transition */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentImageIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Image
            src={images[currentImageIndex]}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
          {/* Dark cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Foreground content */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="container mx-auto px-4 pb-8 md:pb-12 lg:pb-16">
          <div className="max-w-5xl text-white space-y-4">
            {/* Glassy organization info */}
            {organization && (
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Avatar className="h-12 w-12 border-2 border-white/30">
                  <AvatarImage src={organization.logoUrl || ''} alt={organization.name} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {organization.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs text-white/70">Presented by</span>
                  <span className="font-medium text-white">{organization.name}</span>
                </div>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold netflix-title-reveal drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
              {title}
            </motion.h1>

            {/* Glassy event details */}
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {category && (
                <Badge className="bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center gap-2 text-sm py-1.5 px-3 shadow-md">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{category.name}</span>
                  {category.parentName && (
                    <span className="opacity-80 text-xs">({category.parentName})</span>
                  )}
                </Badge>
              )}

              {viewCount !== undefined && (
                <Badge className="bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center gap-2 text-sm py-1.5 px-3 shadow-md">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{viewCount.toLocaleString()} views</span>
                </Badge>
              )}
            </motion.div>

            {/* CTA button with strong glass effect */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  size="lg" 
                  onClick={handleBuyTickets}
                  className="gap-2 bg-white/15 backdrop-blur-lg border border-white/25 text-white shadow-lg hover:bg-white/25 transition-all duration-200 rounded-2xl"
                >
                  Get Tickets
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={toggleFollow}
                  disabled={followPending}
                  aria-pressed={isSubscribed}
                  className={cn(
                    "gap-2 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-lg transition-all duration-200",
                    isSubscribed && "bg-white/20 text-white"
                  )}
                >
                  {followPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className={cn("h-4 w-4", isSubscribed && "text-yellow-300")}/>
                  )}
                  <span>{isSubscribed ? 'Following' : 'Remind me'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image indicators (glassy dots) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all backdrop-blur-md border border-white/40",
                index === currentImageIndex 
                  ? "bg-white/90 w-6 shadow-md" 
                  : "bg-white/40 hover:bg-white/60"
              )}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function NetflixHeroSkeleton() {
  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] lg:h-[85vh] bg-muted/50 animate-pulse overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full p-8 space-y-8">
        <div className="h-10 w-32 bg-muted-foreground/20 rounded-full"></div>
        <div className="h-16 w-3/4 max-w-2xl bg-muted-foreground/20 rounded-lg"></div>
        <div className="flex gap-4">
          <div className="h-8 w-32 bg-muted-foreground/20 rounded-full"></div>
          <div className="h-8 w-32 bg-muted-foreground/20 rounded-full"></div>
        </div>
        <div className="h-10 w-32 bg-primary/30 rounded-lg"></div>
      </div>
    </div>
  );
}
