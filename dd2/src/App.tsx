import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Map as MapIcon, 
  Coins, 
  Hammer, 
  Users, 
  CheckSquare, 
  BookOpen, 
  Settings, 
  Search, 
  Plus, 
  User, 
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  Save,
  Trash2,
  Clock,
  Trophy,
  Zap,
  Shield,
  Crosshair,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  FileText,
  Sword,
  Footprints,
  Shirt,
  Hand,
  Loader,
  Image as ImageIcon,
  Edit2,
  Check,
  Cpu,
  Microchip,
  MoreVertical,
  StickyNote,
  CornerDownRight,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
  PieChart,
  Hash,
  Gamepad2,
  Tag,
  Palette,
  Layout,
  Columns
} from 'lucide-react';
import abilitiesData from '../data/dd2_abilities.json';
import defensesData from '../data/dd2_defenses.json';
import shardsData from '../data/dd2_shards_data.json';
import modsData from '../data/dd2_mods_data.json';
import linksData from '../data/dd2_links.json';

/**
 * PHASE 0: FOUNDATIONS & DATA MODEL
 */

// --- Domain Types ---

export type Rarity = 'common' | 'sturdy' | 'powerful' | 'mythical' | 'legendary' | 'ascended';
export type ItemType = 'weapon' | 'armor' | 'medallion' | 'relic' | 'chip' | 'servo' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'shield' | 'weapon1' | 'weapon2';

export interface Shard {
  id: string;
  name: string;
  description: string;
  source?: any;
  compatibleSlots: string[];
  iconUrl?: string;
  heroId?: string; 
  heroes?: any[];
  upgradeLevels?: any;
}

export interface Mod {
  id: string;
  name: string;
  description: string;
  source?: string;
  compatibleSlots: string[];
  type?: string;
  heroId?: string;
  iconUrl?: string;
}

export interface ResourceLink {
  author: string;
  name: string;
  description: string;
  link: string;
}

export interface Ability {
  name: string;
  statusEffects: string[];
  abilityType: string;
  manaCost: number;
  recharge: string;
  damageType: string;
  damageScalar: number;
  heroes: string[];
  iconUrl: string;
}

export interface Defense {
  name: string;
  status_effects: string;
  damage_type: string;
  defense_type: string;
  mana_cost: string;
  base_def_power: string;
  base_def_health: string;
  t1_atk_scalar: string;
  t2_atk_scalar: string;
  t3_atk_scalar: string;
  t4_atk_scalar: string;
  t5_atk_scalar: string;
  t1_hp_scalar: string;
  t2_hp_scalar: string;
  t3_hp_scalar: string;
  t4_hp_scalar: string;
  t5_hp_scalar: string;
  base_atk_rate: string;
  max_atk_rate: string;
  base_range: string;
  max_range: string;
  base_atk_range: string;
  max_atk_range: string;
  range_scalar: string;
  asc_def_power: string;
  asc_def_health: string;
  asc_gambit: string;
  hero: string;
  image_url: string;
  iconUrl?: string;
  heroId?: string;
}


export interface Hero {
  id: string;
  name: string;
  class: string;
  roleTags: string[];
  color: string;
  iconUrl?: string;
  equipmentSlots?: string[]; 
  stats?: {
    health: number;
    damage: number;
    speed: number;
  };
}

export interface BuildSlot {
  slotId: string;
  shards: (string | null)[];
  mods: (string | null)[];
}

export interface Build {
  id: string;
  name: string;
  heroId: string;
  customColor: string; // Changed from tags to single custom color
  slots: Record<string, BuildSlot>;
  lastEdited: number;
}

export interface Tower {
  id: string;
  name: string;
  duCost: number;
  heroId: string;
  iconUrl?: string; 
  stats?: any; 
}

export interface MapData {
  id: string;
  name: string;
  maxDU: number;
  imageUrl?: string;
  difficulty: 'campaign' | 'chaos' | 'mastery' | 'onslaught';
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  type: 'note' | 'level' | 'hero'; // Renamed standard->note, counter->level
  currentValue?: number; // For level type
  maxValue?: number;     // For level type
  linkedHeroId?: string; // For hero type
  notes?: string;
  imageUrl?: string;
}

export interface Checklist {
  id: string;
  title: string;
  category: string;
  icon?: string; 
  sections: {
    id: string;
    title: string;
    items: ChecklistItem[];
  }[];
}

interface DataRegistry {
  heroes: Hero[];
  maps: MapData[];
  towers: Tower[];
  shards: Shard[];
  mods: Mod[];
  checklists: Checklist[];
  builds: Build[];
  abilities: Ability[];
  defenses: Defense[];
  links: ResourceLink[];
}

// --- Constants ---

const STANDARD_SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'relic'];
const SHIELD_SLOTS = ['weapon', 'shield', 'helmet', 'chest', 'gloves', 'boots', 'relic'];
const DUAL_WIELD_SLOTS = ['weapon1', 'weapon2', 'helmet', 'chest', 'gloves', 'boots', 'relic'];

const SLOT_CONFIG: Record<string, { label: string, icon: any }> = {
  weapon: { label: 'Weapon', icon: Sword },
  weapon1: { label: 'Left Weapon', icon: Sword },
  weapon2: { label: 'Right Weapon', icon: Sword },
  shield: { label: 'Shield', icon: Shield },
  helmet: { label: 'Helmet', icon: User },
  chest: { label: 'Chest', icon: Shirt },
  gloves: { label: 'Gloves', icon: Hand },
  boots: { label: 'Boots', icon: Footprints },
  relic: { label: 'Relic', icon: Zap },
  servo: { label: 'Servo', icon: Microchip },
  chip: { label: 'Chip', icon: Cpu },
};

const GENERIC_ICONS = [
  { id: 'sword', icon: Sword, label: 'Combat' },
  { id: 'shield', icon: Shield, label: 'Defense' },
  { id: 'coins', icon: Coins, label: 'Farming' },
  { id: 'trophy', icon: Trophy, label: 'Achievement' },
  { id: 'zap', icon: Zap, label: 'Power' },
  { id: 'book', icon: BookOpen, label: 'Research' },
  { id: 'gamepad', icon: Gamepad2, label: 'General' },
  { id: 'hammer', icon: Hammer, label: 'Build' },
];

