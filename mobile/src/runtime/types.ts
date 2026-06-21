/**
 * LocalModelRuntime — the seam that, per the mobile architecture plan, replaces
 * the Anthropic client from the Python `agent.py`. The UI talks ONLY to this
 * interface, so swapping the stub for a real on-device runtime (llama.cpp / MLC
 * running Qwen2.5 0.5B → 1.5B) is a config change, not a rewrite.
 *
 * Nothing here makes a network call. The single network boundary in the product
 * is the future PlacesSource (OSM/Overpass) — not the model.
 */

export type ChatRole = 'user' | 'companion';

export type ChatTurn = {
  id: string;
  role: ChatRole;
  text: string;
  at: number; // epoch ms
};

/** Identifies which on-device model is loaded behind the adapter. */
export type ModelId = 'qwen2.5-0.5b-q4' | 'qwen2.5-1.5b-q4';

export type ModelInfo = {
  id: ModelId;
  label: string;
  approxSizeMb: number;
  note: string;
};

export interface LocalModelRuntime {
  /** Which model is active (mirrors the runtime-adapter config swap in the plan). */
  readonly model: ModelInfo;

  /** True once weights are loaded into memory and ready to infer. */
  isReady(): boolean;

  /** Load weights. The real impl warms llama.cpp/MLC; the stub resolves instantly. */
  load(): Promise<void>;

  /**
   * Produce the companion's next reply given the running conversation. The real
   * impl runs the agent loop (tool calls into local DataSources) on-device.
   */
  respond(history: ChatTurn[]): Promise<string>;
}
