import React from 'react';
import { Gamepad2, Star, Calendar, Car, Home } from 'lucide-react';

const HighlightCard: React.FC<{
  game: string;
  rating: string;
  timestamp?: string;
  review: string;
  icon: React.ReactNode;
  image?: string;
}> = ({ game, rating, timestamp, review, icon, image }) => (
  <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-900/30 to-black/60 border border-blue-500/30 rounded-3xl overflow-hidden group">
    <div className="grid md:grid-cols-2">
        <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300">
                    {icon}
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">{game}</h3>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-tangled-gold">
                    <Star size={18} fill="currentColor" />
                    <span className="font-mono font-bold text-lg">{rating}</span>
                </div>
                {timestamp && (
                    <div className="text-white/40 text-xs font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5">
                        {timestamp}
                    </div>
                )}
            </div>

            <p className="text-gray-300 text-lg leading-relaxed italic border-l-4 border-blue-500/50 pl-4 py-1">
                "{review}"
            </p>
        </div>
        <div className="h-64 md:h-auto relative overflow-hidden bg-black/40">
            {image ? (
                <img src={image} alt={game} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <Gamepad2 size={120} />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:block hidden" />
        </div>
    </div>
  </div>
);

const GameChip: React.FC<{ name: string }> = ({ name }) => (
    <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 hover:border-blue-400/50 hover:bg-blue-900/20 transition-all cursor-default text-sm text-blue-100/70 font-medium">
        {name}
    </div>
);

const RECENT_GAMES = [
    "Chop your tree", "x 999.909.909", "Hypershot", "Ugly to HOT [ 1]", 
    "100 Waves Later", "Catalog Avatar Creator", "Miners World [Trading]", 
    "RIVALS", "f Chop Your Tree", "Fisch [VALENTIDES]", "[ { S1] Dig Legends", 
    "Anime] Card", "Cage Fishing $", "OP Blade] Trade a Kitty", "1 Giant Lifting Simulator", 
    "[+] Prospecting!", "[V11] Blox Loot", "Pixel Blade [W2 REVAMP ]", "Blair", 
    "Build A Restaurant I Restaurant Tycoon 3", "Taxi Boss", "Drill For Ores!", 
    "DOORS [CHAOS MODE]", "Cut Trees", "Silent Mansion HORROR]", "Hat"
];

export const RobloxPage: React.FC = () => {
  return (
    <div className="space-y-16 animate-fade-in pb-20 max-w-6xl mx-auto">
        <header className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-900/20 border border-blue-500/30 mb-4 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Gamepad2 size={40} className="text-blue-400" />
            </div>
            <h2 className="text-5xl font-serif text-blue-100 tracking-tight">Roblox Adventures</h2>
            <p className="text-blue-200/50 max-w-lg mx-auto text-lg">
                The games that defined our 7 months together.
            </p>
        </header>

        <div className="grid grid-cols-1 gap-12">
            <HighlightCard 
                game="Neighbors"
                rating="10/10"
                timestamp="The Beginning"
                review="This is the one that started it all. Without this random game, we wouldn't be here. It's crazy to think about."
                icon={<Home size={32} />}
                image="/gallery/roblox1.png"
            />
            
            <HighlightCard 
                game="Taxi Boss"
                rating="100/10"
                timestamp="Most Played"
                review="The one we played the absolute most. All those hours driving around, racing, and just talking. My favorite memories."
                icon={<Car size={32} />}
            />
        </div>

        <div className="space-y-8 bg-black/30 p-10 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Gamepad2 className="text-blue-400" size={24} />
                <h3 className="text-2xl font-serif text-white/90">Our Recent Activity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {RECENT_GAMES.map((game, i) => (
                    <GameChip key={i} name={game} />
                ))}
            </div>
            
            <div className="pt-6 text-center text-white/20 text-xs font-mono uppercase tracking-[0.2em]">
                & more memories being made every day
            </div>
        </div>
    </div>
  );
};