const CUSTOM_COLORS = [
  { id: 'red', class: 'bg-red-600', text: 'text-red-100', border: 'border-red-500' },
  { id: 'orange', class: 'bg-orange-600', text: 'text-orange-100', border: 'border-orange-500' },
  { id: 'amber', class: 'bg-amber-600', text: 'text-amber-100', border: 'border-amber-500' },
  { id: 'green', class: 'bg-green-600', text: 'text-green-100', border: 'border-green-500' },
  { id: 'emerald', class: 'bg-emerald-600', text: 'text-emerald-100', border: 'border-emerald-500' },
  { id: 'teal', class: 'bg-teal-600', text: 'text-teal-100', border: 'border-teal-500' },
  { id: 'cyan', class: 'bg-cyan-600', text: 'text-cyan-100', border: 'border-cyan-500' },
  { id: 'blue', class: 'bg-blue-600', text: 'text-blue-100', border: 'border-blue-500' },
  { id: 'indigo', class: 'bg-indigo-600', text: 'text-indigo-100', border: 'border-indigo-500' },
  { id: 'violet', class: 'bg-violet-600', text: 'text-violet-100', border: 'border-violet-500' },
  { id: 'purple', class: 'bg-purple-600', text: 'text-purple-100', border: 'border-purple-500' },
  { id: 'fuchsia', class: 'bg-fuchsia-600', text: 'text-fuchsia-100', border: 'border-fuchsia-500' },
  { id: 'pink', class: 'bg-pink-600', text: 'text-pink-100', border: 'border-pink-500' },
  { id: 'rose', class: 'bg-rose-600', text: 'text-rose-100', border: 'border-rose-500' },
  { id: 'slate', class: 'bg-slate-600', text: 'text-slate-100', border: 'border-slate-500' },
  { id: 'zinc', class: 'bg-zinc-600', text: 'text-zinc-100', border: 'border-zinc-500' },
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'item';

const formatValue = (val: any) => {
  if (val === null || val === undefined || val === '') return '-';
  let str = String(val);
  str = str
    .replace(/\u2013|\u2014/g, '-')      // en/em dash -> hyphen
    .replace(/\u2192/g, '->')           // arrow -> ascii
    .replace(/\u2018|\u2019/g, "'")     // curly quotes
    .replace(/\u201c|\u201d/g, '"');
  // Strip remaining non-ASCII
  str = str.replace(/[^\x20-\x7E]/g, '');
  str = str.trim();
  return str || '-';
};

const normalizeShard = (raw: any, heroes: Hero[]): Shard => {
  const heroName = raw.heroes?.[0]?.name;
  const compatibleSlots = Array.isArray(raw.compatibleSlots) && raw.compatibleSlots.length
    ? raw.compatibleSlots
    : raw.heroes?.map((h: any) => h.slot).filter(Boolean) || ['relic', 'weapon', 'helmet', 'chest', 'gloves', 'boots'];

  const heroId = heroName ? heroes.find(h => h.name.toLowerCase() === heroName.toLowerCase())?.id : undefined;
  const source =
    typeof raw.source === 'object'
      ? raw.source
      : typeof raw.source === 'string'
        ? raw.source
        : raw.source?.difficulty || 'Unknown';

  return {
    id: raw.id || `s_${slugify(raw.name || 'shard')}`,
    name: raw.name || 'Unknown Shard',
    description: typeof raw.description === 'string' ? raw.description : (raw.description?.text || 'No description'),
    source,
    compatibleSlots: compatibleSlots.map((slot: string) => String(slot).toLowerCase()),
    iconUrl: raw.heroes?.[0]?.image || raw.iconUrl || raw.image,
    heroId,
    heroes: Array.isArray(raw.heroes) ? raw.heroes : [],
    upgradeLevels: raw.upgradeLevels
  };
};

const normalizeMod = (raw: any, heroes: Hero[]): Mod => {
  const heroName = raw.hero;
  const heroId = typeof heroName === 'string' ? heroes.find(h => h.name.toLowerCase() === heroName.toLowerCase())?.id : undefined;
  const type = raw.type || 'Any';
  const slotMap: Record<string, string[]> = {
    'Weapon': ['weapon', 'weapon1', 'weapon2'],
    'Relic': ['relic'],
    'Armor': ['helmet', 'chest', 'gloves', 'boots'],
  };
  const compatibleSlots = slotMap[type] || ['relic'];

  return {
    id: raw.id || `m_${slugify(raw.name || 'mod')}`,
    name: raw.name || 'Unknown Mod',
    description: raw.description || 'No description',
    source: raw.drop || raw.source || 'Unknown',
    compatibleSlots: compatibleSlots.map(s => s.toLowerCase()),
    type,
    heroId,
    iconUrl: raw.image || raw.iconUrl || raw.icons?.plain
  };
};

const normalizeLink = (raw: any): ResourceLink => ({
  author: raw.author || 'Unknown',
  name: raw.name || 'Untitled',
  description: raw.description || 'No description',
  link: raw.link || '#'
});

const normalizeDefense = (raw: any, heroes: Hero[]) => {
  const heroName = raw.hero || raw.heroId;
  const heroId = heroName ? heroes.find(h => h.name.toLowerCase() === String(heroName).toLowerCase())?.id : undefined;

  return {
    ...raw,
    name: raw.name || 'Unknown Defense',
    iconUrl: raw.image_url || raw.iconUrl || raw.icons?.plain,
    hero: heroName || '',
    heroId
  };
};

const buildInitialRegistry = (): DataRegistry => {
  const saved = localStorage.getItem('dd2_planner_data');
  const savedData = saved ? JSON.parse(saved) : null;
  const base = savedData ? { ...INITIAL_REGISTRY, ...savedData } : INITIAL_REGISTRY;
  const heroIdByName = (name?: string) => {
    if (!name) return undefined;
    return base.heroes.find(h => h.name.toLowerCase() === String(name).toLowerCase())?.id;
  };
  const normalizedDefenses = ([...(savedData?.defenses || []), ...((defensesData as any).defenses || [])] as any[])
    .map((d: any) => normalizeDefense(d, base.heroes))
    .reduce((acc: any[], item: any) => {
      const exists = acc.find(d => d.name === item.name);
      if (!exists) acc.push(item);
      return acc;
    }, []);
  const normalizedShards = ([...(savedData?.shards || []), ...(shardsData as any[])] as any[])
    .map((s: any) => normalizeShard(s, base.heroes))
    .reduce((acc: any[], item: any) => {
      const exists = acc.find(s => s.name === item.name);
      if (!exists) {
        acc.push(item);
      } else {
        const merged: any = { ...exists, ...item };
        merged.iconUrl = item.iconUrl || exists.iconUrl;
        merged.source = item.source || exists.source;
        merged.upgradeLevels = item.upgradeLevels ?? exists.upgradeLevels;
        merged.compatibleSlots = (item.compatibleSlots && item.compatibleSlots.length) ? item.compatibleSlots : exists.compatibleSlots;
        merged.heroes = (item.heroes && item.heroes.length ? item.heroes : exists.heroes) || [];
        merged.heroId = exists.heroId || item.heroId || heroIdByName(merged.heroes?.[0]?.name);
        acc[acc.indexOf(exists)] = merged;
      }
      return acc;
    }, []);
  const normalizedMods = ([...(savedData?.mods || []), ...(modsData as any[])] as any[])
    .map((m: any) => normalizeMod(m, base.heroes))
    .reduce((acc: any[], item: any) => {
      const exists = acc.find(s => s.name === item.name);
      if (!exists) {
        acc.push(item);
      } else {
        const merged: any = { ...exists, ...item };
        merged.iconUrl = item.iconUrl || exists.iconUrl;
        merged.image = item.image || exists.image;
        merged.hero = exists.hero || item.hero;
        merged.heroId = exists.heroId || item.heroId || heroIdByName(merged.hero);
        merged.type = item.type || exists.type;
        merged.compatibleSlots = (item.compatibleSlots && item.compatibleSlots.length) ? item.compatibleSlots : exists.compatibleSlots;
        acc[acc.indexOf(exists)] = merged;
      }
      return acc;
    }, []);
  const normalizedLinks = ([...(savedData?.links || []), ...((linksData as any).resources || [])] as any[])
    .map((l: any) => normalizeLink(l))
    .reduce((acc: any[], item: any) => {
      const exists = acc.find(s => s.name === item.name && s.link === item.link);
      if (!exists) acc.push(item);
      return acc;
    }, []);
  const ensuredLinks = normalizedLinks.length ? normalizedLinks : ((linksData as any).resources || []).map((l: any) => normalizeLink(l));

  return {
    ...base,
    abilities: abilitiesData as Ability[],
    defenses: normalizedDefenses,
    shards: normalizedShards,
    mods: normalizedMods,
    links: ensuredLinks,
  };
};

// --- Initial Data ---

const INITIAL_REGISTRY: DataRegistry = {
  heroes: [
    { id: 'h20', name: 'Squire', class: 'Squire', roleTags: ['Tank', 'Builder'], color: 'bg-orange-600', equipmentSlots: SHIELD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/9/91/Squire_Icon.png' },
    { id: 'h3', name: 'Apprentice', class: 'Apprentice', roleTags: ['DPS', 'Builder'], color: 'bg-blue-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/2/2d/Apprentice_Icon.png' },
    { id: 'h13', name: 'Huntress', class: 'Huntress', roleTags: ['DPS', 'Builder'], color: 'bg-green-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/9/96/Huntress_Icon.png' },
    { id: 'h17', name: 'Monk', class: 'Monk', roleTags: ['Support', 'Builder'], color: 'bg-yellow-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/3/3d/Monk_Icon.png' },
    { id: 'h1', name: 'Abyss Lord', class: 'Abyss Lord', roleTags: ['Builder', 'Tank'], color: 'bg-purple-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/6/65/Abyss_Lord_Icon.png' },
    { id: 'h2', name: 'Adept', class: 'Adept', roleTags: ['DPS', 'Builder'], color: 'bg-violet-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/8/88/Adept_Icon.png' },
    { id: 'h4', name: 'Aquarion', class: 'Aquarion', roleTags: ['DPS', 'Builder'], color: 'bg-cyan-500', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/c/c2/Aquarion_Icon.png' },
    { id: 'h5', name: 'Barbarian', class: 'Barbarian', roleTags: ['DPS'], color: 'bg-red-700', equipmentSlots: DUAL_WIELD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/a/a2/Barbarian_Icon.png' },
    { id: 'h6', name: 'Countess', class: 'Countess', roleTags: ['Tank', 'Builder'], color: 'bg-orange-500', equipmentSlots: SHIELD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/c/c5/Countess_Icon.png' },
    { id: 'h7', name: 'Cyborg', class: 'Cyborg', roleTags: ['DPS', 'Builder'], color: 'bg-zinc-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/5/5f/Cyborg_Icon.png' },
    { id: 'h8', name: 'Dryad', class: 'Dryad', roleTags: ['Builder', 'Support'], color: 'bg-emerald-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/4/4d/Dryad_Icon.png' },
    { id: 'h9', name: 'Engineer', class: 'Engineer', roleTags: ['Builder', 'DPS'], color: 'bg-teal-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/a/a7/Engineer_Icon.png' },
    { id: 'h10', name: 'Frostweaver', class: 'Frostweaver', roleTags: ['Builder', 'CC'], color: 'bg-sky-500', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/5/5d/Frostweaver_Icon.png' },
    { id: 'h11', name: 'Gunwitch', class: 'Gunwitch', roleTags: ['DPS'], color: 'bg-pink-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/8/8f/Gunwitch_Icon.png' },
    { id: 'h12', name: 'Hunter', class: 'Hunter', roleTags: ['DPS', 'Builder'], color: 'bg-emerald-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/f/f6/Hunter_Icon.png' },
    { id: 'h14', name: 'Initiate', class: 'Initiate', roleTags: ['Support', 'Builder'], color: 'bg-amber-500', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/8/88/Initiate_Icon.png' },
    { id: 'h15', name: 'Lavamancer', class: 'Lavamancer', roleTags: ['Tank', 'Builder'], color: 'bg-red-800', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/c/c8/Lavamancer_Icon.png' },
    { id: 'h16', name: 'Mercenary', class: 'Mercenary', roleTags: ['DPS'], color: 'bg-slate-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/3/36/Mercenary_Icon.png' },
    { id: 'h18', name: 'Mystic', class: 'Mystic', roleTags: ['Builder', 'Support'], color: 'bg-indigo-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/8/8f/Mystic_Icon.png' },
    { id: 'h19', name: 'Series EV2', class: 'Series EV2', roleTags: ['Builder', 'DPS'], color: 'bg-teal-600', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/d/d3/Series_EV2_Icon.png' },
    { id: 'h21', name: 'Jester', class: 'Jester', roleTags: ['Support', 'DPS'], color: 'bg-fuchsia-700', equipmentSlots: STANDARD_SLOTS, iconUrl: 'https://static.wikia.nocookie.net/dungeondefenders/images/9/9d/Jester_Icon.png' },
  ],
  maps: [
    { id: 'm1', name: 'The Gates of Dragonfall', maxDU: 1000, difficulty: 'campaign' },
    { id: 'm2', name: 'Nimbus Reach', maxDU: 1200, difficulty: 'chaos' },
  ],
  towers: [],
  shards: [],
  mods: [],
  checklists: [],
  builds: [],
  abilities: [],
  defenses: [],
  links: []
};

// --- Reusable Components ---

const Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm hover:border-zinc-600 transition-colors ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'accent' | 'success' }) => {
  const styles = {
    default: 'bg-zinc-800 text-zinc-300',
    outline: 'border border-zinc-700 text-zinc-400',
    accent: 'bg-red-900/30 text-red-400 border border-red-900/50',
    success: 'bg-green-900/30 text-green-400 border border-green-900/50',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick, icon: Icon, disabled }: any) => {
  const variants = {
    primary: 'bg-red-700 hover:bg-red-600 text-white shadow-red-900/20 shadow-lg',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700',
    ghost: 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200',
    icon: 'p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-full',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${variant === 'icon' ? '' : sizes[size]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const SearchInput = ({ placeholder = 'Search...', value, onChange }: any) => (
  <div className="relative group">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={16} />
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900/50 placeholder:text-zinc-600 text-sm transition-all"
      placeholder={placeholder}
    />
  </div>
);

const ThemedSelect = ({ value, onChange, children, className = '' }: any) => (
  <div className="relative group">
    <select
      value={value}
      onChange={onChange}
      className={`appearance-none bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800/80 text-zinc-100 text-sm pl-3 pr-10 py-2 rounded-lg shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-1 focus:ring-red-700 focus:border-red-700 transition-all hover:border-zinc-700 hover:-translate-y-[1px] ${className}`}
    >
      {children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
  </div>
);

const NumberStepper = ({ value, min = 0, max = 999, onChange, label, step = 1 }: any) => (
  <div className="flex flex-col gap-1">
    {label && <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</span>}
    <div className="flex items-center bg-zinc-900 rounded-md border border-zinc-800 overflow-hidden">
      <button 
        onClick={() => onChange(Math.max(min, value - step))}
        className="p-2 hover:bg-zinc-800 text-zinc-400 active:text-red-400 transition-colors"
      >
        <ChevronDown size={14} />
      </button>
      <div className="flex-1 text-center font-mono text-sm text-zinc-200 min-w-[3rem]">
        {value}
      </div>
      <button 
        onClick={() => onChange(Math.min(max, value + step))}
        className="p-2 hover:bg-zinc-800 text-zinc-400 active:text-green-400 transition-colors"
      >
        <ChevronUp size={14} />
      </button>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Confirm</Button>
        </div>
      </div>
    </div>
  );
};

const InlineInput = ({ value, onSave, onCancel, placeholder, type = 'text', autoFocus = true, allowFile = false }: any) => {
  const [text, setText] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSave(text);
    if (e.key === 'Escape') onCancel();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) {
          setText(ev.target.result as string);
          // Auto save on file select for convenience
          onSave(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 flex items-center gap-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 focus-within:border-red-500 transition-colors">
        <input
          ref={inputRef}
          type={type}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white outline-none"
        />
        {allowFile && (
          <>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
              title="Upload Image"
            >
              <Upload size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
      <button onClick={() => onSave(text)} className="p-1.5 text-green-500 hover:bg-zinc-800 rounded"><Check size={14} /></button>
      <button onClick={onCancel} className="p-1.5 text-red-500 hover:bg-zinc-800 rounded"><X size={14} /></button>
    </div>
  );
};

const ProgressBar = ({ progress, color = 'bg-green-500' }: { progress: number, color?: string }) => (
  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
    <div 
      className={`h-full transition-all duration-500 ${color}`} 
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
    />
  </div>
);

const HeroCard = ({ hero, onClick }: { hero: Hero, onClick: () => void }) => (
  <div onClick={onClick} className="group cursor-pointer rounded-xl overflow-hidden border border-zinc-800 hover:border-red-500 transition-all duration-300 hover:-translate-y-1 h-[280px] bg-zinc-900 flex flex-col">
    <div className={`h-[60%] relative flex items-center justify-center overflow-hidden`}>
      <div className={`absolute inset-0 ${hero.color} opacity-30 group-hover:opacity-40 transition-opacity`} />
      {hero.iconUrl ? (
        <img src={hero.iconUrl} alt={hero.name} className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl" />
      ) : (
        <User size={64} className="text-white/50 relative z-10" />
      )}
    </div>
    <div className="h-[40%] bg-zinc-950 p-4 flex flex-col justify-between border-t border-zinc-800 relative z-20">
      <div><h3 className="text-lg font-bold text-white leading-tight">{hero.name}</h3><p className="text-xs text-zinc-400">{hero.class}</p></div>
      <div className="flex flex-wrap gap-1.5 mt-2">{hero.roleTags.map(tag => <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-300">{tag}</span>)}</div>
    </div>
  </div>
);

// --- SELECTION MODAL ---

const SelectionModal = ({ isOpen, onClose, items, onSelect, title }: any) => {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const filtered = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-4"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-200 focus:border-red-500 outline-none" /></div>
      <div className="space-y-2">
        {filtered.map((item: any) => (
          <div key={item.id} onClick={() => onSelect(item)} className="p-3 rounded bg-zinc-900 border border-zinc-800 hover:border-red-500 cursor-pointer flex justify-between items-center group">
            <div className="flex items-center gap-3">
              {item.iconUrl && <img src={item.iconUrl} className="w-8 h-8 rounded bg-black object-contain" />}
              <div>
                <div className="font-medium text-zinc-200 group-hover:text-white">{item.name}</div>
                <div className="text-xs text-zinc-500 line-clamp-2">
                  {typeof item.description === 'string' ? item.description : 'Details available'}
                </div>
              </div>
            </div>
            <Plus size={16} className="text-zinc-600 group-hover:text-red-500" />
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-zinc-500 py-4">No matching items found.</div>}
      </div>
    </Modal>
  );
};

// --- LAYOUT SIDEBAR ---

const Sidebar = ({ activePage, setPage, mobileOpen, setMobileOpen }: any) => {
  const navItems = [
    { id: 'maps', label: 'Map Planner', icon: MapIcon },
    { id: 'gold', label: 'Gold Calculator', icon: Coins },
    { id: 'builds', label: 'Build Editor', icon: Hammer },
    { id: 'heroes', label: 'Heroes', icon: Users },
    { id: 'checklists', label: 'Collection Tracker', icon: CheckSquare }, // Renamed per user intent
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const SidebarItem = ({ icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${
        isActive 
          ? 'bg-red-900/10 text-red-500' 
          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <div className="ml-auto w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
    </button>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed md:relative z-50 h-full w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-900">
          <div className="flex items-center gap-2 text-red-600 font-bold tracking-tight text-xl">
            <div className="w-8 h-8 bg-red-600 text-black flex items-center justify-center rounded text-sm font-black">DD2</div>
            <span>Planner</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto md:hidden text-zinc-500"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Tools</div>
          {navItems.map((item) => (
            <SidebarItem key={item.id} {...item} isActive={activePage === item.id} onClick={() => { setPage(item.id); setMobileOpen(false); }} />
          ))}
        </div>
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
          <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-zinc-900 transition-colors">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><User size={16} /></div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-zinc-200">Defender</span>
              <span className="text-[10px] text-zinc-500">Offline Mode</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

// --- PAGES ---

const MapPlanner = ({ registry }: { registry: DataRegistry }) => {
  const [selectedMapId, setSelectedMapId] = useState('m1');
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [placedTowers, setPlacedTowers] = useState<{ id: string, towerId: string, x: number, y: number }[]>([]);
  const selectedMap = registry.maps.find(m => m.id === selectedMapId);
   
  const duStats = useMemo(() => {
    if (!selectedMap) return { used: 0, remaining: 0, percent: 0 };
    const used = placedTowers.reduce((acc, pt) => acc + (registry.towers.find(t => t.id === pt.towerId)?.duCost || 0), 0);
    return { used, remaining: selectedMap.maxDU - used, percent: (used / selectedMap.maxDU) * 100 };
  }, [placedTowers, selectedMap, registry]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTowerId || !selectedMap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const tower = registry.towers.find(t => t.id === selectedTowerId);
    if (tower && duStats.remaining >= tower.duCost) {
      setPlacedTowers([...placedTowers, { id: Math.random().toString(), towerId: selectedTowerId, x, y }]);
    }
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500">
      <div className="w-80 border-r border-zinc-900 bg-zinc-950 p-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Map Select</label>
          <div className="relative">
            <select value={selectedMapId} onChange={(e) => { setSelectedMapId(e.target.value); setPlacedTowers([]); }} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 p-2 rounded-md appearance-none focus:outline-none focus:border-red-900">
              {registry.maps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={14} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500"><span className="capitalize">{selectedMap?.difficulty}</span><span>Max DU: {selectedMap?.maxDU}</span></div>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Defense Palette</label>
          <div className="grid grid-cols-2 gap-2">
            {registry.towers.map(tower => {
              const isSelected = selectedTowerId === tower.id;
              const canAfford = duStats.remaining >= tower.duCost;
              return (
                <button key={tower.id} onClick={() => setSelectedTowerId(tower.id)} disabled={!canAfford && !isSelected} className={`p-3 rounded-lg border text-left transition-all relative ${isSelected ? 'bg-red-900/20 border-red-600 ring-1 ring-red-600' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'} ${!canAfford && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    {tower.iconUrl ? <img src={tower.iconUrl} className="w-5 h-5 object-contain" /> : <Shield size={20} className={isSelected ? 'text-red-500' : 'text-zinc-400'} />}
                    <span className="text-xs font-mono text-zinc-500">{tower.duCost}</span>
                  </div>
                  <div className="text-sm font-medium text-zinc-200 truncate">{tower.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-zinc-900/30 relative flex flex-col">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-zinc-950/90 border border-zinc-800 rounded-full px-6 py-3 shadow-xl backdrop-blur-md flex items-center gap-8 min-w-[320px]">
           <div className="flex flex-col items-center"><span className="text-[10px] text-zinc-500 uppercase font-bold">Used DU</span><span className={`text-lg font-bold font-mono ${duStats.used > (selectedMap?.maxDU || 0) ? 'text-red-500' : 'text-zinc-200'}`}>{duStats.used}</span></div>
           <div className="flex-1 h-3 w-40 bg-zinc-800 rounded-full overflow-hidden relative"><div className={`h-full transition-all duration-300 ${duStats.remaining < 0 ? 'bg-red-600' : 'bg-blue-500'}`} style={{ width: `${Math.min(duStats.percent, 100)}%` }} /></div>
           <div className="flex flex-col items-center"><span className="text-[10px] text-zinc-500 uppercase font-bold">Remaining</span><span className="text-lg font-bold font-mono text-zinc-200">{duStats.remaining}</span></div>
        </div>
        <div className="flex-1 p-12 flex items-center justify-center overflow-hidden">
          <div className="relative w-full aspect-video bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-800 shadow-2xl overflow-hidden cursor-crosshair group" onClick={handleMapClick}>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"><div className="text-center opacity-10"><MapIcon size={96} className="mx-auto mb-4" /><h2 className="text-4xl font-black uppercase tracking-widest">{selectedMap?.name}</h2></div></div>
             {placedTowers.map(pt => {
               const towerDef = registry.towers.find(t => t.id === pt.towerId);
               const heroDef = registry.heroes.find(h => h.id === towerDef?.heroId);
               return (
                 <div key={pt.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer" style={{ left: `${pt.x}%`, top: `${pt.y}%` }} onClick={(e) => { e.stopPropagation(); setPlacedTowers(placedTowers.filter(t => t.id !== pt.id)); }}>
                   <div className={`w-8 h-8 rounded-full ${heroDef?.color || 'bg-zinc-500'} shadow-lg border-2 border-white flex items-center justify-center text-white overflow-hidden`}>
                     {towerDef?.iconUrl ? <img src={towerDef.iconUrl} className="w-full h-full object-cover" /> : <Shield size={14} />}
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10 bg-white/5 pointer-events-none" />
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoldCalculator = () => {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(30);
  const [loadingTime, setLoadingTime] = useState(60);
  const [goldPerRun, setGoldPerRun] = useState(50000);
  const runsPerHour = useMemo(() => {
    const totalCycleSeconds = (minutes * 60) + seconds + loadingTime;
    return totalCycleSeconds > 0 ? 3600 / totalCycleSeconds : 0;
  }, [minutes, seconds, loadingTime]);
  const goldPerHour = runsPerHour * goldPerRun;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><Coins className="text-yellow-500" />Gold Efficiency</h1></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 space-y-8 h-fit">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2"><Clock size={16} /> Cycle Time</h3>
            <div className="flex gap-4 mb-4"><NumberStepper label="Min" value={minutes} onChange={setMinutes} max={59} /><NumberStepper label="Sec" value={seconds} onChange={setSeconds} max={59} /></div>
            <NumberStepper label="Loading Overhead (Sec)" value={loadingTime} onChange={setLoadingTime} max={120} step={5} />
          </div>
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2"><Trophy size={16} /> Rewards</h3>
            <div className="space-y-1"><label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gold Per Run</label><input type="number" value={goldPerRun} onChange={(e) => setGoldPerRun(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-2 rounded-md font-mono focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600/50 outline-none" /></div>
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"><span className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-2">Runs / Hour</span><span className="text-4xl font-mono text-white font-light">{runsPerHour.toFixed(1)}</span></div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden group"><div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" /><span className="text-yellow-600 text-xs uppercase tracking-widest font-bold mb-2">Gold / Hour</span><span className="text-4xl font-mono text-yellow-400 font-bold">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(goldPerHour)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuildEditor = ({ registry, setRegistry }: { registry: DataRegistry, setRegistry: React.Dispatch<React.SetStateAction<DataRegistry>> }) => {
  const [selectedHeroId, setSelectedHeroId] = useState('h20');
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [pickerState, setPickerState] = useState<{ isOpen: boolean, type: 'shard' | 'mod', slotId: string, index: number } | null>(null);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);

  const hero = registry.heroes.find(h => h.id === selectedHeroId);
  
  const heroBuilds = registry.builds.filter(b => {
    const isHeroMatch = b.heroId === selectedHeroId;
    if (!isHeroMatch) return false;
    if (activeColorFilter) return b.customColor === activeColorFilter;
    return true;
  });

  const activeBuild = registry.builds.find(b => b.id === selectedBuildId);

  const createBuild = () => {
    const newBuild: Build = {
      id: `b_${Date.now()}`,
      heroId: selectedHeroId,
      name: `New Build ${heroBuilds.length + 1}`,
      customColor: 'zinc',
      slots: {},
      lastEdited: Date.now()
    };
    setRegistry(prev => ({ ...prev, builds: [...prev.builds, newBuild] }));
    setSelectedBuildId(newBuild.id);
  };

  const updateBuild = (slotId: string, type: 'shards' | 'mods', index: number, itemId: string) => {
    if (!selectedBuildId) return;
    setRegistry(prev => ({
      ...prev,
      builds: prev.builds.map(b => {
        if (b.id !== selectedBuildId) return b;
        const currentSlot = b.slots[slotId] || { slotId, shards: [null, null, null], mods: [null, null, null] };
        const newArray = [...currentSlot[type]];
        newArray[index] = itemId;
        return {
          ...b,
          slots: { ...b.slots, [slotId]: { ...currentSlot, [type]: newArray } },
          lastEdited: Date.now()
        };
      })
    }));
    setPickerState(null);
  };

  const setBuildColor = (colorId: string) => {
    if (!activeBuild) return;
    setRegistry(prev => ({
      ...prev,
      builds: prev.builds.map(b => b.id === activeBuild.id ? { ...b, customColor: colorId } : b)
    }));
  };

  const getSlotIcon = (id: string) => SLOT_CONFIG[id]?.icon || Crosshair;
  const slots = (hero?.equipmentSlots || STANDARD_SLOTS);

  const getCompatibleItems = () => {
    if (!pickerState) return [];
    const collection = pickerState.type === 'shard' ? registry.shards : registry.mods;
    const slotName = pickerState.slotId.toLowerCase();
    const matchesSlot = (item: any) => {
      const slotsLower = (item.compatibleSlots || []).map((s: string) => s.toLowerCase());
      if (slotName.includes('weapon')) return slotsLower.some((s: string) => s.includes('weapon'));
      return slotsLower.includes(slotName);
    };
    const score = (item: any) => {
      const heroScore = (item as any).heroId && (item as any).heroId === selectedHeroId ? 0 : 1;
      const slotScore = matchesSlot(item) ? 0 : 1;
      return [heroScore, slotScore, (item.name || '').toLowerCase()];
    };
    return collection
      .filter(item => {
        if ((item as any).heroId && (item as any).heroId !== selectedHeroId) return false;
        return matchesSlot(item);
      })
      .sort((a, b) => {
        const sa = score(a);
        const sb = score(b);
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      });
  };

  const getBuildStyle = (colorId: string) => {
    return CUSTOM_COLORS.find(c => c.id === colorId) || CUSTOM_COLORS[14]; // Default zinc
  };

  return (
    <div className="flex h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="w-72 border-r border-zinc-900 bg-zinc-950 p-6 overflow-y-auto flex flex-col">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Hero Class</label>
        <div className="relative mb-6">
          <select value={selectedHeroId} onChange={(e) => { setSelectedHeroId(e.target.value); setSelectedBuildId(null); }} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 p-2 rounded-md appearance-none focus:outline-none focus:border-red-900">
            {registry.heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-zinc-500 pointer-events-none" size={14} />
        </div>

        <div className="text-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden ${hero?.color} flex items-center justify-center mb-3 shadow-lg`}>
            {hero?.iconUrl ? <img src={hero.iconUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-white" />}
          </div>
          <h2 className="text-xl font-bold text-white">{hero?.name}</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Saved Builds</span>
            <div className="flex gap-2">
                {activeColorFilter && (
                    <button onClick={() => setActiveColorFilter(null)} className="text-xs text-zinc-500 hover:text-white flex items-center">
                        <X size={10} className="mr-1" /> Clear
                    </button>
                )}
                <button onClick={createBuild} className="text-xs text-red-500 hover:text-red-400 font-bold">+ New</button>
            </div>
          </div>

          {/* Color Filter */}
          <div className="mb-4 flex flex-wrap gap-1.5">
             {CUSTOM_COLORS.slice(0,8).map(c => (
                 <button 
                    key={c.id}
                    onClick={() => setActiveColorFilter(activeColorFilter === c.id ? null : c.id)}
                    className={`w-4 h-4 rounded-full ${c.class} ${activeColorFilter === c.id ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}
                    title={c.id}
                 />
             ))}
          </div>

          {heroBuilds.map(b => {
            const style = getBuildStyle(b.customColor);
            return (
              <button key={b.id} onClick={() => setSelectedBuildId(b.id)} className={`w-full text-left p-2 rounded text-sm transition-all group border-l-4 ${selectedBuildId === b.id ? `bg-zinc-900 ${style.border} text-white` : `border-transparent hover:bg-zinc-900 text-zinc-400`}`}>
                <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{b.name}</span>
                    {selectedBuildId === b.id && <div className={`w-2 h-2 rounded-full ${style.class}`} />}
                </div>
              </button>
            );
          })}
          {heroBuilds.length === 0 && <div className="text-xs text-zinc-600 text-center py-4">No builds found.</div>}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          {activeBuild ? (
            <>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                        <input 
                        value={activeBuild.name} 
                        onChange={(e) => {
                            setRegistry(prev => ({
                            ...prev,
                            builds: prev.builds.map(b => b.id === activeBuild.id ? { ...b, name: e.target.value } : b)
                            }));
                        }}
                        className="text-3xl font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-red-500 outline-none transition-colors w-full"
                        />
                    </div>
                    <Button variant="secondary" icon={Save} onClick={() => { /* Auto-saves to local storage */ }}>Autosaved</Button>
                </div>
                
                {/* Build Color Picker */}
                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 w-fit">
                    <Palette size={16} className="text-zinc-500" />
                    <div className="flex gap-2">
                        {CUSTOM_COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setBuildColor(c.id)}
                                className={`w-6 h-6 rounded-full ${c.class} transition-transform ${activeBuild.customColor === c.id ? 'scale-110 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                title={c.id}
                            />
                        ))}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map(slotId => {
                  const Icon = getSlotIcon(slotId);
                  const slotData = activeBuild.slots[slotId] || { slotId, shards: [null, null, null], mods: [null, null, null] };
                   
                  return (
                    <div key={slotId} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
                      <div className="p-3 bg-zinc-950/50 border-b border-zinc-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400"><Icon size={16} /></div>
                        <span className="font-medium text-zinc-300 capitalize">{slotId.replace(/[0-9]/g, '')}</span>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-zinc-800 h-48">
                        <div className="p-3 space-y-2">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold text-center mb-1">Shards</div>
                          {[0, 1, 2].map(i => {
                            const itemId = slotData.shards[i];
                            const item = registry.shards.find(s => s.id === itemId);
                            return (
                              <button key={i} onClick={() => setPickerState({ isOpen: true, type: 'shard', slotId, index: i })} className="w-full p-2 rounded bg-black/20 border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 text-left transition-colors group/slot h-10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 group-hover/slot:bg-blue-500 group-hover/slot:border-blue-400" />
                                <span className={`text-xs truncate ${item ? 'text-blue-300' : 'text-zinc-600 group-hover/slot:text-zinc-300'}`}>
                                  {item ? item.name : 'Empty'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold text-center mb-1">Mods</div>
                          {[0, 1, 2].map(i => {
                            const itemId = slotData.mods[i];
                            const item = registry.mods.find(m => m.id === itemId);
                            return (
                              <button key={i} onClick={() => setPickerState({ isOpen: true, type: 'mod', slotId, index: i })} className="w-full p-2 rounded bg-black/20 border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 text-left transition-colors group/slot h-10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-sm bg-zinc-800 border border-zinc-600 group-hover/slot:bg-yellow-500 group-hover/slot:border-yellow-400" />
                                <span className={`text-xs truncate ${item ? 'text-yellow-300' : 'text-zinc-600 group-hover/slot:text-zinc-300'}`}>
                                  {item ? item.name : 'Empty'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Hammer size={64} className="mb-4 text-zinc-600" />
              <h3 className="text-xl font-bold text-zinc-300">No Build Selected</h3>
              <p className="text-zinc-500 mb-6">Select a build from the sidebar or create a new one.</p>
              <Button onClick={createBuild}>Create New Build</Button>
            </div>
          )}
        </div>
      </div>

      <SelectionModal 
        isOpen={!!pickerState} 
        title={`Select ${pickerState?.type === 'shard' ? 'Shard' : 'Mod'}`}
        items={getCompatibleItems()}
        onClose={() => setPickerState(null)}
        onSelect={(item: any) => updateBuild(pickerState!.slotId, pickerState!.type === 'shard' ? 'shards' : 'mods', pickerState!.index, item.id)}
      />
    </div>
  );
};

const IconPicker = ({ onSelect, registry }: { onSelect: (iconId: string) => void, registry: DataRegistry }) => (
  <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto p-1">
    {GENERIC_ICONS.map(i => {
      const Icon = i.icon;
      return (
        <button key={i.id} onClick={() => onSelect(i.id)} className="aspect-square flex flex-col items-center justify-center p-2 rounded hover:bg-zinc-800 transition-colors gap-1 border border-transparent hover:border-zinc-700">
          <Icon size={24} className="text-zinc-300" />
          <span className="text-[10px] text-zinc-500 truncate w-full text-center">{i.label}</span>
        </button>
      )
    })}
    {registry.heroes.map(h => (
      <button key={h.id} onClick={() => onSelect(h.id)} className="aspect-square flex flex-col items-center justify-center p-1 rounded hover:bg-zinc-800 transition-colors gap-1 border border-transparent hover:border-zinc-700">
        {h.iconUrl ? <img src={h.iconUrl} className="w-8 h-8 object-contain" /> : <div className={`w-8 h-8 rounded-full ${h.color}`} />}
        <span className="text-[10px] text-zinc-500 truncate w-full text-center">{h.name}</span>
      </button>
    ))}
  </div>
);

const ChecklistsPage = ({ registry, setRegistry }: { registry: DataRegistry, setRegistry: React.Dispatch<React.SetStateAction<DataRegistry>> }) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [inputState, setInputState] = useState<{ type: 'section' | 'item' | 'title' | 'note' | 'image' | 'list-create', listId?: string, sectionId?: string, itemId?: string, value?: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{ type: 'delete-list' | 'delete-section', listId: string, sectionId?: string } | null>(null);
  const [newItemType, setNewItemType] = useState<'note' | 'level' | 'hero'>('note');
  const [newListIcon, setNewListIcon] = useState<string>('gamepad');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Default to first list on load if none selected
  useEffect(() => {
    if (!selectedListId && registry.checklists.length > 0) {
      setSelectedListId(registry.checklists[0].id);
    }
  }, [registry.checklists]);

  const selectedList = registry.checklists.find(l => l.id === selectedListId);

  // --- Helpers ---

  const getListIcon = (iconId?: string) => {
    const generic = GENERIC_ICONS.find(g => g.id === iconId);
    if (generic) return <generic.icon size={20} className="text-zinc-300" />;
    const hero = registry.heroes.find(h => h.id === iconId);
    if (hero?.iconUrl) return <img src={hero.iconUrl} className="w-5 h-5 object-contain" />;
    if (hero) return <div className={`w-5 h-5 rounded-full ${hero.color}`} />;
    return <CheckSquare size={20} className="text-zinc-300" />;
  };

  // --- CRUD ---

  const handleAddSection = (title: string) => {
    if (!selectedListId || !title.trim()) return setInputState(null);
    setRegistry(prev => ({
      ...prev,
      checklists: prev.checklists.map(list => list.id !== selectedListId ? list : { 
        ...list, sections: [...list.sections, { id: `s_${Date.now()}`, title, items: [] }] 
      })
    }));
    setInputState(null);
  };

  const handleAddItem = (label: string) => {
    if (!inputState?.sectionId || !selectedListId) return setInputState(null);
    const newItem: ChecklistItem = {
      id: `i_${Date.now()}`,
      label,
      isCompleted: false,
      type: newItemType,
      currentValue: newItemType === 'level' ? 0 : undefined,
      maxValue: newItemType === 'level' ? 10 : undefined,
      linkedHeroId: newItemType === 'hero' ? registry.heroes[0].id : undefined
    };
    
    setRegistry(prev => ({
      ...prev,
      checklists: prev.checklists.map(l => l.id !== selectedListId ? l : {
        ...l,
        sections: l.sections.map(s => s.id !== inputState.sectionId ? s : { ...s, items: [...s.items, newItem] })
      })
    }));
    setInputState(null);
  };

  const handleCreateList = (title: string) => {
    if (!title.trim()) return setInputState(null);
    const newList: Checklist = {
      id: `cl_${Date.now()}`,
      title,
      category: 'Custom',
      icon: newListIcon,
      sections: [{ id: 's1', title: 'To Do', items: [] }, { id: 's2', title: 'Done', items: [] }]
    };
    setRegistry(prev => ({ ...prev, checklists: [...prev.checklists, newList] }));
    setInputState(null);
    setSelectedListId(newList.id);
  };

  const updateItem = (listId: string, sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setRegistry(prev => ({
      ...prev,
      checklists: prev.checklists.map(l => l.id !== listId ? l : {
        ...l,
        sections: l.sections.map(s => s.id !== sectionId ? s : {
          ...s,
          items: s.items.map(i => i.id !== itemId ? i : { ...i, ...updates })
        })
      })
    }));
  };

  // --- Renders ---

  const renderCard = (listId: string, sectionId: string, item: ChecklistItem) => {
    return (
      <div key={item.id} className="group bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition-all shadow-sm relative animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-2 mb-2">
           <div className="flex-1 font-medium text-zinc-200 text-sm">{item.label}</div>
           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editMode ? (
                  <button onClick={() => setRegistry(prev => ({...prev, checklists: prev.checklists.map(l => l.id !== listId ? l : { ...l, sections: l.sections.map(s => s.id !== sectionId ? s : { ...s, items: s.items.filter(i => i.id !== item.id) }) }) }))} className="text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button>
                ) : (
                  <button onClick={() => setInputState({ type: 'note', listId, sectionId, itemId: item.id })} className="text-zinc-500 hover:text-yellow-500"><Edit2 size={14} /></button>
                )}
           </div>
        </div>

        {/* Content Body based on Type */}
        <div className="space-y-2">
            
            {/* Image Preview */}
            {item.imageUrl && (
                <div className="relative rounded overflow-hidden aspect-video bg-black group/img">
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                    <button onClick={() => setInputState({ type: 'image', listId, sectionId, itemId: item.id })} className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">Change Image</button>
                </div>
            )}

            {/* Note Type */}
            {item.type === 'note' && (
                <div className="flex items-center gap-2">
                    <button onClick={() => updateItem(listId, sectionId, item.id, { isCompleted: !item.isCompleted })} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.isCompleted ? 'bg-green-600 border-green-600 text-white' : 'border-zinc-600 bg-zinc-950'}`}>
                        {item.isCompleted && <Check size={10} />}
                    </button>
                    <span className="text-xs text-zinc-500">{item.isCompleted ? 'Completed' : 'Pending'}</span>
                </div>
            )}

            {/* Level Type (Counter) */}
            {item.type === 'level' && (
                 <div className="bg-zinc-950 rounded p-2 border border-zinc-800">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Level / Tier</span>
                        <span className="text-xs font-mono text-white">{item.currentValue} <span className="text-zinc-600">/ {item.maxValue}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => updateItem(listId, sectionId, item.id, { currentValue: Math.max(0, (item.currentValue || 0) - 1) })} className="w-6 h-6 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-400">-</button>
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${((item.currentValue || 0) / (item.maxValue || 10)) * 100}%` }} />
                        </div>
                        <button onClick={() => updateItem(listId, sectionId, item.id, { currentValue: Math.min((item.maxValue || 10), (item.currentValue || 0) + 1) })} className="w-6 h-6 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-400">+</button>
                    </div>
                 </div>
            )}

            {/* Hero Type */}
            {item.type === 'hero' && (
                <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded border border-zinc-800">
                    <User size={14} className="text-zinc-500" />
                    <select 
                        value={item.linkedHeroId} 
                        onChange={(e) => updateItem(listId, sectionId, item.id, { linkedHeroId: e.target.value })}
                        className="bg-transparent text-xs text-zinc-300 w-full outline-none"
                    >
                        {registry.heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
            )}

            {/* Notes Field */}
            {item.notes && (
                <div className="text-xs text-zinc-500 bg-yellow-900/10 border-l-2 border-yellow-700 pl-2 py-1">
                    {item.notes}
                </div>
            )}
            
            {/* Tools Footer */}
            <div className="flex justify-end gap-2 border-t border-zinc-800/50 pt-2 mt-2">
                <button 
                  onClick={() => setInputState({ type: 'image', listId, sectionId, itemId: item.id })} 
                  className={`text-[10px] flex items-center gap-1 hover:text-white ${item.imageUrl ? 'text-blue-400' : 'text-zinc-600'}`}
                >
                    <ImageIcon size={12} /> {item.imageUrl ? 'Edit Img' : 'Add Img'}
                </button>
            </div>
        </div>

        {/* Inline Editors */}
        {inputState?.itemId === item.id && (
          <div className="absolute inset-0 z-10 bg-zinc-900 p-2 flex items-center justify-center">
             <div className="w-full">
                <InlineInput 
                value={inputState.type === 'note' ? item.notes : item.imageUrl} 
                placeholder={inputState.type === 'note' ? "Note..." : "Paste URL or Upload"}
                allowFile={inputState.type === 'image'}
                onSave={(val: string) => {
                    updateItem(listId, sectionId, item.id, inputState.type === 'note' ? { notes: val } : { imageUrl: val });
                    setInputState(null);
                }}
                onCancel={() => setInputState(null)} 
                />
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 bg-zinc-950">
      
      {/* --- Sidebar List Selector --- */}
      <div className={`border-r border-zinc-900 bg-zinc-950 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Collections</span>
            <button onClick={() => setInputState({ type: 'list-create' })} className="text-zinc-400 hover:text-white"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {registry.checklists.map(list => (
                <button 
                    key={list.id} 
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedListId === list.id ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                >
                    <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                        {getListIcon(list.icon)}
                    </div>
                    <div className="flex-1 truncate text-sm font-medium">{list.title}</div>
                    {selectedListId === list.id && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </button>
            ))}
        </div>
      </div>

      {/* --- Main Board View --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20">
             <div className="flex items-center gap-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-white"><Columns size={20} /></button>
                 {selectedList ? (
                     <div>
                         <h2 className="text-xl font-bold text-white leading-none">{selectedList.title}</h2>
                         <span className="text-xs text-zinc-500">{selectedList.category}</span>
                     </div>
                 ) : (
                     <span className="text-zinc-500">Select a list</span>
                 )}
             </div>
             {selectedList && (
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditMode(!editMode)} icon={editMode ? Check : Edit2}>{editMode ? 'Done' : 'Edit'}</Button>
                    <Button variant="primary" size="sm" icon={Trash2} onClick={() => setConfirmState({ type: 'delete-list', listId: selectedList.id })} className="bg-red-900/50 hover:bg-red-900 border-none" />
                </div>
             )}
        </div>

        {selectedList ? (
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex h-full gap-6">
                    {/* Columns (Sections) */}
                    {selectedList.sections.map(section => (
                        <div key={section.id} className="w-80 flex-shrink-0 flex flex-col h-full bg-zinc-950/50 rounded-xl border border-zinc-900/50">
                            <div className="p-3 border-b border-zinc-900/50 flex justify-between items-center bg-zinc-900/30 rounded-t-xl">
                                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">{section.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="bg-zinc-800 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded-full">{section.items.length}</span>
                                    {editMode && <button onClick={() => setConfirmState({ type: 'delete-section', listId: selectedList.id, sectionId: section.id })} className="text-zinc-600 hover:text-red-500"><X size={14} /></button>}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {section.items.map(item => renderCard(selectedList.id, section.id, item))}
                                
                                {inputState?.type === 'item' && inputState.sectionId === section.id ? (
                                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-1 mb-2 bg-zinc-950 p-1 rounded">
                                            <button onClick={() => setNewItemType('note')} className={`flex-1 text-[10px] py-1 rounded ${newItemType === 'note' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Note</button>
                                            <button onClick={() => setNewItemType('level')} className={`flex-1 text-[10px] py-1 rounded ${newItemType === 'level' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Level</button>
                                            <button onClick={() => setNewItemType('hero')} className={`flex-1 text-[10px] py-1 rounded ${newItemType === 'hero' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Hero</button>
                                        </div>
                                        <InlineInput autoFocus placeholder="Enter label..." onSave={handleAddItem} onCancel={() => setInputState(null)} />
                                    </div>
                                ) : (
                                    <button onClick={() => setInputState({ type: 'item', listId: selectedList.id, sectionId: section.id })} className="w-full py-2 flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800 text-sm font-medium">
                                        <Plus size={16} /> Add Card
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Section Column */}
                    <div className="w-80 flex-shrink-0 h-full">
                        {inputState?.type === 'section' ? (
                             <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                                 <InlineInput autoFocus placeholder="New Column Title..." onSave={handleAddSection} onCancel={() => setInputState(null)} />
                             </div>
                        ) : (
                            <button onClick={() => setInputState({ type: 'section', listId: selectedList.id })} className="w-full h-12 flex items-center gap-2 px-4 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-300 border border-zinc-900 hover:border-zinc-800 transition-all">
                                <Plus size={20} />
                                <span className="font-medium">Add Column</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                <Layout size={64} className="mb-4 opacity-20" />
                <p>Create a collection to get started.</p>
                <Button className="mt-4" onClick={() => setInputState({ type: 'list-create' })}>Create Collection</Button>
            </div>
        )}

      </div>

      {/* --- MODALS --- */}

      <Modal isOpen={inputState?.type === 'list-create'} onClose={() => setInputState(null)} title="New Collection">
         <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Collection Title</label>
              <input 
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:border-red-500 outline-none" 
                placeholder="e.g. Chaos 8 Farming, Tower Upgrades"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(e.currentTarget.value) }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Icon</label>
              <IconPicker registry={registry} onSelect={(icon) => setNewListIcon(icon)} />
            </div>
         </div>
      </Modal>

      <ConfirmationModal 
        isOpen={!!confirmState} 
        onClose={() => setConfirmState(null)} 
        onConfirm={() => {
          if (confirmState?.type === 'delete-list') {
            setRegistry(prev => ({ ...prev, checklists: prev.checklists.filter(l => l.id !== confirmState.listId) }));
            setSelectedListId(null);
          } else if (confirmState?.type === 'delete-section') {
            setRegistry(prev => ({ ...prev, checklists: prev.checklists.map(l => l.id !== confirmState.listId ? l : { ...l, sections: l.sections.filter(s => s.id !== confirmState.sectionId) }) }));
          }
          setConfirmState(null);
        }} 
        title="Confirm Deletion" 
        message="Are you sure? This cannot be undone."
      />

    </div>
  );
};

// --- HEROES PAGE (Missing Component Added) ---

const HeroesPage = ({ registry }: { registry: DataRegistry }) => {
  const [search, setSearch] = useState('');
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(registry.heroes[0]?.id || null);
  const [preview, setPreview] = useState<{ type: 'ability' | 'defense', data: any } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredHeroes = registry.heroes.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.class.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!selectedHeroId && filteredHeroes[0]) {
      setSelectedHeroId(filteredHeroes[0].id);
    }
    if (selectedHeroId && !filteredHeroes.find(h => h.id === selectedHeroId)) {
      setSelectedHeroId(filteredHeroes[0]?.id || null);
    }
  }, [filteredHeroes, selectedHeroId]);

  const selectedHero = registry.heroes.find(h => h.id === selectedHeroId) || filteredHeroes[0];
  const heroName = selectedHero?.name?.toLowerCase();

  const heroAbilities = (registry.abilities || []).filter(a => (a.heroes || []).some(h => h.toLowerCase() === heroName));
  const heroDefenses = (registry.defenses || []).filter(d => {
    if ((d as any).heroId && (d as any).heroId === selectedHero?.id) return true;
    const heroField = (d as any).hero;
    return typeof heroField === 'string' && heroField.toLowerCase() === heroName;
  });

  useEffect(() => {
    if (!selectedHero) return;
    if (heroAbilities.length > 0) {
      setPreview({ type: 'ability', data: heroAbilities[0] });
    } else if (heroDefenses.length > 0) {
      setPreview({ type: 'defense', data: heroDefenses[0] });
    } else {
      setPreview(null);
    }
  }, [selectedHeroId, heroAbilities.length, heroDefenses.length, selectedHero]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><Users className="text-red-500" />Heroes</h1>
          <p className="text-zinc-400">Manage and view hero stats and equipment slots.</p>
        </div>
        <div className="w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="Search heroes..." />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredHeroes.map(hero => (
            <div key={hero.id} className={selectedHeroId === hero.id ? 'ring-2 ring-red-600 rounded-xl transition-all' : ''}>
              <HeroCard hero={hero} onClick={() => { setSelectedHeroId(hero.id); setDetailOpen(true); }} />
            </div>
        ))}
      </div>

      {filteredHeroes.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
            No heroes found matching your search.
        </div>
      )}

      <Modal isOpen={detailOpen && !!selectedHero} onClose={() => setDetailOpen(false)} title="Hero Details">
        {selectedHero && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full ${selectedHero.color} flex items-center justify-center overflow-hidden border border-white/10`}>
                {selectedHero.iconUrl ? <img src={selectedHero.iconUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedHero.name}</h2>
                <p className="text-sm text-zinc-500">{selectedHero.class}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Abilities</h3>
                  <span className="text-xs text-zinc-500">{heroAbilities.length} items</span>
                </div>
                {heroAbilities.length === 0 ? (
                  <div className="text-sm text-zinc-600">No abilities found for this hero.</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {heroAbilities.map((ab, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setPreview({ type: 'ability', data: ab })}
                        onClick={() => setPreview({ type: 'ability', data: ab })}
                        className={`w-14 h-14 rounded-lg border flex items-center justify-center bg-zinc-950 hover:border-red-700 transition-colors ${preview?.type === 'ability' && preview.data === ab ? 'border-red-600 ring-1 ring-red-900/60' : 'border-zinc-800'}`}
                      >
                        <img src={ab.iconUrl} alt={ab.name} className="w-10 h-10 object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Defenses</h3>
                  <span className="text-xs text-zinc-500">{heroDefenses.length} items</span>
                </div>
                {heroDefenses.length === 0 ? (
                  <div className="text-sm text-zinc-600">No defenses found for this hero.</div>
                ) : (
                <div className="flex flex-wrap gap-3">
                  {heroDefenses.map((def, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => setPreview({ type: 'defense', data: def })}
                      onClick={() => setPreview({ type: 'defense', data: def })}
                      className={`relative w-14 h-14 rounded-lg border flex items-center justify-center bg-zinc-950 hover:border-red-700 transition-colors ${preview?.type === 'defense' && preview.data === def ? 'border-red-600 ring-1 ring-red-900/60' : 'border-zinc-800'}`}
                    >
                      {def.iconUrl || (def as any).image_url ? (
                        <img src={def.iconUrl || (def as any).image_url} alt={(def as any).name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Shield size={18} className="text-zinc-500" />
                      )}
                      <span className="absolute -bottom-2 text-[10px] text-zinc-500 capitalize">{(def as any).defense_type || 'Unknown'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>

            <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950/70 min-h-[140px]">
              {preview ? (
                preview.type === 'ability' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={preview.data.iconUrl} className="w-10 h-10 object-contain" />
                      <div>
                        <div className="text-lg font-bold text-white">{preview.data.name}</div>
                        <div className="text-xs text-zinc-500">{preview.data.abilityType}</div>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">Mana: {preview.data.manaCost ?? '-'}</div>
                    {preview.data.damageType && <div className="text-sm text-zinc-400">Damage Type: {preview.data.damageType}</div>}
                    {preview.data.statusEffects?.length > 0 && <div className="text-sm text-zinc-400">Effects: {preview.data.statusEffects.join(', ')}</div>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {preview.data.iconUrl || (preview.data as any).image_url ? (
                        <img src={preview.data.iconUrl || (preview.data as any).image_url} className="w-10 h-10 object-contain" />
                      ) : <Shield size={20} className="text-zinc-500" />}
                      <div>
                        <div className="text-lg font-bold text-white">{preview.data.name}</div>
                        <div className="text-xs text-zinc-500">{(preview.data as any).defense_type || 'Defense'}</div>
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">Mana: {(preview.data as any).mana_cost || '-'}</div>
                    {(preview.data as any).damage_type && <div className="text-sm text-zinc-400">Damage Type: {(preview.data as any).damage_type}</div>}
                    {(preview.data as any).status_effects && <div className="text-sm text-zinc-400">Status: {(preview.data as any).status_effects}</div>}
                  </div>
                )
              ) : (
                <div className="text-sm text-zinc-600">Select an ability or defense to view details.</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const EncyclopediaPage = ({ registry }: { registry: DataRegistry }) => {
  const [activeTab, setActiveTab] = useState('abilities');
  const [search, setSearch] = useState('');
  const [heroFilter, setHeroFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'hero' | 'name'>('hero');

  const heroNameById = (id?: string) => registry.heroes.find(h => h.id === id)?.name || '';
  const heroIdFromName = (name?: string) => registry.heroes.find(h => h.name.toLowerCase() === (name || '').toLowerCase())?.id;
  const heroMatches = (id?: string, fallbackName?: string) => {
    if (heroFilter === 'all') return true;
    if (id === heroFilter) return true;
    const filterName = heroNameById(heroFilter).toLowerCase();
    return (!!fallbackName && fallbackName.toLowerCase() === filterName);
  };

  const filteredAbilities = (registry.abilities || [])
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .filter(a => {
      if (heroFilter === 'all') return true;
      return (a.heroes || []).some(hName => heroMatches(heroIdFromName(hName), hName));
    });
  const filteredDefenses = (registry.defenses || [])
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .filter(d => heroMatches((d as any).heroId, (d as any).hero));
  const filteredShards = (registry.shards || [])
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => heroMatches((s as Shard).heroId, (s as any).heroes?.[0]?.name));
  const filteredMods = (registry.mods || [])
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter(m => heroMatches((m as any).heroId, (m as any).hero));
  const filteredLinks = ((registry.links && registry.links.length ? registry.links : (linksData as any).resources) || [])
    .filter((l: any) => l.name.toLowerCase().includes(search.toLowerCase()) || (l.description || '').toLowerCase().includes(search.toLowerCase()) || (l.author || '').toLowerCase().includes(search.toLowerCase()));

  const sortItems = <T,>(items: T[], getHeroId: (item: T) => string | undefined, getName: (item: T) => string) => {
    const heroLookup = (id?: string) => heroNameById(id).toLowerCase();
    return [...items].sort((a, b) => {
      const aHero = heroLookup(getHeroId(a));
      const bHero = heroLookup(getHeroId(b));
      if (heroFilter !== 'all') {
        const aMatch = getHeroId(a) === heroFilter;
        const bMatch = getHeroId(b) === heroFilter;
        if (aMatch !== bMatch) return aMatch ? -1 : 1;
      }
      if (sortMode === 'hero' && aHero !== bHero) return aHero.localeCompare(bHero);
      return getName(a).toLowerCase().localeCompare(getName(b).toLowerCase());
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'abilities':
        const abilities = sortItems(
          filteredAbilities,
          (a: any) => (a.heroes || []).map((h: string) => heroIdFromName(h)).find(Boolean),
          (a: any) => a.name
        );
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(abilities).map((ability, index) => (
              <Card key={index} className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <img src={ability.iconUrl} alt={formatValue(ability.name)} className="w-12 h-12" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{formatValue(ability.name)}</h3>
                    <p className="text-sm text-zinc-400">{formatValue(ability.abilityType)}</p>
                    <p className="text-xs text-zinc-500">{formatValue((ability.heroes || []).join(', '))}</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex justify-between"><span>Mana</span><span>{formatValue(ability.manaCost)}</span></div>
                  <div className="flex justify-between"><span>Recharge</span><span>{formatValue(ability.recharge)}</span></div>
                  <div className="flex justify-between"><span>Damage Type</span><span>{formatValue(ability.damageType)}</span></div>
                  <div className="flex justify-between"><span>Damage Scalar</span><span>{formatValue(ability.damageScalar)}</span></div>
                  <div className="flex justify-between"><span>Status Effects</span><span>{formatValue((ability.statusEffects || []).join(', '))}</span></div>
                </div>
              </Card>
            ))}
          </div>
        );
      case 'defenses': {
        const defenses = sortItems(filteredDefenses, (d: any) => d.heroId, (d: any) => d.name);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {defenses.map((defense, index) => {
              const heroName = heroNameById((defense as any).heroId) || (defense as any).hero || 'Any';
              const defenseType = (defense as any).defense_type || 'Unknown';
              return (
                <Card key={index} className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 mb-4">
                    {defense.iconUrl || (defense as any).image_url ? (
                      <img src={defense.iconUrl || (defense as any).image_url} alt={formatValue(defense.name)} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Shield size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{formatValue(defense.name)}</h3>
                      <p className="text-sm text-zinc-400">{formatValue(heroName)}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">{formatValue(defenseType)}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex justify-between"><span>Mana</span><span>{formatValue((defense as any).mana_cost || defense.duCost || '0')}</span></div>
                    <div className="flex justify-between"><span>Damage Type</span><span>{(defense as any).damage_type || 'â€”'}</span></div>
                    <div className="flex justify-between"><span>Status</span><span>{(defense as any).status_effects || 'â€”'}</span></div>
                    <div className="flex justify-between"><span>Base Power</span><span>{formatValue((defense as any).base_def_power)}</span></div>
                    <div className="flex justify-between"><span>Base Health</span><span>{formatValue((defense as any).base_def_health)}</span></div>
                    <div className="flex justify-between"><span>Atk Rate</span><span>{(defense as any).base_atk_rate || '-'} → {(defense as any).max_atk_rate || '-'}</span></div>
                    <div className="flex justify-between"><span>Range</span><span>{(defense as any).base_range || '-'} → {(defense as any).max_range || '-'}</span></div>
                    <div className="flex justify-between"><span>Ascension</span><span>Power {formatValue((defense as any).asc_def_power)} / Health {formatValue((defense as any).asc_def_health)}</span></div>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      }
      case 'mods': {
        const mods = sortItems(filteredMods, (m: any) => m.heroId, (m: any) => m.name);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mods.map((mod, index) => {
              const heroName = heroNameById((mod as any).heroId) || (mod as any).hero || 'Any';
              const iconSrc = (mod as any).iconUrl || (mod as any).image || (mod as any).icons?.plain;
              return (
                <Card key={index} className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {iconSrc ? (
                      <img src={iconSrc} alt={formatValue(mod.name)} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Cpu size={18} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{formatValue(mod.name)}</h3>
                      <p className="text-sm text-zinc-400">{formatValue(heroName)}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">{formatValue((mod as any).type || 'Mod')}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex justify-between"><span>Source</span><span>{formatValue((mod as any).source || 'Unknown')}</span></div>
                    <div className="flex justify-between"><span>Slots</span><span>{formatValue((mod as any).compatibleSlots?.join(', ') || '-')}</span></div>
                  </div>
                  <div className="text-sm text-zinc-300 leading-snug">{formatValue(mod.description)}</div>
                </Card>
              );
            })}
          </div>
        );
      }
      case 'links': {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link, index) => (
              <Card key={index} className="flex flex-col gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{link.name}</h3>
                  <p className="text-sm text-zinc-400">By {link.author}</p>
                </div>
                <p className="text-sm text-zinc-300 leading-snug line-clamp-3">{link.description || 'No description'}</p>
                <a href={link.link} target="_blank" className="text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                  <ExternalLink size={14} /> Open
                </a>
              </Card>
            ))}
          </div>
        );
      }
      case 'shards': {
        const shards = sortItems(filteredShards, (s: Shard) => s.heroId, (s: Shard) => s.name);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {shards.map((shard, index) => {
              const heroesList = (shard as any).heroes || [];
              const heroName = heroNameById(shard.heroId) || heroesList[0]?.name || '';
              const sourceLabel = typeof shard.source === 'string' ? shard.source : (shard as any).source?.difficulty || 'Unknown';
              const rawSource = (shard as any).source;
              const difficultyIcon = rawSource && typeof rawSource === 'object' ? rawSource.difficultyIcon : undefined;
              const shardIcon = shard.iconUrl || heroesList[0]?.image;
              return (
                <Card key={index} className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {shardIcon ? (
                      <img src={shardIcon} alt={formatValue(shard.name)} className="w-12 h-12" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Shield size={18} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{formatValue(shard.name)}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        {difficultyIcon && <img src={difficultyIcon} className="w-4 h-4 object-contain" />}
                        <span>{formatValue(sourceLabel)}</span>
                      </div>
                      {heroName && <p className="text-xs text-zinc-500">{formatValue(heroName)}</p>}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex justify-between"><span>Upgrade Levels</span><span>{formatValue((shard as any).upgradeLevels)}</span></div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-zinc-500">Heroes</span>
                      <div className="text-xs text-zinc-300">
                        {formatValue(
                          heroesList
                            .map((h: any) => `${h.name || ''}${h.slot ? ` (${h.slot})` : ''}${h.gilded ? ` - ${h.gilded}` : ''}`)
                            .join('; ')
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300 leading-snug">{formatValue(shard.description)}</div>
                </Card>
              );
            })}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><BookOpen className="text-red-500" />Encyclopedia</h1>
          <p className="text-zinc-400">Browse all the data from the game.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            <div className="w-64">
              <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
            </div>
            <div className="flex gap-2">
              <ThemedSelect value={heroFilter} onChange={(e: any) => setHeroFilter(e.target.value)} className="min-w-[140px]">
                <option value="all">All Heroes</option>
                {registry.heroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </ThemedSelect>
              <ThemedSelect value={sortMode} onChange={(e: any) => setSortMode(e.target.value as 'hero' | 'name')} className="min-w-[140px]">
                <option value="hero">Sort by Hero</option>
                <option value="name">Sort by Name</option>
              </ThemedSelect>
            </div>
        </div>
      </div>
      <div className="flex border-b border-zinc-800 mb-6">
        <button onClick={() => setActiveTab('abilities')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'abilities' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-400 hover:text-white'}`}>Abilities</button>
        <button onClick={() => setActiveTab('defenses')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'defenses' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-400 hover:text-white'}`}>Defenses</button>
        <button onClick={() => setActiveTab('mods')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'mods' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-400 hover:text-white'}`}>Mods</button>
        <button onClick={() => setActiveTab('shards')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'shards' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-400 hover:text-white'}`}>Shards</button>
        <button onClick={() => setActiveTab('links')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'links' ? 'text-red-500 border-b-2 border-red-500' : 'text-zinc-400 hover:text-white'}`}>Links</button>
      </div>
      {renderContent()}
    </div>
  );
};



const SettingsPage = ({ onImport, onExport, setRegistry }: { onImport: (data: any) => void, onExport: () => void, setRegistry: React.Dispatch<React.SetStateAction<DataRegistry>> }) => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<string>('');



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;

    if (!files) return;



    setStatus('Reading files...');

    

    Array.from(files).forEach(file => {

      const reader = new FileReader();

      reader.onload = (e) => {

        try {

          const data = JSON.parse(e.target?.result as string);

          let type = 'unknown';

          

          if (file.name.includes('defenses') || (data.towers && Array.isArray(data.towers))) type = 'towers';

          else if (file.name.includes('shards') || (data.shards && Array.isArray(data.shards))) type = 'shards';

          else if (file.name.includes('mods') || (data.mods && Array.isArray(data.mods))) type = 'mods';

          else if (file.name.includes('materials')) type = 'towers'; 

          

          if (Array.isArray(data)) {

             if (data[0]?.hero) type = 'mods'; 

             if (data[0]?.upgradeLevels) type = 'shards'; 
             
             if (data[0]?.base_def_power) type = 'towers'; 

          }



          console.log(`Importing ${file.name} as ${type}`);

          onImport({ type, data, filename: file.name });

          setStatus(`Imported ${file.name}`);

        } catch (err) {

          console.error('JSON Parse Error', err);

          setStatus(`Error parsing ${file.name}`);

        }

      };

      reader.readAsText(file);

    });

  };



  return (

    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">

            <Settings className="text-red-500" />

            Settings

          </h1>

          <p className="text-zinc-400">Import and export your data.</p>

        </div>

      </div>

      <Card>

        <h3 className="text-lg font-bold text-white mb-2">Import Data</h3>

        <p className="text-zinc-400 text-sm mb-4">

          Import data from `.json` files. You can import towers, shards, and mods.

        </p>

        <div className="flex items-center gap-4">

          <Button

            variant="primary"

            icon={Upload}

            onClick={() => fileInputRef.current?.click()}

          >

            Select Files

          </Button>

          <input

            ref={fileInputRef}

            type="file"

            multiple

            accept=".json"

            className="hidden"

            onChange={handleFileUpload}

          />

          <span className="text-sm text-zinc-500">{status}</span>

        </div>

      </Card>

    </div>

  );

};



// --- APP & PERSISTENCE ---



export default function App() {

  const [activePage, setActivePage] = useState('checklists');

  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [registry, setRegistry] = useState<DataRegistry>(() => buildInitialRegistry());

   

  

   

    useEffect(() => {

   

      localStorage.setItem('dd2_planner_data', JSON.stringify(registry));

   

    }, [registry]);



  const handleDataImport = ({ type, data, filename }: any) => {

    setRegistry(prev => {

      const next = { ...prev };

      const getHeroIdByName = (name: string) => prev.heroes.find(h => h.name.toLowerCase() === name?.toLowerCase())?.id || 'unknown';



      if (type === 'towers' || filename.includes('defenses')) {

        const rawTowers = Array.isArray(data) ? data : (data.materials || []);

        const newTowers = rawTowers

          .filter((t: any) => t.defense_type === 'Tower' || t.base_def_power)

          .map((t: any) => ({

            id: `t_${Math.random().toString(36).substr(2,9)}`,

            name: t.name || t.material,

            duCost: parseInt(t.mana_cost) || 0,

            heroId: getHeroIdByName(t.hero),

            iconUrl: t.image_url || t.icons?.plain,

            stats: t

          }));

        next.towers = [...next.towers, ...newTowers];
        next.defenses = [...next.defenses, ...rawTowers.map((d: any) => normalizeDefense(d, prev.heroes))];

      }

      if (type === 'shards' || filename.includes('shards')) {

        const rawShards = Array.isArray(data) ? data : (data.shards || []);

        const newShards = rawShards.map((s: any) => normalizeShard(s, prev.heroes));

        next.shards = [...next.shards, ...newShards];

      }
      if (type === 'mods' || filename.includes('mods')) {
        const rawMods = Array.isArray(data) ? data : (data.mods || []);
        const newMods = rawMods.map((m: any) => normalizeMod(m, prev.heroes));
        next.mods = [...next.mods, ...newMods];
      }
      if (type === 'links' || filename.includes('links')) {
        const rawLinks = Array.isArray(data) ? data : (data.resources || []);
        const newLinks = rawLinks.map((l: any) => normalizeLink(l));
        next.links = [...next.links, ...newLinks];
      }

            if (filename.includes('abilities')) {

              next.abilities = data;

            }

            return next;

          });

        };



  const forceSave = () => {

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registry));

    const downloadAnchorNode = document.createElement('a');

    downloadAnchorNode.setAttribute("href", dataStr);

    downloadAnchorNode.setAttribute("download", "dd2_planner_backup.json");

    document.body.appendChild(downloadAnchorNode);

    downloadAnchorNode.click();

    downloadAnchorNode.remove();

  };



  const renderContent = () => {

    switch (activePage) {

      case 'maps': return <MapPlanner registry={registry} />;

      case 'gold': return <GoldCalculator />;

      case 'builds': return <BuildEditor registry={registry} setRegistry={setRegistry} />;

      case 'heroes': return <HeroesPage registry={registry} />; 

      case 'checklists': return <ChecklistsPage registry={registry} setRegistry={setRegistry} />;

      case 'encyclopedia': return <EncyclopediaPage registry={registry} />;

      case 'settings': return <SettingsPage onImport={handleDataImport} onExport={forceSave} setRegistry={setRegistry} />;

      default: return <HeroesPage registry={registry} />;

    }

  };



  return (

    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-red-900/30 selection:text-red-200">

      <Sidebar activePage={activePage} setPage={setActivePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-30">

          <div className="flex items-center gap-4 flex-1">

            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100"><Menu size={20} /></button>

            <div className="max-w-md w-full hidden md:block"><SearchInput value={searchQuery} onChange={setSearchQuery} /></div>

          </div>

          <div className="flex items-center gap-2">

            <Button variant="icon" icon={Save} onClick={forceSave} />

            <Button variant="primary" size="sm" icon={Plus} onClick={() => setActivePage('builds')}>Quick Add</Button>

          </div>

        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-black/20">{renderContent()}</main>

      </div>

    </div>

  );

}










