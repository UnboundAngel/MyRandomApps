import React, { useState, useEffect } from 'react';
import { Heart, Star, Gamepad2, Film, Reply } from 'lucide-react';

// --- AGGREGATE ALL IMAGES ---
const ALL_IMAGES = [
    // Minecraft
    ...Array.from({ length: 27 }, (_, i) => `/gallery/minecraft (${i + 1}).png`),
    // Unpacking
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
    '/gallery/Unpacking 1-1-2026/20260119_0010.png',
    // Backrooms
    '/gallery/backrooms (1).png',
    '/gallery/backrooms (2).png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124134.png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124204.png',
    '/gallery/Backrooms - Christmas 2025/Screenshot 2025-12-28 124617.png',
    // Anomaly
    ...Array.from({ length: 11 }, (_, i) => `/gallery/anamoly (${i + 1}).png`),
    // Stanley
    '/gallery/stanleyParable (1).png', '/gallery/stanleyParable (2).png', '/gallery/stanleyParable (3).png',
    // Misc
    '/gallery/roblox1.png',
    '/gallery/i-made-a-set-of-totoro-wallpaper-for-pc-and-mobile-phone-v0-6hzef7qqqiqb1-1141773918.jpg',
    '/gallery/craftinendium.png',
    '/gallery/ldrhub.png',
    '/gallery/nourish.png'
].sort(() => Math.random() - 0.5); // Shuffle initially

