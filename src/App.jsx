import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createEditor, Node, Editor, Transforms, Text, Range } from 'slate';
import { Slate, Editable, withReact, useSlate, useFocused, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import AncientScrollbar from './AncientScrollbar';

/* --- THEME & ASSET MANAGEMENT --- */

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Inconsolata:wght@400;700&family=Roboto+Slab:wght@400;700&family=Dancing+Script:wght@400;700&family=Indie+Flower&family=Patrick+Hand&family=Shadows+Into+Light&family=Satisfy&family=Courgette&family=Permanent+Marker&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Raleway:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
`;

const FONT_OPTIONS = [
  { name: 'Caveat', family: "'Caveat', cursive" },
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Indie Flower', family: "'Indie Flower', cursive" },
  { name: 'Patrick Hand', family: "'Patrick Hand', cursive" },
  { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
  { name: 'Satisfy', family: "'Satisfy', cursive" },
  { name: 'Courgette', family: "'Courgette', cursive" },
  { name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
  
  { name: 'Crimson Text', family: "'Crimson Text', serif" },
  { name: 'Playfair', family: "'Playfair Display', serif" },
  { name: 'Lora', family: "'Lora', serif" },
  { name: 'Merriweather', family: "'Merriweather', serif" },
  { name: 'EB Garamond', family: "'EB Garamond', serif" },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
  { name: 'Cormorant', family: "'Cormorant Garamond', serif" },
  { name: 'Source Serif', family: "'Source Serif Pro', serif" },
  { name: 'Slab', family: "'Roboto Slab', serif" },

  { name: 'Open Sans', family: "'Open Sans', sans-serif" },
  { name: 'Lato', family: "'Lato', sans-serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Raleway', family: "'Raleway', sans-serif" },

  { name: 'Typewriter', family: "'Inconsolata', monospace" },
  { name: 'Source Code', family: "'Source Code Pro', monospace" },
  { name: 'Fira Code', family: "'Fira Code', monospace" },
  { name: 'Courier Prime', family: "'Courier Prime', monospace" },
];

const HIGHLIGHT_COLORS = ['#fff59d', '#a7d1a7', '#84b6f4', '#f4a9a8', '#b39ddb'];

const THEME_DATA = {
  Midnight: {
    name: 'Midnight',
    wood: "radial-gradient(circle at 50% 0%, #1a0f05 10%, #0d0603 60%, #000000 90%)",
    paper: `
      linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0) 5%, rgba(0,0,0,0) 95%, rgba(0,0,0,0.06) 100%),
      repeating-linear-gradient(transparent, transparent 27px, rgba(40, 30, 20, 0.08) 28px),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
    `,
    leather: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent 40%),
      linear-gradient(135deg, #2a1a10 0%, #1a0f08 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")
    `,
    paperColor: '#f4e4bc'
  },
  Mahogany: {
    name: 'Mahogany',
    wood: "radial-gradient(circle at 50% 0%, #6b2b0e 10%, #401a07 60%, #240f03 90%)",
    paper: `
      linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 5%, rgba(0,0,0,0) 95%, rgba(0,0,0,0.05) 100%),
      repeating-linear-gradient(transparent, transparent 27px, rgba(100, 70, 50, 0.06) 28px),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E")
    `,
    leather: `
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 40%),
      linear-gradient(135deg, #6b3b21 0%, #402313 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")
    `,
    paperColor: '#FDF4E3'
  },
  Minimalist: {
    name: 'Minimalist',
    wood: "#111827",
    paper: ``,
    leather: `linear-gradient(135deg, #4B5563 0%, #1F2937 100%)`,
    paperColor: '#F3F4F6'
  }
};

const initialPageValue = [{ type: 'paragraph', children: [{ text: '' }] }];

const serializeSlateToString = (nodes) => {
  if (!nodes) return '';
  return nodes.map(n => Node.string(n)).join('\n');
};

const serializeSlateToMarkdown = (nodes) => {
    if (!nodes) return '';
    return nodes.map(node => {
      if (node.type === 'paragraph') {
        return node.children.map(child => {
          let text = child.text;
          if (child.bold) {
            text = `**${text}**`;
          }
          if (child.italic) {
            text = `*${text}*`;
          }
          if (child.highlight) {
            text = `==${text}=={${child.highlight}}`;
          }
          return text;
        }).join('');
      }
      return '';
    }).join('\n');
};
  
const deserializeMarkdownToSlate = (markdown) => {
    const lines = markdown.split('\n');
    return lines.map(line => {
      const children = [];
      // Regex to match highlights, bold, and italic.
      // Order matters slightly for simpler parsing if not using a full parser.
      // We'll use a sequential approach for simplicity here since it's a thematic app.
      
      let remainingLine = line;
      
      while (remainingLine.length > 0) {
          const highlightMatch = remainingLine.match(/^==(.*?)==\{(.*?)}/);
          const boldMatch = remainingLine.match(/^\*\*(.*?)\*\*/);
          const italicMatch = remainingLine.match(/^\*(.*?)\*/);
          
          if (highlightMatch) {
              children.push({ text: highlightMatch[1], highlight: highlightMatch[2] });
              remainingLine = remainingLine.slice(highlightMatch[0].length);
          } else if (boldMatch) {
              children.push({ text: boldMatch[1], bold: true });
              remainingLine = remainingLine.slice(boldMatch[0].length);
          } else if (italicMatch) {
              children.push({ text: italicMatch[1], italic: true });
              remainingLine = remainingLine.slice(italicMatch[0].length);
          } else {
              // Just a character or plain text until next match
              const nextSpecial = remainingLine.search(/==|\*\*|\*/);
              if (nextSpecial === -1) {
                  children.push({ text: remainingLine });
                  remainingLine = "";
              } else if (nextSpecial === 0) {
                  // It matches the start but didn't match the full regex (e.g. single * without closing)
                  children.push({ text: remainingLine[0] });
                  remainingLine = remainingLine.slice(1);
              } else {
                  children.push({ text: remainingLine.slice(0, nextSpecial) });
                  remainingLine = remainingLine.slice(nextSpecial);
              }
          }
      }
  
      return {
        type: 'paragraph',
        children: children.length > 0 ? children : [{ text: '' }],
      };
    });
};


const soundService = {
  // Simple pool for typewriter sounds to reduce latency/lag
  typewriterPool: [],
  volumes: { type: 0.8, page: 1.0, click: 0.5 }, // Default Volumes
  
  updateVolumes: (newVolumes) => { 
      soundService.volumes = { ...soundService.volumes, ...newVolumes }; 
  },

  getAudio: (src) => {
      const pool = soundService.typewriterPool;
      // Recycle an ended audio if available
      const available = pool.find(a => a.paused && a.src.endsWith(src));
      if (available) return available;
      // Or create new (up to a limit)
      // Limit increased to 50 to allow for fast typing (many overlapping sounds)
      if (pool.length < 50) {
          const a = new Audio(src);
          pool.push(a);
          return a;
      }
      return new Audio(src); // Fallback
  },

  preload: () => {
      // Pre-populate the pool with essential sounds to avoid load-lag on first keypress
      const commons = ['typewriter-TYPE.mp3', 'typewriter-SPACE.mp3', 'ui-click.mp3'];
      commons.forEach(src => {
          // Create a few instances of each common sound
          for (let i = 0; i < 5; i++) {
              const a = new Audio(src);
              a.load();
              soundService.typewriterPool.push(a);
          }
      });
  },

  play: (src, soundEnabled, category = 'click', pitchVariance = 0) => {
    if (!soundEnabled) return;
    
    // Use pool for ui-click and typewriter sounds, normal new Audio for others
    const audio = ((src.includes('ui-click') || src.includes('typewriter')) && pitchVariance > 0) 
        ? soundService.getAudio(src) 
        : new Audio(src);

    const baseVol = soundService.volumes[category] ?? 1.0;
    audio.volume = Math.max(0, Math.min(1, baseVol));

    if (pitchVariance > 0) {
        audio.playbackRate = 1.0 + (Math.random() * pitchVariance * 2 - pitchVariance); 
        audio.currentTime = 0; // Reset recycled audio
    }
    
    audio.play().catch(e => {
        // Ignore play-interrupted errors which happen frequently with rapid typing
        if (e.name !== 'AbortError') {
             console.warn(`Sound error: ${e.message}`);
        }
    });
  },
  pageFlip: (soundEnabled) => soundService.play('page-flip.mp3', soundEnabled, 'page'),
  bookOpen: (soundEnabled) => soundService.play('ui-click.mp3', soundEnabled, 'click'),
  click: (soundEnabled) => soundService.play('ui-click.mp3', soundEnabled, 'click'),
  type: (soundEnabled, isSpace = false) => {
      const src = isSpace ? 'typewriter-SPACE.mp3' : 'typewriter-TYPE.mp3';
      soundService.play(src, soundEnabled, 'type', 0.15);
  },
};


/* --- INLINE ICONS --- */
const PinIcon = ({ className = "", onMouseDown }) => (
    <svg 
        className={className} 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={onMouseDown}
    >
        <path d="M16 3.84861C16.8293 4.14513 17.5 4.86982 17.5 5.76022C17.5 6.7018 16.7018 7.5 15.7602 7.5C14.8698 7.5 14.1451 6.82929 13.8486 6L10 10V16L12 18V20L7 22L5 17L7 15L4 12L6 8.15139C5.17071 7.85487 4.5 7.13018 4.5 6.23978C4.5 5.2982 5.2982 4.5 6.23978 4.5C7.13018 4.5 7.85487 5.17071 8.15139 6L12 10L16 3.84861Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const StickyNoteIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"></path>
    <path d="M15 3v6h6"></path>
  </svg>
);

const TrashIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const EditIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const SaveIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const PlusIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const ImportIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);


const ArrowLeftIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const MoreIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

const CloseIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SliderIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const FilmIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="2" y1="7" x2="7" y2="7"></line>
    <line x1="2" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="22" y2="17"></line>
    <line x1="17" y1="7" x2="22" y2="7"></line>
  </svg>
);

const TUTORIALS = [
    { id: 'zen', title: 'Zen Mode', file: 'zen_mode.mp4', type: 'video' },
    { id: 'oracle', title: 'The Oracle', file: 'oracle.mp4', type: 'video' },
    { id: 'bookmark', title: 'Using Bookmarks', file: 'Bookmark.mp4', type: 'video' },
    { id: 'note', title: 'Notes', file: 'note.mp4', type: 'video' },
    { id: 'highlighter', title: 'Highlighter Tool', file: 'highlighter.gif', type: 'image' },
    { id: 'candle_timer', title: 'Candle Sprint', file: null, type: 'interactive_candle' },
    { id: 'ink_flow', title: 'Ink Flow Mode', file: null, type: 'ink_flow_demo' },
    { id: 'typewriter_scrolling', title: 'Typewriter Scrolling', file: null, type: 'typewriter_scrolling_demo' },
];

const GearIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 20 4-4-1.5-1.5-2.5 2.5V12.5M12 12.5V4M12 4h.01M4 12h16"/>
        <path d="m18.2 11.2-1.6.6a1 1 0 0 0-.6 1.6l.6 1.6-3.2 1.9-1.6-.6a1 1 0 0 0-1.6.6l-.6 1.6-1.9-3.2.6-1.6a1 1 0 0 0-.6-1.6l-1.6-.6 3.2-1.9 1.6.6a1 1 0 0 0 1.6-.6l.6-1.6L14 4.5l1.6.6a1 1 0 0 0 1.6-.6l.6-1.6 1.9 3.2-.6 1.6a1 1 0 0 0 .6 1.6l1.6.6Z"/>
    </svg>
);

const TypewriterScrollingDemo = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 px-12">
            <div className="w-full aspect-video bg-black/40 rounded-xl border border-white/10 p-4 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-500/20 z-0"></div>
                <div className="absolute top-[45%] left-4 text-[10px] text-amber-500/40 uppercase tracking-widest font-mono">Center Line</div>
                
                <div className="w-48 space-y-4 animate-typewriter-scroll relative z-10">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="h-4 bg-amber-100/10 rounded-full w-full"></div>
                    ))}
                    <div className="h-4 bg-amber-500/40 rounded-full w-3/4 flex items-center px-2">
                        <div className="w-[2px] h-3 bg-amber-500 animate-pulse"></div>
                    </div>
                    {[9,10,11,12].map(i => (
                        <div key={i} className="h-4 bg-amber-100/10 rounded-full w-full"></div>
                    ))}
                </div>
            </div>
            <p className="text-center text-xs text-amber-100/60 font-serif">The page automatically slides up as you type, keeping your active line perfectly centered in your field of vision.</p>
        </div>
    );
};

const InkFlowDemo = () => {
    const [text, setText] = useState("Keep writing...");
    const [isBlocked, setIsBlocked] = useState(false);

    const handleBackspace = () => {
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 200);
    };

    const handleType = () => {
        setText(prev => prev + " and more...");
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 px-12">
            {/* Mini Page */}
            <div className={`w-full aspect-[4/3] bg-[#fdf4e3] p-6 shadow-2xl transition-all duration-300 relative rounded-sm ${isBlocked ? 'ring-4 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)_inset]' : 'ring-2 ring-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)_inset]'}`}>
                <div className="font-handwriting text-xl text-[#2a1a10] leading-relaxed break-words h-full overflow-hidden">
                    {text}<span className="inline-block w-[2px] h-5 bg-black animate-pulse ml-1 align-middle"></span>
                </div>
                
                {isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/10 pointer-events-none">
                        <div className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter font-bold transform -rotate-12 scale-150 shadow-lg">Blocked</div>
                    </div>
                )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex gap-4">
                <button 
                    onClick={handleType}
                    className="px-4 py-2 bg-amber-900/40 border border-amber-500/30 rounded text-amber-100 text-xs uppercase tracking-widest hover:bg-amber-800/60 transition-all"
                >
                    Simulate Typing
                </button>
                <button 
                    onClick={handleBackspace}
                    className="px-4 py-2 bg-red-900/40 border border-red-500/30 rounded text-red-100 text-xs uppercase tracking-widest hover:bg-red-800/60 transition-all"
                >
                    Press Backspace
                </button>
            </div>
            <p className="text-[10px] text-amber-500/40 uppercase tracking-widest italic font-serif">Try the Backspace above</p>
        </div>
    );
};

const CandleDemo = () => {
    const [progress, setProgress] = useState(1.0);

    return (
        <div className="w-full h-full relative flex flex-col items-center justify-center min-h-[300px]">
            {/* Candle Area - Aligned to bottom to keep base stationary, padded to avoid clipping */}
            <div className="flex-1 flex items-end justify-center w-full pb-12 pt-10">
                <Candle 
                    progress={progress} 
                    isActive={true} 
                    isZenMode={true} 
                    className="relative transform scale-[1.2] origin-bottom"
                />
            </div>

            {/* Relight Button (Centered Overlay) */}
            {progress <= 0 && (
                <button 
                    onClick={() => setProgress(1.0)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] px-6 py-2 bg-black/80 border border-amber-500/30 rounded-full text-amber-100 font-serif uppercase tracking-widest text-xs hover:bg-amber-900/40 transition-all shadow-xl backdrop-blur-sm"
                >
                    Relight Candle
                </button>
            )}

            {/* Slider Control - Docked to bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-4 z-20 px-8">
                <span className="text-[10px] uppercase tracking-widest text-amber-500/50 font-serif">Melt</span>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={progress} 
                    onChange={(e) => setProgress(parseFloat(e.target.value))}
                    className="w-48 sm:w-64 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125 hover:bg-white/20 transition-colors"
                />
                <span className="text-[10px] uppercase tracking-widest text-amber-500/50 font-serif">Full</span>
            </div>
        </div>
    );
};

const EyeIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const HelpIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
    </svg>
);

const ChartBarIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const ActivityIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const ClockIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const KeyboardIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <line x1="6" y1="8" x2="6" y2="8"></line>
    <line x1="10" y1="8" x2="10" y2="8"></line>
    <line x1="14" y1="8" x2="14" y2="8"></line>
    <line x1="18" y1="8" x2="18" y2="8"></line>
    <line x1="6" y1="12" x2="6" y2="12"></line>
    <line x1="10" y1="12" x2="10" y2="12"></line>
    <line x1="14" y1="12" x2="14" y2="12"></line>
    <line x1="18" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="16" x2="18" y2="16"></line>
  </svg>
);

const MoonIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const SaveStatusIcon = ({ status }) => {
    if (status === 'Saving') {
        return (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        );
    }
    return null; 
};


/* --- COMPONENTS --- */
const ExportModal = ({ isOpen, onClose, onExportMd, onExportTxt, onExportDocx, onExportPDF }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1a1008] p-8 rounded-xl border border-amber-900/40 shadow-2xl w-96 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-amber-100/30 hover:text-white">
                    <CloseIcon size={18} />
                </button>
                <h3 className="text-amber-100 font-display text-2xl mb-6 text-center">Export Book</h3>
                <div className="flex flex-col gap-4">
                    <button onClick={onExportMd} className="w-full py-3 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/30 rounded-lg text-amber-100 text-sm font-serif tracking-widest uppercase transition-colors">
                        Export as Markdown (.md)
                    </button>
                    <button onClick={onExportTxt} className="w-full py-3 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/30 rounded-lg text-blue-100 text-sm font-serif tracking-widest uppercase transition-colors">
                        Export as Text (.txt)
                    </button>
                    <button onClick={onExportDocx} className="w-full py-3 bg-gray-700/40 hover:bg-gray-600/60 border border-gray-500/30 rounded-lg text-gray-100 text-sm font-serif tracking-widest uppercase transition-colors">
                        Export as DOCX
                    </button>
                    <button onClick={onExportPDF} className="w-full py-3 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-lg text-purple-100 text-sm font-serif tracking-widest uppercase transition-colors shadow-lg">
                        Export as PDF (Themed)
                    </button>
                </div>
            </div>
        </div>
    );
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>
    }
    if (leaf.italic) {
      children = <em>{children}</em>
    }
    if (leaf.highlight) {
      children = <span style={{ backgroundColor: leaf.highlight === true ? '#fff59d' : leaf.highlight }}>{children}</span>
    }
    return <span {...attributes}>{children}</span>
}
  
