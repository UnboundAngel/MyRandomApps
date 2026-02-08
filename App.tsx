import React, { useState } from 'react';
import { OpeningScreen } from './components/OpeningScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { RainEffect } from './components/RainEffect';
import { Portfolio } from './components/Portfolio';
import { FloatingLanterns } from './components/FloatingLanterns';

type ViewState = 'opening' | 'question' | 'rain' | 'portfolio';

export default function App() {
  const [view, setView] = useState<ViewState>('question');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState('Rapunzel');

  const handlePlayStateChange = (playing: boolean, char: string) => {
    setIsMusicPlaying(playing);
    setActiveCharacter(char);
  };

  let ambientColor = 'rgba(74, 222, 128, 0.3)'; // Green default
  if (activeCharacter === 'Eugene') ambientColor = 'rgba(251, 146, 60, 0.3)';
  if (activeCharacter === 'Both') ambientColor = 'rgba(192, 132, 252, 0.3)';
  if (activeCharacter === '(Inst.)') ambientColor = 'rgba(252, 211, 77, 0.3)';

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-tangled-gold selection:text-tangled-dark"
         style={{ background: 'linear-gradient(to bottom, #1A3C28 0%, #1e4a2e 15%, #2d5a30 25%, #4a5a28 35%, #6b5525 45%, #7c4a1e 55%, #8b4513 70%, #7c3a10 85%, #6b3000 100%)' }}>
      
      {/* RESTORED: Immersive Overlay - Activates when music plays */}
      <div 
        className={`fixed inset-0 z-0 pointer-events-none transition-all duration-1000 ${isMusicPlaying ? 'opacity-100' : 'opacity-0'} immersive-overlay`}
        style={{
            background: `radial-gradient(circle at center, transparent 20%, ${ambientColor} 80%, #000 100%)`, 
            mixBlendMode: 'soft-light',
            backdropFilter: isMusicPlaying ? 'brightness(0.8) contrast(1.1)' : 'none'
        }}
      />

      {/* RESTORED: Floating Particles for Immersion */}
      {isMusicPlaying && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              {[...Array(25)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute bg-white rounded-full animate-float-particle opacity-40"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 2}px`,
                        height: `${Math.random() * 3 + 2}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${8 + Math.random() * 10}s`,
                        boxShadow: `0 0 10px ${ambientColor}`
                    }}
                  />
              ))}
          </div>
      )}

      {/* Background for "happy" states */}
      {(view === 'question' || view === 'portfolio') && (
         <div className={`fixed inset-0 z-0 ${isMusicPlaying ? 'opacity-50' : 'opacity-100'} transition-opacity duration-1000`}>
            <FloatingLanterns />
         </div>
      )}

      {view === 'question' && (
        <QuestionScreen 
          onYes={() => setView('opening')}
          onNo={() => setView('rain')}
        />
      )}

      {view === 'opening' && (
        <OpeningScreen onOpen={() => setView('portfolio')} />
      )}

      {view === 'rain' && (
        <RainEffect />
      )}

      {view === 'portfolio' && (
        <div className="relative z-10">
           <Portfolio onPlayStateChange={handlePlayStateChange} />
        </div>
      )}

      {/* Timestamp in corner as requested */}
      <div className="fixed bottom-2 right-2 z-50 text-[10px] text-white/20 font-mono pointer-events-none">
        {new Date().toLocaleString()}
      </div>

      <style>{`
        .immersive-overlay {
            transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes float-particle {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .animate-float-particle {
            animation-name: float-particle;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
