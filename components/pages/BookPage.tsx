import React, { useState } from 'react';
import { BookOpen, ExternalLink, Heart, Code, Utensils, MessageCircle, PenTool, Sparkles, ArrowLeft } from 'lucide-react';

const APPS = [
    {
        title: "Craftendium",
        url: "https://unboundangel.github.io/Craftendium/",
        image: "/gallery/craftinendium.png",
        icon: <Code size={20} className="text-emerald-400" />,
        desc: "The ultimate Minecraft tool hub, made by me.",
        loveNote: "I built this because I love creating things, just like we create our world together."
    },
    {
        title: "LDR Hub",
        url: "https://ldrhub.app",
        image: "/gallery/ldrhub.png",
        icon: <MessageCircle size={20} className="text-pink-400" />,
        desc: "Our original sanctuary. Built because we needed a Discord alternative for your laptop when your phone died at 12.",
        loveNote: "Every line of code was written so I could keep talking to you for just a few more minutes."
    },
    {
        title: "Nourish",
        url: "https://nourish-d2113.web.app",
        image: "/gallery/nourish.png",
        icon: <Utensils size={20} className="text-orange-400" />,
        desc: "The meal app you really wanted. I finally FIXED the time issue you wanted! You can now customize the time when selecting.",
        loveNote: "I want to make sure you're taking care of yourself, even when I'm not there to cook for you."
    },
    {
        title: "Midnight Writer",
        url: "https://github.com/UnboundAngel/MyRandomApps",
        image: null, 
        icon: <PenTool size={20} className="text-purple-400" />,
        desc: "A journaling app for you and Val. The exe is up but not updated yet. I have been perfecting it. I WILL SOON TRUST.",
        loveNote: "So you can write down your dreams, and maybe one day I'll be in them."
    }
];

