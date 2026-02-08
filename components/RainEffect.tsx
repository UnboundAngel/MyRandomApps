import React, { useEffect, useRef, useState } from 'react';

export const RainEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0);

  // Slow fade-in effect to transition from the "void"
  useEffect(() => {
      const timer = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops: { x: number; y: number; speed: number; length: number }[] = [];
    const count = 500;

    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 5 + 2,
        length: Math.random() * 20 + 10
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      drops.forEach(drop => {
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      ctx.stroke();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
        className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-[5000ms] ease-in"
        style={{ opacity }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 text-gray-500 font-serif text-xl animate-pulse">
        ...oh...
      </div>
    </div>
  );
};