const HoveringToolbar = () => {
    const ref = useRef();
    const editor = useSlate();
    const inFocus = useFocused();
  
    useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) return;
    
        if (!selection || !inFocus || Range.isCollapsed(selection) || Editor.string(editor, selection) === '') {
            el.removeAttribute('style');
            return;
        }
    
        const domSelection = window.getSelection();
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        
        const editorEl = ReactEditor.toDOMNode(editor, editor).parentElement;
        const editorRect = editorEl.getBoundingClientRect();

        let top = rect.top - editorRect.top - el.offsetHeight - 5;
        if (top < 0) {
            top = rect.bottom - editorRect.top + 5;
        }

        el.style.opacity = '1';
        el.style.top = `${top}px`;
        el.style.left = `${rect.left - editorRect.left + rect.width / 2 - el.offsetWidth / 2}px`;
    });
  
    const isMarkActive = (format) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] != null : false;
    };

    const toggleHighlight = (color) => {
        const isActive = isMarkActive('highlight');
        if (isActive && Editor.marks(editor)?.highlight === color) {
            Editor.removeMark(editor, 'highlight');
        } else {
            Editor.addMark(editor, 'highlight', color);
        }
    };
  
    return (
        <div ref={ref} className="absolute z-[100] top-[-10000px] left-[-10000px] p-2 bg-black/80 rounded-md backdrop-blur-sm transition-opacity duration-75 flex gap-2 items-center">
            {HIGHLIGHT_COLORS.map(color => (
                <button
                    key={color}
                    onMouseDown={e => { e.preventDefault(); toggleHighlight(color); }}
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
};
  
const withRichFormatting = editor => {
    const { insertText } = editor;

    editor.insertText = text => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: n => Editor.isBlock(editor, n),
            });
            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor: start, focus: anchor };
            const beforeText = Editor.string(editor, range);

            // 1. Markdown-style shortcuts (Bold ** and Italic *)
            // Triggered on space or punctuation
            if (/\s|[.,!?;:]/.test(text)) {
                // Bold shortcut: **text**
                const boldMatch = beforeText.match(/\*\*([^*]+)\*\*$/);
                if (boldMatch) {
                    const matchText = boldMatch[0];
                    const contentText = boldMatch[1];
                    const matchStart = { ...anchor, offset: anchor.offset - matchText.length };
                    
                    Transforms.select(editor, { anchor: matchStart, focus: anchor });
                    Transforms.delete(editor);
                    Editor.insertNodes(editor, { text: contentText, bold: true });
                    // Reset marks for next character
                    const marks = { ...Editor.marks(editor) };
                    delete marks.bold;
                    editor.marks = marks;
                    
                    insertText(text);
                    return;
                }

                // Italic shortcut: *text*
                const italicMatch = beforeText.match(/\*([^*]+)\*$/);
                if (italicMatch) {
                    const matchText = italicMatch[0];
                    const contentText = italicMatch[1];
                    const matchStart = { ...anchor, offset: anchor.offset - matchText.length };
                    
                    Transforms.select(editor, { anchor: matchStart, focus: anchor });
                    Transforms.delete(editor);
                    Editor.insertNodes(editor, { text: contentText, italic: true });
                    // Reset marks
                    const marks = { ...Editor.marks(editor) };
                    delete marks.italic;
                    editor.marks = marks;

                    insertText(text);
                    return;
                }
            }

            // 2. Capitalize standalone "i"
            if (text === ' ') {
                if (beforeText.endsWith(' i')) {
                    const matchStart = { ...anchor, offset: anchor.offset - 1 };
                    Transforms.select(editor, { anchor: matchStart, focus: anchor });
                    insertText('I');
                } else if (beforeText === 'i') {
                    Transforms.select(editor, { anchor: start, focus: anchor });
                    insertText('I');
                }
            }

            // 3. Capitalize start of sentences
            if (text.length === 1 && /[a-z]/.test(text)) {
                const trimmedBefore = beforeText.trim();
                if (trimmedBefore === '' || /[.!?]\s*$/.test(trimmedBefore)) {
                    insertText(text.toUpperCase());
                    return;
                }
            }
        }

        insertText(text);
    };

    return editor;
};

const RichTextEditor = ({ value, onChange, typewriterMode, isInkFlow, isTypewriterScrolling, soundEnabled, scrollContainerId }) => {
    const editor = useRef(withRichFormatting(withHistory(withReact(createEditor())))).current;
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  
    // Typewriter Scrolling Logic
    React.useLayoutEffect(() => {
        if (!isTypewriterScrolling || !editor.selection || !scrollContainerId) return;

        const handleScroll = () => {
            try {
                // Use Slate's ReactEditor to get the reliable DOM range
                const domRange = ReactEditor.toDOMRange(editor, editor.selection);
                const rect = domRange.getBoundingClientRect();
                const container = document.getElementById(scrollContainerId);
                
                if (container && rect.height > 0) {
                    const containerRect = container.getBoundingClientRect();
                    const relativeY = rect.top - containerRect.top;
                    const targetCenter = containerRect.height / 2;
                    
                    const diff = relativeY - targetCenter;
                    
                    // Use a slightly larger tolerance to prevent jitter
                    if (Math.abs(diff) > 25) { 
                        container.scrollBy({
                            top: diff,
                            behavior: 'auto' // Instant adjustment to prevent lag
                        });
                    }
                }
            } catch (e) {
                // Ignore
            }
        };

        requestAnimationFrame(handleScroll);

    }, [editor.selection, isTypewriterScrolling, scrollContainerId]);

    return (
      <div className={`relative w-full min-h-full transition-all duration-500 ${isInkFlow ? 'ring-2 ring-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)_inset] rounded-sm' : ''}`}>
        <Slate editor={editor} initialValue={value} onChange={onChange}>
          <HoveringToolbar />
          <Editable 
            renderLeaf={renderLeaf}
            className="w-full min-h-full bg-transparent border-none resize-none outline-none font-handwriting text-2xl leading-[28px] text-[#2a1a10]/90 p-2 selection:bg-amber-900/20"
            spellCheck={false}
            onKeyDown={(e) => {
                // Ink Flow Mode: Prevent Backspace
                if (isInkFlow && e.key === 'Backspace') {
                    e.preventDefault();
                    // Visual feedback for blocked action
                    const el = e.target.closest('.relative');
                    if (el) {
                        el.classList.add('ring-red-500/50');
                        setTimeout(() => el.classList.remove('ring-red-500/50'), 150);
                    }
                    return;
                }

                if (typewriterMode && !e.repeat) {
                    soundService.type(soundEnabled, e.key === ' ');
                }
            }}
          />
        </Slate>
      </div>
    );
};

const StickyNote = ({ note, onUpdate, onDelete, bookStageRef, isRightPage, soundEnabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const noteRef = useRef(null);
  
    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const noteRect = noteRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - noteRect.left,
        y: e.clientY - noteRect.top,
      });
      setIsDragging(true);
    };
  
    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isDragging || !bookStageRef || !bookStageRef.current) return;
        const bookRect = bookStageRef.current.getBoundingClientRect();
        
        let newX = e.clientX - bookRect.left - dragOffset.x;
        // If it's a right page note, we must subtract the page's offset from the absolute coordinate
        if (isRightPage) {
            newX -= bookStageRef.current.clientWidth / 2;
        }

        onUpdate(note.id, {
          ...note,
          position: {
            x: newX,
            y: e.clientY - bookRect.top - dragOffset.y,
          }
        });
      };
  
      const handleMouseUp = () => {
        setIsDragging(false);
      };
  
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, dragOffset, note, onUpdate, bookStageRef, isRightPage]);
  
    const toggleMinimize = (e) => {
        e.stopPropagation();
        onUpdate(note.id, { ...note, isMinimized: !note.isMinimized });
        soundService.click(soundEnabled);
    };

    const noteStyle = {
        top: `${note.position.y}px`,
        left: isRightPage ? `calc(50% + ${note.position.x}px)` : `${note.position.x}px`,
        transform: note.isMinimized ? 'rotate(0deg)' : 'rotate(-3deg)'
    };
  
    if (note.isMinimized) {
        return (
            <div 
                ref={noteRef}
                className="absolute p-2 rounded-t-md shadow-lg border border-yellow-700/20 pointer-events-auto z-40"
                style={{
                    ...noteStyle,
                    backgroundColor: '#fffda7',
                    cursor: 'pointer',
                }}
                onClick={toggleMinimize}
            >
                <PinIcon className="absolute -top-1 left-1/2 -translate-x-1/2 text-gray-700" size={16}/>
                <StickyNoteIcon size={16} className="text-black/50" />
            </div>
        );
    }
  
    return (
      <div 
        ref={noteRef}
        className="absolute p-4 rounded-md shadow-lg border border-yellow-700/20 flex flex-col pointer-events-auto z-50"
        style={{
          ...noteStyle,
          backgroundColor: '#fffda7',
          width: '150px',
          minHeight: '120px',
        }}
      >
        <PinIcon 
            className="absolute -top-1 left-1/2 -translate-x-1/2 text-gray-700 cursor-grab"
            size={16}
            onMouseDown={handleMouseDown}
        />
        <div className="absolute -top-2 -right-2 flex gap-1">
            <button onClick={toggleMinimize} className="bg-blue-800 rounded-full p-1 text-white hover:bg-blue-700 z-10">
                <MinusIcon size={12} />
            </button>
            <button onClick={() => { onDelete(note.id); soundService.click(soundEnabled); }} className="bg-red-800 rounded-full p-1 text-white hover:bg-red-700 z-10">
                <CloseIcon size={12} />
            </button>
        </div>
        <textarea
          value={note.content}
          onChange={(e) => onUpdate(note.id, { ...note, content: e.target.value })}
          className="flex-1 bg-transparent border-none resize-none outline-none font-serif text-sm text-gray-800 pt-4"
          onMouseDown={(e) => e.stopPropagation()} 
        />
      </div>
    );
};


const SparklesIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3 1.912 5.886L20 10.8l-5.886 1.912L12 18.6l-1.912-5.886L4.2 10.8l5.886-1.912L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M3 5h4"/>
        <path d="M21 17v4"/>
        <path d="M19 19h4"/>
    </svg>
);

