'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string | Date;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({ 
  endTime, 
  onExpire, 
  className = '',
  showIcon = true 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeRemaining = (targetDate: Date): TimeRemaining => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  };

  useEffect(() => {
    const targetDate = new Date(endTime);
    
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(remaining);

      if (remaining.total <= 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, isExpired, onExpire]);

  const formatTime = () => {
    if (isExpired) {
      return 'انتهى المزاد';
    }

    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
      return `${days} يوم ${hours} ساعة`;
    } else if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getColorClass = () => {
    if (isExpired) return 'text-red-600';
    
    const { total } = timeRemaining;
    const hoursRemaining = total / (1000 * 60 * 60);
    
    if (hoursRemaining < 1) return 'text-red-500'; // Less than 1 hour - red
    if (hoursRemaining < 24) return 'text-orange-500'; // Less than 1 day - orange
    return 'text-gray-600'; // More than 1 day - gray
  };

  const getUrgencyClass = () => {
    if (isExpired) return '';
    
    const { total } = timeRemaining;
    const minutesRemaining = total / (1000 * 60);
    
    if (minutesRemaining < 60) return 'animate-pulse'; // Last hour - pulse
    return '';
  };

  return (
    <div className={`flex items-center space-x-2 space-x-reverse ${className}`}>
      {showIcon && (
        <>
          {isExpired ? (
            <AlertCircle className={`h-4 w-4 ${getColorClass()}`} />
          ) : (
            <Clock className={`h-4 w-4 ${getColorClass()} ${getUrgencyClass()}`} />
          )}
        </>
      )}
      <span className={`font-mono text-sm ${getColorClass()} ${getUrgencyClass()}`}>
        {formatTime()}
      </span>
      
      {!isExpired && timeRemaining.total < 3600000 && ( // Less than 1 hour
        <span className="text-xs text-red-500 font-medium">
          (عاجل!)
        </span>
      )}
    </div>
  );
}