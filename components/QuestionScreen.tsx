import React, { useState } from 'react';

interface QuestionScreenProps {
  onYes: () => void;
  onNo: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({ onYes, onNo }) => {
  const [step, setStep] = useState(0);
  const [isBreaking, setIsBreaking] = useState(false);

  // Simple sequential reveal
  const handleNext = () => setStep(s => s + 1);

  const handleNoClick = () => {
    setIsBreaking(true);
    // Wait 5 seconds for the destruction animation before switching to rain
    setTimeout(onNo, 5000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-colors duration-[3000ms] ease-in ${isBreaking ? 'bg-black' : 'bg-[#1a0b2e]'}`} 
         style={!isBreaking ? { background: 'radial-gradient(circle at center, #2d1b4e 0%, #1a0b2e 100%)' } : {}}>
      
      {/* CRACK OVERLAY */}
      {isBreaking && (
        <div className="absolute inset-0 z-50 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-80" preserveAspectRatio="none">
                <path d="M50 50 L20 20 L30 10 M50 50 L80 20 L90 30 M50 50 L50 90 M50 50 L10 60" 
                      stroke="white" strokeWidth="0.2" fill="none" className="animate-crack-draw" />
                <path d="M50 50 L40 40 L45 30 M50 50 L60 60 L70 55" 
                      stroke="white" strokeWidth="0.1" fill="none" className="animate-crack-draw delay-100" />
            </svg>
            <div className="absolute inset-0 bg-black/20 animate-flicker" />
        </div>
      )}

      <div className={`max-w-2xl w-full space-y-8 ${isBreaking ? 'pointer-events-none' : 'animate-fade-in-up'}`}>
        
        {/* ELEMENT 1: Header */}
        <div className={isBreaking ? 'animate-shatter-1' : ''}>
            {step >= 0 && (
            <h1 className="text-4xl md:text-6xl font-script text-tangled-gold drop-shadow-[0_0_15px_rgba(242,201,76,0.5)] mb-8 transition-all duration-1000 ease-out"
                style={{ opacity: 1, transform: 'translateY(0)' }}>
                My repunsel ~~
            </h1>
            )}
        </div>

        {/* ELEMENT 2: Paragraph */}
        <div className={isBreaking ? 'animate-shatter-2' : ''}>
            {step >= 1 && (
            <p className="text-xl md:text-2xl font-serif text-green-100/90 leading-relaxed transition-all duration-1000 delay-300">
                This has been one heck of a journey, and although it has only been 7 months, we somehow have more shared memories than I do with anyone.
            </p>
            )}
        </div>

        {/* ELEMENT 3: Question & Buttons */}
        <div className={isBreaking ? 'animate-shatter-3' : ''}>
            {step >= 2 && (
            <div className="pt-8 transition-all duration-1000 delay-500">
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-12">
                - To make it official: Will you be my ventline? 
                </h2>
                
                <div className="flex justify-center gap-8">
                <button 
                    onClick={onYes}
                    className="px-12 py-4 bg-gradient-to-r from-tangled-purple to-purple-800 text-white rounded-full font-bold text-xl hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 border border-white/10"
                >
                    yes
                </button>
                <button 
                    onClick={handleNoClick}
                    className="px-12 py-4 bg-transparent border border-white/20 text-white/50 rounded-full font-serif text-xl hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                    no
                </button>
                </div>
            </div>
            )}
        </div>

        {step < 2 && !isBreaking && (
            <div className="pt-12">
                <button 
                   onClick={handleNext} 
                   className="text-tangled-gold/50 hover:text-tangled-gold text-sm uppercase tracking-widest animate-pulse transition-colors"
                >
                    ( Click to continue )
                </button>
            </div>
        )}
      </div>

      <style>{`
        @keyframes crack-draw {
            0% { stroke-dasharray: 0, 1000; }
            100% { stroke-dasharray: 1000, 0; }
        }
        .animate-crack-draw {
            animation: crack-draw 0.2s ease-out forwards;
        }

        @keyframes flicker {
            0%, 100% { opacity: 0; }
            10%, 30%, 50%, 70%, 90% { opacity: 0.1; }
            20%, 40%, 60%, 80% { opacity: 0; }
        }
        .animate-flicker {
            animation: flicker 0.5s linear;
        }

        @keyframes shatter-drop {
            0% { transform: translate(0, 0) rotate(0); }
            10% { transform: translate(-5px, 5px) rotate(-2deg); }
            20% { transform: translate(5px, -5px) rotate(2deg); }
            30% { transform: translate(0, 0) rotate(0); }
            100% { transform: translate(0, 150vh) rotate(45deg); opacity: 0; }
        }

        .animate-shatter-1 { animation: shatter-drop 3s ease-in forwards; animation-delay: 0.2s; }
        .animate-shatter-2 { animation: shatter-drop 3.5s ease-in forwards; animation-delay: 0.5s; }
        .animate-shatter-3 { animation: shatter-drop 4s ease-in forwards; animation-delay: 0.8s; }
      `}</style>
    </div>
  );
};