const AnalyticsModal = ({ isOpen, onClose, books, dailyStats, streak }) => {
    if (!isOpen) return null;

    // Calculate real stats from current books
    const totalWords = books.reduce((acc, book) => {
        return acc + serializeSlateToString(book.pages.flat()).split(/\s+/).filter(w => w.length > 0).length;
    }, 0);
    
    const totalPages = books.reduce((acc, book) => acc + book.pages.length, 0);
    const journalsCount = books.length;

    // Generate real activity data for the last 7 days
    const activityData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];
        activityData.push({
            day: i === 0 ? 'Today' : dayName,
            words: dailyStats[dateStr] || 0
        });
    }

    // Dynamic Goals
    // Default yearly goal 100k, or sum of all book goals if higher
    const sumBookGoals = books.reduce((acc, b) => acc + (b.wordGoal || 0), 0);
    const yearlyGoal = Math.max(100000, sumBookGoals); 
    const progressPercent = Math.min((totalWords / yearlyGoal) * 100, 100);

    // Prevent division by zero for bar height scaling
    const maxWords = Math.max(...activityData.map(d => d.words), 10); 

    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#1a1008] rounded-xl border border-amber-900/40 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative overflow-hidden">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-amber-100/30 hover:text-white transition-colors z-50">
                    <CloseIcon size={20} />
                </button>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-minimal p-12">
                    <div className="text-center mb-12">
                        <h3 className="text-amber-100 font-display text-4xl mb-2">Insightful Analytics</h3>
                        <p className="text-amber-500/50 text-xs uppercase tracking-[0.3em] font-serif">Visualize your creative journey</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-center">
                            <span className="block text-amber-500/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Total Words</span>
                            <span className="text-4xl font-display text-amber-100">{totalWords.toLocaleString()}</span>
                        </div>
                        <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-center">
                            <span className="block text-amber-500/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Journals</span>
                            <span className="text-4xl font-display text-amber-100">{journalsCount}</span>
                        </div>
                        <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-center">
                            <span className="block text-amber-500/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Total Pages</span>
                            <span className="text-4xl font-display text-amber-100">{totalPages}</span>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-black/20 p-8 rounded-2xl border border-white/5 mb-12 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-serif text-amber-200/80 tracking-widest uppercase text-sm">Weekly Writing Activity</h4>
                            <div className="flex items-center gap-2 text-[10px] text-amber-500/40 uppercase font-bold tracking-tighter">
                                <ActivityIcon size={12} /> Live Pulse
                            </div>
                        </div>

                        {/* SVG Chart */}
                        <div className="h-64 w-full flex items-end justify-between gap-4 px-4 relative">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-2">
                                <div className="border-t border-white w-full"></div>
                                <div className="border-t border-white w-full"></div>
                                <div className="border-t border-white w-full"></div>
                            </div>

                            {activityData.map((data, i) => {
                                const height = (data.words / maxWords) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group gap-3 relative z-10">
                                        <div className="relative w-full flex flex-col items-center justify-end h-48">
                                            {/* Bar */}
                                            <div 
                                                className="w-8 sm:w-12 bg-gradient-to-t from-amber-900/60 to-amber-500/40 rounded-t-sm transition-all duration-1000 ease-out group-hover:from-amber-800 group-hover:to-amber-400 shadow-lg relative"
                                                style={{ height: `${Math.max(height, 2)}%` }} // Min height for visibility
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-100 text-black px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                                                    {data.words} words
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-serif text-amber-500/40 uppercase tracking-widest">{data.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Yearly Goal Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-black/30 p-8 rounded-xl border border-white/5 flex items-center gap-8">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (progressPercent / 100))} className="text-amber-600" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-display text-amber-100">{Math.round(progressPercent)}%</span>
                                </div>
                            </div>
                            <div>
                                <h5 className="font-serif text-amber-100 text-lg">Yearly Goal</h5>
                                <p className="text-sm text-amber-100/50 font-serif">
                                    You've written {totalWords.toLocaleString()} of your {yearlyGoal.toLocaleString()} word goal.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-900/20 to-transparent p-8 rounded-xl border border-amber-900/20 flex flex-col justify-center text-center">
                            <h5 className="font-serif text-amber-100 text-lg mb-2">Writing Streak</h5>
                            <div className="flex justify-center items-center gap-2 text-4xl font-display text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                <span>🔥 {streak} Days</span>
                            </div>
                            <p className="text-[10px] text-amber-500/40 uppercase tracking-[0.2em] mt-4">Keep the fire burning</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const HelpModal = ({ isOpen, onClose, soundEnabled }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedFolders, setExpandedFolders] = useState(['writing']);

    const helpStructure = [
        { id: 'overview', label: 'Overview' },
        { 
            id: 'writing', 
            label: 'Writing & Editing', 
            children: [
                { id: 'highlighting', label: 'Highlighting' },
                { id: 'sticky_notes', label: 'Sticky Notes' },
                { id: 'tabs', label: 'Page Tabs' },
                { id: 'ink_flow', label: 'Ink Flow Mode' },
                { id: 'typewriter_scrolling', label: 'Typewriter Scrolling' }
            ]
        },
        { id: 'zen', label: 'Zen Mode' },
        { id: 'oracle', label: 'The Oracle' },
        { id: 'candle_timer', label: 'Candle Sprint' },
        { id: 'shortcuts', label: 'Shortcuts' },
    ];

    const toggleFolder = (id) => {
        setExpandedFolders(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
        soundService.click(soundEnabled);
    };

    const handleTabClick = (item) => {
        if (item.children) {
            toggleFolder(item.id);
        } else {
            setActiveTab(item.id);
            soundService.click(soundEnabled);
        }
    };

    const renderTutorial = (tutorialId) => {
        const tutorial = TUTORIALS.find(t => t.id === tutorialId);
        if (!tutorial) return <div className="text-amber-100/50">Tutorial not found.</div>;

        return (
            <div className="space-y-6 h-full flex flex-col">
                <h4 className="font-display text-3xl text-amber-100">{tutorial.title}</h4>
                <div className="flex-1 bg-black/40 rounded-xl border border-white/5 overflow-hidden relative flex items-center justify-center group min-h-[300px]">
                    {tutorial.type === 'video' ? (
                        <video 
                            src={`tutorials/${tutorial.file}`} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-contain opacity-90"
                        />
                    ) : tutorial.type === 'image' ? (
                        <img 
                            src={`tutorials/${tutorial.file}`} 
                            alt={tutorial.title}
                            className="w-full h-full object-contain opacity-90"
                        />
                    ) : tutorial.type === 'interactive_candle' ? (
                        <CandleDemo />
                    ) : tutorial.type === 'ink_flow_demo' ? (
                        <InkFlowDemo />
                    ) : tutorial.type === 'typewriter_scrolling_demo' ? (
                        <TypewriterScrollingDemo />
                    ) : (
                        <div className="text-amber-500/20">
                            <ClockIcon size={120} />
                        </div>
                    )}
                </div>
                <p className="text-amber-100/60 font-serif text-sm leading-relaxed">
                    {tutorialId === 'highlighter' && "Select any text to reveal the highlighting toolbar. Choose a color to mark important passages, key themes, or items needing review. Highlights are saved within your journal."}
                    {tutorialId === 'note' && "Click the Sticky Note icon in the toolbar to add a digital 'post-it' to your page. These notes are perfect for character bios, plot reminders, or research. Drag them anywhere and toggle their visibility as needed."}
                    {tutorialId === 'bookmark' && "Use the Page Tabs at the top of the book to create custom bookmarks for chapters or important sections. You can give each tab a unique label and color for effortless navigation through long works."}
                    {tutorialId === 'zen' && "Zen Mode is your ultimate focus tool. When activated, the interface elements fade away, leaving only your text. This minimizes visual noise and helps you enter a deep state of creative flow. Toggle it using the 'Eye' icon or Alt+Z."}
                    {tutorialId === 'oracle' && "The Oracle breaks through writer's block using the power of synchronicity. Drawing an Oracle card provides an atmospheric prompt to nudge your imagination in a new direction. Use it whenever you need a spark of inspiration."}
                    {tutorialId === 'candle_timer' && "The Candle Sprint is an atmospheric timer for your writing sessions. Light a candle for 10 to 60 minutes and watch it melt away as you type. To maintain complete immersion, the candle is only visible during Zen Mode."}
                    {tutorialId === 'ink_flow' && "Ink Flow Mode is a hardcore drafting tool that disables the Backspace key. By preventing you from editing as you go, it forces you to maintain forward momentum. Look for the red halo on your page to know it's active. Disable it via Settings or Alt+I."}
                    {tutorialId === 'typewriter_scrolling' && "Typewriter Scrolling keeps your focus locked. As you write, the page automatically scrolls to keep your current line vertically centered. This mimics the behavior of physical typewriters and prevents neck strain from looking at the bottom of the page."}
                </p>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <h4 className="font-display text-3xl text-amber-100">Welcome to Midnight Writer</h4>
                        <p className="text-amber-100/80 leading-relaxed font-serif text-lg">
                            Midnight Writer is a distraction-free environment designed to help you focus on what matters most: your words. 
                            Inspired by the quiet solitude of late-night inspiration, every element is crafted to immerse you in the creative process.
                        </p>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h5 className="font-bold text-amber-500 uppercase tracking-widest text-xs mb-2">Quick Tip</h5>
                            <p className="text-sm text-amber-100/70">Your work is saved automatically as you type. You can also export your journals to various formats.</p>
                        </div>
                    </div>
                );
            case 'zen':
                return renderTutorial('zen');
            case 'oracle':
                return renderTutorial('oracle');
            case 'candle_timer':
                return renderTutorial('candle_timer');
            case 'highlighting': return renderTutorial('highlighter');
            case 'sticky_notes': return renderTutorial('note');
            case 'tabs': return renderTutorial('bookmark');
            case 'ink_flow': return renderTutorial('ink_flow');
            case 'typewriter_scrolling': return renderTutorial('typewriter_scrolling');
            case 'shortcuts':
                return (
                    <div className="space-y-6">
                        <h4 className="font-display text-3xl text-amber-100">Keyboard Shortcuts</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { key: 'ESC', action: 'Close Modals / Exit Zen Mode' },
                                { key: 'ALT + Z', action: 'Toggle Zen Mode' },
                                { key: 'ALT + O', action: 'Open The Oracle' },
                                { key: 'ALT + L', action: 'Return to Library' },
                                { key: 'ALT + S', action: 'Open Settings' },
                                { key: 'ALT + H', action: 'Open Help' },
                                { key: 'CTRL + S', action: 'Force Save (Auto-saves by default)' },
                            ].map((shortcut, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-amber-100/80">{shortcut.action}</span>
                                    <code className="bg-black/30 px-2 py-1 rounded text-amber-500 font-mono text-xs font-bold">{shortcut.key}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#1a1008] rounded-xl border border-amber-900/40 shadow-2xl w-full max-w-4xl h-[70vh] flex relative overflow-hidden">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-amber-100/30 hover:text-white transition-colors z-50">
                    <CloseIcon size={20} />
                </button>

                {/* Sidebar */}
                <div className="w-64 bg-black/20 border-r border-amber-900/20 flex flex-col pt-8">
                    <div className="px-6 mb-8">
                        <h3 className="text-amber-100 font-display text-2xl">Help Center</h3>
                        <p className="text-amber-500/50 text-[10px] uppercase tracking-[0.2em] font-serif mt-1">Guide & Manual</p>
                    </div>
                    <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar-minimal">
                        {helpStructure.map(item => (
                            <div key={item.id}>
                                <button
                                    onClick={() => handleTabClick(item)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-serif transition-all flex justify-between items-center ${
                                        activeTab === item.id 
                                        ? 'bg-amber-900/40 text-amber-100 border border-amber-800/30 shadow-inner' 
                                        : 'text-amber-100/50 hover:bg-white/5 hover:text-amber-100'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.children && (
                                        <span className={`transform transition-transform ${expandedFolders.includes(item.id) ? 'rotate-90' : ''}`}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                        </span>
                                    )}
                                </button>
                                
                                {item.children && expandedFolders.includes(item.id) && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                                        {item.children.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={() => { setActiveTab(child.id); soundService.click(soundEnabled); }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-xs font-serif transition-all ${
                                                    activeTab === child.id 
                                                    ? 'text-amber-100 bg-white/5' 
                                                    : 'text-amber-100/40 hover:text-amber-100 hover:bg-white/5'
                                                }`}
                                            >
                                                {child.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#1a1008] relative overflow-y-auto custom-scrollbar-minimal">
                    <div className="p-12 pb-20 h-full">
                        {renderContent()}
                    </div>
                </div>

            </div>
        </div>
    );
};

const OnboardingModal = ({ isOpen, onComplete, soundEnabled }) => {
    if (!isOpen) return null;
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ name: '', goal: '', experience: '' });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (step === 0 && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, soundEnabled]); // Depend on step to ensure we only trigger on step 0

    const handleNext = () => {
        console.log("handleNext called, current step:", step);
        try {
            soundService.pageFlip(soundEnabled);
        } catch (e) {
            console.error("Sound error:", e);
        }
        
        if (step === 3) {
            console.log("Completing onboarding");
            onComplete(formData);
        } else {
            console.log("Incrementing step");
            setStep(prev => prev + 1);
        }
    };

    const updateData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        soundService.click(soundEnabled);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="text-center space-y-8 animate-fade-in">
                        <div className="mb-4">
                            <SparklesIcon size={48} className="text-amber-500/50 mx-auto animate-pulse" />
                        </div>
                        <h2 className="font-display text-5xl text-amber-100">Midnight Writer</h2>
                        <p className="font-serif text-xl text-amber-100/60 italic">"The scariest moment is always just before you start."</p>
                        <button 
                            onClick={handleNext}
                            className="relative z-[100] cursor-pointer mt-8 px-12 py-4 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/30 rounded-full text-amber-100 font-serif tracking-[0.2em] uppercase transition-all hover:scale-105 pointer-events-auto"
                        >
                            Begin Journey
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="text-center space-y-8 animate-fade-in w-full max-w-md">
                        <h3 className="font-display text-3xl text-amber-100">Who is the author?</h3>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full bg-transparent border-b-2 border-amber-900/50 focus:border-amber-500 outline-none text-center font-serif text-3xl text-amber-100 py-4 placeholder-amber-900/30 transition-colors"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && formData.name && handleNext()}
                        />
                        <button 
                            onClick={handleNext}
                            disabled={!formData.name}
                            className={`mt-8 px-8 py-3 rounded-full font-serif tracking-widest uppercase text-sm transition-all ${formData.name ? 'bg-amber-900/40 text-amber-100 hover:bg-amber-800/60 cursor-pointer' : 'bg-transparent text-amber-900/30 cursor-not-allowed'}`}
                        >
                            Continue
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center space-y-8 animate-fade-in w-full max-w-lg">
                        <h3 className="font-display text-3xl text-amber-100">What brings you here tonight?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Write a Novel', 'Daily Journaling', 'Poetry & Lyrics', 'Note Taking', 'Screenplay', 'Just Exploring'].map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => { updateData('goal', goal); setTimeout(handleNext, 300); }}
                                    className={`p-6 rounded-xl border transition-all text-sm font-serif uppercase tracking-widest ${formData.goal === goal ? 'bg-amber-900/60 border-amber-500/50 text-amber-100' : 'bg-black/20 border-white/5 text-amber-100/50 hover:bg-white/5 hover:text-amber-100'}`}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center space-y-8 animate-fade-in w-full max-w-lg">
                        <h3 className="font-display text-3xl text-amber-100">Your Experience Level?</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: 'Novice Scribe', desc: 'I am just starting my writing journey.' },
                                { label: 'Occasional Writer', desc: 'I write when inspiration strikes.' },
                                { label: 'Dedicated Author', desc: 'Writing is a daily discipline for me.' }
                            ].map((level) => (
                                <button
                                    key={level.label}
                                    onClick={() => { updateData('experience', level.label); setTimeout(handleNext, 300); }}
                                    className={`p-6 rounded-xl border text-left transition-all group ${formData.experience === level.label ? 'bg-amber-900/60 border-amber-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                >
                                    <span className={`block font-display text-xl mb-1 ${formData.experience === level.label ? 'text-amber-100' : 'text-amber-100/70 group-hover:text-amber-100'}`}>{level.label}</span>
                                    <span className="text-xs font-serif text-amber-100/40 uppercase tracking-wider">{level.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            
            <div className="relative z-50 w-full flex flex-col items-center justify-center min-h-[500px]">
                {renderStep()}
                
                {/* Progress Dots */}
                <div className="absolute bottom-0 flex gap-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-amber-500' : 'bg-white/10'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, bookTitle }) => {
  if (!isOpen) return null;
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);
  
  const handleMouseDown = () => {
    let start = null;
    const duration = 1500; // 1.5 seconds to hold

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onConfirm();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseUp = () => {
    cancelAnimationFrame(animationRef.current);
    setProgress(0);
  };

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
        <div className="bg-[#1a1008] p-10 rounded-xl border border-red-900/40 shadow-2xl w-full max-w-md text-center relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-amber-100/30 hover:text-white">
                <CloseIcon size={18} />
            </button>
            
            <div className="mb-6 flex justify-center text-red-500/80">
                <TrashIcon size={48} />
            </div>
            
            <h3 className="text-amber-100 font-display text-2xl mb-2">Burn this Journal?</h3>
            <p className="text-amber-500/50 text-sm font-serif mb-8">
                "{bookTitle}" will be lost to the void forever.<br/>There is no turning back.
            </p>

            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                className="group relative w-full h-14 bg-red-900/20 border border-red-900/50 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer select-none"
            >
                {/* Progress Fill */}
                <div 
                    className="absolute inset-0 bg-red-700 transition-all ease-linear duration-75"
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Text Layer */}
                <span className="relative z-10 text-red-100 font-serif uppercase tracking-[0.2em] text-sm font-bold group-hover:text-white transition-colors">
                    {progress >= 100 ? "Burning..." : "Hold to Incinerate"}
                </span>
            </button>
        </div>
    </div>
  );
};

const PlayIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const PauseIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
);

const VolumeIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
);

const VolumeXIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
);

const AMBIANCE_TRACKS = [
    { name: "Crackling Fire", file: "ambiance/campfire-crackling-fireplace-sound-119594.mp3" },
    { name: "City Rain", file: "ambiance/city-ambience-9272.mp3" },
    { name: "Gentle Rain", file: "ambiance/relaxing-rain-444802.mp3" },
    { name: "Brown Noise", file: "ambiance/relaxing-smoothed-brown-noise-294838.mp3" },
    { name: "Underwater", file: "ambiance/underwater-white-noise-46423.mp3" },
];

const MusicIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const AudioVisualizer = ({ isActive }) => {    return (
        <div className={`flex items-end gap-[2px] h-3 w-3 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-1 bg-amber-500 rounded-t-[1px] ${isActive ? 'animate-pulse h-3' : 'h-1'}`} style={{ animationDuration: '0.4s' }}></div>
            <div className={`w-1 bg-amber-500 rounded-t-[1px] ${isActive ? 'animate-pulse h-2' : 'h-1'}`} style={{ animationDuration: '0.5s' }}></div>
            <div className={`w-1 bg-amber-500 rounded-t-[1px] ${isActive ? 'animate-pulse h-2.5' : 'h-1'}`} style={{ animationDuration: '0.3s' }}></div>
        </div>
    );
};

const AudioMixer = ({ sfxVolumes, setSfxVolumes, soundEnabled, typewriterMode }) => {
    const updateVol = (key, val) => {
        const newVols = { ...sfxVolumes, [key]: parseFloat(val) };
        setSfxVolumes(newVols);
    };

    const previewSound = (key) => {
        if (key === 'type') soundService.type(soundEnabled);
        if (key === 'click') soundService.click(soundEnabled);
        if (key === 'page') soundService.pageFlip(soundEnabled);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h4 className="font-display text-2xl text-amber-100">Sound Board</h4>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500/50 uppercase tracking-widest">
                    <ActivityIcon size={14} /> Live Mixer
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {[
                    { key: 'type', label: 'Typewriter', icon: <KeyboardIcon size={20}/> },
                    { key: 'page', label: 'Page Turns', icon: <ImportIcon size={20} className="rotate-90"/> }, // Reusing import icon as page flip metaphor
                    { key: 'click', label: 'UI Clicks', icon: <PlayIcon size={20}/> }
                ].map(channel => {
                    const isTypewriterMuted = channel.key === 'type' && !typewriterMode;
                    const isMuted = !soundEnabled || isTypewriterMuted || sfxVolumes[channel.key] === 0;
                    const isDisabled = !soundEnabled || isTypewriterMuted;

                    return (
                        <div key={channel.key} className={`bg-black/30 p-4 rounded-xl border flex flex-col items-center gap-4 group transition-all relative overflow-hidden ${isMuted ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-amber-500/30'}`}>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AudioVisualizer isActive={!isMuted && sfxVolumes[channel.key] > 0} />
                            </div>
                            
                            <div className="flex flex-col items-center gap-2">
                                <div className={`p-3 rounded-full transition-colors ${!isMuted ? 'bg-amber-900/40 text-amber-100' : 'bg-red-900/20 text-red-500/40'}`}>
                                    {channel.icon}
                                </div>
                                <span className={`font-serif text-sm transition-colors ${!isMuted ? 'text-amber-100/80' : 'text-red-500/40'}`}>{channel.label}</span>
                                <button 
                                    onClick={() => previewSound(channel.key)}
                                    className={`text-[10px] uppercase tracking-widest border rounded px-2 py-1 transition-all flex items-center gap-1 ${!isMuted ? 'text-amber-500/50 hover:text-amber-100 border-transparent hover:border-amber-500/30' : 'text-red-500/20 border-transparent cursor-not-allowed'}`}
                                    disabled={isMuted}
                                >
                                    <PlayIcon size={10} /> Preview
                                </button>
                            </div>
                            
                            <div className="h-32 w-10 relative flex items-center justify-center">
                                {/* Track Background */}
                                <div className={`h-full w-2 rounded-full transition-colors ${!isMuted ? 'bg-black/50' : 'bg-red-900/20'}`}></div>
                                
                                {/* Filled Track */}
                                <div 
                                    className={`w-2 rounded-b-full rounded-t-sm transition-all duration-75 absolute bottom-0 pointer-events-none ${!isMuted ? 'bg-amber-600' : 'bg-red-600/20'}`}
                                    style={{ height: `${sfxVolumes[channel.key] * 100}%` }}
                                ></div>

                                {/* Cross-out Line (When muted globally or locally) */}
                                {isMuted && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-12 h-[1px] bg-red-500/40 rotate-45"></div>
                                    </div>
                                )}

                                {/* Range Input (Rotated) */}
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01"
                                    value={sfxVolumes[channel.key]}
                                    onChange={(e) => updateVol(channel.key, e.target.value)}
                                    disabled={isDisabled}
                                    className={`absolute w-32 h-10 opacity-0 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    style={{ 
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: 'center'
                                    }} 
                                />
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={Math.round(sfxVolumes[channel.key] * 100)}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value, 10);
                                        if (isNaN(val)) val = 0;
                                        if (val < 0) val = 0;
                                        if (val > 100) val = 100;
                                        updateVol(channel.key, val / 100);
                                    }}
                                    disabled={isDisabled}
                                    className={`w-8 bg-transparent text-center font-mono text-[10px] border-b border-transparent transition-colors focus:outline-none p-0 ${!isMuted ? 'text-amber-500/80 hover:border-white/10 focus:border-amber-500' : 'text-red-500/40 cursor-not-allowed'}`}
                                />
                                <span className={`font-mono text-[10px] transition-colors ${!isMuted ? 'text-amber-500/30' : 'text-red-500/20'}`}>%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Candle = ({ progress, isActive, isZenMode, className = "" }) => {
    if (!isActive || !isZenMode) return null;
    
    // Height calculation
    const height = Math.max(10, progress * 140);
    
    return (
      <div className={`z-[60] flex flex-col items-center animate-fade-in pointer-events-none perspective-500 ${className}`}>
          {/* Flame & Glow Container */}
          {progress > 0 && (
              <div className="relative mb-[-4px] z-10 flex flex-col items-center">
                  {/* Outer Ambient Glow (Room Light) */}
                  <div className="absolute -top-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                  
                  {/* Inner Halo */}
                  <div className="absolute -top-6 w-12 h-12 bg-yellow-500/30 rounded-full blur-xl animate-flicker"></div>
                  
                  {/* The Flame Core */}
                  <div className="relative w-4 h-12 flex justify-center origin-bottom">
                      <div className="absolute bottom-0 w-4 h-full bg-gradient-to-t from-blue-400 via-orange-500 to-yellow-100 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] animate-flicker shadow-[0_0_20px_rgba(255,165,0,0.6)] opacity-90 blur-[0.5px]"></div>
                      <div className="absolute bottom-1 w-1.5 h-4 bg-blue-600/40 rounded-full blur-[1px]"></div>
                  </div>
              </div>
          )}
          
          {/* Wick */}
          <div className="w-[2px] h-3 bg-[#1a1008] opacity-80 mb-[-1px] z-0"></div>
          
          {/* Candle Body */}
          <div 
              className="w-10 bg-gradient-to-r from-[#eecfa1] via-[#f7e7ce] to-[#dcb376] rounded-t-sm rounded-b-md shadow-[-5px_0_15px_rgba(0,0,0,0.5)_inset,5px_0_10px_rgba(255,255,255,0.1)_inset] transition-all duration-1000 ease-linear relative overflow-hidden"
              style={{ height: `${height}px` }}
          >
              {/* Molten Wax Pool at Top */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#fff9e6] to-transparent opacity-80 blur-[1px]"></div>
              
              {/* Drip 1 */}
              <div className="absolute top-2 left-2 w-1.5 h-8 bg-[#f7e7ce] rounded-full opacity-90 shadow-sm"></div>
              {/* Drip 2 */}
              <div className="absolute top-4 right-3 w-1 h-5 bg-[#eecfa1] rounded-full opacity-80 shadow-sm"></div>
          </div>
          
          {/* Base/Plate */}
          <div className="w-16 h-2 bg-[#2a1a10] rounded-[50%] mt-[-2px] shadow-[0_10px_20px_rgba(0,0,0,0.8)] border border-white/5"></div>
      </div>
    );
};

const SprintModal = ({ isOpen, onClose, onStart, onStop, isActive, soundEnabled }) => {
    if (!isOpen) return null;
    const durations = [10, 15, 20, 25, 30, 45, 60];

    return (
        <div className="absolute top-20 right-48 z-[100] bg-[#1a1008] border border-amber-900/40 rounded-xl shadow-2xl p-4 w-64 animate-fade-in">
            <h4 className="font-display text-amber-100 mb-2 text-center">{isActive ? "Candle is Lit" : "Lighting a Candle"}</h4>
            <p className="text-[10px] text-amber-500/50 text-center mb-4 font-serif italic">
                The candle burns only in Zen Mode.
            </p>
            
            {isActive ? (
                <button
                    onClick={() => { onStop(); soundService.click(soundEnabled); }}
                    className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-lg text-red-200 font-serif text-sm uppercase tracking-widest transition-all mb-2"
                >
                    Blow Out Candle
                </button>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {durations.map(min => (
                        <button
                            key={min}
                            onClick={() => { onStart(min); soundService.click(soundEnabled); }}
                            className="p-2 bg-white/5 hover:bg-amber-900/40 border border-transparent hover:border-amber-500/30 rounded text-amber-100/80 font-serif text-sm transition-all"
                        >
                            {min}m
                        </button>
                    ))}
                </div>
            )}
            <button onClick={onClose} className="w-full mt-4 text-[10px] text-amber-500/40 hover:text-amber-500 uppercase tracking-widest">Close</button>
        </div>
    );
};

const RainOverlay = ({ isActive }) => {
    if (!isActive) return null;
    
    // Create static array of drops to avoid re-renders
    const drops = useRef(Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${0.5 + Math.random() * 1}s`,
        height: `${10 + Math.random() * 20}px`
    }))).current;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
            {drops.map((drop, i) => (
                <div 
                    key={i}
                    className="absolute top-0 w-[1px] bg-white/10 animate-rain-fall"
                    style={{ 
                        left: drop.left, 
                        animationDelay: drop.delay, 
                        animationDuration: drop.duration,
                        height: drop.height
                    }}
                ></div>
            ))}
        </div>
    );
};

const DustMotes = ({ isActive }) => {
    if (!isActive) return null;

    const motes = useRef(Array.from({ length: 15 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        size: `${2 + Math.random() * 3}px`
    }))).current;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {motes.map((mote, i) => (
                <div 
                    key={i}
                    className="absolute bg-white/5 rounded-full animate-float blur-[1px]"
                    style={{ 
                        left: mote.left, 
                        top: mote.top, 
                        width: mote.size, 
                        height: mote.size,
                        animationDelay: mote.delay 
                    }}
                ></div>
            ))}
        </div>
    );
};

const Observer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: '10%', right: '15%' });

    useEffect(() => {
        // Random appearance logic
        const checkAppear = () => {
            if (!isVisible && Math.random() < 0.05) { // 5% chance every 10s
                setPosition({ 
                    top: `${10 + Math.random() * 20}%`, 
                    right: `${10 + Math.random() * 30}%` 
                });
                setIsVisible(true);
                // Disappear after random time
                setTimeout(() => setIsVisible(false), 5000 + Math.random() * 5000);
            }
        };
        const interval = setInterval(checkAppear, 10000);
        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <div 
            className={`absolute w-12 h-12 z-0 transition-opacity duration-1000 pointer-events-auto ${isVisible ? 'opacity-20 hover:opacity-0' : 'opacity-0'}`}
            style={{ top: position.top, right: position.right }}
            onMouseEnter={() => setIsVisible(false)} // Vanish on hover
        >
            {/* Crow Silhouette */}
            <svg viewBox="0 0 24 24" fill="black" className="w-full h-full drop-shadow-2xl">
                <path d="M21.5,12 C20.1,12.3 19.3,13.2 18.5,14.5 C17.8,15.7 16.5,16.5 15,16.5 C14.5,16.5 14,16.4 13.5,16.2 C13.5,16.5 13.5,16.8 13.5,17 C13.5,17.2 13.5,17.5 13.5,17.7 C13.5,18 13.5,18.2 13.5,18.5 L12.5,21.5 L11.5,18.5 C11.5,18.2 11.5,18 11.5,17.7 C11.5,17.5 11.5,17.2 11.5,17 C11.5,16.5 11.6,16 11.8,15.5 C10.8,15.8 9.8,16 8.7,16 C6.5,16 4.5,15 3,13.5 L2,12.5 L3.5,12 C5,11.5 6.2,10.5 7,9.2 C7.8,8 9.5,7.2 11.5,7.2 C13.5,7.2 15.2,8 16,9.2 C16.8,10.5 18,11.5 19.5,12 L21.5,12 Z" />
            </svg>
        </div>
    );
};

const FunConfirmModal = ({ isOpen, onClose, onConfirm }) => {

    if (!isOpen) return null;

    return (

        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">

            <div className="bg-[#1a1008] p-8 rounded-xl border border-amber-900/40 shadow-2xl w-full max-w-sm text-center relative overflow-hidden">

                <div className="mb-6 text-amber-500">

                    <SparklesIcon size={48} className="mx-auto animate-bounce" />

                </div>

                <h3 className="text-amber-100 font-display text-2xl mb-4">A Plea for Whimsy...</h3>

                <p className="text-amber-100/60 font-serif mb-8 italic">

                    "Oh, don't be such a curmudgeon! The shadows are lonely without their observers, and the paper longs for the messiness of creation. Are you sure you want to banish the magic?"

                </p>

                <div className="flex flex-col gap-3">

                    <button 

                        onClick={onClose}

                        className="w-full py-3 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/30 rounded-lg text-amber-100 text-sm font-serif tracking-widest uppercase transition-colors"

                    >

                        Keep the Magic

                    </button>

                    <button 

                        onClick={onConfirm}

                        className="w-full py-2 text-[10px] text-white/20 hover:text-red-500/50 uppercase tracking-[0.2em] transition-colors"

                    >

                        Yes, I prefer a boring world.

                    </button>

                </div>

            </div>

        </div>

    );

};



const SettingsModal = ({ 

    isOpen, onClose, font, onFontChange, theme, onThemeChange, 

    soundEnabled, onSoundToggle, activeBook, updateBook, 

    ambianceTrack, setAmbianceTrack, ambianceVolume, setAmbianceVolume, 

    isAmbiancePlaying, setIsAmbiancePlaying,

    typewriterMode, setTypewriterMode,

    isInkFlow, setIsInkFlow,

    isTypewriterScrolling, setIsTypewriterScrolling,

    easterEggsEnabled, setEasterEggsEnabled,

    sleepTimer, setSleepTimer,

    autoPause, setAutoPause,

    ambianceAudioRef, resetAudioEngine,

    sfxVolumes, setSfxVolumes

}) => {

    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('write'); // write, ambiance, audio

    const [goal, setGoal] = useState(activeBook?.wordGoal || 0);

    const [showFunConfirm, setShowFunConfirm] = useState(false);



    const handleToggleEasterEggs = () => {

        if (easterEggsEnabled) {

            setShowFunConfirm(true);

        } else {

            setEasterEggsEnabled(true);

            soundService.click(soundEnabled);

        }

    };



    const navItems = [
        { id: 'write', label: 'Write', icon: <EditIcon size={18} /> },
        { id: 'ambiance', label: 'Ambiance', icon: <MusicIcon size={18} /> },
        { id: 'audio', label: 'Sound Board', icon: <SliderIcon size={18} /> },
    ];

    const handleSaveGoal = () => {
        updateBook({ ...activeBook, wordGoal: parseInt(goal, 10) || 0 });
        soundService.click(soundEnabled);
    };

    const fontCategories = {
        "Handwriting": ['Caveat', 'Dancing Script', 'Indie Flower', 'Patrick Hand', 'Shadows Into Light', 'Satisfy', 'Courgette', 'Permanent Marker'],
        "Serif": ['Crimson Text', 'Playfair', 'Lora', 'Merriweather', 'EB Garamond', 'Libre Baskerville', 'Cormorant', 'Source Serif', 'Slab'],
        "Sans Serif": ['Open Sans', 'Lato', 'Montserrat', 'Raleway'],
        "Monospace": ['Typewriter', 'Source Code', 'Fira Code', 'Courier Prime']
    };

    return (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-[#1a1008] rounded-xl border border-amber-900/40 shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-64 bg-black/20 border-r border-amber-900/20 flex flex-col pt-8 p-4">
                <div className="px-2 mb-8">
                    <h3 className="text-amber-100 font-display text-2xl">Settings</h3>
                    <p className="text-amber-500/50 text-[10px] uppercase tracking-[0.2em] font-serif mt-1">Control Panel</p>
                </div>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-serif transition-all flex items-center gap-3 ${
                                activeTab === item.id 
                                ? 'bg-amber-900/40 text-amber-100 border border-amber-800/30 shadow-inner' 
                                : 'text-amber-100/50 hover:bg-white/5 hover:text-amber-100'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto">
                    <button onClick={onClose} className="w-full py-3 border border-white/5 rounded-lg text-amber-100/40 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                        <CloseIcon size={16} /> <span className="text-xs uppercase tracking-widest">Close</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative flex flex-col bg-[#1a1008]">
                <div className="p-6 border-b border-amber-900/20 flex-shrink-0 flex items-center justify-center relative">
                    <div className="text-center">
                        <h3 className="text-amber-100 font-display text-3xl mb-1">
                            {activeTab === 'write' ? 'Environment' : activeTab === 'ambiance' ? 'Ambiance' : 'Sound Board'}
                        </h3>
                        <p className="text-amber-500/50 text-xs uppercase tracking-[0.2em] font-serif">Customize your writing environment</p>
                    </div>
                </div>
                <AncientScrollbar className="flex-1">
                    <div className="p-12 space-y-10">                        
                        {/* WRITE TAB */}
                        {activeTab === 'write' && (
                            <div className="space-y-10 animate-fade-in">
                                {/* Fonts Section */}
                                <div className="space-y-6">
                                    <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Typography</h4>
                                    
                                    {Object.entries(fontCategories).map(([category, fonts]) => (
                                        <div key={category} className="space-y-3">
                                            <h5 className="text-amber-500/60 text-xs font-serif uppercase tracking-wider pl-1">{category}</h5>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {fonts.map(fontName => {
                                                    const option = FONT_OPTIONS.find(f => f.name === fontName);
                                                    if (!option) return null;
                                                    return (
                                                        <button 
                                                            key={option.name}
                                                            onClick={() => { onFontChange(option.family); soundService.click(soundEnabled); }}
                                                            className={`h-12 px-2 rounded-lg transition-all text-sm border flex items-center justify-center ${
                                                            font === option.family 
                                                                ? 'bg-amber-800/60 border-amber-600/50 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                                                                : 'bg-black/20 hover:bg-white/5 border-transparent text-amber-100/60 hover:text-amber-100/90'
                                                            }`}
                                                            style={{ fontFamily: option.family }}
                                                            title={option.name}
                                                        >
                                                            <span className="truncate">{option.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Theme Section */}
                                <div className="space-y-6">
                                    <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Atmosphere</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.values(THEME_DATA).map(themeOption => (
                                        <button 
                                            key={themeOption.name}
                                            onClick={() => { onThemeChange(themeOption.name); soundService.click(soundEnabled); }}
                                            className={`py-4 px-4 rounded-xl transition-all text-sm border flex flex-col items-center gap-2 ${
                                            theme === themeOption.name
                                                ? 'bg-amber-800/60 border-amber-600/50 text-amber-100 shadow-lg' 
                                                : 'bg-black/20 hover:bg-white/5 border-transparent text-amber-100/60'
                                            }`}
                                        >
                                            <div className="w-full h-8 rounded mb-1 border border-white/10" style={{ background: themeOption.wood }}></div>
                                            <span className="font-serif tracking-wide">{themeOption.name}</span>
                                        </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Goals Section */}
                                {activeBook && (
                                <div className="space-y-6">
                                    <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Goals</h4>
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                                        <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-3">Word Goal for "{activeBook.title}"</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={goal}
                                                onChange={(e) => setGoal(e.target.value)}
                                                className="flex-1 bg-black/30 border border-amber-900/30 rounded-lg px-4 py-3 text-amber-50 focus:outline-none focus:border-amber-600 font-serif text-lg placeholder-amber-900/50"
                                                placeholder="e.g. 50000"
                                            />
                                            <button 
                                                onClick={handleSaveGoal} 
                                                className="px-8 py-3 bg-amber-800/60 hover:bg-amber-700/60 border border-amber-700/30 rounded-lg text-amber-100 uppercase tracking-widest text-xs font-bold transition-all"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* Advanced Writing Tools */}
                                <div className="space-y-6">
                                    <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Drafting Tools</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => { setIsInkFlow(!isInkFlow); soundService.click(soundEnabled); }}
                                            className={`py-4 px-6 rounded-xl transition-all text-sm border flex items-center justify-between group ${
                                            isInkFlow
                                                ? 'bg-red-900/30 border-red-600/30 text-red-100' 
                                                : 'bg-black/20 hover:bg-white/5 border-transparent text-amber-100/60'
                                            }`}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-serif text-lg">Ink Flow Mode</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Disables Backspace</span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isInkFlow ? 'bg-red-600' : 'bg-white/10'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isInkFlow ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => { setIsTypewriterScrolling(!isTypewriterScrolling); soundService.click(soundEnabled); }}
                                            className={`py-4 px-6 rounded-xl transition-all text-sm border flex items-center justify-between group ${
                                            isTypewriterScrolling
                                                ? 'bg-amber-900/30 border-amber-600/30 text-amber-100' 
                                                : 'bg-black/20 hover:bg-white/5 border-transparent text-amber-100/60'
                                            }`}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-serif text-lg">Typewriter Scrolling</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Keep active line centered</span>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isTypewriterScrolling ? 'bg-amber-600' : 'bg-white/10'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isTypewriterScrolling ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AMBIANCE TAB */}
                        {activeTab === 'ambiance' && (
                    <div className="space-y-6">
                        <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Ambiance</h4>
                        
                        <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                            {/* Controls */}
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => { setIsAmbiancePlaying(!isAmbiancePlaying); soundService.click(soundEnabled); }}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAmbiancePlaying ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-black/40 text-amber-100/50 hover:bg-white/10 hover:text-amber-100'}`}
                                >
                                    {isAmbiancePlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                                </button>
                                
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-serif text-amber-500/60 uppercase tracking-widest">
                                        <span>Master Volume</span>
                                        <span>{Math.round(ambianceVolume * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setAmbianceVolume(0)} className="text-amber-100/40 hover:text-amber-100">
                                            {ambianceVolume === 0 ? <VolumeXIcon size={16} /> : <VolumeIcon size={16} />}
                                        </button>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="1" 
                                            step="0.01" 
                                            value={ambianceVolume}
                                            onChange={(e) => setAmbianceVolume(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Track Selection */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {AMBIANCE_TRACKS.map(track => (
                                    <button
                                        key={track.name}
                                        onClick={() => { 
                                            if (ambianceTrack === track.file && isAmbiancePlaying) {
                                                setIsAmbiancePlaying(false);
                                            } else {
                                                setAmbianceTrack(track.file);
                                                setIsAmbiancePlaying(true);
                                            }
                                            soundService.click(soundEnabled);
                                        }}
                                        className={`p-3 rounded-lg text-sm font-serif transition-all text-left flex items-center gap-2 ${ambianceTrack === track.file ? 'bg-amber-900/40 border border-amber-600/40 text-amber-100' : 'bg-black/20 border border-transparent text-amber-100/40 hover:bg-white/5 hover:text-amber-100'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${ambianceTrack === track.file && isAmbiancePlaying ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`}></div>
                                        {track.name}
                                    </button>
                                ))}
                            </div>

                            {/* Advanced Audio Features */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                {/* Sleep Timer */}
                                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                                    <div className="flex items-center gap-3 text-amber-100/80">
                                        <ClockIcon size={16} />
                                        <span className="text-xs font-serif uppercase tracking-widest">Sleep Timer</span>
                                    </div>
                                    <select 
                                        value={sleepTimer} 
                                        onChange={(e) => setSleepTimer(parseInt(e.target.value))}
                                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-amber-100 outline-none focus:border-amber-600"
                                    >
                                        <option value={0}>Off</option>
                                        <option value={15}>15m</option>
                                        <option value={30}>30m</option>
                                        <option value={45}>45m</option>
                                        <option value={60}>60m</option>
                                    </select>
                                </div>
                                
                                {/* Auto Pause */}
                                <button 
                                    onClick={() => { setAutoPause(!autoPause); soundService.click(soundEnabled); }}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${autoPause ? 'bg-amber-900/60 border border-amber-500/50 shadow-md' : 'bg-black/30 border border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3 text-amber-100/80">
                                        <PauseIcon size={16} />
                                        <span className="text-xs font-serif uppercase tracking-widest">Auto-Pause</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${autoPause ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] scale-110' : 'bg-white/10'}`}></div>
                                </button>
                            </div>
                    
                                </div>
                            </div>
                        )}

                        {/* AUDIO TAB (NEW) */}
                        {activeTab === 'audio' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-serif text-amber-200/90 tracking-widest uppercase text-sm border-b border-white/5 pb-2">Master Controls</h4>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => { onSoundToggle(); soundService.click(!soundEnabled); }}
                                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${
                                            soundEnabled
                                                ? 'bg-amber-900/30 border-amber-600/30 text-amber-100' 
                                                : 'bg-black/20 border-white/10 text-white/30'
                                            }`}
                                        >
                                            {soundEnabled ? "SFX Enabled" : "SFX Muted"}
                                        </button>
                                        
                                        <button 
                                            onClick={() => { setTypewriterMode(!typewriterMode); soundService.click(soundEnabled); }}
                                            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${
                                            typewriterMode
                                                ? 'bg-amber-900/30 border-amber-600/30 text-amber-100' 
                                                : 'bg-black/20 border-white/10 text-white/30'
                                            }`}
                                        >
                                            {typewriterMode ? "Typewriter ON" : "Typewriter OFF"}
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-amber-500/40 font-mono text-right -mt-4 italic">
                                    * Note: Typewriter sounds may cause slight input latency on some devices.
                                </p>

                                <AudioMixer 
                                    sfxVolumes={sfxVolumes} 
                                    setSfxVolumes={setSfxVolumes} 
                                    soundEnabled={soundEnabled} 
                                    typewriterMode={typewriterMode}
                                />
                            </div>
                        )}

                    </div>
                </AncientScrollbar>
            </div>
          </div>
        </div>
    );
};

const BOOK_COVERS = [
  { bg: 'linear-gradient(135deg, #3a2c2a 0%, #1a0f08 100%)', accent: '#d4af37', border: '#5c4033' }, // Classic Leather
  { bg: 'linear-gradient(135deg, #2a3b4a 0%, #0f172a 100%)', accent: '#c0c0c0', border: '#334155' }, // Midnight Blue
  { bg: 'linear-gradient(135deg, #2a4a3b 0%, #064e3b 100%)', accent: '#cd7f32', border: '#14532d' }, // Forest Green
  { bg: 'linear-gradient(135deg, #4a2a3b 0%, #3f1828 100%)', accent: '#e5e4e2', border: '#831843' }, // Royal Plum
  { bg: 'linear-gradient(135deg, #3b2a4a 0%, #2e1065 100%)', accent: '#ffd700', border: '#5b21b6' }, // Mystic Purple
  { bg: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', accent: '#daa520', border: '#991b1b' }, // Crimson
];

const Library = ({ books, onOpenBook, onCreateBook, onDeleteBook, onImportBook, textures, soundEnabled, userProfile }) => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle 800px at ${e.clientX}px ${e.clientY}px, rgba(255,255,255,0.15), transparent 80%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-screen w-full relative overflow-y-auto overflow-x-hidden bg-black selection:bg-amber-500/30 custom-scrollbar-library">
        <div className="min-h-screen w-full flex flex-col items-center justify-start pt-24 pb-32 px-12 relative text-amber-50">
          
          {/* Background with Spotlight Effect */}
          <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000" style={{ background: textures.wood }}></div>
          <div className="absolute inset-0 z-0 bg-black/60 pointer-events-none"></div>
          
          {/* The Observer (Easter Egg) */}
          <Observer />

          <div 
            ref={spotlightRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay"
          ></div>

          <div className="relative z-10 w-full max-w-7xl">
            <div className="text-center mb-16 relative">
                 <h1 className="text-6xl font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-700 drop-shadow-sm font-bold tracking-tight pb-2">
                  The Midnight Library
                </h1>
                {userProfile && (
                    <p className="text-amber-500/50 text-sm font-serif uppercase tracking-[0.3em] mt-4 animate-fade-in">
                        Welcome back, {userProfile.name}
                    </p>
                )}
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mt-6 opacity-60"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12 perspective-2000">
              {books.map((book, index) => {
                 const style = BOOK_COVERS[book.id % BOOK_COVERS.length];
                 return (
                    <div
                    key={book.id}
                    className="group relative cursor-pointer transform transition-all duration-500 hover:-translate-y-6 hover:rotate-y-12 z-10 hover:z-20"
                    onClick={() => onOpenBook(book.id)}
                    >
                    <div 
                        className="w-full aspect-[2/3] rounded-r-md rounded-l-sm shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-l-4 border-black/20"
                        style={{ 
                            background: style.bg,
                            boxShadow: `inset 2px 0 5px rgba(255,255,255,0.1), inset -2px 0 10px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.5)`
                        }}
                    >
                        {/* Spine Highlight */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/20 to-transparent"></div>
                        
                        {/* Gold Banding (Top & Bottom) */}
                        <div className="absolute top-8 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${style.accent}, transparent)` }}></div>
                        <div className="absolute bottom-8 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${style.accent}, transparent)` }}></div>

                        {/* Cover Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 py-12 text-center">
                        
                            {/* Title Area */}
                            <div className="w-full relative py-6 border-t border-b border-white/10 group-hover:border-white/30 transition-colors">
                                <h3 className="font-display text-xl text-amber-100/90 leading-tight drop-shadow-md line-clamp-3 group-hover:text-white transition-colors">
                                {book.title}
                                </h3>
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 border border-white/5 rotate-45"></div>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-serif tracking-[0.2em] uppercase text-amber-200">
                                    {new Date(book.lastModified).toLocaleDateString()}
                                </span>
                                 <span className="text-[9px] font-sans tracking-widest text-white/40">
                                    {book.wordGoal > 0 ? `${Math.round((serializeSlateToString(book.pages.flat()).split(/\s+/).length / book.wordGoal) * 100)}% Complete` : 'No Goal'}
                                </span>
                            </div>
                        </div>

                        {/* Texture Overlay */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-multiply pointer-events-none"></div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); soundService.click(soundEnabled); }}
                        className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-red-900/90 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 text-white shadow-lg border border-red-500/30 z-50 translate-y-2 group-hover:translate-y-0"
                    >
                        <TrashIcon size={14} />
                    </button>
                    </div>
                );
              })}

              {/* CREATE NEW BOOK CARD */}
              <div
                onClick={onCreateBook}
                className="w-full aspect-[2/3] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group hover:border-amber-500/30 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all text-white/20 border border-white/5 group-hover:border-amber-500/40 shadow-inner">
                  <PlusIcon size={32} />
                </div>
                <span className="font-serif text-lg text-white/30 group-hover:text-amber-100 transition-colors tracking-wide">New Journal</span>
              </div>

              {/* IMPORT BOOK CARD */}
              <div
                onClick={onImportBook}
                className="w-full aspect-[2/3] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group hover:border-blue-500/30 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all text-white/20 border border-white/5 group-hover:border-blue-500/40 shadow-inner">
                  <ImportIcon size={32} />
                </div>
                <span className="font-serif text-lg text-white/30 group-hover:text-blue-100 transition-colors tracking-wide">Import Book</span>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
};


const ClosedBookCover = ({ title, date, textures, wordCount, pageCount }) => {
    return (
      <div
        className="w-full h-full rounded-r-lg rounded-l-sm shadow-2xl relative overflow-hidden cursor-pointer"
        style={{ background: textures.leather, boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.6)' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/10 via-transparent to-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center ml-8">
          <div className="border-2 border-amber-600/30 p-8 w-full h-full flex flex-col items-center justify-center rounded-sm">
            <div className="mb-12 opacity-80">
              <span className="block w-8 h-8 mx-auto border-t-2 border-l-2 border-amber-500/40 transform rotate-45 mb-2"></span>
            </div>
            <h1 className="font-display text-5xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 mb-6 drop-shadow-md tracking-wide">
              {title}
            </h1>
            <div className="w-16 h-1 bg-amber-700/40 mb-6"></div>
            <p className="font-display text-amber-500/70 text-lg tracking-widest">
              {wordCount} Words / {pageCount} Pages
            </p>
          </div>
        </div>
      </div>
    );
};

const PageContent = ({
  content,
  pageNumber,
  onContentChange,
  tabs = [],
  onTabClick,
  isLeftPage,
  textures,
  typewriterMode,
  isInkFlow,
  isTypewriterScrolling,
  soundEnabled
}) => {
  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: textures.paperColor,
          backgroundImage: textures.paper,
          boxShadow: isLeftPage
            ? 'inset -15px 0 40px rgba(60, 40, 20, 0.15)'
            : 'inset 15px 0 40px rgba(60, 40, 20, 0.15)'
        }}
      ></div>
      <div className="h-12 w-full"></div>
      
      {/* Scrollable Content Area with Minimalist Scrollbar */}
      <div 
        className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden w-full custom-scrollbar-minimal px-10"
        style={{ direction: isLeftPage ? 'rtl' : 'ltr' }}
        id={`scroll-container-${pageNumber}`}
      >
         <div 
            style={{ direction: 'ltr' }}
            className={`transition-all duration-500 ${isTypewriterScrolling ? 'py-[45vh]' : 'pb-10'}`}
         >
            <RichTextEditor 
                value={content} 
                onChange={onContentChange} 
                typewriterMode={typewriterMode} 
                isInkFlow={isInkFlow} 
                isTypewriterScrolling={isTypewriterScrolling}
                soundEnabled={soundEnabled} 
                scrollContainerId={`scroll-container-${pageNumber}`}
            />
         </div>
      </div>

      <div className="h-12 w-full flex items-center justify-between px-8 pb-4 text-[#5c4a3d]/50 font-serif text-sm z-10">
        <span>{isLeftPage && pageNumber ? pageNumber : ''}</span>
        <span>{!isLeftPage && pageNumber ? pageNumber : ''}</span>
      </div>
      <div className={`absolute top-0 bottom-0 w-16 pointer-events-none z-20 mix-blend-multiply opacity-40
        ${isLeftPage
          ? 'right-0 bg-gradient-to-l from-black/80 via-black/10 to-transparent'
          : 'left-0 bg-gradient-to-r from-black/80 via-black/10 to-transparent'}`}
      ></div>
      {!isLeftPage && (
        <div className="absolute -top-3 right-8 flex flex-row gap-2 z-50 perspective-500">
          {tabs.slice(-3).map((tab) => (
            <div
              key={tab.id}
              onClick={(e) => { e.stopPropagation(); onTabClick(tab.pageIndex); }}
              className="group cursor-pointer relative transform transition-transform hover:-translate-y-1"
              title={tab.label}
            >
              <div
                className="w-6 h-10 rounded-t-sm shadow-[2px_-2px_5px_rgba(0,0,0,0.2)] flex items-center justify-center border-b border-black/5"
                style={{
                  backgroundColor: tab.color,
                  boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.3), 0 -2px 5px rgba(0,0,0,0.1)'
                }}
              >
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ORACLE_PROMPTS = [
    "A secret hidden in a recipe book.",
    "The shadow that moved when the light was off.",
    "A letter addressed to a house that no longer exists.",
    "The sound of a typewriter in an empty room.",
    "Someone finds a key that fits every door but their own.",
    "The rain isn't falling; it's rising.",
    "A ghost who is more afraid of you than you are of it.",
    "The clock strikes thirteen, and then the world changes.",
    "A map where the paths change every time you look.",
    "The last person on Earth hears a knock at the door.",
    "A mirror that reflects the room as it was fifty years ago.",
    "You find a photo of yourself in a box of antiques from 1920.",
    "The forest where no birds sing.",
    "A conversation with a stranger who knows your name but you've never met.",
    "The star that shouldn't be there.",
    "A journal entry dated for tomorrow.",
    "The wind carries a whisper meant only for you.",
    "A door that appears only at midnight.",
    "The candle that never burns down.",
    "A city built entirely of glass and secrets."
];

const OracleModal = ({ isOpen, onClose, soundEnabled }) => {
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [isFlipping, setIsFlipping] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            drawNewCard();
        }
    }, [isOpen]);

    const drawNewCard = () => {
        setIsFlipping(true);
        setHasRevealed(false);
        soundService.pageFlip(soundEnabled);
        
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * ORACLE_PROMPTS.length);
            setCurrentPrompt(ORACLE_PROMPTS[randomIndex]);
            setHasRevealed(true);
            setTimeout(() => setIsFlipping(false), 600);
        }, 600);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col items-center gap-12 w-full max-w-lg px-6">
                
                <div className="text-center space-y-2">
                    <h3 className="text-amber-100 font-display text-4xl tracking-widest uppercase">The Oracle</h3>
                    <p className="text-amber-500/50 text-xs font-serif tracking-[0.3em] uppercase">Seek inspiration from the void</p>
                </div>

                <div 
                    className={`relative w-64 aspect-[2/3] perspective-1000 cursor-pointer group transition-transform duration-500 ${isFlipping ? 'scale-95' : 'hover:scale-105'}`}
                    onClick={() => !isFlipping && drawNewCard()}
                >
                    <div className={`relative w-full h-full transition-transform duration-1000 transform-style-3d ${hasRevealed ? 'rotate-y-180' : ''}`}>
                        
                        {/* Back of Card (Hidden initially) */}
                        <div className="absolute inset-0 backface-hidden rounded-xl border-4 border-amber-900/40 bg-[#1a0f08] flex items-center justify-center overflow-hidden shadow-2xl">
                            <div className="absolute inset-4 border border-amber-900/20 rounded-lg flex items-center justify-center">
                                <SparklesIcon size={48} className="text-amber-900/30 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-20"></div>
                        </div>

                        {/* Front of Card (Revealed) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-4 border-amber-500/30 bg-[#fdf4e3] p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                            <div className="absolute inset-4 border-2 border-amber-500/10 rounded-lg pointer-events-none"></div>
                            <SparklesIcon size={24} className="text-amber-500/20 mb-6" />
                            <p className="text-[#2a1a10] font-serif text-xl italic leading-relaxed">
                                "{currentPrompt}"
                            </p>
                            <div className="mt-8 w-12 h-[1px] bg-amber-500/20"></div>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button 
                        onClick={() => !isFlipping && drawNewCard()}
                        className="text-amber-100/40 hover:text-amber-100 text-xs font-serif uppercase tracking-[0.2em] transition-colors"
                    >
                        {isFlipping ? "Drawing..." : "Draw Another Card"}
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-12 py-4 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-700/30 rounded-full text-amber-100 text-xs font-bold uppercase tracking-[0.3em] transition-all"
                    >
                        Return to Writing
                    </button>
                </div>

            </div>
        </div>
    );
};

const BookEngine = ({ book, updateBook, onClose, onExport, onAddNote, onUpdateNote, onDeleteNote, textures, soundEnabled, isZenMode, setIsZenMode, showOracle, setShowOracle, typewriterMode, isInkFlow, isTypewriterScrolling, ambianceTrack, isAmbiancePlaying }) => {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const [showTabModal, setShowTabModal] = useState(false);
  const [tabLabel, setTabLabel] = useState("");
  const [tabError, setTabError] = useState(false);
  const bookStageRef = useRef(null); 
  
  // Sprint Timer State
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0); // Total seconds
  const [timerRemaining, setTimerRemaining] = useState(0); // Seconds left
  const hasChimed = useRef(false);

  // Midnight Bell Easter Egg
  useEffect(() => {
      const checkTime = () => {
          const now = new Date();
          if (now.getHours() === 0 && now.getMinutes() === 0) {
              if (!hasChimed.current) {
                  // Use the new dedicated bell sound
                  const bell = new Audio('bell.mp3');
                  // Keep volume low as requested
                  bell.volume = Math.min(1, (soundEnabled ? 1 : 0) * 0.3);
                  bell.play().catch(e => console.warn(e));
                  hasChimed.current = true;
              }
          } else {
              hasChimed.current = false; // Reset for next midnight
          }
      };
      
      const interval = setInterval(checkTime, 10000); // Check every 10s
      checkTime(); // Check immediately
      
      return () => clearInterval(interval);
  }, [soundEnabled]);

  useEffect(() => {
      let interval = null;
      if (timerActive && timerRemaining > 0) {
          interval = setInterval(() => {
              setTimerRemaining(prev => {
                  if (prev <= 1) {
                      setTimerActive(false);
                      // Ideally play a 'burnout' sound here
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      } else if (timerRemaining === 0) {
          setTimerActive(false);
      }
      return () => clearInterval(interval);
  }, [timerActive, timerRemaining]);

  const startSprint = (minutes) => {
      const seconds = minutes * 60;
      setTimerDuration(seconds);
      setTimerRemaining(seconds);
      setTimerActive(true);
      setShowSprintModal(false);
  };

  const totalSpreads = Math.ceil(book.pages.length / 2) + 1;

  const getLeftPageContent = (spreadIndex) => {
    if (spreadIndex <= 0) return null;
    if (spreadIndex === 1) return null;
    const pageIndex = (spreadIndex - 1) * 2 - 1;
    return { content: book.pages[pageIndex] || initialPageValue, index: pageIndex };
  };

  const getRightPageContent = (spreadIndex) => {
    if (spreadIndex === 0) return null;
    const pageIndex = (spreadIndex - 1) * 2;
    return { content: book.pages[pageIndex] || initialPageValue, index: pageIndex };
  };

  /* --- FLIP LOGIC WITH "LOOK AHEAD" --- */
  let staticLeftIndex = currentSpreadIndex;
  let staticRightIndex = currentSpreadIndex;

  if (isFlipping) {
    if (flipDirection === 'next') {
      staticRightIndex = currentSpreadIndex + 1;
    } else {
      staticLeftIndex = currentSpreadIndex - 1;
    }
  }

  const staticLeftPage = getLeftPageContent(staticLeftIndex);
  const staticRightPage = getRightPageContent(staticRightIndex);

  const isOpening = flipDirection === 'next' && currentSpreadIndex === 0;
  const isClosing = flipDirection === 'prev' && currentSpreadIndex === 1;

  const leatherStyle = { background: textures.leather };
  const paperStyle = { backgroundImage: textures.paper, backgroundColor: textures.paperColor };

  let flipperFrontStyle = paperStyle;
  let flipperBackStyle = paperStyle;

  if (isOpening) {
    flipperFrontStyle = leatherStyle;
    flipperBackStyle = leatherStyle;
  } else if (isClosing) {
    flipperFrontStyle = leatherStyle;
    flipperBackStyle = leatherStyle;
  }

  const handleNext = () => {
    if (isFlipping) return;
    soundService.pageFlip(soundEnabled);

    if (currentSpreadIndex < totalSpreads - 1) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 900);
    } else {
      let newPages = [...book.pages, initialPageValue, initialPageValue];
      updateBook({ ...book, pages: newPages });
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 900);
    }
  };

  const handlePrev = () => {
    if (currentSpreadIndex > 0 && !isFlipping) {
      soundService.pageFlip(soundEnabled);
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev - 1);
        setIsFlipping(false);
      }, 900);
    }
  };

  const jumpToPage = (pageIndex) => {
    const spread = Math.floor(pageIndex / 2) + 1;
    setCurrentSpreadIndex(spread);
  };

  const updatePage = (index, newContent) => {
    const newPages = [...book.pages];
    newPages[index] = newContent;
    updateBook({ ...book, pages: newPages, lastModified: Date.now() });
  };

  const addTab = (label, color) => {
    if (!label.trim()) {
      setTabError(true);
      return;
    }
    const rightPage = getRightPageContent(currentSpreadIndex);
    if (!rightPage) return;
    const newTab = { id: Date.now(), label, color, pageIndex: rightPage.index };
    updateBook({ ...book, tabs: [...(book.tabs || []), newTab] });
    setShowTabModal(false);
    setTabLabel("");
    setTabError(false);
  };

  const wordCount = book.pages.reduce((acc, page) => {
    const pageText = serializeSlateToString(page);
    const words = pageText.trim().split(/\s+/).filter(w => w.length > 0);
    return acc + words.length;
  }, 0);
  
  const pageCount = book.pages.length;

  const goalProgress = book.wordGoal > 0 ? (wordCount / book.wordGoal) * 100 : 0;

  // Ink Stain Logic
  const [inkStains, setInkStains] = useState([]);
  const sessionStartWords = useRef(wordCount);

  useEffect(() => {
      const wordsWritten = wordCount - sessionStartWords.current;
      const stainsEarned = Math.floor(wordsWritten / 1000); 
      
      if (stainsEarned > inkStains.length) {
          // Add a new stain
          const newStain = {
              id: Date.now(),
              top: `${10 + Math.random() * 80}%`,
              left: `${Math.random() > 0.5 ? 2 : 98}%`, // Edges of the spread
              rotation: Math.random() * 360,
              opacity: 0.3 + Math.random() * 0.4,
              scale: 0.5 + Math.random() * 0.8
          };
          setInkStains(prev => [...prev, newStain]);
      }
  }, [wordCount, inkStains.length]);

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-start pt-24">
      
      {/* Easter Eggs */}
      <RainOverlay isActive={ambianceTrack.includes('rain') && isAmbiancePlaying} />
      <DustMotes isActive={!isZenMode} />

      {/* Background Elements - Fade out in Zen Mode */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isZenMode ? 'opacity-0' : 'opacity-100'}`} style={{ background: textures.wood }}></div>
      <div className={`absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] transition-opacity duration-1000 ${isZenMode ? 'opacity-0' : 'opacity-30'}`}></div>

      <div className={`absolute top-[-20%] left-[10%] w-[90vw] h-[90vw] bg-[radial-gradient(circle,rgba(255,200,120,0.12)_0%,rgba(0,0,0,0)_65%)] pointer-events-none blur-3xl z-10 transition-opacity duration-1000 ${isZenMode ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`absolute top-[-5%] left-[25%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,230,180,0.25)_0%,rgba(0,0,0,0)_70%)] pointer-events-none mix-blend-overlay filter blur-[80px] z-10 animate-pulse-slow transition-opacity duration-1000 ${isZenMode ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_30%,black_90%)] transition-opacity duration-1000 ${isZenMode ? 'opacity-40' : 'opacity-90'}`}></div>

      {/* Top Bar with Title Edit - Zen Mode Fades This Out */}
      <div 
        className={`absolute top-0 left-0 w-full h-24 z-50 flex items-center justify-between px-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-1000 ${isZenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-6 pointer-events-auto">
          <button onClick={onClose} className="text-amber-100/60 hover:text-amber-100 transition-colors flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeftIcon size={16} />
            </div>
            <span className="font-serif tracking-widest text-sm uppercase hidden sm:inline">Library</span>
          </button>
        </div>

        <div className="flex-1 mx-8">
            <div className="flex items-center gap-2 group justify-center">
                <input
                value={book.title}
                onChange={(e) => updateBook({ ...book, title: e.target.value })}
                className="bg-transparent border-b border-transparent hover:border-amber-500/30 focus:border-amber-500/50 outline-none font-display text-xl sm:text-2xl text-amber-100/90 placeholder-amber-500/30 w-auto transition-all text-center"
                />
                <EditIcon size={14} className="text-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {currentSpreadIndex > 0 && (
                <div className="flex items-center gap-4 text-amber-100/30 font-serif text-xs tracking-[0.2em] uppercase mt-2">
                    <span className="w-28 text-right">{wordCount} Words</span>
                    {book.wordGoal > 0 && (
                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden mx-4">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 progress-bar-animated"
                                style={{ width: `${Math.min(goalProgress, 100)}%`}}
                            ></div>
                        </div>
                    )}
                    {book.wordGoal > 0 && <span className="w-28 text-left">Goal: {book.wordGoal}</span>}
                </div>
            )}
        </div>

        {currentSpreadIndex > 0 && (
          <div className="pointer-events-auto flex items-center gap-3 mr-16">
            <button
                onClick={() => { setShowSprintModal(!showSprintModal); soundService.click(soundEnabled); }}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all border backdrop-blur-sm ${isZenMode ? 'opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto' : 'opacity-100'} ${timerActive ? 'bg-orange-900/40 border-orange-500/40 text-orange-200 animate-pulse' : 'bg-black/20 hover:bg-white/10 text-amber-100/60 hover:text-amber-100 border-white/5'}`}
                title="Sprint Timer"
            >
                <ClockIcon size={16} />
            </button>
            {timerActive && !isZenMode && (
                <span className="text-[10px] text-orange-400/60 uppercase tracking-widest font-serif animate-pulse mr-2">
                    Candle Lit (Zen Mode)
                </span>
            )}
            <SprintModal 
                isOpen={showSprintModal} 
                onClose={() => setShowSprintModal(false)} 
                onStart={startSprint} 
                onStop={() => { setTimerActive(false); setTimerRemaining(0); setShowSprintModal(false); }}
                isActive={timerActive}
                soundEnabled={soundEnabled} 
            />

            <button
              onClick={() => { setShowOracle(true); soundService.click(soundEnabled); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border backdrop-blur-sm ${isZenMode ? 'opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto' : 'opacity-100'} bg-purple-900/20 hover:bg-purple-800/40 text-purple-200 border-purple-500/20`}
              title="The Midnight Oracle"
            >
              <SparklesIcon size={14} /> <span className="text-xs font-serif uppercase tracking-widest hidden sm:inline">Oracle</span>
            </button>
            <button
              onClick={() => { setIsZenMode(!isZenMode); soundService.click(soundEnabled); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors border backdrop-blur-sm ${isZenMode ? 'bg-amber-100 text-black border-amber-100' : 'bg-transparent text-amber-100/60 border-amber-500/20 hover:bg-white/5 hover:text-amber-100'}`}
              title="Toggle Zen Mode"
            >
              <EyeIcon size={14} /> <span className="text-xs font-serif uppercase tracking-widest hidden sm:inline">{isZenMode ? 'Exit Zen' : 'Zen Mode'}</span>
            </button>
            <button
              onClick={() => { onAddNote(staticRightPage.index); soundService.click(soundEnabled); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-100 transition-colors border border-yellow-500/30 backdrop-blur-sm"
            >
              <StickyNoteIcon size={14} /> <span className="text-xs font-serif uppercase tracking-widest hidden sm:inline">Add Note</span>
            </button>
            <button onClick={() => { setShowTabModal(true); soundService.click(soundEnabled); }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a0f08]/80 hover:bg-[#2a1a10] text-amber-100/80 transition-colors border border-amber-500/20 backdrop-blur-sm">
                <MoreIcon size={14} /> <span className="text-xs font-serif uppercase tracking-widest hidden sm:inline">Tab</span>
            </button>
            <button onClick={() => { onExport(); soundService.click(soundEnabled); }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/40 hover:bg-amber-800/60 text-amber-100 transition-colors border border-amber-500/30 backdrop-blur-sm">
              <SaveIcon size={14} /> <span className="text-xs font-serif uppercase tracking-widest hidden sm:inline">Export</span>
            </button>
          </div>
        )}
      </div>

      {/* --- 3D BOOK STAGE --- */}
      <div className={`book-stage transition-all duration-1000 ${isZenMode ? 'scale-110' : 'scale-100'}`}>
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out
           ${currentSpreadIndex === 0 ? '-translate-x-[25%]' : 'translate-x-0'}`}
          ref={bookStageRef} // Assign ref here
        >

          <div className="absolute inset-x-8 top-8 bottom-[-20px] bg-black/60 blur-2xl rounded-[50%] translate-z-[-50px]"></div>

          {/* LEFT STACK (Static) */}
          {currentSpreadIndex > 0 && (
            <div className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-l-lg origin-right transition-opacity duration-300 z-50`}>
                <div className="absolute inset-0 inside-cover-left" style={{ background: textures.leather }}></div>
                {staticLeftIndex > 1 && staticLeftPage && (
                <PageContent
                    key={staticLeftPage.index}
                    content={staticLeftPage.content}
                    pageNumber={staticLeftPage.index + 1}
                    isLeftPage={true}
                    onContentChange={(newContent) => updatePage(staticLeftPage.index, newContent)}
                    textures={textures}
                    typewriterMode={typewriterMode}
                    isInkFlow={isInkFlow}
                    isTypewriterScrolling={isTypewriterScrolling}
                    soundEnabled={soundEnabled}
                />
                )}
            </div>
          )}

          {/* RIGHT STACK (Static) */}
          <div className="absolute top-0 bottom-0 right-0 w-1/2 rounded-r-lg origin-left z-50"
            style={{
              background: staticRightIndex === 0 ? 'transparent' : textures.paperColor,
              backgroundImage: staticRightIndex === 0 ? 'none' : textures.paper,
              boxShadow: staticRightIndex === 0 ? 'none' : 'inset 5px 0 20px rgba(0,0,0,0.2), 5px 5px 15px rgba(0,0,0,0.3)'
            }}>
                        {staticRightIndex === 0 && (
                          <ClosedBookCover title={book.title} date={book.lastModified} textures={textures} wordCount={wordCount} pageCount={pageCount} />
                        )}
                        {staticRightIndex > 0 && staticRightPage && (
                          <PageContent
                            key={staticRightPage.index}
                            content={staticRightPage.content}
                            pageNumber={staticRightPage.index + 1}
                            onContentChange={(newContent) => updatePage(staticRightPage.index, newContent)}
                            tabs={book.tabs}
                            onTabClick={jumpToPage}
                            isLeftPage={false}
                            textures={textures}
                            typewriterMode={typewriterMode}
                            isInkFlow={isInkFlow}
                            isTypewriterScrolling={isTypewriterScrolling}
                            soundEnabled={soundEnabled}
                          />
                        )}
                      </div>
            
                      {/* Ink Stains Overlay */}
                      <div className="absolute inset-0 pointer-events-none z-[55] overflow-hidden rounded-lg">
                          {inkStains.map(stain => (
                              <div 
                                key={stain.id}
                                className="absolute w-12 h-12 bg-black rounded-full filter blur-md mix-blend-multiply transition-opacity duration-1000"
                                style={{
                                    top: stain.top,
                                    left: stain.left,
                                    opacity: stain.opacity,
                                    transform: `translate(-50%, -50%) rotate(${stain.rotation}deg) scale(${stain.scale})`,
                                    background: 'radial-gradient(circle, rgba(40,40,50,0.8) 0%, rgba(40,40,50,0) 70%)'
                                }}
                              ></div>
                          ))}
                      </div>
            
                      {/* Sticky Notes Rendered at BookEngine level */}
          <div className="absolute inset-0 pointer-events-none z-[60]">
            {book.notes
              .filter(note => staticLeftPage && note.pageIndex === staticLeftPage.index)
              .map(note => (
                <StickyNote
                  key={note.id}
                  note={note}
                  isRightPage={false}
                  onUpdate={onUpdateNote}
                  onDelete={onDeleteNote}
                  bookStageRef={bookStageRef}
                  soundEnabled={soundEnabled}
                />
              ))}
            {book.notes
              .filter(note => staticRightPage && note.pageIndex === staticRightPage.index)
              .map(note => (
                <StickyNote
                  key={note.id}
                  note={note}
                  isRightPage={true}
                  onUpdate={onUpdateNote}
                  onDelete={onDeleteNote}
                  bookStageRef={bookStageRef}
                  soundEnabled={soundEnabled}
                />
              ))}
          </div>


          {/* SPINE - MOVED INSIDE THE TRANSFORM CONTAINER */}
          <div className={`absolute left-1/2 top-0 bottom-0 w-12 -ml-6 z-60 rounded-sm transition-opacity duration-500
            ${currentSpreadIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
            style={{
              background: 'linear-gradient(to right, #1a0f08, #2a1a10 40%, #2a1a10 60%, #1a0f08)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5)'
            }}>
          </div>

          {/* ANIMATED PAGE FLIPPER */}
          {isFlipping && (
            <div
              className={`absolute top-0 bottom-0 w-1/2 z-70 transform-style-3d
                ${flipDirection === 'next'
                  ? 'right-0 origin-left animate-flip-right-to-left'
                  : 'left-0 origin-right animate-flip-left-to-right'
                }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 backface-hidden overflow-hidden rounded-r-sm"
                style={flipperFrontStyle}>
                {flipDirection === 'next' ? (
                  currentSpreadIndex === 0 ? (
                    <ClosedBookCover title={book.title} date={book.lastModified} textures={textures} wordCount={wordCount} pageCount={pageCount} />
                  ) : (
                      (() => {
                        const content = getRightPageContent(currentSpreadIndex);
                        return content && (
                          <PageContent
                            key={content.index}
                            content={content?.content || initialPageValue}
                            pageNumber={content.index + 1}
                            tabs={book.tabs}
                            isLeftPage={false}
                            textures={textures}
                            typewriterMode={typewriterMode}
                            isInkFlow={isInkFlow}
                            isTypewriterScrolling={isTypewriterScrolling}
                            soundEnabled={soundEnabled}
                          />
                        );
                      })()
                    )
                ) : (
                    (() => {
                      const content = getLeftPageContent(currentSpreadIndex);
                      return content && (
                        <PageContent
                          key={content.index}
                          content={content?.content || initialPageValue}
                          pageNumber={content.index + 1}
                          isLeftPage={true}
                          textures={textures}
                          typewriterMode={typewriterMode}
                          isInkFlow={isInkFlow}
                          isTypewriterScrolling={isTypewriterScrolling}
                          soundEnabled={soundEnabled}
                        />
                      );
                    })()
                  )}
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 overflow-hidden rounded-l-sm"
                style={flipperBackStyle}>
                {flipDirection === 'next' ? (
                  (() => {
                    const content = getLeftPageContent(currentSpreadIndex + 1);
                    return content && (
                      <PageContent
                        key={content.index}
                        content={content?.content || initialPageValue}
                        pageNumber={content.index + 1}
                        isLeftPage={true}
                        textures={textures}
                        typewriterMode={typewriterMode}
                        isInkFlow={isInkFlow}
                        isTypewriterScrolling={isTypewriterScrolling}
                        soundEnabled={soundEnabled}
                      />
                    );
                  })()
                ) : (
                    (() => {
                      const content = getRightPageContent(currentSpreadIndex - 1);
                      return content && (
                        <PageContent
                          key={content.index}
                          content={content?.content || initialPageValue}
                          pageNumber={content.index + 1}
                          tabs={book.tabs}
                          isLeftPage={false}
                          textures={textures}
                          typewriterMode={typewriterMode}
                          isInkFlow={isInkFlow}
                          isTypewriterScrolling={isTypewriterScrolling}
                          soundEnabled={soundEnabled}
                        />
                      );
                    })()
                  )}
              </div>
            </div>
          )}

          {/* Navigation Click Zones */}
          <div className="absolute inset-y-0 -left-12 w-20 z-40 hover:bg-white/5 transition-colors cursor-w-resize opacity-0 hover:opacity-100 flex items-center justify-start pl-4" onClick={handlePrev}>
            <div className="bg-black/50 p-2 rounded-full text-white/50"><ArrowLeftIcon size={24} /></div>
          </div>
          <div className="absolute inset-y-0 -right-12 w-20 z-40 hover:bg-white/5 transition-colors cursor-e-resize opacity-0 hover:opacity-100 flex items-center justify-end pr-4" onClick={() => handleNext()}>
            <div className="bg-black/50 p-2 rounded-full text-white/50 rotate-180"><ArrowLeftIcon size={24} /></div>
          </div>

        </div>
      </div>
      
      {showTabModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1a1008] p-8 rounded-xl border border-amber-900/40 shadow-2xl w-96 relative">
            <button onClick={() => { setShowTabModal(false); setTabError(false); setTabLabel(""); }} className="absolute top-4 right-4 text-amber-100/30 hover:text-white">
              <CloseIcon size={18} />
            </button>
            <h3 className="text-amber-100 font-display text-2xl mb-2 text-center">New Bookmark</h3>
            <p className="text-amber-500/50 text-center text-xs mb-6 uppercase tracking-widest font-serif">Mark this page for later</p>

            <input
              id="tabLabel"
              placeholder="Chapter Title..."
              className={`w-full bg-black/30 border rounded-lg px-4 py-3 text-amber-50 mb-2 focus:outline-none font-serif text-lg placeholder-amber-900/50 transition-all ${tabError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-amber-900/30 focus:border-amber-600'}`}
              value={tabLabel}
              onChange={(e) => { setTabLabel(e.target.value); if (tabError) setTabError(false); }}
              autoFocus
            />
            {tabError && <p className="text-red-500/80 text-[10px] uppercase tracking-widest font-serif mb-4 animate-pulse">A name is required for the record</p>}
            {!tabError && <div className="h-4 mb-4"></div>}

            <div className="flex justify-center gap-3 mb-8">
              {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'].map(color => (
                <button
                  key={color}
                  onClick={() => addTab(tabLabel, color)}
                  className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-transparent hover:border-white/50 focus:scale-110"
                  style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
                ></button>
              ))}
            </div>

            <button
              onClick={() => addTab(tabLabel, '#eab308')}
              className="w-full py-3 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/30 rounded-lg text-amber-100 text-sm font-serif tracking-widest uppercase transition-colors"
            >
              Create Tab
            </button>
          </div>
        </div>
      )}

      <Candle 
        progress={timerDuration > 0 ? timerRemaining / timerDuration : 0} 
        isActive={timerActive} 
        isZenMode={isZenMode} 
        className="fixed bottom-8 right-16"
      />
    </div>
  );
};

// 7. MAIN APP CONTAINER
const App = () => {
  const [view, setView] = useState('library');
  const [books, setBooks] = useState(null); // Null initial state until loaded from disk
  const [activeBookId, setActiveBookId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showOracle, setShowOracle] = useState(false);
  const [font, setFont] = useState(localStorage.getItem('midnight-writer-font') || FONT_OPTIONS[0].family);
  const [theme, setTheme] = useState(localStorage.getItem('midnight-writer-theme') || 'Midnight');
  const [soundEnabled, setSoundEnabled] = useState(JSON.parse(localStorage.getItem('midnight-writer-sound')) || false);
  const [saveStatus, setSaveStatus] = useState('');
  const [dailyStats, setDailyStats] = useState(() => JSON.parse(localStorage.getItem('midnight-writer-daily-stats') || '{}'));
  const [userProfile, setUserProfile] = useState(() => JSON.parse(localStorage.getItem('midnight-writer-user-profile') || 'null'));
  const [showOnboarding, setShowOnboarding] = useState(!userProfile);
  const [loadingMessage, setLoadingMessage] = useState("Illuminating your collection of journals...");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Ambiance State
  const [ambianceTrack, setAmbianceTrack] = useState(localStorage.getItem('midnight-writer-ambiance-track') || AMBIANCE_TRACKS[0].file);
  const [ambianceVolume, setAmbianceVolume] = useState(parseFloat(localStorage.getItem('midnight-writer-ambiance-volume')) || 0.5);
  const [isAmbiancePlaying, setIsAmbiancePlaying] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(JSON.parse(localStorage.getItem('midnight-writer-typewriter')) || false);
  const [isInkFlow, setIsInkFlow] = useState(JSON.parse(localStorage.getItem('midnight-writer-inkflow')) || false);
  const [isTypewriterScrolling, setIsTypewriterScrolling] = useState(JSON.parse(localStorage.getItem('midnight-writer-typewriter-scrolling')) || false);
  const [sleepTimer, setSleepTimer] = useState(0); // Minutes
  const [autoPause, setAutoPause] = useState(JSON.parse(localStorage.getItem('midnight-writer-autopause')) || false);
  
  // Audio Mixer State
  const [sfxVolumes, setSfxVolumes] = useState(JSON.parse(localStorage.getItem('midnight-writer-sfx-volumes')) || { type: 0.8, page: 1.0, click: 0.5 });

  const ambianceAudioRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const lastTotalWords = useRef(0);
  const isInitialLoad = useRef(true);

  // Preload audio on mount
  useEffect(() => {
      soundService.preload();
  }, []);

  const resetAudioEngine = () => {
        if (ambianceAudioRef.current) {
            ambianceAudioRef.current.pause();
            ambianceAudioRef.current.src = "";
            ambianceAudioRef.current.load();
        }
        ambianceAudioRef.current = new Audio(ambianceTrack);
        setIsAmbiancePlaying(false);
  };

  // Sync SFX Volumes
  useEffect(() => {
      soundService.updateVolumes(sfxVolumes);
      localStorage.setItem('midnight-writer-sfx-volumes', JSON.stringify(sfxVolumes));
  }, [sfxVolumes]);

  // Initialize Audio once
  if (!ambianceAudioRef.current) {
      ambianceAudioRef.current = new Audio(ambianceTrack);
  }

  // Lifecycle Cleanup (Prevents duplicates on HMR/Reload)
  useEffect(() => {
      return () => {
          if (ambianceAudioRef.current) {
              ambianceAudioRef.current.pause();
              ambianceAudioRef.current.src = "";
          }
      };
  }, []);

  // Ambiance Effect
  useEffect(() => {
    const audio = ambianceAudioRef.current;
    if (!audio) return;
    
    // Handle Track Change
    // We check if the current src (resolved absolute path) matches the desired track
    // Note: audio.src returns empty string if not set, or full URL
    const targetSrc = new URL(ambianceTrack, window.location.origin).href;
    if (audio.src !== targetSrc) {
        audio.src = ambianceTrack;
        audio.load();
        if (isAmbiancePlaying) audio.play().catch(e => console.warn("Audio play failed", e));
    }

    // Handle Volume
    audio.volume = ambianceVolume;
    audio.loop = true;

    // Handle Play/Pause
    if (isAmbiancePlaying && audio.paused) {
        audio.play().catch(e => console.warn("Audio play failed", e));
    } else if (!isAmbiancePlaying && !audio.paused) {
        audio.pause();
    }
    
    // Persist Settings
    localStorage.setItem('midnight-writer-ambiance-track', ambianceTrack);
    localStorage.setItem('midnight-writer-ambiance-volume', ambianceVolume);
    localStorage.setItem('midnight-writer-typewriter', JSON.stringify(typewriterMode));
    localStorage.setItem('midnight-writer-autopause', JSON.stringify(autoPause));

  }, [ambianceTrack, ambianceVolume, isAmbiancePlaying, typewriterMode, autoPause]);

  // Sleep Timer Effect
  useEffect(() => {
      if (sleepTimer > 0) {
          sleepTimerRef.current = setTimeout(() => {
              setIsAmbiancePlaying(false);
              setSleepTimer(0);
              soundService.click(soundEnabled); // Optional: audible cue
          }, sleepTimer * 60000);
      }
      return () => clearTimeout(sleepTimerRef.current);
  }, [sleepTimer]);

  // Auto-Pause Effect
  useEffect(() => {
      const handleBlur = () => {
          if (autoPause && isAmbiancePlaying && ambianceAudioRef.current) {
              ambianceAudioRef.current.pause();
          }
      };
      const handleFocus = () => {
          if (autoPause && isAmbiancePlaying && ambianceAudioRef.current) {
              ambianceAudioRef.current.play().catch(e => console.warn(e));
          }
      };
      
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      return () => {
          window.removeEventListener('blur', handleBlur);
          window.removeEventListener('focus', handleFocus);
      };
  }, [autoPause, isAmbiancePlaying]);


  const handleOnboardingComplete = (data) => {
      // Start "Account Creation" phase
      setIsCreatingAccount(true);
      setShowOnboarding(false); // Hide the modal immediately
      setLoadingMessage("Preparing your personal library...");
      soundService.click(soundEnabled);

      // Fake a creation delay for effect
      setTimeout(() => {
          localStorage.setItem('midnight-writer-user-profile', JSON.stringify(data));
          setUserProfile(data);
          setIsCreatingAccount(false);
      }, 2500);
  };

  // Global Keydown Listener for Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
        // Alt + Z: Zen Mode (Only if in a book)
        if (e.altKey && e.key.toLowerCase() === 'z' && view === 'book') {
            e.preventDefault();
            setIsZenMode(prev => !prev);
            soundService.click(soundEnabled);
        }
        // Alt + O: Oracle (Only if in a book)
        if (e.altKey && e.key.toLowerCase() === 'o' && view === 'book') {
            e.preventDefault();
            setShowOracle(prev => !prev);
            soundService.click(soundEnabled);
        }
        // Alt + L: Library
        if (e.altKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            setView('library');
            setIsZenMode(false);
            setShowOracle(false);
            soundService.bookOpen(soundEnabled);
        }
        // Alt + S: Settings
        if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            setIsSettingsOpen(prev => !prev);
            soundService.click(soundEnabled);
        }
        // Alt + H: Help
        if (e.altKey && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            setIsHelpOpen(prev => !prev);
            soundService.click(soundEnabled);
        }
        // Alt + I: Emergency Disable Ink Flow
        if (e.altKey && e.key.toLowerCase() === 'i' && isInkFlow) {
            e.preventDefault();
            setIsInkFlow(false);
            soundService.click(soundEnabled); // Maybe a specific 'unlock' sound later
        }
        // Alt + A: Analytics
        if (e.altKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            setIsAnalyticsOpen(prev => !prev);
            soundService.click(soundEnabled);
        }
        // Ctrl + S: Save
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            // Saving is automatic, but we can trigger the UI feedback
            setSaveStatus('Saving');
            window.electronAPI.saveData(books).then(() => {
                setTimeout(() => setSaveStatus(''), 1000);
            });
        }
        // ESC: Close Modals
        if (e.key === 'Escape') {
            if (showOracle) setShowOracle(false);
            else if (isSettingsOpen) setIsSettingsOpen(false);
            else if (isHelpOpen) setIsHelpOpen(false);
            else if (isAnalyticsOpen) setIsAnalyticsOpen(false);
            else if (isExportModalOpen) setIsExportModalOpen(false);
            else if (isDeleteModalOpen) setIsDeleteModalOpen(false);
            else if (isZenMode) setIsZenMode(false);
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [view, soundEnabled, books, showOracle, isSettingsOpen, isHelpOpen, isAnalyticsOpen, isExportModalOpen, isZenMode, isDeleteModalOpen]);

  // Load data from disk on startup
  useEffect(() => {
    const loadData = async () => {
      if (window.electronAPI) {
          try {
            const result = await window.electronAPI.loadData();
            let loadedBooks = [];
            if (result.success && result.data) {
                loadedBooks = result.data;
            }

            setBooks(loadedBooks);
            const total = loadedBooks.reduce((acc, book) => {
                return acc + serializeSlateToString(book.pages.flat()).split(/\s+/).filter(w => w.length > 0).length;
            }, 0);
            lastTotalWords.current = total;
          } catch (error) {
              console.error("Failed to load data:", error);
              setBooks([]);
          }
      } else {
          setBooks([]);
      }
    };
    loadData();
  }, []);

  // Auto-save to disk with debounce
  useEffect(() => {
      if (isInitialLoad.current || !books) return;
      
      const timeoutId = setTimeout(() => {
          if (window.electronAPI) {
              window.electronAPI.saveData(books);
          }
      }, 1000);

      return () => clearTimeout(timeoutId);
  }, [books]);

  // Track Word Count History
  useEffect(() => {
      if (!books) return;

      const currentTotal = books.reduce((acc, book) => {
          return acc + serializeSlateToString(book.pages.flat()).split(/\s+/).filter(w => w.length > 0).length;
      }, 0);

      const delta = currentTotal - lastTotalWords.current;
      
      if (delta > 0 && !isInitialLoad.current) {
          const today = new Date().toISOString().split('T')[0];
          setDailyStats(prev => {
              const newStats = { ...prev, [today]: (prev[today] || 0) + delta };
              localStorage.setItem('midnight-writer-daily-stats', JSON.stringify(newStats));
              return newStats;
          });
      }
      
      lastTotalWords.current = currentTotal;
      // Mark initial load as done after the first stat check
      if (isInitialLoad.current) {
          isInitialLoad.current = false;
      }
  }, [books]);

  // Calculate Streak
  const getStreak = () => {
      const today = new Date();
      let streak = 0;
      let checkDate = new Date(today); // Clone the date object
      let safety = 0;
      
      while (safety < 3650) { // Safety break after ~10 years
          safety++;
          const dateStr = checkDate.toISOString().split('T')[0];
          if (dailyStats[dateStr] && dailyStats[dateStr] > 0) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
          } else {
              // Allow skipping today if 0, but if yesterday is 0, streak ends
              if (dateStr === today.toISOString().split('T')[0] && streak === 0) {
                  checkDate.setDate(checkDate.getDate() - 1);
                  continue;
              }
              break;
          }
      }
      return streak;
  };

  // Save data to disk with a debounce
  useEffect(() => {
    if (isInitialLoad.current) {
        if (books) {
            isInitialLoad.current = false;
        }
        return;
    }
    
    const handler = setTimeout(() => {
        if (books) {
            setSaveStatus('Saving');
            window.electronAPI.saveData(books).then(() => {
                setTimeout(() => {
                    setSaveStatus('');
                }, 2000);
            });
        }
    }, 1500); // Debounce save

    return () => clearTimeout(handler);
  }, [books]);


  useEffect(() => {
      localStorage.setItem('midnight-writer-font', font);
  }, [font]);

  useEffect(() => {
      localStorage.setItem('midnight-writer-theme', theme);
  }, [theme]);
  
  useEffect(() => {
      localStorage.setItem('midnight-writer-sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
      localStorage.setItem('midnight-writer-inkflow', JSON.stringify(isInkFlow));
  }, [isInkFlow]);

  useEffect(() => {
      localStorage.setItem('midnight-writer-typewriter-scrolling', JSON.stringify(isTypewriterScrolling));
  }, [isTypewriterScrolling]);

  // Zen Mode & Fullscreen Synchronization
  useEffect(() => {
    const handleStateCheck = () => {
      // Use requestAnimationFrame to ensure we check dimensions AFTER the browser has updated the window state
      requestAnimationFrame(() => {
        const isApiFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        // Check if window dimensions match screen dimensions (allowing small tolerance for borders)
        const isWindowFullscreen = 
            Math.abs(window.outerWidth - screen.width) < 10 && 
            Math.abs(window.outerHeight - screen.height) < 10;

        // If neither API fullscreen is active nor is the window physically fullscreen, turn off Zen Mode
        if (!isApiFullscreen && !isWindowFullscreen) {
          setIsZenMode(false);
        }
      });
    };

    document.addEventListener('fullscreenchange', handleStateCheck);
    document.addEventListener('webkitfullscreenchange', handleStateCheck);
    window.addEventListener('resize', handleStateCheck); 
    
    const handleKeyDown = (e) => {
        // F11 triggers native fullscreen toggle; wait slightly for it to complete then check
        if (e.key === 'F11') {
            setTimeout(handleStateCheck, 200);
        }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleStateCheck);
      document.removeEventListener('webkitfullscreenchange', handleStateCheck);
      window.removeEventListener('resize', handleStateCheck);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isZenMode) {
      // Check if we are already in some form of fullscreen (API or Physical/F11)
      const isApiFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const isWindowFullscreen = Math.abs(window.outerWidth - screen.width) < 10 && Math.abs(window.outerHeight - screen.height) < 10;

      // Only request API fullscreen if we are NOT in any kind of fullscreen
      if (!isApiFullscreen && !isWindowFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
           console.error(`Error attempting to enable full-screen mode: ${err.message}`);
           // If request failed, double check if we might have resized into fullscreen during the attempt
           const isNowWindowFullscreen = Math.abs(window.outerWidth - screen.width) < 10 && Math.abs(window.outerHeight - screen.height) < 10;
           if (!isNowWindowFullscreen) {
               setIsZenMode(false);
           }
        });
      }
    } else {
      // If turning off Zen Mode, exit API fullscreen
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
      }
    }
  }, [isZenMode]);

  const activeTextures = THEME_DATA[theme];

  const handleOpenBook = (id) => {
    soundService.bookOpen(soundEnabled);
    setActiveBookId(id);
    setView('book');
  };

  const handleCreateBook = () => {
    soundService.click(soundEnabled);
    const newBook = {
      id: Date.now(),
      title: "Untitled Journal",
      lastModified: Date.now(),
      pages: [initialPageValue, initialPageValue],
      tabs: [],
      notes: [],
      wordGoal: 0,
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    setActiveBookId(newBook.id);
    setView('book');
    if (window.electronAPI) {
        window.electronAPI.saveData(updatedBooks);
    }
  };
  
  const updateBook = (updatedBook) => {
    setBooks(books.map(x => x.id === updatedBook.id ? updatedBook : x));
  };

  const handleAddNote = (pageIndex) => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook || pageIndex === -1) return;

    const newNote = {
      id: Date.now(),
      pageIndex: pageIndex,
      content: "A new thought...",
      position: { x: 60, y: 60 },
      isMinimized: false,
    };
    
    updateBook({ ...currentBook, notes: [...(currentBook.notes || []), newNote] });
  };
  
  const handleUpdateNote = (noteId, updatedNote) => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;
    updateBook({ ...currentBook, notes: currentBook.notes.map(n => n.id === noteId ? updatedNote : n) });
  };
  
  const handleDeleteNote = (noteId) => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;
    updateBook({ ...currentBook, notes: currentBook.notes.filter(n => n.id !== noteId) });
  };

  const handleExportMd = async () => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;
    const pageContent = currentBook.pages.map(page => serializeSlateToMarkdown(page)).join('\n\n---\n\n');
    const markdownContent = [
      `# ${currentBook.title}`,
      `<!-- lastModified: ${currentBook.lastModified} -->`,
      `<!-- wordGoal: ${currentBook.wordGoal || 0} -->`,
      pageContent
    ].join('\n\n');
    await window.electronAPI.saveFile(markdownContent);
    setIsExportModalOpen(false);
  };

  const handleExportTxt = async () => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;
    const pageContent = currentBook.pages.map(page => serializeSlateToString(page)).join('\n\n');
    const txtContent = `# ${currentBook.title}\n\n${pageContent}`;
    await window.electronAPI.saveTxtFile(txtContent);
    setIsExportModalOpen(false);
  };
  
  const handleExportDocx = async () => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;

    const data = {
      title: currentBook.title,
      pages: currentBook.pages
    };
    
    await window.electronAPI.saveDocxFile(data);
    setIsExportModalOpen(false);
  };

  const handleExportPDF = async () => {
    const currentBook = books.find(b => b.id === activeBookId);
    if (!currentBook) return;

    const currentTheme = THEME_DATA[theme];
    
    const renderNodeToHtml = (node) => {
        if (node.type === 'paragraph') {
            const children = node.children.map(n => {
                let text = n.text;
                text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                if (n.bold) {
                    text = `<strong>${text}</strong>`;
                }
                if (n.italic) {
                    text = `<em>${text}</em>`;
                }
                if (n.highlight) {
                    return `<span style="background-color: ${n.highlight}">${text}</span>`;
                }
                return text;
            }).join('');
            return `<p>${children || '<br/>'}</p>`;
        }
        return '';
    };

    const pagesHtml = currentBook.pages.map(page => 
        `<div class="page">${page.map(renderNodeToHtml).join('')}</div>`
    ).join('');

    // Reusing the FONTS string but removing the surrounding ` ` quotes if needed or just pasting the URL directly to be safe
    const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Inconsolata:wght@400;700&family=Roboto+Slab:wght@400;700&family=Dancing+Script:wght@400;700&family=Indie+Flower&family=Patrick+Hand&family=Shadows+Into+Light&family=Satisfy&family=Courgette&family=Permanent+Marker&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Raleway:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');`;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${fontImport}
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .page {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            background-color: ${currentTheme.paperColor};
            background-image: ${currentTheme.paper}; 
            background-size: cover;
            font-family: ${font}, serif;
            font-size: 14pt;
            line-height: 1.6;
            color: #2a1a10;
            page-break-after: always;
            position: relative;
            overflow: hidden;
          }
          .cover {
             display: flex;
             flex-direction: column;
             justify-content: center;
             align-items: center;
             text-align: center;
             background: ${currentTheme.leather}; 
             color: #eecfa1;
             text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }
          h1 { font-family: 'Playfair Display', serif; font-size: 3em; margin-bottom: 0.5em; }
        </style>
      </head>
      <body>
        <div class="page cover">
            <h1>${currentBook.title}</h1>
            <p style="opacity: 0.8; font-size: 1em; letter-spacing: 0.2em; text-transform: uppercase;">
                ${new Date(currentBook.lastModified).toLocaleDateString()}
            </p>
        </div>
        ${pagesHtml}
      </body>
      </html>
    `;

    await window.electronAPI.savePDF({ html: fullHtml, title: currentBook.title });
    setIsExportModalOpen(false);
  };


  const handleImportBook = async () => {
    soundService.click(soundEnabled);
    const result = await window.electronAPI.openFile();
    if (result.success) {
      try {
        const { content } = result;
        const lines = content.split('\n');

        const titleLine = lines.find(line => line.startsWith('# '));
        const title = titleLine ? titleLine.substring(2).trim() : 'Untitled';
        
        const metaLine = lines.find(line => line.startsWith('<!-- lastModified:'));
        const lastModified = metaLine ? parseInt(metaLine.match(/(\d+)/)[0]) : Date.now();
        
        const goalLine = lines.find(line => line.startsWith('<!-- wordGoal:'));
        const wordGoal = goalLine ? parseInt(goalLine.match(/(\d+)/)[0]) : 0;
        
        const contentStartIndex = content.lastIndexOf('-->') + 3;
        const mainContent = content.substring(contentStartIndex).trim();
        const pagesText = mainContent.split('\n\n---\n\n');

        const newBook = {
          id: Date.now(),
          title,
          lastModified,
          pages: pagesText.map(p => deserializeMarkdownToSlate(p)),
          tabs: [],
          notes: [],
          wordGoal,
        };

        const updatedBooks = [...books, newBook];
        setBooks(updatedBooks);
        if (window.electronAPI) {
            window.electronAPI.saveData(updatedBooks);
        }

      } catch (e) {
        console.error("Failed to parse imported book file.", e);
      }
    } else if (result.error) {
      console.error(`Failed to import book: ${result.error}`);
    }
  };


  const activeBook = books ? books.find(b => b.id === activeBookId) : null;

  return (
    <div className="font-sans bg-black min-h-screen text-slate-900 overflow-hidden selection:bg-amber-900/30">
      <style>{`
        ${FONTS}
        .font-handwriting { font-family: ${font}; }
        .font-serif { font-family: 'Crimson Text', serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        .progress-bar-animated {
            background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
            background-size: 1rem 1rem;
            animation: progress-animation 1s linear infinite;
        }
        
        .perspective-1000 { perspective: 1000px; }
        .perspective-2000 { perspective: 2000px; }
        .perspective-500 { perspective: 500px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.4);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.6);
        }

        /* Minimalist Thematic Scrollbar for Book Pages */
        .custom-scrollbar-minimal::-webkit-scrollbar {
            width: 10px;
        }
        .custom-scrollbar-minimal::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02); /* Very faint paper shadow */
            border-radius: 4px;
        }
        .custom-scrollbar-minimal::-webkit-scrollbar-thumb {
            background: #8d6e63; /* Sepia/Leather tone */
            background-image: linear-gradient(to bottom, #8d6e63 0%, #6d4c41 100%);
            border: 2px solid rgba(255, 255, 255, 0.2); /* Inset feel */
            border-radius: 10px;
            opacity: 0.5; /* Semi-transparent by default */
        }
        .custom-scrollbar-minimal::-webkit-scrollbar-thumb:hover {
            background: #5d4037; /* Darker leather on hover */
            background-image: linear-gradient(to bottom, #5d4037 0%, #4e342e 100%);
        }

        /* Thematic Library Scrollbar */
        .custom-scrollbar-library::-webkit-scrollbar {
            width: 10px !important;
        }
        .custom-scrollbar-library::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.4) !important;
            border-radius: 10px !important;
        }
        .custom-scrollbar-library::-webkit-scrollbar-thumb {
            background: #4e342e !important;
            background-image: linear-gradient(to bottom, #5d4037, #3e2723) !important;
            border-radius: 10px !important;
            border: 2px solid rgba(0, 0, 0, 0.2) !important;
        }
        .custom-scrollbar-library::-webkit-scrollbar-thumb:hover {
            background: #6d4c41 !important;
        }

        .inside-cover-left {
            background: ${activeTextures.leather};
            box-shadow: inset -10px 0px 15px rgba(0,0,0,0.5);
        }
        .book-container {
            display: grid;
            place-items: center;
            width: 100vw;
            height: 100vh;
            padding: 1rem;
        }
        .book-stage {
            width: 90vw;
            max-width: 1200px;
            max-height: 80vh;
            aspect-ratio: 3 / 2;
        }


        /* Animation Keyframes */
        @keyframes flipRightToLeft {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes flipLeftToRight {
          0% { transform: rotateY(0deg); } 
          100% { transform: rotateY(180deg); }
        }
        @keyframes progress-animation {
            0% { background-position: 1rem 0; }
            100% { background-position: 0 0; }
        }
        
        .animate-flip-right-to-left { animation: flipRightToLeft 0.9s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards; }
        .animate-flip-left-to-right { animation: flipLeftToRight 0.9s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards; }
        
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Main Content Area - Only visible when books are loaded and not creating account */}
      {books && !isCreatingAccount && (
        <>
          {view === 'library' && (
            <div className="absolute top-6 right-6 z-[101] flex gap-4">
                <button 
                    onClick={() => { setIsAnalyticsOpen(true); soundService.click(soundEnabled); }} 
                    className="text-amber-100/60 hover:text-amber-100 transition-colors p-2 rounded-full hover:bg-white/10"
                    title="Analytics"
                >
                    <ChartBarIcon size={20} />
                </button>
                <button 
                    onClick={() => { setIsHelpOpen(true); soundService.click(soundEnabled); }} 
                    className="text-amber-100/60 hover:text-amber-100 transition-colors p-2 rounded-full hover:bg-white/10"
                    title="Help"
                >
                    <HelpIcon size={20} />
                </button>
                <button 
                    onClick={() => { setIsSettingsOpen(true); soundService.click(soundEnabled); }} 
                    className="text-amber-100/60 hover:text-amber-100 transition-colors p-2 rounded-full hover:bg-white/10"
                    title="Settings"
                >
                    <GearIcon size={20} />
                </button>
            </div>
          )}

          <div className={`absolute bottom-4 left-4 z-[101] text-xs transition-opacity duration-500 flex items-center gap-2 ${saveStatus === 'Saving' ? 'opacity-100' : 'opacity-0'}`}>
            <SaveStatusIcon status={saveStatus} />
            <p className="text-white/50 font-serif">Saving...</p>
          </div>
          
                    <ExportModal 
                      isOpen={isExportModalOpen} 
                      onClose={() => setIsExportModalOpen(false)} 
                      onExportMd={handleExportMd} 
                      onExportTxt={handleExportTxt}
                      onExportDocx={handleExportDocx}
                      onExportPDF={handleExportPDF}
                    />
                    <SettingsModal 
                      isOpen={isSettingsOpen} 
                      onClose={() => { setIsSettingsOpen(false); soundService.click(soundEnabled); }}
                      font={font} 
                      onFontChange={(f) => { setFont(f); localStorage.setItem('midnight-writer-font', f); }}
                      theme={theme}
                      onThemeChange={(t) => { setTheme(t); localStorage.setItem('midnight-writer-theme', t); }}
                      soundEnabled={soundEnabled}
                      onSoundToggle={() => setSoundEnabled(!soundEnabled)}
                      activeBook={books?.find(b => b.id === activeBookId)}
                      updateBook={updateBook}
                      ambianceTrack={ambianceTrack}
                      setAmbianceTrack={setAmbianceTrack}
                      ambianceVolume={ambianceVolume}
                      setAmbianceVolume={setAmbianceVolume}
                      isAmbiancePlaying={isAmbiancePlaying}
                      setIsAmbiancePlaying={setIsAmbiancePlaying}
                                  typewriterMode={typewriterMode}
                                  setTypewriterMode={setTypewriterMode}
                                  isInkFlow={isInkFlow}
                                  setIsInkFlow={setIsInkFlow}
                                  isTypewriterScrolling={isTypewriterScrolling}
                                  setIsTypewriterScrolling={setIsTypewriterScrolling}
                                  sleepTimer={sleepTimer}                      setSleepTimer={setSleepTimer}
                      autoPause={autoPause}
                      setAutoPause={setAutoPause}
                      ambianceAudioRef={ambianceAudioRef}
                      resetAudioEngine={resetAudioEngine}
                      sfxVolumes={sfxVolumes}
                      setSfxVolumes={setSfxVolumes}
                    />
          <HelpModal 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)}
            soundEnabled={soundEnabled}
          />

          <AnalyticsModal 
            isOpen={isAnalyticsOpen} 
            onClose={() => setIsAnalyticsOpen(false)}
            books={books}
            soundEnabled={soundEnabled}
            dailyStats={dailyStats}
            streak={getStreak()}
          />

          <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setBookToDelete(null); }}
            onConfirm={() => {
                if (bookToDelete) {
                    const updatedBooks = books.filter(b => b.id !== bookToDelete.id);
                    setBooks(updatedBooks);
                    if (window.electronAPI) {
                        window.electronAPI.saveData(updatedBooks);
                    }
                    setBookToDelete(null);
                    setIsDeleteModalOpen(false);
                    soundService.click(soundEnabled); // Or a specific 'burn' sound if available
                }
            }}
            bookTitle={bookToDelete?.title || 'this journal'}
          />

          {view === 'library' && (
            <Library
              books={books}
              onOpenBook={handleOpenBook}
              onCreateBook={handleCreateBook}
              onDeleteBook={(id) => { 
                  const book = books.find(b => b.id === id);
                  if (book) {
                    setBookToDelete(book);
                    setIsDeleteModalOpen(true);
                  }
              }}
              onImportBook={handleImportBook}
              textures={activeTextures}
              soundEnabled={soundEnabled}
              userProfile={userProfile}
            />
          )}

          {view === 'book' && activeBook && (
            <div className="book-container">
                <BookEngine
                    book={activeBook}
                    updateBook={updateBook}
                    onClose={() => { setView('library'); soundService.bookOpen(soundEnabled); setIsZenMode(false); setShowOracle(false); }}
                    onExport={() => setIsExportModalOpen(true)}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    textures={activeTextures}
                    soundEnabled={soundEnabled}
                    isZenMode={isZenMode}
                    setIsZenMode={setIsZenMode}
                    showOracle={showOracle}
                    setShowOracle={setShowOracle}
                    typewriterMode={typewriterMode}
                    isInkFlow={isInkFlow}
                    isTypewriterScrolling={isTypewriterScrolling}
                    ambianceTrack={ambianceTrack}
                    isAmbiancePlaying={isAmbiancePlaying}
                />
            </div>
          )}

                          <OracleModal 
                            isOpen={showOracle} 
                            onClose={() => setShowOracle(false)} 
                            soundEnabled={soundEnabled} 
                          />
                        </>
                      )}
                
                      {(!books || isCreatingAccount) && (                  <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-black animate-fade-in">
                      <SparklesIcon size={32} className="text-amber-500/50 mb-6 animate-pulse" />
                      <p className="text-amber-100/60 font-serif text-lg tracking-widest uppercase animate-pulse">{loadingMessage}</p>
                  </div>
                )}

      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        soundEnabled={soundEnabled}
      />
              </div>
            );
          };
export default App;