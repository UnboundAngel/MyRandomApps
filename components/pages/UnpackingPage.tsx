import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, Play, Pause, Heart } from 'lucide-react';

const UNPACKING_IMAGES = [
    '/gallery/Unpacking 1-1-2026/20251230_0002.png',
    '/gallery/Unpacking 1-1-2026/20251230_0003.png',
    '/gallery/Unpacking 1-1-2026/20251230_0004.png',
    '/gallery/Unpacking 1-1-2026/20251230_0005.png',
    '/gallery/Unpacking 1-1-2026/20251231_0001.png',
    '/gallery/Unpacking 1-1-2026/20251231_0002.png',
    '/gallery/Unpacking 1-1-2026/20251231_0003.png',
    '/gallery/Unpacking 1-1-2026/20251231_0004.png',
    '/gallery/Unpacking 1-1-2026/20260101_0001.png',
    '/gallery/Unpacking 1-1-2026/20260101_0002.png',
    '/gallery/Unpacking 1-1-2026/20260101_0003.png',
    '/gallery/Unpacking 1-1-2026/20260101_0004.png',
    '/gallery/Unpacking 1-1-2026/20260101_0005.png',
    '/gallery/Unpacking 1-1-2026/20260101_0006.png',
    '/gallery/Unpacking 1-1-2026/20260105_0001.png',
    '/gallery/Unpacking 1-1-2026/20260105_0002.png',
    '/gallery/Unpacking 1-1-2026/20260105_0003.png',
    '/gallery/Unpacking 1-1-2026/20260105_0004.png',
    '/gallery/Unpacking 1-1-2026/20260105_0005.png',
    '/gallery/Unpacking 1-1-2026/20260105_0006.png',
    '/gallery/Unpacking 1-1-2026/20260118_0001.png',
    '/gallery/Unpacking 1-1-2026/20260119_0001.png',
    '/gallery/Unpacking 1-1-2026/20260119_0002.png',
    '/gallery/Unpacking 1-1-2026/20260119_0003.png',
    '/gallery/Unpacking 1-1-2026/20260119_0004.png',
    '/gallery/Unpacking 1-1-2026/20260119_0005.png',
    '/gallery/Unpacking 1-1-2026/20260119_0006.png',
    '/gallery/Unpacking 1-1-2026/20260119_0007.png',
    '/gallery/Unpacking 1-1-2026/20260119_0008.png',
    '/gallery/Unpacking 1-1-2026/20260119_0009.png',
    '/gallery/Unpacking 1-1-2026/20260119_0010.png'
];

export const UnpackingPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % UNPACKING_IMAGES.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + UNPACKING_IMAGES.length) % UNPACKING_IMAGES.length);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-10 pb-20 animate-fade-in bg-[#d7ccc8] overflow-hidden">
        
        <div className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        <div className="fixed inset-0 opacity-10 pointer-events-none">
            {[...Array(10)].map((_, i) => (
                <Heart 
                    key={i} 
                    className="absolute text-[#8d6e63] animate-pulse" 
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        transform: `scale(${Math.random() * 2 + 1}) rotate(${Math.random() * 360}deg)`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>

        <header className="relative z-10 text-center space-y-2 mb-8">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5d4037] text-[#efebe9] mb-2 shadow-lg transform -rotate-6">
                <Package size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#5d4037] tracking-tight font-serif drop-shadow-sm">
                Unpacking Our Home
            </h2>
        </header>

        {/* Polaroid Container */}
        <div className="relative z-10 w-full max-w-6xl aspect-[4/3] md:aspect-video flex items-center justify-center p-4">
             {UNPACKING_IMAGES.map((src, idx) => (
                <div 
                    key={idx}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out transform ${
                        idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                    <div className="bg-white p-4 pb-16 md:p-6 md:pb-20 rounded-sm shadow-[20px_20px_60px_rgba(0,0,0,0.15)] border-t border-l border-white/50 transform rotate-1 w-full h-full max-w-5xl">
                        <div className="relative w-full h-full overflow-hidden bg-[#8d6e63]/5 flex items-center justify-center">
                            {/* Blurred background version to fill edges */}
                            <img 
                                src={src} 
                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-110" 
                                alt=""
                            />
                            {/* Main Image (Contain ensures nothing is cut off) */}
                            <img src={src} className="relative w-full h-full object-contain z-10" alt="Memory" />
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center font-script text-2xl md:text-4xl text-[#5d4037] opacity-60">
                           Our Space
                        </div>
                    </div>
                </div>
             ))}

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-0 md:-inset-x-20 z-30 pointer-events-none">
                <button onClick={prevSlide} className="p-4 bg-[#5d4037]/10 hover:bg-[#5d4037]/20 rounded-full text-[#5d4037] backdrop-blur-sm transition-all pointer-events-auto"><ChevronLeft size={40} /></button>
                <button onClick={nextSlide} className="p-4 bg-[#5d4037]/10 hover:bg-[#5d4037]/20 rounded-full text-[#5d4037] backdrop-blur-sm transition-all pointer-events-auto"><ChevronRight size={40} /></button>
            </div>
        </div>

        <div className="relative z-10 flex justify-center gap-3 overflow-x-auto py-10 px-6 no-scrollbar w-full max-w-[95vw]">
            {UNPACKING_IMAGES.map((src, idx) => (
                <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
                    className={`relative flex-shrink-0 w-24 md:w-32 aspect-video bg-white p-1 pb-4 shadow-md transition-all duration-500 ${idx === currentIndex ? 'ring-2 ring-[#5d4037] -translate-y-2 z-20' : 'opacity-50 hover:opacity-100'}`}
                >
                    <img src={src} className="w-full h-full object-cover" alt="Thumb" />
                </button>
            ))}
        </div>

        <div className="absolute bottom-8 z-30 flex items-center gap-4">
             <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-[#5d4037] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <span className="text-[#5d4037] font-mono text-sm font-bold bg-white/40 px-3 py-1 rounded-full">{currentIndex + 1} / {UNPACKING_IMAGES.length}</span>
        </div>

        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </div>
  );
};
