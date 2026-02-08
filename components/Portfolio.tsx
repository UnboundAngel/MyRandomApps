import React, { useState, useEffect } from 'react';
import { Flower, Gamepad2, Box, BookOpen, X, Clapperboard, Heart, Package, Ghost, Star, PlayCircle } from 'lucide-react';
import { SongCard } from './SongCard';
import { RelationshipTimer } from './RelationshipTimer';
import { RobloxPage } from './pages/RobloxPage';
import { MinecraftPage } from './pages/MinecraftPage';
import { BookPage } from './pages/BookPage';
import { UnpackingPage } from './pages/UnpackingPage';
import { BackroomsPage } from './pages/BackroomsPage';
import { CreditsScreen } from './CreditsScreen';

interface PortfolioProps {
  onBack?: () => void;
  onPlayStateChange: (playing: boolean, char: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onBack, onPlayStateChange }) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isCracked, setIsCracked] = useState(false);
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());

  // Mark page as visited when opened
  const openPage = (page: string) => {
      setActiveItem(page);
      setVisitedPages(prev => new Set(prev).add(page));
  };

  const handleMinecraftClick = () => {
    setIsCracked(true);
    setTimeout(() => openPage('Minecraft'), 600);
  };

  const allVisited = visitedPages.size >= 6; // Lily, Roblox, Minecraft, Unpacking, Backrooms, Book

  const renderContent = () => {
    switch (activeItem) {
      case 'Lily':
        return (
          <div className="space-y-12 animate-fade-in pb-20 max-w-5xl mx-auto">
             <div className="text-center space-y-4">
               <h2 className="text-5xl font-serif text-tangled-gold">Our Favorites</h2>
               <div className="relative w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img 
                    src="/gallery/i-made-a-set-of-totoro-wallpaper-for-pc-and-mobile-phone-v0-6hzef7qqqiqb1-1141773918.jpg" 
                    alt="Totoro" 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               </div>
             </div>
             
             <section className="max-w-4xl mx-auto w-full bg-black/40 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-green-800/50 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif text-white border-b border-green-700 pb-2 inline-block">
                    My Rapunzel
                  </h2>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 text-green-100 bg-white/5 p-3 rounded-lg border border-white/5">
                        <Flower className="text-pink-300 min-w-[24px]" />
                        <span className="text-sm md:text-base">Loves lillies (because shes a minor) and green, but she's a big girl</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-100 bg-white/5 p-3 rounded-lg border border-white/5">
                        <Clapperboard className="text-tangled-gold min-w-[24px]" />
                        <span className="text-sm md:text-base">My little nigga</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-100 bg-white/5 p-3 rounded-lg border border-white/5">
                        <Gamepad2 className="text-blue-400 min-w-[24px]" />
                        <span className="text-sm md:text-base">We all know val is salty she lost me to you</span>
                      </div>
                  </div>
                </div>
                <div className="transform scale-95">
                    <SongCard onPlayStateChange={onPlayStateChange} />
                </div>
              </div>
            </section>

             <div className="bg-black/30 p-8 rounded-2xl border border-white/10 max-w-4xl mx-auto">
                <RelationshipTimer showBoat={true} />
             </div>
          </div>
        );
      case 'Roblox':
        return <RobloxPage />;
      case 'Minecraft':
        return <MinecraftPage />;
      case 'Book':
        return <BookPage />;
      case 'Unpacking':
        return <UnpackingPage />;
      case 'Backrooms':
        return <BackroomsPage />;
      case 'Credits':
        return <CreditsScreen onBack={() => setActiveItem(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full relative pt-12 pb-24 px-4 md:px-8">
      
      {/* DECORATIVE VINES */}
      <div className="fixed top-0 left-0 w-48 h-48 border-l-4 border-t-4 border-totoro-leaf rounded-tl-[80px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-0 right-0 w-48 h-48 border-r-4 border-t-4 border-totoro-leaf rounded-tr-[80px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-totoro-leaf/50 rounded-bl-3xl opacity-10 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-totoro-leaf/50 rounded-br-3xl opacity-10 pointer-events-none z-0"></div>

      {/* Back / Close Details */}
      {activeItem && activeItem !== 'Credits' && (
        <button 
            onClick={() => { setActiveItem(null); setIsCracked(false); }}
            className="fixed top-6 right-6 z-50 bg-black/50 p-3 rounded-full text-white hover:bg-red-500/20 hover:text-red-200 transition-all border border-white/10 backdrop-blur-md"
        >
            <X size={24} />
        </button>
      )}

      {/* Main Grid - Hidden when active item exists */}
      {!activeItem && (
         <div className="max-w-7xl mx-auto h-full flex flex-col items-center justify-center animate-fade-in-up">
            
            {/* Header */}
            <header className="text-center mb-16">
              <div className="inline-block p-2 bg-tangled-purple/30 rounded-full mb-4 border border-tangled-purple/50">
                 <span className="text-tangled-gold uppercase tracking-widest text-xs font-bold px-3">Since 2025</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-script text-transparent bg-clip-text bg-gradient-to-r from-tangled-gold via-yellow-200 to-tangled-gold drop-shadow-lg mb-2">
                Susie & Atticus
              </h1>
              <p className="text-green-200 font-serif text-lg md:text-xl">
                no matter what, we will always be.
              </p>
            </header>

            {/* CREDITS UNLOCK BUTTON */}
            {allVisited && (
                <div className="w-full max-w-lg mx-auto mb-12 animate-fade-in">
                    <button 
                        onClick={() => setActiveItem('Credits')}
                        className="group w-full relative overflow-hidden bg-gradient-to-r from-tangled-purple to-purple-900 rounded-2xl p-1 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all duration-500 hover:scale-105"
                    >
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center gap-4 relative z-10">
                            <PlayCircle size={32} className="text-tangled-gold animate-pulse" />
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-white font-serif tracking-wide">The Final Chapter</h3>
                                <p className="text-xs text-purple-200/80 uppercase tracking-widest">Our Story Credits</p>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                
                {/* LILY */}
                <div 
                    onClick={() => openPage('Lily')}
                    className="group relative h-64 bg-gradient-to-br from-green-900 to-green-950 rounded-3xl border border-green-700/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(74,222,128,0.2)] transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-[url('/gallery/minecraft.png')] opacity-20 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
                    {visitedPages.has('Lily') && <div className="absolute top-4 right-4 text-green-400 bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-400/20 group-hover:bg-green-500/20 transition-colors">
                            <Flower size={32} className="text-green-300" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Our Favorites</h2>
                        <p className="text-green-200/60 text-xs">Movies, Tangled, & Us</p>
                    </div>
                </div>

                {/* ROBLOX */}
                <div 
                    onClick={() => openPage('Roblox')}
                    className="group relative h-64 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl border border-blue-700/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(96,165,250,0.2)] transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-[url('/gallery/roblox1.png')] opacity-30 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
                    {visitedPages.has('Roblox') && <div className="absolute top-4 right-4 text-blue-400 bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-400/20 group-hover:bg-blue-500/20 transition-colors">
                            <Gamepad2 size={32} className="text-blue-300" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Roblox</h2>
                        <p className="text-blue-200/60 text-xs">Timestamps & Reviews</p>
                    </div>
                </div>

                {/* MINECRAFT */}
                <div 
                    onClick={handleMinecraftClick}
                    className={`group relative h-64 bg-gradient-to-br from-[#3c2a1e] to-[#2a1b12] rounded-3xl border border-yellow-900/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(251,146,60,0.2)] transition-all duration-500 hover:-translate-y-2 ${isCracked ? 'scale-110' : ''}`}
                >
                    <div className="absolute inset-0 bg-[url('/gallery/minecraft.png')] opacity-40 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay grayscale group-hover:grayscale-0" />
                    {isCracked && (
                        <div className="absolute inset-0 z-20 pointer-events-none animate-crack">
                             <div className="absolute inset-0 border-4 border-yellow-600/30 mask-crack" />
                        </div>
                    )}
                    {visitedPages.has('Minecraft') && <div className="absolute top-4 right-4 text-orange-400 bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 border border-orange-400/20 group-hover:bg-orange-500/20 transition-colors">
                            <Box size={32} className="text-orange-300" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Minecraft</h2>
                        <p className="text-orange-200/60 text-xs">Cracking open the Bedrock</p>
                    </div>
                </div>

                {/* UNPACKING */}
                <div 
                    onClick={() => openPage('Unpacking')}
                    className="group relative h-64 bg-gradient-to-br from-[#5d4037] to-[#8d6e63] rounded-3xl border border-[#d7ccc8]/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(141,110,99,0.3)] transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-[url('/gallery/Unpacking 1-1-2026/20260119_0010.png')] opacity-40 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
                    {visitedPages.has('Unpacking') && <div className="absolute top-4 right-4 text-[#efebe9] bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                         <div className="w-16 h-16 bg-[#d7ccc8]/20 rounded-full flex items-center justify-center mb-4 border border-[#d7ccc8]/30 group-hover:bg-[#d7ccc8]/40 transition-colors">
                            <Package size={32} className="text-[#efebe9]" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Unpacking</h2>
                        <p className="text-[#efebe9]/60 text-xs">Our cozy digital home</p>
                    </div>
                </div>

                {/* BACKROOMS */}
                <div 
                    onClick={() => openPage('Backrooms')}
                    className="group relative h-64 bg-gradient-to-br from-[#8c8128] to-[#423d14] rounded-3xl border border-yellow-500/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(253,224,71,0.2)] transition-all duration-500 hover:-translate-y-2"
                >
                     <div className="absolute inset-0 bg-[url('/gallery/backrooms (1).png')] opacity-30 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
                     {visitedPages.has('Backrooms') && <div className="absolute top-4 right-4 text-yellow-200 bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                         <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-400/20 group-hover:bg-yellow-500/20 transition-colors">
                            <Ghost size={32} className="text-yellow-200" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">Backrooms</h2>
                        <p className="text-yellow-100/60 text-xs">Liminal spaces & spooks</p>
                    </div>
                </div>

                {/* BOOK */}
                <div 
                    onClick={() => openPage('Book')}
                    className="group relative h-64 bg-gradient-to-br from-pink-900 to-rose-950 rounded-3xl border border-pink-700/30 overflow-hidden cursor-pointer shadow-2xl hover:shadow-[0_0_40px_rgba(244,114,182,0.2)] transition-all duration-500 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-[url('/gallery/anamoly (1).png')] opacity-20 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
                    {visitedPages.has('Book') && <div className="absolute top-4 right-4 text-pink-300 bg-black/40 rounded-full p-1"><Star size={16} fill="currentColor" /></div>}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                         <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mb-4 border border-pink-400/20 group-hover:bg-pink-500/20 transition-colors">
                            <BookOpen size={32} className="text-pink-300" />
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-2">The Book</h2>
                        <p className="text-pink-200/60 text-xs">Curated apps & other stories</p>
                    </div>
                </div>

            </div>

            {/* Relationship Timer */}
            <div className="w-full mt-24 mb-12">
                <RelationshipTimer showBoat={false} />
            </div>

            {/* RESTORED: CLOSING NOTE */}
            <section className="mt-12 max-w-2xl text-center space-y-6 animate-fade-in-up">
                 <div className="w-24 h-px bg-gradient-to-r from-transparent via-tangled-gold to-transparent mx-auto" />
                 <h2 className="text-2xl md:text-3xl font-serif text-white leading-relaxed">
                    This has been a crazy experience I never imagined of living.
                 </h2>
                 <p className="text-green-100/70 font-sans italic text-lg">
                    You alone have done so much for me Susie, and despite the hard times, you make it all worth it.
                 </p>
                 <div className="flex justify-center gap-2 pt-4">
                    <Heart size={20} className="text-tangled-gold fill-tangled-gold" />
                    <Heart size={20} className="text-tangled-gold fill-tangled-gold" />
                    <Heart size={20} className="text-tangled-gold fill-tangled-gold" />
                 </div>
            </section>
         </div>
      )}

      {/* Details View Modal */}
      {activeItem && activeItem !== 'Credits' && (
         <div className="max-w-[95vw] mx-auto min-h-[80vh] p-4 md:p-10 pb-20">
            {renderContent()}
         </div>
      )}
      {activeItem === 'Credits' && renderContent()}
    </div>
  );
};