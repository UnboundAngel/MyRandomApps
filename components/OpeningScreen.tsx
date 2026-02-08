import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { AtmosphereShader } from './AtmosphereShader';

interface OpeningScreenProps {
  onOpen: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onOpen }) => {
  const [status, setStatus] = useState<'closed' | 'opening' | 'open' | 'full'>('closed');
  const [exiting, setExiting] = useState(false);

  const handleOpen = () => {
    if (status !== 'closed') return;
    
    // Step 1: Open Flap
    setStatus('opening');
    
    // Step 2: Slide Card Up (Wait for flap to open)
    setTimeout(() => {
      setStatus('open');
    }, 600);

    // Step 3: Zoom In/Expand (Wait for card to slide out)
    setTimeout(() => {
      setStatus('full');
    }, 1400);
  };

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onOpen, 1000);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // console.error(`[OpeningScreen] Failed to load image: ${e.currentTarget.src}`);
    // Hide broken image to prevent ugly icon
    e.currentTarget.style.display = 'none';
  };

  // Textures and Colors
  const envelopeColor = "#4a2f7a"; // Deep Tangled Purple
  const envelopeDark = "#321d55"; // Darker shade for insides
  const envelopeLight = "#5B3E96"; // Lighter shade for flaps
  
  // A subtle linen pattern via CSS radial gradients
  const textureStyle = {
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 1px, transparent 1px),
      radial-gradient(circle at 0% 0%, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '8px 8px, 12px 12px'
  };

  // Filter to turn black line art into the vintage brown/gold (#856b48) used in text
  const lineArtFilter = "invert(46%) sepia(16%) saturate(1324%) hue-rotate(7deg) brightness(96%) contrast(87%)";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden perspective-2000 transition-opacity duration-1000 bg-black ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* --- BACKGROUND LAYER --- */}
      {/* 1. Static Magical Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://wallpapercave.com/wp/PR5bFYI.jpg')" }}
      />
      
      {/* 2. WebGL Mist Shader */}
      <AtmosphereShader />

      {/* 3. Dark Overlay Vignette to focus center */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_80%,#000_100%)] z-10 pointer-events-none" />

      {/* --- FLOATING PARTICLES (Foreground) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-tangled-gold rounded-full animate-float blur-[1px]"></div>
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-tangled-gold/80 rounded-full animate-float-delayed blur-[1px]"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-tangled-gold rounded-full animate-float blur-[1px]"></div>
      </div>

      {/* --- 3D INTERACTIVE CARD CONTAINER --- */}
      <div 
        className={`relative transition-all duration-1000 ease-in-out transform-style-3d z-30 ${
          status === 'full' ? 'scale-[3] translate-y-[30vh] opacity-0' : 'scale-100 hover:scale-105 cursor-pointer opacity-100'
        }`}
        style={{ width: '340px', height: '230px' }}
        onClick={handleOpen}
      >
        
        {/* --- THE LETTER INSIDE --- */}
        <div 
          className="absolute left-0 right-0 mx-auto bg-[#fdf6e3] shadow-md transition-all duration-1000 ease-in-out flex flex-col items-center overflow-hidden"
          style={{
            width: '90%',
            height: '210px',
            top: '5px',
            zIndex: 5,
            transform: 
              status === 'closed' || status === 'opening' 
                ? 'translateY(0)' 
                : 'translateY(-130px)',
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
          }}
        >
           <div className="mt-8 text-tangled-purple/60 text-[8px] font-serif tracking-[0.2em] uppercase">For Susie</div>
           <div className="w-8 h-8 rounded-full bg-tangled-purple/10 mt-4 flex items-center justify-center border border-tangled-purple/20">
             <Heart size={12} className="text-tangled-purple" fill="currentColor" />
           </div>
           <div className="mt-6 h-0.5 w-16 bg-tangled-gold/40 rounded-full" />
           <div className="mt-1.5 h-0.5 w-10 bg-tangled-gold/40 rounded-full" />
        </div>

        {/* --- ENVELOPE BACK --- */}
        <div 
          className="absolute inset-0 rounded-md shadow-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: envelopeColor, 
            zIndex: 1,
            ...textureStyle
          }}
        >
             {/* Glow behind the envelope */}
             <div className="absolute -inset-4 bg-tangled-gold/20 blur-xl rounded-full -z-10 animate-pulse-slow"></div>
        </div>

        {/* --- ENVELOPE FRONT POCKETS --- */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Left Flap */}
          <div className="absolute left-0 bottom-0 top-0 w-1/2 shadow-[2px_0_5px_rgba(0,0,0,0.3)] border-r border-black/10" 
               style={{ 
                 backgroundColor: envelopeLight, 
                 clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                 ...textureStyle 
               }} 
          />
          {/* Right Flap */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 shadow-[-2px_0_5px_rgba(0,0,0,0.3)] border-l border-black/10" 
               style={{ 
                 backgroundColor: envelopeLight, 
                 clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
                 ...textureStyle 
               }} 
          />
          {/* Bottom Flap */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]" 
               style={{ 
                 backgroundColor: envelopeColor, 
                 clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                 ...textureStyle 
               }} 
          />
        </div>

        {/* --- ENVELOPE FLAP (ROTATING) --- */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 origin-top"
          style={{ 
            zIndex: status === 'closed' ? 20 : 1,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s linear 0.4s', 
            transform: status === 'closed' ? 'rotateX(0deg)' : 'rotateX(180deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Flap Outer */}
          <div className="absolute inset-0 backface-hidden border-b border-white/5" 
               style={{ 
                 backgroundColor: envelopeLight, 
                 clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                 ...textureStyle 
               }} 
          />
          {/* Flap Inner */}
          <div className="absolute inset-0 backface-hidden" 
               style={{ 
                 backgroundColor: envelopeDark, 
                 clipPath: 'polygon(0 0, 50% 100%, 100% 0)', 
                 transform: 'rotateY(180deg)',
                 ...textureStyle 
               }} 
          />
        </div>

        {/* --- WAX SEAL --- */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-30 ${
            status === 'closed' ? 'opacity-100 scale-100 delay-0' : 'opacity-0 scale-150 pointer-events-none'
          }`}
        >
           <div className="relative w-16 h-16 bg-gradient-to-br from-[#d97706] to-[#78350f] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#fcd34d]/30 flex items-center justify-center group">
             <div className="absolute inset-1 border border-[#fcd34d]/40 rounded-full border-dashed opacity-70" />
             <span className="font-serif text-[#fef3c7] font-bold text-2xl drop-shadow-sm group-hover:scale-110 transition-transform">S</span>
             
             {/* Shine effect on wax */}
             <div className="absolute top-2 left-3 w-4 h-2 bg-white/20 rounded-full blur-[2px] transform -rotate-45" />
           </div>
           
           <div className="absolute top-20 w-40 left-1/2 -translate-x-1/2 text-center">
              <p className="text-[#fef3c7] text-[10px] tracking-[0.3em] font-serif animate-pulse drop-shadow-md">TAP TO OPEN</p>
           </div>
        </div>
      </div>

      {/* --- FINAL FULL SCREEN LETTER (MODAL) --- */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-1000 ${
          status === 'full' ? 'opacity-100 visible backdrop-blur-sm' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div 
          className={`bg-[#f0e6d2] w-full max-w-lg shadow-[0_0_80px_rgba(107,76,154,0.3)] rounded-lg overflow-hidden flex flex-col transform transition-transform duration-1000 relative border-4 border-[#eaddcf] ${
            status === 'full' ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
          }`}
        >
            {/* 1. Heavy Paper Texture Overlay (Multiply for better blending) */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none z-0 mix-blend-multiply" 
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }} 
            />
            {/* 1.5 Additional Noise Texture for grittiness */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>


            {/* 2. Floral Corners (Peony Line Art) */}
            {/* Right Corner */}
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none z-20">
               <img 
                 src="https://cdn.pixabay.com/photo/2022/05/10/16/32/floral-7187295_1280.png" 
                 alt="Floral Corner"
                 className="w-full h-full object-contain object-top-right"
                 referrerPolicy="no-referrer"
                 onError={handleImageError}
                 style={{ 
                   filter: lineArtFilter,
                   transform: 'scale(1.2) translate(10%, -10%)'
                 }} 
               />
            </div>
            {/* Left Corner (Mirrored) */}
             <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none z-20">
               <img 
                 src="https://cdn.pixabay.com/photo/2022/05/10/16/32/floral-7187295_1280.png" 
                 alt="Floral Corner Left"
                 className="w-full h-full object-contain object-top-right"
                 referrerPolicy="no-referrer"
                 onError={handleImageError}
                 style={{ 
                   filter: lineArtFilter,
                   transform: 'scaleX(-1) scale(1.2) translate(10%, -10%)'
                 }} 
               />
            </div>

            {/* Letter Header */}
            <div className="relative pt-20 pb-6 px-8 text-center z-10">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tangled-purple/10 border-2 border-tangled-purple/20 mb-4 shadow-inner">
                  <Heart size={24} className="text-tangled-purple" fill="currentColor" />
               </div>
               <h1 className="font-script text-5xl text-tangled-purple drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">My Rapunzel</h1>
               <p className="text-[#856b48] text-[11px] uppercase tracking-[0.2em] mt-3 font-serif border-t border-b border-[#856b48]/20 py-1 inline-block">
                 2/14/2026
               </p>
            </div>

            {/* Letter Body */}
            <div className="px-10 pb-4 text-center space-y-6 relative z-10">
               <p className="font-serif text-xl text-[#4a3b2a] leading-relaxed italic drop-shadow-sm">
                 “I CAN’T BELIEVE I DID THIS!” -- Rapunzel
               </p>
               <p className="font-sans text-lg text-[#5c4d3c] leading-relaxed">
                 For the most beautiful princess I know, all from a little roblox game called Neighbors.
               </p>
               <div className="py-2 flex justify-center gap-2 opacity-80">
                 <Sparkles className="text-tangled-gold" size={20} />
               </div>
            </div>

            {/* Letter Footer with Vintage Line Art Divider */}
            <div className="relative p-0 z-10 flex flex-col items-center">
               
               {/* 4. Floral Divider (Bottom) */}
               <div className="w-full flex justify-center opacity-80 mb-6 px-4">
                 <img 
                   src="https://cdn.pixabay.com/photo/2019/04/20/11/39/divider-4141753_1280.png" 
                   alt="Vintage Floral Divider"
                   className="w-full max-w-[320px] h-auto"
                   referrerPolicy="no-referrer"
                   onError={handleImageError}
                   style={{ 
                     filter: lineArtFilter
                   }}
                 />
               </div>

               <div className="w-full bg-[#e8deca]/80 p-6 border-t border-[#d6cbb5] flex justify-center backdrop-blur-[2px]">
                 <button 
                   onClick={handleEnter}
                   className="group relative px-10 py-4 bg-gradient-to-r from-tangled-purple to-[#4a2f7a] text-white rounded-full font-serif text-sm tracking-widest transition-all hover:shadow-[0_0_20px_rgba(107,76,154,0.4)] hover:scale-105 flex items-center gap-3 overflow-hidden border border-white/10 shadow-lg"
                 >
                   <span className="relative z-10 font-bold">MEMORIES</span>
                   <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                   
                   {/* Shine animation */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shine" />
                 </button>
               </div>
            </div>
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        @keyframes shine {
            100% { transform: translateX(100%); }
        }
        .animate-shine { animation: shine 0.6s; }
      `}</style>
    </div>
  );
};