interface CreditsProps {
    onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsProps> = ({ onBack }) => {
    const [bgIndex, setBgIndex] = useState(0);

    // Background Slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex(prev => (prev + 1) % ALL_IMAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col">
            
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {ALL_IMAGES.map((src, i) => (
                    <div 
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === bgIndex ? 'opacity-40' : 'opacity-0'}`}
                    >
                        <img 
                            src={src} 
                            alt="Memory" 
                            className="w-full h-full object-cover blur-sm scale-105 animate-slow-pan" 
                        />
                    </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
            </div>

            {/* Back Button */}
            <button 
                onClick={onBack}
                className="absolute top-6 left-6 z-50 text-white/30 hover:text-white transition-colors flex items-center gap-2"
            >
                <Reply size={20} /> <span className="text-xs uppercase tracking-widest">Back to Portfolio</span>
            </button>

            {/* Scrolling Content */}
            <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden animate-credits-scroll flex flex-col items-center pb-40">
                
                <div className="h-screen" /> {/* Spacer to start from bottom */}

                {/* --- INTRO --- */}
                <section className="text-center max-w-3xl px-6 mb-32 space-y-6">
                    <h1 className="text-6xl md:text-8xl font-script text-tangled-gold drop-shadow-[0_0_20px_rgba(242,201,76,0.5)] mb-8">
                        Susie & Atticus
                    </h1>
                    <p className="text-2xl font-serif text-white/90 leading-relaxed">
                        No matter what, we will always be.
                    </p>
                    <p className="text-green-100/60 italic text-lg max-w-2xl mx-auto">
                        This has been a crazy experience I never imagined living. You alone have done so much for me Susie, and despite the hard times, you make it all worth it.
                    </p>
                </section>

                {/* --- MOVIES --- */}
                <section className="text-center max-w-4xl px-6 mb-32 space-y-8">
                    <div className="flex items-center justify-center gap-3 text-pink-300 mb-6">
                        <Film size={32} />
                        <h2 className="text-3xl font-serif uppercase tracking-widest">Our Cinema</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-lg text-white/70">
                        <p>Totoro <span className="text-xs text-white/30 ml-2">(Classic)</span></p>
                        <p className="text-tangled-gold font-bold">Tangled <span className="text-xs font-normal ml-2">(3 Times!)</span></p>
                        <p>The Patriot <span className="text-xs text-white/30 ml-2">(School)</span></p>
                        <p>The Dark Knight</p>
                        <p>Greenland 1 & 2</p>
                        <p>Exam</p>
                        <p>Host</p>
                        <p>The Rip</p>
                        <p>Weapons</p>
                    </div>
                </section>

                {/* --- GAMES --- */}
                <section className="text-center max-w-5xl px-6 mb-32 space-y-8">
                    <div className="flex items-center justify-center gap-3 text-blue-300 mb-8">
                        <Gamepad2 size={32} />
                        <h2 className="text-3xl font-serif uppercase tracking-widest">The Game Log</h2>
                    </div>
                    
                    <div className="space-y-12">
                        <GameEntry 
                            date="1/1/2026" name="No I'm Not Your Neighbor" status="Playing"
                            feedback="Decent game. Havnt played much, concept is interesting."
                        />
                        <GameEntry 
                            date="12/19/2024" name="Backrooms: Escape Together" status="Finished"
                            feedback="I enjoyed it. It had good puzzles and made for some rlly good screams. I never felt bored playing it. Really looking forward to the other game."
                        />
                        <GameEntry 
                            date="12/24/2024" name="The Forest" status="Playing"
                            feedback="Good game. Hard to build at times but I wouldn't know because I had fun getting all the supplies 😝"
                        />
                        <GameEntry 
                            name="I'm on Observation Duty 8" status="Playing"
                            feedback="So far it's okay. Skipped right to 8 didn't bother with 1-7 because who cares. Even on normal mode it's hard to find anomalies that aren't obvious."
                        />
                        <GameEntry 
                            name="No I'm Not A Human" status="Playing"
                            feedback="Really good game. Hard to figure out endings without searching it up. Would be better if someone took the time to talk to the people instead of just testing them."
                        />
                        <GameEntry 
                            name="Subnautica" status="Playing"
                            feedback="I like watching it. Forgot most of it but from what I remember the storyline gets confusing at times and it could be pretty slow. I like all the fish and animals."
                        />
                        <GameEntry 
                            name="Unpacking" status="Playing"
                            feedback="REALLY good game. Relaxing and calming. Putting all the books away is annoying because no one needs that many books nigga."
                        />
                        <GameEntry 
                            name="Stanley Parable Ultra Deluxe" status="Playing" highlight
                            feedback="Best game we have played EVER. Really looking forward to playing the first one."
                        />
                        <GameEntry 
                            name="Buckshot Roulette" status="Finished"
                            feedback="Really fun to play together. I always won ofc."
                        />
                        <GameEntry 
                            name="TELEFORUM" status="Finished"
                            feedback="Don't really remember it but it wasn't really scary."
                        />
                    </div>
                </section>

                {/* --- CLOSING NOTE (REVAMPED) --- */}
                <section className="text-center max-w-3xl px-6 mb-40 space-y-10">
                    <Heart size={48} className="mx-auto text-red-500 animate-pulse" />
                    
                    <div className="space-y-6 text-xl font-serif text-white/80 leading-relaxed">
                        <p>
                            No matter if we are now, or aren't anymore, I am forever grateful for even having met you and had the chance to call you mine, Susie. 
                        </p>
                        <p>
                            I am genuinely your parents' #1 fan just for bringing you into this world (awkward laugh).
                        </p>
                        <p>
                            From the times we played Wordle together, to watching movies with Savvy and Gigi... we even got my grandma to join in on the Wordle craze, and now it's a daily ritual for her too?? You have this incredible power to influence people, Susie. It's a really powerful, unique skill, and you're just naturally good at it.
                        </p>
                        <p className="italic text-white/60 text-lg">
                            Anyways, let me stop glazing you before your head gets too big.
                        </p>
                    </div>

                    <div className="pt-12 space-y-4">
                        <h3 className="text-3xl font-serif text-white">
                            As always, I love you, Susie.
                        </h3>
                        <p className="text-5xl md:text-6xl text-tangled-gold mt-8 rotate-[-5deg] inline-block" style={{ fontFamily: '"Dancing Script", cursive' }}>
                            Atticus
                        </p>
                    </div>
                </section>

                <div className="h-screen" />
            </div>

            <style>{`
                @keyframes slow-pan {
                    0% { transform: scale(1.05); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1.05); }
                }
                .animate-slow-pan {
                    animation: slow-pan 20s infinite ease-in-out;
                }
                /* Hide scrollbar for cleaner look */
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

const GameEntry: React.FC<{
    date?: string;
    name: string;
    feedback: string;
    status: string;
    highlight?: boolean;
}> = ({ date, name, feedback, status, highlight }) => (
    <div className={`flex flex-col items-center space-y-2 ${highlight ? 'scale-110 my-8' : ''}`}>
        <h3 className={`text-2xl font-bold ${highlight ? 'text-tangled-gold' : 'text-blue-200'}`}>
            {name}
        </h3>
        <div className="flex gap-4 text-xs font-mono text-white/40 uppercase tracking-widest mb-2">
            {date && <span>{date}</span>}
            <span className={status === 'Finished' ? 'text-green-400' : 'text-yellow-400'}>[{status}]</span>
        </div>
        <p className="text-white/70 italic max-w-xl leading-relaxed">
            "{feedback}"
        </p>
    </div>
);