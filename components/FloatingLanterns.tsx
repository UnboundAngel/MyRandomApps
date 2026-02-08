import React, { useMemo } from 'react';

export const FloatingLanterns: React.FC = () => {
  // Memoize lanterns to prevent re-generation on re-renders
  const lanterns = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const leftVal = Math.random() * 100;
      const topVal = Math.random() * 100; // Distribute vertically across the container
      
      // Tilt logic
      const tiltDirection = leftVal < 50 ? 1 : -1; 
      const rotation = (Math.random() * 15 + 5) * tiltDirection; 

      return {
        id: i,
        left: `${leftVal}%`,
        top: `${topVal}%`,
        animationDelay: `${Math.random() * 20}s`,
        duration: `${25 + Math.random() * 15}s`,
        scale: Math.random() * 0.4 + 0.3,
        opacity: Math.random() * 0.3 + 0.7,
        rotation,
      };
    });
  }, []);

  const lanternUrl = '/lantern.png';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 h-full">
      {lanterns.map((lantern) => (
        <img
          key={lantern.id}
          src={lanternUrl}
          alt="Floating Lantern"
          className="absolute drop-shadow-[0_0_15px_rgba(242,201,76,0.5)] lantern-item pointer-events-none"
          style={{
            left: lantern.left,
            top: lantern.top, // Changed from bottom to top for full page distribution
            width: `${120 * lantern.scale}px`,
            height: 'auto',
            opacity: lantern.opacity,
            '--rotation': `${lantern.rotation}deg`,
            animationDelay: lantern.animationDelay,
            animationDuration: lantern.duration,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        .lantern-item {
          transform: rotate(var(--rotation));
          animation-name: floatUp;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(var(--rotation));
          }
          100% {
            transform: translateY(-1000px) rotate(var(--rotation));
          }
        }
      `}</style>
    </div>
  );
};