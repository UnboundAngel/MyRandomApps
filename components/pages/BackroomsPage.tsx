import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const BACKROOMS_IMAGES = [
    '/gallery/backrooms (1).png',
    '/gallery/backrooms (2).png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124134.png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124204.png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124617.png'
];

export const BackroomsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % BACKROOMS_IMAGES.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + BACKROOMS_IMAGES.length) % BACKROOMS_IMAGES.length);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-10 pb-20 animate-fade-in bg-[#1a1a0b] overflow-hidden font-mono text-white">
        
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

        <header className="relative z-10 text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#c9c17f] drop-shadow-2xl uppercase">
                Backrooms Together
            </h2>
            <div className="mt-4 text-xl md:text-2xl text-[#8c8128] font-serif italic">
                Christmas 2025
            </div>
        </header>

        {/* Immersive View */}
        <div className="relative z-10 w-full max-w-[90vw] aspect-video bg-black rounded-sm overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5">
            {BACKROOMS_IMAGES.map((src, idx) => (
                <div 
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                        idx === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Blurred background version to fill edges */}
                    <img 
                        src={src} 
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110" 
                        alt=""
                    />
                    {/* Main Image (Contain ensures nothing is cut off) */}
                    <img src={src} className="relative w-full h-full object-contain z-10 brightness-[0.9] contrast-[1.1]" alt="Backrooms Memory" />
                </div>
            ))}

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <button onClick={prevSlide} className="p-4 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all border border-white/10 pointer-events-auto"><ChevronLeft size={40} /></button>
                <button onClick={nextSlide} className="p-4 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all border border-white/10 pointer-events-auto"><ChevronRight size={40} /></button>
            </div>
        </div>

        <div className="relative z-10 flex justify-center gap-4 py-12 px-6 no-scrollbar w-full max-w-[90vw] overflow-x-auto">
            {BACKROOMS_IMAGES.map((src, idx) => (
                <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
                    className={`relative flex-shrink-0 w-28 md:w-44 aspect-video rounded-sm border-2 transition-all duration-500 ${
                        idx === currentIndex ? 'border-[#c9c17f] scale-110 shadow-2xl z-20' : 'border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                >
                    <img src={src} className="w-full h-full object-cover" alt="Thumb" />
                </button>
            ))}
        </div>

        <div className="absolute bottom-8 z-30 flex items-center gap-6">
             <button onClick={() => setIsPlaying(!isPlaying)} className="text-[#c9c17f] hover:text-white transition-colors">
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <span className="text-white/20 font-mono tracking-widest text-lg">{currentIndex + 1} / {BACKROOMS_IMAGES.length}</span>
        </div>

        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </div>
  );
};