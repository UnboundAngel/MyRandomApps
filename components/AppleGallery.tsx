import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface AppleGalleryProps {
  images: string[];
  title?: string;
  subtitle?: string;
}

export const AppleGallery: React.FC<AppleGalleryProps> = ({ images, title, subtitle }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <div className="w-full h-full">
      {(title || subtitle) && (
          <div className="mb-6 px-4">
              {title && <h3 className="text-2xl font-bold text-white mb-1 font-serif">{title}</h3>}
              {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
          </div>
      )}

      {/* Masonry-ish Grid (CSS Columns) */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-4 space-y-4">
        {images.map((src, idx) => (
          <div 
            key={idx}
            onClick={() => openLightbox(idx)}
            className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-zoom-in bg-white/5 border border-white/10 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <img 
                src={src} 
                alt={`Gallery ${idx}`} 
                className="w-full h-auto object-cover" 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 size={16} className="text-white drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / "Swipe" View */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button 
                onClick={closeLightbox}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50"
            >
                <X size={24} />
            </button>

            {/* Navigation Buttons */}
            <button 
                onClick={prevImage}
                className="absolute left-4 md:left-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:scale-110 z-40 hidden md:block"
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                onClick={nextImage}
                className="absolute right-4 md:right-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:scale-110 z-40 hidden md:block"
            >
                <ChevronRight size={32} />
            </button>

            {/* Main Image Container */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center p-4" onClick={closeLightbox}>
                 <img 
                    src={images[selectedIndex]} 
                    alt="Full View" 
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-zoom-in"
                    onClick={(e) => e.stopPropagation()} 
                 />
                 
                 {/* Mobile Swipe Hints (Visual Only) */}
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:hidden pointer-events-none opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                 </div>
                 
                 {/* Counter */}
                 <div className="absolute top-6 left-6 text-white/50 font-mono text-sm">
                     {selectedIndex + 1} / {images.length}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};
