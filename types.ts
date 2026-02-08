export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: 'roblox' | 'heart' | 'movie' | 'flower';
}

export interface LetterState {
  loading: boolean;
  content: string | null;
  error: string | null;
}

export interface User {
  name: string;
  avatar: string;
}
