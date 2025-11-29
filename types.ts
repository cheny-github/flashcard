
export type Proficiency = 'new' | 'known' | 'unknown';

export interface Card {
  id: string;
  category: string;
  question: string;
  answer: string;
  details?: string[]; // Optional bullet points for complex answers
  tags?: string[]; // Optional tags for organization
  proficiency?: Proficiency;
}

export type ViewMode = 'study' | 'list' | 'editor';

export interface AppState {
  cards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  mode: ViewMode;
}