export const BookPage: React.FC = () => {
  const [bookState, setBookState] = useState<'closed' | 'opening' | 'open'>('closed');

  const handleOpen = () => {
    if (bookState !== 'closed') return;
    setBookState('opening');
    // Allow animation to play out before switching to full content view
    setTimeout(() => {
        setBookState('open');
    }, 1500); 
  };

  if (bookState !== 'open') {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center perspective-2000 bg-[#1a0f0f] overflow-hidden">
             
             {/* Ambient Background */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3e2723_0%,#000_100%)] opacity-50" />
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

             {/* THE 3D BOOK */}
             <div 
                className={`relative w-[300px] h-[450px] md:w-[400px] md:h-[600px] transform-style-3d transition-all duration-[1500ms] ease-in-out cursor-pointer group ${
                    bookState === 'opening' ? 'rotate-y-[-20deg] scale-[3] translate-x-[-50px] opacity-0' : 'rotate-y-0 hover:rotate-y-[-5deg] hover:scale-105'
                }`}
                onClick={handleOpen}
             >
                {/* --- FRONT COVER --- */}
                <div 
                    className={`absolute inset-0 bg-[#5d4037] rounded-r-xl rounded-l-md shadow-2xl origin-left transform-style-3d transition-all duration-[1500ms] ease-in-out z-20 flex flex-col items-center justify-center border-l-8 border-[#3e2723] ${
                        bookState === 'opening' ? 'rotate-y-[-140deg]' : 'rotate-y-0'
                    }`}
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0) 20%), url('https://www.transparenttextures.com/patterns/leather.png')`,
                        backfaceVisibility: 'hidden'
                    }}
                >
                    {/* Gold Inlay */}
                    <div className="absolute inset-4 border-2 border-[#a1887f]/30 rounded-r-lg rounded-l-sm" />
                    <div className="absolute inset-6 border border-[#a1887f]/20 rounded-r-lg rounded-l-sm" />

                    {/* Title */}
                    <div className="relative z-10 text-center p-8 transform translate-z-[2px]">
                        <div className="w-32 h-32 mx-auto mb-8 rounded-full border-4 border-[#ffb74d] flex items-center justify-center bg-[#3e2723] shadow-inner">
                            <Heart size={64} className="text-[#ffb74d] fill-[#ffb74d]/20" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-[#ffb74d] tracking-widest drop-shadow-md mb-2">JOURNAL</h1>
                        <p className="text-[#d7ccc8] font-mono tracking-[0.3em] text-xs uppercase">Of Our Creations</p>
                    </div>

                    {/* Lock/Latch */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#ffb74d] rounded-l-md shadow-lg flex items-center justify-center opacity-80">
                        <div className="w-1 h-8 bg-[#3e2723]/30 rounded-full" />
                    </div>
                </div>

                {/* --- PAGES (The "Block" of pages) --- */}
                <div className="absolute inset-y-2 right-2 left-4 bg-[#fff9c4] rounded-r-md shadow-inner transform translate-z-[-5px] z-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                    {/* Page Lines */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/10 to-transparent" />
                </div>

                {/* --- BACK COVER --- */}
                <div className="absolute inset-0 bg-[#3e2723] rounded-r-xl rounded-l-md transform translate-z-[-20px] shadow-2xl rounded-l-xl" />

                {/* --- MAGICAL INTERIOR (Revealed when opening) --- */}
                <div 
                    className="absolute inset-0 bg-[#fff] rounded-r-xl rounded-l-md z-0 flex items-center justify-center overflow-hidden"
                    style={{
                        transform: 'translateZ(-1px)',
                    }}
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-yellow-100 opacity-50" />
                     <div className="text-center opacity-0 animate-fade-in delay-500">
                        <Sparkles className="mx-auto text-tangled-gold mb-4 animate-pulse" size={48} />
                        <p className="font-script text-3xl text-[#5d4037]">For My Rapunzel</p>
                     </div>
                </div>

                {/* --- PARTICLES (Burst on open) --- */}
                {bookState === 'opening' && (
                    <div className="absolute inset-0 z-50 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <Heart 
                                key={i}
                                className="absolute text-tangled-gold fill-tangled-gold animate-float-particle"
                                size={Math.random() * 20 + 10}
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    '--tx': `${(Math.random() - 0.5) * 400}px`,
                                    '--ty': `${(Math.random() - 0.5) * 400}px`,
                                    animationDuration: '1.5s',
                                    animationFillMode: 'forwards'
                                } as any}
                            />
                        ))}
                    </div>
                )}
             </div>

             <div className={`absolute bottom-10 text-[#a1887f] font-mono text-sm tracking-widest transition-opacity duration-500 ${bookState === 'opening' ? 'opacity-0' : 'opacity-100 animate-pulse'}`}>
                 CLICK TO OPEN
             </div>

             <style>{`
                .perspective-2000 { perspective: 2000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .rotate-y-[-140deg] { transform: rotateY(-140deg); }
                .rotate-y-[-20deg] { transform: rotateY(-20deg); }
                .rotate-y-[-5deg] { transform: rotateY(-5deg); }
                .rotate-y-0 { transform: rotateY(0deg); }
                .translate-z-[-20px] { transform: translateZ(-20px); }
                
                @keyframes float-particle-burst {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
                }
                .animate-float-particle {
                    animation: float-particle-burst 1s ease-out forwards;
                }
             `}</style>
        </div>
    );
  }

  // --- OPENED JOURNAL CONTENT ---
  return (
    <div className="min-h-screen w-full animate-fade-in bg-[#f5f5f0] text-[#2c2c2c] overflow-y-auto">
        
        {/* Paper Texture Background */}
        <div className="fixed inset-0 pointer-events-none opacity-50 z-0 mix-blend-multiply" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')` }} 
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">
            
            <header className="mb-16 text-center">
                <button 
                    onClick={() => setBookState('closed')}
                    className="group fixed top-6 left-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-[#5d4037] hover:bg-[#5d4037] hover:text-white transition-all border border-[#5d4037]/10"
                >
                    <ArrowLeft size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Close Journal</span>
                </button>

                <div className="inline-block p-3 rounded-full bg-[#fce4ec] mb-4 shadow-sm animate-fade-in-up">
                    <Heart size={32} className="text-[#ec407a] fill-[#ec407a]" />
                </div>
                <h1 className="text-5xl md:text-7xl font-script text-[#3e2723] mb-4 drop-shadow-sm">My Digital Love Letters</h1>
                <p className="font-serif text-[#5d4037]/80 italic text-xl md:text-2xl">"I build things to show you I care."</p>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#ec407a]/30 to-transparent mx-auto mt-8 rounded-full" />
            </header>

            {/* Collage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                {APPS.map((app, idx) => (
                    <div 
                        key={idx}
                        className={`group relative bg-white p-4 pb-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ${idx % 2 !== 0 ? 'md:translate-y-16' : ''}`}
                        style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}
                    >
                        {/* Washi Tape Effect */}
                        <div 
                            className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#ffecb3]/90 backdrop-blur-sm transform -rotate-1 shadow-sm z-20 opacity-90" 
                            style={{ 
                                maskImage: 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/tape-mask.png)',
                                WebkitMaskImage: 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/tape-mask.png)',
                                maskSize: 'contain',
                                transform: `translateX(-50%) rotate(${Math.random() * 4 - 2}deg)`
                            }}
                        />

                        {/* Image / Screenshot */}
                        <div className="relative aspect-video w-full overflow-hidden bg-[#f5f5f5] mb-6 border-4 border-white shadow-inner">
                            {app.image ? (
                                <img src={app.image} alt={app.title} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] text-[#8e24aa]/40">
                                    <Sparkles size={48} className="mb-2" />
                                    <span className="font-serif italic text-xl">Coming Soon</span>
                                </div>
                            )}
                            
                            {/* Link Button */}
                            <a 
                                href={app.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg text-[#3e2723] hover:bg-[#3e2723] hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-30"
                            >
                                <ExternalLink size={20} />
                            </a>
                        </div>

                        {/* Content */}
                        <div className="px-4">
                            <div className="flex items-center gap-3 mb-4 border-b-2 border-[#f0f0f0] pb-3">
                                <div className="p-2 bg-[#fafafa] rounded-lg shadow-sm">
                                    {app.icon}
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-[#3e2723]">{app.title}</h3>
                            </div>
                            
                            <p className="font-sans text-[#5d4037] leading-relaxed mb-6 text-sm md:text-base">
                                {app.desc}
                            </p>

                            {/* Love Note */}
                            <div className="bg-[#fff0f3] p-6 rounded-xl border border-[#ffcdd2] relative mt-4 transform group-hover:scale-[1.02] transition-transform origin-bottom">
                                <Heart size={20} className="text-[#ec407a] absolute -top-3 -left-2 bg-white rounded-full p-0.5 shadow-sm" fill="currentColor" />
                                <p className="font-script text-xl text-[#880e4f] leading-snug">
                                    "{app.loveNote}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-40 text-center pb-10">
                <div className="flex justify-center gap-2 mb-4 text-[#d7ccc8]">
                    <Heart size={12} fill="currentColor" />
                    <Heart size={12} fill="currentColor" />
                    <Heart size={12} fill="currentColor" />
                </div>
                <p className="font-mono text-xs text-[#a1887f] uppercase tracking-widest">
                    More pages being written every day...
                </p>
            </div>
        </div>
    </div>
  );
};