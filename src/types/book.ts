export type BookStatus = 'to-read' | 'reading' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  thumbnail?: string;
  progress: number;
}

export interface UserStats {
  streak: number;
  lastDate: string | null;
}