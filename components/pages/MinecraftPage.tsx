import React, { useState, useEffect } from 'react';
import { Box, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const MINECRAFT_IMAGES = Array.from({ length: 27 }, (_, i) => `/gallery/minecraft (${i + 1}).png`);

export const MinecraftPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [bgColor, setBgColor] = useState('rgba(20, 40, 20, 0.8)');

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % MINECRAFT_IMAGES.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + MINECRAFT_IMAGES.length) % MINECRAFT_IMAGES.length);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = MINECRAFT_IMAGES[currentIndex];
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setBgColor(`rgba(${r}, ${g}, ${b}, 0.5)`);
    };
  }, [currentIndex]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-4 md:pt-10 pb-24 overflow-hidden">
        
        {/* REACTIVE BACKGROUND */}
        <div 
            className="fixed inset-0 z-0 transition-all duration-[1500ms] ease-in-out"
            style={{ 
                background: `radial-gradient(circle at center, ${bgColor} 0%, #050505 100%)`,
            }}
        />
        
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
            <div 
                className="absolute top-0 left-0 w-full h-full blur-[150px] transition-colors duration-[2000ms]"
                style={{ backgroundColor: bgColor }}
            />
        </div>

        <header className="relative z-10 text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white font-mono tracking-tighter drop-shadow-2xl">MINECRAFT JAVA</h2>
        </header>

        {/* MASSIVE Cinematic Slideshow */}
        <div className="relative z-10 group w-full max-w-[95vw] h-[60vh] md:h-[78vh] rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
            
            {/* Image Layer - Using Contain to prevent cutting off images */}
            <div className="absolute inset-0">
                {MINECRAFT_IMAGES.map((src, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* Blurred background version to fill edges */}
                        <img 
                            src={src} 
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110" 
                            alt=""
                        />
                        {/* Main Image (Contain ensures nothing is cut off) */}
                        <img 
                            src={src} 
                            alt={`Minecraft ${idx}`} 
                            className="relative w-full h-full object-contain z-10" 
                        />
                    </div>
                ))}
            </div>

            {/* Clean Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <button 
                    onClick={prevSlide}
                    className="p-3 md:p-6 bg-black/30 hover:bg-white/10 rounded-full text-white backdrop-blur-xl transition-all border border-white/10"
                >
                    <ChevronLeft size={40} />
                </button>
                <button 
                    onClick={nextSlide}
                    className="p-3 md:p-6 bg-black/30 hover:bg-white/10 rounded-full text-white backdrop-blur-xl transition-all border border-white/10"
                >
                    <ChevronRight size={40} />
                </button>
            </div>

            {/* Info & Playback */}
            <div className="absolute bottom-8 left-8 z-30 flex items-center gap-4">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-black/40 hover:bg-white/10 rounded-2xl text-white backdrop-blur-xl border border-white/10 transition-all"
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="text-white font-mono text-base tracking-widest bg-black/40 px-5 py-2 rounded-2xl backdrop-blur-xl border border-white/10">
                    {currentIndex + 1} / {MINECRAFT_IMAGES.length}
                </div>
            </div>
        </div>

        {/* Larger Thumbnails */}
        <div className="relative z-10 flex justify-center gap-4 overflow-x-auto py-10 px-6 no-scrollbar w-full max-w-[95vw]">
            {MINECRAFT_IMAGES.map((src, idx) => (
                <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
                    className={`relative flex-shrink-0 w-32 md:w-44 aspect-video rounded-xl overflow-hidden border-2 transition-all duration-500 ${idx === currentIndex ? 'border-white scale-110 z-20 shadow-2xl' : 'border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                    <img src={src} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                </button>
            ))}
        </div>

        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </div>
  );
};
