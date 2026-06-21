import { JournalEntry, OpenDecision, Reflection } from './types';

/**
 * Mock personal corpus for the scaffold — a slice of Maya's mindfulness journal,
 * mirroring the backend's data.md demo. Lets every screen render real-feeling
 * content with no model or network.
 */

export const journalEntries: JournalEntry[] = [
  {
    id: 'j-1',
    date: '2026-06-19',
    dayLabel: 'Fri',
    note: 'Left the phone in the kitchen overnight and actually slept. Morning sit felt easy. Took a real lunch break and walked outside.',
    mood: 8,
    moodTag: 'good',
    sleepHours: 7.5,
    meditationMin: 20,
    stress: 3,
    gratitude: 'A walk without my phone.',
  },
  {
    id: 'j-2',
    date: '2026-06-18',
    dayLabel: 'Thu',
    note: 'Apologized to my partner for last week. Felt lighter afterward. Meditation is making me notice irritation before it spills out.',
    mood: 8,
    moodTag: 'good',
    sleepHours: 7.5,
    meditationMin: 18,
    stress: 3,
    gratitude: 'A long, honest talk.',
  },
  {
    id: 'j-3',
    date: '2026-06-17',
    dayLabel: 'Wed',
    note: 'Slipped — late night, no sit. Still, I caught my stress rising and took three slow breaths instead of reacting. Small win inside an off day.',
    mood: 5,
    moodTag: 'okay',
    sleepHours: 6,
    meditationMin: 0,
    stress: 7,
    gratitude: 'Caught myself before snapping.',
  },
  {
    id: 'j-4',
    date: '2026-06-16',
    dayLabel: 'Tue',
    note: 'Steady, productive morning. The link is undeniable: on days I meditate AND sleep 7+ hours, my mood is high and stress is low.',
    mood: 7,
    moodTag: 'good',
    sleepHours: 7,
    meditationMin: 12,
    stress: 4,
    gratitude: 'A quiet morning.',
  },
  {
    id: 'j-5',
    date: '2026-06-15',
    dayLabel: 'Mon',
    note: 'Three Mondays in a row that did not feel like a crash landing. The earlier wake-up plus meditation is the single biggest change.',
    mood: 7,
    moodTag: 'good',
    sleepHours: 7,
    meditationMin: 15,
    stress: 4,
    gratitude: 'The early-alarm habit is sticking.',
  },
  {
    id: 'j-6',
    date: '2026-06-14',
    dayLabel: 'Sun',
    note: 'Best day in ages. Movement, nature, people, sleep. Stress basically gone. Being outside does as much for me as the cushion does.',
    mood: 9,
    moodTag: 'great',
    sleepHours: 8.5,
    meditationMin: 25,
    stress: 2,
    gratitude: 'Hiked to the lookout with friends.',
  },
];

export const latestReflection: Reflection = {
  id: 'r-1',
  title: 'A gentle week in review',
  period: 'This week',
  generatedAt: '2026-06-19T22:00:00Z',
  summary:
    'You are trending calmer and more rested than last week. Your steadiest days shared three things: a short morning meditation, seven-plus hours of sleep, and some time outside or with people.',
  insights: [
    'Your best days (Sun 9/10, Thu & Fri 8/10) all had 7.5h+ sleep and a morning sit.',
    'The one rough day (Wed) followed a late night with no meditation — a pattern you noticed yourself.',
    'Leaving your phone out of the bedroom shows up right before your best-sleep nights.',
  ],
  suggestions: [
    'Protect the early-alarm + morning sit — it is doing the heavy lifting.',
    'Keep the phone charging outside the bedroom on weeknights.',
    'When a day slips, the three-breaths reset is working — lean on it without judgment.',
  ],
};

export const openDecisions: OpenDecision[] = [
  {
    id: 'd-1',
    question: 'Where should I eat tonight?',
    context: 'Low energy, want something comforting but not too heavy. Near home.',
    factors: ['Comfort vs. health', 'Short wait', 'Walking distance'],
  },
  {
    id: 'd-2',
    question: 'Should I keep the 6am wake-up on weekends?',
    context: 'Weekday early rises are helping, but weekends feel like they need rest.',
    factors: ['Consistency', 'Rest & recovery', 'How I feel by Sunday night'],
  },
];
