import {
  ChatTurn,
  LocalModelRuntime,
  ModelId,
  ModelInfo,
} from './types';

const MODELS: Record<ModelId, ModelInfo> = {
  'qwen2.5-0.5b-q4': {
    id: 'qwen2.5-0.5b-q4',
    label: 'Qwen2.5 0.5B (Q4)',
    approxSizeMb: 380,
    note: 'Default — widest device support, very low battery cost.',
  },
  'qwen2.5-1.5b-q4': {
    id: 'qwen2.5-1.5b-q4',
    label: 'Qwen2.5 1.5B (Q4)',
    approxSizeMb: 1024,
    note: 'Upgrade path — stronger reasoning, needs a newer iPhone.',
  },
};

/**
 * Stub runtime for the front-end scaffold. Returns warm, plausible companion
 * replies that nudge the user to reflect, WITHOUT any real inference or network.
 * Replace with a llama.cpp/MLC-backed implementation of LocalModelRuntime; the
 * UI does not change.
 */
export class MockModelRuntime implements LocalModelRuntime {
  readonly model: ModelInfo;
  private ready = false;

  constructor(modelId: ModelId = 'qwen2.5-0.5b-q4') {
    this.model = MODELS[modelId];
  }

  isReady() {
    return this.ready;
  }

  async load() {
    // Real impl: memory-map weights into llama.cpp/MLC. Stub: pretend-warm.
    await delay(300);
    this.ready = true;
  }

  async respond(history: ChatTurn[]): Promise<string> {
    await delay(450 + Math.random() * 400); // mimic on-device latency
    const last = [...history].reverse().find((t) => t.role === 'user')?.text ?? '';
    return pickReply(last, history.length);
  }
}

export function availableModels(): ModelInfo[] {
  return Object.values(MODELS);
}

function pickReply(userText: string, turnCount: number): string {
  const t = userText.toLowerCase();

  if (/(eat|food|lunch|dinner|hungry|restaurant)/.test(t)) {
    return "Let's figure out food. What matters most right now — something quick, something comforting, or something healthy? I can look at places near you when you're ready (that's the only time I ever touch the network, and I only send a rough location).";
  }
  if (/(tired|exhausted|sleep|cant sleep|can't sleep)/.test(t)) {
    return 'It sounds like rest is on your mind. Looking back, your calmer days followed nights with seven-plus hours. Want to set a gentle wind-down reminder for tonight?';
  }
  if (/(stress|anxious|overwhelmed|stressed)/.test(t)) {
    return 'That sounds like a lot to carry. Before we problem-solve — what would feel like the smallest next step that you could actually take today?';
  }
  if (/(decide|decision|choose|should i|torn)/.test(t)) {
    return "Let's think it through together. What are the two options as you see them, and which one are you leaning toward when you trust your gut?";
  }
  if (turnCount <= 1) {
    return "I'm here. Tell me what's on your mind — a decision you're weighing, or just how the day is going.";
  }
  return "Thanks for sharing that. I've noted it. What feels most important about it to you right now?";
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
