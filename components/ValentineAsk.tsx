import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';

const FloatingHeart: React.FC<{ delay: number; left: string; size: number; duration: number }> = ({ delay, left, size, duration }) => (
  <div
    className="absolute bottom-0 pointer-events-none"
    style={{
      left,
      animation: `valentineFloat ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    <Heart
      size={size}
      className="text-tangled-gold/20 fill-tangled-gold/10"
    />
  </div>
);

export const ValentineAsk: React.FC = () => {
  const [noBtnPosition, setNoBtnPosition] = useState({ top: '0', left: '0', position: 'static' as any });
  const [accepted, setAccepted] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const cooldownRef = useRef(false);

  const floatingHearts = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 8,
      left: `${Math.random() * 90 + 5}%`,
      size: Math.random() * 14 + 8,
      duration: 6 + Math.random() * 6,
    })), []);

  const noMessages = ['No', 'Are you sure?', 'Really?', 'Think again...', 'Pretty please?', 'Last chance!', ':(', 'fine...jk'];

  const moveButton = () => {
    if (!containerRef.current || !btnRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = btnRef.current.getBoundingClientRect();
    
    const maxLeft = containerRect.width - btnRect.width - 40;
    const maxTop = containerRect.height - btnRect.height - 40;
    
    const newLeft = Math.max(20, Math.floor(Math.random() * maxLeft));
    const newTop = Math.max(20, Math.floor(Math.random() * maxTop));

    setNoBtnPosition({
      position: 'absolute',
      top: `${newTop}px`,
      left: `${newLeft}px`,
    });
    setNoAttempts(() => Math.floor(Math.random() * noMessages.length));
  };

  useEffect(() => {
    if (accepted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!btnRef.current) return;
      
      const btnRect = btnRef.current.getBoundingClientRect();
      const btnCenter = {
        x: btnRect.left + btnRect.width / 2,
        y: btnRect.top + btnRect.height / 2
      };

      const dist = Math.sqrt(
        Math.pow(e.clientX - btnCenter.x, 2) + 
        Math.pow(e.clientY - btnCenter.y, 2)
      );

      if (dist < 120 && !cooldownRef.current) {
        cooldownRef.current = true;
        moveButton();
        setTimeout(() => { cooldownRef.current = false; }, 500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [accepted, noBtnPosition]);

  if (accepted) {
    return (
      <div className="relative max-w-lg mx-auto overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(107,76,154,0.4) 0%, rgba(242,201,76,0.2) 50%, rgba(107,76,154,0.4) 100%)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        <div className="relative text-center p-12 backdrop-blur-md rounded-3xl border border-tangled-gold/60 shadow-[0_0_60px_rgba(242,201,76,0.2)]">
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <Heart
                key={i}
                className="fill-tangled-gold text-tangled-gold"
                size={i === 2 ? 40 : 28}
                style={{
                  animation: 'valentineFloat 2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                  opacity: i === 2 ? 1 : 0.7,
                }}
              />
            ))}
          </div>
          <h2 className="text-4xl md:text-6xl font-script text-transparent bg-clip-text bg-gradient-to-r from-tangled-gold via-yellow-200 to-tangled-gold mb-4">
            Best Day Ever!
          </h2>
          <p className="text-lg text-green-100/90 mb-2 font-serif leading-relaxed">
            I promise to be the Flynn to your Rapunzel
          </p>
          <p className="text-sm text-tangled-gold/60 font-sans italic">
            (but less stealing, more hugs)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl min-h-[420px]"
    >
      {/* Animated gradient border glow */}
      <div
        className="absolute -inset-[2px] rounded-3xl z-0"
        style={{
          background: 'linear-gradient(135deg, #F2C94C, #6B4C9A, #F2C94C, #6B4C9A)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 4s ease infinite',
        }}
      />

      {/* Inner card */}
      <div className="relative z-10 rounded-3xl min-h-[420px] flex flex-col justify-center items-center p-8"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(107,76,154,0.3) 0%, rgba(0,0,0,0.7) 50%, rgba(45,27,78,0.4) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Floating hearts background */}
        {floatingHearts.map((h) => (
          <FloatingHeart key={h.id} {...h} />
        ))}

        <div className="text-center z-10 w-full">
          {/* Sun/lantern icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: 'rgba(242, 201, 76, 0.3)' }}
              />
              <Heart size={56} className="relative text-tangled-gold fill-tangled-gold/30 drop-shadow-[0_0_20px_rgba(242,201,76,0.5)]" />
            </div>
          </div>

          <p className="text-tangled-gold/60 uppercase tracking-[0.3em] text-xs font-sans mb-3">
            The Big Question
          </p>
          <h2 className="text-4xl md:text-5xl font-script text-transparent bg-clip-text bg-gradient-to-r from-tangled-gold via-yellow-200 to-tangled-gold mb-10 leading-tight">
            Will you be my Valentine?
          </h2>
          
          <div className="flex flex-col md:flex-row gap-5 items-center justify-center w-full h-32">
            <button
              onClick={() => setAccepted(true)}
              className="group relative px-10 py-4 rounded-full font-bold text-lg z-40 cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-110"
            >
              <div
                className="absolute inset-0 rounded-full transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #6B4C9A 0%, #F2C94C 50%, #6B4C9A 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease infinite',
                }}
              />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(242,201,76,0.6)]" />
              <span className="relative text-white drop-shadow-md tracking-wide">Yes!</span>
            </button>
            
            <button
              id="no-btn"
              ref={btnRef}
              onClick={moveButton}
              style={noBtnPosition.position === 'absolute' ? { position: 'absolute', top: noBtnPosition.top, left: noBtnPosition.left, transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' } : {}}
              className="px-8 py-3 rounded-full text-base z-30 whitespace-nowrap cursor-not-allowed border border-white/10 bg-white/5 text-white/40 hover:text-white/60 transition-colors duration-200 backdrop-blur-sm"
            >
              {noMessages[noAttempts]}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes valentineFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-40px) rotate(10deg); opacity: 0.6; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};