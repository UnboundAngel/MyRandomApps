import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const songImageUrl = '/song.jpg';
const songAudioUrl = '/Tangled - I See The Light.mp3';

// Final synchronized lyrics based on your recording
const savedLyrics: { label: string; text: string; time: number }[] = [
  { "label": "Rapunzel", "text": "All those days watching from the windows", "time": 10.75 },
  { "label": "Rapunzel", "text": "All those years outside looking in", "time": 15.79 },
  { "label": "Rapunzel", "text": "All that time never even knowing", "time": 20.41 },
  { "label": "Rapunzel", "text": "Just how blind I've been", "time": 25.23 },
  { "label": "Rapunzel", "text": "Now I'm here, blinking in the starlight", "time": 30.23 },
  { "label": "Rapunzel", "text": "Now I'm here, suddenly I see", "time": 35.48 },
  { "label": "Rapunzel", "text": "Standing here, it's all so clear", "time": 40.09 },
  { "label": "Rapunzel", "text": "I'm where I'm meant to be", "time": 44.47 },
  { "label": "Rapunzel", "text": "And at last I see the light", "time": 49.02 },
  { "label": "Rapunzel", "text": "And it's like the fog has lifted", "time": 53.66 },
  { "label": "Rapunzel", "text": "And at last I see the light", "time": 58.36 },
  { "label": "Rapunzel", "text": "And it's like the sky is new", "time": 62.87 },
  { "label": "Rapunzel", "text": "And it's warm and real and bright", "time": 67.79 },
  { "label": "Rapunzel", "text": "And the world has somehow shifted", "time": 72.55 },
  { "label": "Rapunzel", "text": "All at once everything looks different", "time": 81.11 },
  { "label": "Rapunzel", "text": "Now that I see you", "time": 85.94 },
  { "label": "(Inst.)", "text": "[Orchestral Bridge]", "time": 91.26 },
  { "label": "Eugene", "text": "All those days, chasing down a daydream", "time": 120.92 },
  { "label": "Eugene", "text": "All those years, living in a blur", "time": 126.1 },
  { "label": "Eugene", "text": "All that time, never truly seeing", "time": 130.39 },
  { "label": "Eugene", "text": "Things the way they were", "time": 135.08 },
  { "label": "Eugene", "text": "Now she's here, shining in the starlight", "time": 139.94 },
  { "label": "Eugene", "text": "Now she's here, suddenly I know", "time": 144.92 },
  { "label": "Eugene", "text": "If she's here, it's crystal clear", "time": 149.4 },
  { "label": "Eugene", "text": "I'm where I'm meant to go", "time": 153.93 },
  { "label": "Both", "text": "And at last I see the light", "time": 158.2 },
  { "label": "Eugene", "text": "And it's like the fog has lifted", "time": 162.7 },
  { "label": "Both", "text": "And at last I see the light", "time": 167.03 },
  { "label": "Rapunzel", "text": "And it's like the sky is new", "time": 171.46 },
  { "label": "Both", "text": "And it's warm and real and bright", "time": 175.5 },
  { "label": "Both", "text": "And the world has somehow shifted", "time": 180.45 },
  { "label": "Both", "text": "All at once everything looks different", "time": 189.0 },
  { "label": "Both", "text": "Now that I see you", "time": 194.22 },
  { "label": "Both", "text": "Now that I see you", "time": 203.39 }
];

const WORD_STAGGER = 80;
const LETTER_STAGGER = 20;

