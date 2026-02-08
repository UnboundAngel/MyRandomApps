import React, { useState, useEffect } from 'react';

interface TimerProps {
  showBoat?: boolean;
  timerOnly?: boolean;
  isMusicPlaying?: boolean;
}

export const RelationshipTimer: React.FC<TimerProps> = ({ showBoat = true, timerOnly = false, isMusicPlaying = false }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date('2025-06-26T00:00:00');

    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTime({ days, hours, minutes, seconds });
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, []);

  const lanternBg = '/boat.png';

  // Timer-only mode
  if (!showBoat) {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg md:text-2xl font-serif text-tangled-gold text-center mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider opacity-90">
          Time Since Our Story Began
        </h2>
        <div className="grid grid-cols-4 gap-3 md:gap-8 p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5">
          <TimeUnit value={time.days} label="Days" />
          <TimeUnit value={time.hours} label="Hours" />
          <TimeUnit value={time.minutes} label="Mins" />
          <TimeUnit value={time.seconds} label="Secs" />
        </div>
        <div className="mt-2 text-tangled-gold/60 font-script text-sm md:text-base drop-shadow-md">
          June 26, 2025
        </div>
      </div>
    );
  }

  // Boat Mode
  return (
    <div className="w-full flex flex-col items-center justify-end pointer-events-none">
      
      <div className="relative w-full max-w-5xl flex justify-center items-end overflow-visible">

        {/* The Boat Image */}
        <img 
          src={lanternBg} 
          alt="Tangled Boat Scene" 
          className="relative z-10 w-full h-auto max-h-[40vh] md:max-h-[50vh] object-contain object-bottom drop-shadow-[0_0_25px_rgba(0,0,0,0.5)]"
          style={{ marginBottom: '-1px' }}
        />
      </div>
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[40px] md:min-w-[60px]">
    <div className="text-xl md:text-3xl font-serif font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
      {Math.abs(value)}
    </div>
    <div className="text-yellow-200/80 text-[9px] md:text-xs uppercase tracking-widest mt-1 drop-shadow-md">
      {label}
    </div>
  </div>
);