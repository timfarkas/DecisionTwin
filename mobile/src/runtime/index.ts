export type {
  LocalModelRuntime,
  ChatTurn,
  ChatRole,
  ModelId,
  ModelInfo,
} from './types';
export { MockModelRuntime, availableModels } from './mockRuntime';

import { MockModelRuntime } from './mockRuntime';
import type { LocalModelRuntime } from './types';

/**
 * The app's single runtime instance. Today it's the mock; later, select a
 * llama.cpp/MLC implementation here based on device capability + the user's
 * model choice in Settings. Callers import `runtime`, never a concrete class.
 */
export const runtime: LocalModelRuntime = new MockModelRuntime('qwen2.5-0.5b-q4');