const AnimatedWord: React.FC<{
  word: string;
  wordIndex: number;
  isActive: boolean;
  elapsed: number;
}> = ({ word, wordIndex, isActive, elapsed }) => {
  const wordDelay = wordIndex * WORD_STAGGER;
  const wordElapsed = elapsed - wordDelay;
  const wordVisible = isActive && wordElapsed > 0;

  return (
    <span className="inline-block mr-[0.3em]">
      {word.split('').map((letter, li) => {
        const letterDelay = li * LETTER_STAGGER;
        const letterElapsed = wordElapsed - letterDelay;
        const letterProgress = wordVisible ? Math.min(Math.max(letterElapsed / 150, 0), 1) : 0;
        const glowProgress = wordVisible ? Math.min(Math.max((letterElapsed - 50) / 300, 0), 1) : 0;
        const glowFade = glowProgress > 0.8 ? (1 - glowProgress) / 0.2 : glowProgress / 0.8;

        return (
          <span
            key={li}
            className="inline-block transition-none"
            style={{
              opacity: letterProgress,
              transform: `translateY(${(1 - letterProgress) * 8}px)`,
              color: glowFade > 0.1
                ? `rgb(${Math.round(255 * glowFade + 255 * (1 - glowFade))}, ${Math.round(230 * glowFade + 255 * (1 - glowFade))}, ${Math.round(100 * glowFade + 255 * (1 - glowFade))})`
                : 'white',
              textShadow: glowFade > 0.1
                ? `0 0 ${10 + glowFade * 15}px rgba(242, 201, 76, ${glowFade * 0.9}), 0 0 ${4 + glowFade * 6}px rgba(255, 255, 200, ${glowFade * 0.6})`
                : '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
};

const AnimatedLabel: React.FC<{ label: string; elapsed: number; color: string }> = ({ label, elapsed, color }) => {
  const progress = Math.min(Math.max(elapsed / 300, 0), 1);
  return (
    <div
      className="text-[10px] uppercase tracking-[0.3em] mb-1.5 font-sans font-bold"
      style={{
        opacity: progress * 0.9,
        transform: `translateY(${(1 - progress) * -4}px)`,
        color: color,
        textShadow: `0 0 10px ${color}66`,
      }}
    >
      {label}
    </div>
  );
};

// --- BRIDGE COMPONENT ---
const MagicalBridge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    if (!isActive) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full overflow-hidden">
                {/* Cleaned up floating lights */}
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute -bottom-4 bg-gradient-to-t from-orange-400 to-yellow-200 w-2 h-3 rounded-full animate-float-lantern opacity-60"
                        style={{
                            left: `${15 + Math.random() * 70}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${5 + Math.random() * 4}s`,
                            boxShadow: '0 0 20px 2px rgba(251, 146, 60, 0.4)'
                        }}
                    />
                ))}
            </div>
            <style>{`
                @keyframes float-lantern {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 0.6; }
                    100% { transform: translateY(-200px) scale(1.1); opacity: 0; }
                }
                .animate-float-lantern {
                    animation-name: float-lantern;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }
            `}</style>
        </div>
    );
};

interface SongCardProps {
    onPlayStateChange?: (isPlaying: boolean, character: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ onPlayStateChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [lineElapsed, setLineElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number>();
  const characterRef = useRef<string>('Rapunzel');

  useEffect(() => {
    const newChar = savedLyrics[currentLine]?.label || 'Rapunzel';
    characterRef.current = newChar;
    if (onPlayStateChange) {
        onPlayStateChange(isPlaying, newChar);
    }
  }, [currentLine, isPlaying]);

  const initVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return;

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 128; // Fewer bars for cleaner look
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
    }

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const char = characterRef.current;
        let color1 = '#4ade80'; // Rapunzel Green
        let color2 = '#22c55e';
        let glow = 'rgba(74, 222, 128, 0.5)';

        if (char === 'Eugene') {
            color1 = '#fb923c'; // Eugene Orange
            color2 = '#f97316';
            glow = 'rgba(251, 146, 60, 0.5)';
        } else if (char === 'Both') {
            color1 = '#c084fc'; // Both Purple
            color2 = '#a855f7';
            glow = 'rgba(192, 132, 252, 0.5)';
        } else if (char === '(Inst.)') {
            color1 = '#fcd34d'; // Gold
            color2 = '#f59e0b';
            glow = 'rgba(252, 211, 77, 0.5)';
        }

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i];
            const percent = val / 255;
            const height = percent * canvas.height * 0.6;
            
            ctx.shadowBlur = 15 * percent;
            ctx.shadowColor = color1;
            
            const gradient = ctx.createLinearGradient(0, canvas.height / 2 - height, 0, canvas.height / 2 + height);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, color1);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            
            // Draw refined "pulse pillars" centered vertically
            const centerX = x + barWidth / 2;
            const centerY = canvas.height / 2;
            
            ctx.beginPath();
            ctx.roundRect(centerX - barWidth/4, centerY - height/2, barWidth/2, height, 10);
            ctx.fill();
            
            x += barWidth + 4;
        }

        requestRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      initVisualizer();
      audioRef.current.play().catch(e => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const syncLyrics = () => {
        if (!audioRef.current) return;
        const time = audioRef.current.currentTime;
        let activeIndex = 0;
        for (let i = 0; i < savedLyrics.length; i++) {
            if (time >= savedLyrics[i].time) activeIndex = i;
            else break;
        }
        setCurrentLine(activeIndex);
        setLineElapsed((time - savedLyrics[activeIndex].time) * 1000);
        if (isPlaying) requestAnimationFrame(syncLyrics);
    };
    syncLyrics();
    
    const audioEl = audioRef.current;
    if(audioEl) {
        audioEl.onended = () => {
            setIsPlaying(false);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }
  }, [isPlaying]);

  const visibleLines = useMemo(() => {
    const result: { line: typeof savedLyrics[0]; index: number; distance: number }[] = [];
    for (let i = 0; i < savedLyrics.length; i++) {
      const d = i - currentLine;
      if (d >= -2 && d <= 3) result.push({ line: savedLyrics[i], index: i, distance: d });
    }
    return result;
  }, [currentLine]);

  const showLyrics = isPlaying;
  const showActiveBackground = isHovered || isPlaying;
  const char = characterRef.current;
  
  // Theme Logic
  let themeColor = '#4ade80'; // Green
  let ringColor = 'ring-green-500/50';
  let shadowColor = 'shadow-[0_0_30px_rgba(34,197,94,0.4)]';

  if (char === 'Eugene') {
      themeColor = '#fb923c'; // Orange
      ringColor = 'ring-orange-500/50';
      shadowColor = 'shadow-[0_0_30px_rgba(249,115,22,0.4)]';
  } else if (char === 'Both') {
      themeColor = '#c084fc'; // Purple
      ringColor = 'ring-purple-500/50';
      shadowColor = 'shadow-[0_0_30px_rgba(168,85,247,0.4)]';
  } else if (char === '(Inst.)') {
      themeColor = '#fcd34d'; // Gold
      ringColor = 'ring-yellow-400/50';
      shadowColor = 'shadow-[0_0_40px_rgba(252,211,77,0.5)]';
  }

  return (
    <div className="flex flex-col gap-4 w-full">
        <div
          className={`relative h-64 rounded-xl overflow-hidden shadow-2xl transition-all duration-700 cursor-pointer group ${isPlaying ? `ring-4 ${ringColor} ${shadowColor}` : 'border-2 border-tangled-gold/30'}`}
          style={{ transform: isHovered ? 'translateY(-2px)' : 'none' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handlePlayToggle}
        >
          <audio ref={audioRef} src={songAudioUrl} crossOrigin="anonymous" />
          <canvas ref={canvasRef} width={600} height={256} className={`absolute inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-60' : 'opacity-0'}`} style={{ mixBlendMode: 'screen' }} />
          <img src={songImageUrl} alt="I See The Light" className="absolute inset-0 w-full h-full object-cover -z-10 transition-all duration-1000" style={{ opacity: showActiveBackground ? 0.2 : 0.8, transform: showActiveBackground ? 'scale(1.08)' : 'scale(1)', filter: isPlaying ? 'blur(4px)' : 'none' }} />
          
          <div className="absolute top-3 right-3 z-30 bg-black/40 backdrop-blur-sm p-2 rounded-full border border-white/10 text-white/80 transition-all">
              {isPlaying ? <Volume2 size={20} className="animate-pulse" style={{ color: themeColor }} /> : <VolumeX size={20} />}
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 transition-opacity" style={{ opacity: showLyrics ? 0 : 1 }}>
            <span className="font-serif text-white text-xl tracking-widest drop-shadow-md">I See The Light</span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20 transition-opacity" style={{ opacity: showLyrics ? 1 : 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)' }}>
            {/* Bridge Effect */}
            {char === '(Inst.)' && <MagicalBridge isActive={true} />}

            {/* Lyrics */}
            {char !== '(Inst.)' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                {visibleLines.map(({ line, index, distance }) => {
                    const isCurrent = distance === 0;
                    return (
                    <div key={index} className="absolute w-full text-center px-3" style={{ transform: `translateY(${distance * 30}px) scale(${isCurrent ? 1 : 0.9})`, opacity: isCurrent ? 1 : 0.2, filter: isCurrent ? 'none' : 'blur(1px)', transition: 'all 0.6s ease' }}>
                        {line.label && isCurrent && <AnimatedLabel label={line.label} elapsed={lineElapsed} color={themeColor} />}
                        <div className={`font-serif ${isCurrent ? 'text-sm md:text-base' : 'text-xs text-white/50'}`}>
                        {line.text.split(' ').map((word, wi) => <AnimatedWord key={wi} word={word} wordIndex={wi} isActive={isCurrent} elapsed={isCurrent ? lineElapsed : 0} />)}
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
          </div>
        </div>
    </div>
  );
};