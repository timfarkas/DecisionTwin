/**
 * Local data types — the mobile heirs of the Python `DataSource` corpus.
 * In the real app these are rows in on-device SQLite + a vector index; here
 * they back the UI with in-memory mock data.
 */

export type Mood = 'low' | 'okay' | 'good' | 'great';

export type JournalEntry = {
  id: string;
  date: string; // ISO date
  dayLabel: string; // e.g. "Mon"
  note: string;
  mood: number; // 1–10
  moodTag: Mood;
  sleepHours: number;
  meditationMin: number;
  stress: number; // 1–10
  gratitude: string;
};

export type Reflection = {
  id: string;
  title: string;
  period: string; // e.g. "This week"
  generatedAt: string;
  summary: string;
  insights: string[];
  suggestions: string[];
};

export type OpenDecision = {
  id: string;
  question: string;
  context: string;
  factors: string[];
};
