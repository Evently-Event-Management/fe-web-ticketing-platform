'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  durationInMinutes: number;
  onExpire?: () => void;
}

export default function CountdownTimer({ durationInMinutes, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Check if we're in warning zone (less than 20% of time left)
    if (timeLeft <= durationInMinutes * 60 * 0.2) {
      setIsWarning(true);
    }

    // Check if timer expired
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, durationInMinutes]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerClasses = () => {
    const baseClasses = "flex items-center mt-3 text-sm p-2 rounded-md";
    
    if (isWarning) {
      return `${baseClasses} bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400`;
    }
    
    return `${baseClasses} bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500`;
  };

  return (
    <div className={getTimerClasses()}>
      <Clock className={`h-4 w-4 mr-2 ${isWarning ? 'animate-pulse' : ''}`} />
      <span>
        Seat reservation expires in <strong>{formatTime(timeLeft)}</strong>
      </span>
    </div>
  );
}