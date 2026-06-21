# DecisionTwin Mobile — Architecture Plan

**A fully-local, private, always-on decision companion**

_Design proposal — no code. Prepared for Gabe._

---

## 1. Goal in one sentence

Take the existing DecisionTwin pipeline (`spec → agent → report`, pluggable
`DataSource`, extensible tool list) and run the whole loop **on the phone** with an
on-device LLM, so the user gets a private, voice-first decision companion that learns
from ongoing conversation and phone context — with exactly **one** narrow network edge
for place lookups.

---

## 2. Design principles (the non-negotiables)

- **Local by default.** The model, the memory, the agent loop, and all reasoning live
  on-device. Nothing about the user leaves the phone.
- **One network boundary, clearly fenced.** Place data (restaurants, hours, ratings)
  physically cannot live on-device. That single lookup is the *only* outbound call, and
  it carries **only a coarse location + a generic query** — never personal memory, never
  conversation text.
- **Reuse, don't rewrite.** The three abstractions we already built map cleanly onto
  mobile. We are swapping implementations behind stable interfaces, not redesigning.
- **Graceful offline.** The companion is fully useful with the network off; place lookup
  degrades to cache or a deep-link handoff.

---

## 3. How the current architecture maps onto mobile

The existing repo already has the right seams. Each one survives the port:

**`data.py` — `DataSource` ABC + `search(query)`**
→ becomes a **registry of local DataSources**. Today there is one Markdown source. On
mobile we register several (memory, location, time/sensors, places) behind the same
`search`-style interface. Callers never change.

**`agent.py` — `TOOLS` list + `TOOL_HANDLERS` + `run_agent()`**
→ the agent loop is unchanged in *shape*; we swap the Anthropic client for an
**on-device runtime adapter**, and grow the tool list. The `TOOLS`/`TOOL_HANDLERS`
pattern is exactly how we add `recall_memory`, `get_location`, `find_places`, etc.

**`synthesis.py` — `spec → run_agent → report.md`**
→ generalizes into two flows: (a) the **interactive companion loop** (each user turn is a
mini-spec), and (b) a **periodic reflection job** that runs a stored "spec" (e.g. *"review
this week and surface decision patterns"*) and writes a private report into memory —
the direct descendant of `report.md`.

| Today (desktop) | Mobile equivalent | Stays local? |
|---|---|---|
| `MarkdownFileSource` | `MemorySource` (journal + facts + decisions) | ✅ fully local |
| (n/a) | `LocationSource` (GPS, geofence, motion) | ✅ fully local |
| (n/a) | `TimeSensorSource` (clock, calendar, battery, activity) | ✅ fully local |
| (n/a) | `PlacesSource` | 🌐 **the one network edge** (cache-first) |
| Anthropic API in `agent.py` | On-device Qwen runtime adapter | ✅ fully local |
| `spec.md` → `report.md` | Reflection job → memory report | ✅ fully local |

---

## 4. Recommended tech stack

**App shell: iOS first, cross-platform-ready, native modules where it matters.**

- **iOS is the primary target** (per Gabe's decision). Build with **React Native** so a
  later Android port is a stretch, not a rewrite — but optimize the first release for
  iOS: Metal-accelerated inference, BGTaskScheduler background work, and
  AVSpeechSynthesizer TTS. Native Swift modules where the bridge needs to touch
  CoreLocation, background scheduling, or the inference runtime.
- **On-device LLM runtime:** **llama.cpp** (via a thin native bridge) as the primary
  choice, with **MLC LLM** as the alternative where GPU/NPU acceleration is available.
  - llama.cpp: broadest model/quant support, GGUF ecosystem, runs CPU-only, easy to
    embed. Best for "works everywhere" prototyping.
  - MLC LLM: better hardware acceleration (Metal / OpenCL / NPU), better battery and
    latency on supported devices. Best for the polished build.
  - Decision: **prototype on llama.cpp, benchmark MLC on target hardware, keep the
    runtime behind an adapter so we can switch.**
- **Voice:**
  - STT: on-device **whisper.cpp** (tiny/base, quantized) — keeps voice local.
  - TTS: platform native (AVSpeechSynthesizer on iOS, Android TextToSpeech) — already
    on-device, zero network.
- **Local storage / memory:**
  - **SQLite** (structured: daily metrics, decisions, facts, timestamps) +
  - **sqlite-vec / a small on-device vector index** for semantic recall over journal
    text, embedded with a tiny local embedding model.
  - Everything inside the OS secure sandbox; optional encryption-at-rest via the
    platform keystore.
- **Place lookup (the network edge):** **OpenStreetMap / Overpass** as the default
  provider (free, no API key, no ToS entanglement), behind a single `PlacesSource`
  adapter. **Deep-link-to-Maps** (open Apple Maps / Google Maps with a query) is the
  fallback. Google Places and Apple MapKit are explicitly **dropped as defaults** — the
  adapter boundary means either could be slotted in later without touching callers.

---

## 5. Component architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  APP SHELL (React Native, iOS-first)         │
│   Voice-first UI · text fallback · notifications · settings  │
└───────────────┬───────────────────────────────┬─────────────┘
                │                                 │
        ┌───────▼────────┐               ┌────────▼─────────┐
        │  Capture Loop  │               │  Reflection Job  │
        │ (always-on)    │               │ (periodic spec)  │
        └───────┬────────┘               └────────┬─────────┘
                │            AGENT CORE            │
        ┌───────▼─────────────────────────────────▼─────────┐
        │  agent.py (ported): run_agent() + TOOLS/HANDLERS   │
        │  ── swaps Anthropic client for ──                  │
        │  ┌──────────────────────────────────────────────┐ │
        │  │  LocalModelRuntime adapter                    │ │
        │  │  (llama.cpp / MLC) — Qwen2.5 0.5B–1.5B (Q4)   │ │
        │  └──────────────────────────────────────────────┘ │
        └───────┬───────────────────────────────────────────┘
                │  tool calls
   ┌────────────┼───────────────┬───────────────┬────────────────┐
   ▼            ▼               ▼               ▼                ▼
┌────────┐ ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐
│Memory  │ │Location  │  │Time/Sensor │  │  (reasoning │  │ PlacesSource │
│Source  │ │Source    │  │Source      │  │   only)     │  │ 🌐 NETWORK   │
│SQLite +│ │GPS/geo/  │  │clock/cal/  │  │             │  │ cache-first  │
│vector  │ │motion    │  │battery/act │  │             │  │ deep-link alt│
└────────┘ └──────────┘  └────────────┘  └─────────────┘  └──────┬───────┘
  LOCAL       LOCAL          LOCAL                                 │
══════════════════════════════════════════════════════════ THE ONLY EDGE
                                                                   ▼
                                                    Places API / Maps app
                                                 (sends: coarse loc + query
                                                  only — never personal data)
```

All DataSources implement the same interface descended from today's `DataSource` ABC.
The agent reaches them only through registered tools, so the network boundary is
enforced in exactly one place: the `PlacesSource` / `find_places` tool.

---

## 6. DataSource boundaries — local vs. the single network edge

### Fully local (never touches the network)
- **MemorySource** — the user's journal entries, tracked metrics, stated preferences,
  and past decisions. The mobile heir to `MarkdownFileSource`. Read + append.
- **LocationSource** — current GPS, geofence/place-category ("at home", "near
  downtown"), motion/activity state. Used to *form* a query, not to transmit identity.
- **TimeSensorSource** — time of day, day of week, calendar free/busy, battery, recent
  activity. Pure context, never leaves the device.

### The one network edge — `PlacesSource`
- **Provider:** **OpenStreetMap via the Overpass API** — free, **no API key**, no
  per-user account. Because there's no key, there's no provider-side identity to leak;
  the request is an anonymous geographic query.
- **What it does:** given a coarse location + a generic query (e.g. *"ramen, open now,
  within 1km"*), runs an Overpass query and returns nearby places with hours/tags. (Note:
  OSM coverage of hours/ratings is uneven; where data is missing the agent says so and
  can offer the deep-link handoff instead.)
- **What it sends:** a bounding box / radius + amenity tags. **Nothing else.** No name, no
  memory, no conversation, no account identifiers — Overpass requires none.
- **Privacy controls baked in:**
  - **Location coarsening** — round/jitter coordinates to a neighborhood, not a precise
    point, before the call.
  - **Query sanitization** — the agent constructs the outbound query from a fixed
    template; personal text can never be appended.
  - **Explicit consent gate** — the first place lookup (and optionally each one) shows a
    clear "this will check the network for nearby places" prompt.
- **Caching / offline:**
  - **Local cache** of recently/frequently seen places keyed by geo-cell + category,
    with TTL on volatile fields (hours, "open now"). Lets the companion answer
    "where did I like eating near here?" fully offline from memory + cache.
  - **Deep-link handoff mode** — instead of calling an API, open the system Maps app
    with the query. Zero API key, zero data stored by us, and the OS handles the lookup.
  - **Hard offline** — if no network and no cache, the agent falls back to MemorySource
    ("last time near here you chose X") and says so honestly.

---

## 7. The always-on capture + reflection loop

Two cooperating loops, both built on the ported agent core.

**A. Capture loop (foreground + light background)**
1. User talks (voice) or types. STT runs locally (whisper.cpp).
2. Agent responds conversationally and, crucially, **asks clarifying decision
   questions** ("what matters more right now — speed or something healthy?").
3. Salient facts, preferences, metrics, and decisions are **appended to MemorySource**
   (structured rows + embedded text). This is the on-device analogue of growing
   `data.md`.
4. Context (location/time/sensors) is attached to each entry so later recall is
   situational.

**B. Reflection job (periodic — user-configurable, defaults to nightly)**
1. Loads a stored **spec** ("review the recent period; surface patterns, recurring
   decision factors, and gentle suggestions") — the direct heir of `spec.md`.
2. Runs `run_agent()` over MemorySource locally.
3. Writes a **private report into memory** and optionally surfaces a short, supportive
   notification ("You decide better on nights you sleep 7h+ — want a wind-down nudge?").
   This is `report.md`, mobile edition.

**Battery/thermal realism:** the local model is woken on-demand for turns and for the
scheduled reflection only — not held resident. Background work uses iOS BGTaskScheduler
(WorkManager on a later Android port) to stay within platform limits.

---

## 8. On-device model choice & tradeoffs

**Decision: ship on Qwen2.5-0.5B-Instruct (Q4), with a documented upgrade path to 1.5B.**
4-bit quantized (Q4_K_M GGUF or MLC equivalent).

- **0.5B (Q4) — the starting point:** ~300–400MB, runs on almost any modern iPhone, very
  low latency and battery. Good enough for conversational capture, slot-filling, and
  structured tool calls. **We ship this first** for the widest device support and to
  de-risk the concept on real hardware.
- **1.5B (Q4) — the upgrade path:** ~900MB–1.1GB, noticeably better reasoning and
  instruction-following, still feasible on modern iPhones. **If the 0.5B underperforms**
  on reasoning or tool-call reliability in real use, we move up.
  - **Crucially, this is a config swap, not a rewrite.** Because the model sits behind the
    `LocalModelRuntime` adapter (the same seam that replaced the Anthropic client in
    `agent.py`), upgrading means pointing the adapter at a different GGUF and bumping a
    memory/threads setting. No agent-loop, DataSource, or UI code changes.
  - Plan to gate this behind device capability (RAM/chip) so older phones stay on 0.5B
    while capable ones can opt into 1.5B.
- **Why Qwen2.5 small/instruct:** strong instruction-following and tool/JSON behavior at
  tiny sizes, permissive licensing, broad GGUF/MLC availability.

**Tradeoffs to manage:**
- **Reasoning ceiling.** Small models drift on long multi-step reasoning. Mitigate by
  keeping each agent turn *narrow* (tool-assisted, short context) rather than asking for
  big essays — which fits the companion's turn-by-turn nature anyway.
- **Tool-call reliability.** Constrain outputs with grammars/JSON schema enforcement
  (llama.cpp GBNF / structured decoding) so `TOOL_HANDLERS` always receive valid args.
- **Context window.** Don't dump all memory in; rely on **vector recall** to fetch only
  the relevant slices into the prompt.
- **Quality floor.** Provide a clearly-labeled optional "use a bigger model" mode *only*
  if the user explicitly opts into a local larger model — never a silent cloud fallback.

---

## 9. Phased build roadmap

**Phase 0 — Spike the runtime (de-risk the core)**
- Embed llama.cpp + Qwen2.5-0.5B-Q4 in a bare **React Native iOS** app. Prove: load
  model, run a prompt, measure latency/battery/thermals on 2–3 real iPhones (a mid-range
  and a recent one). Decide llama.cpp vs MLC. **Sanity-check that 0.5B clears the
  reasoning/tool-call bar** — if it doesn't, exercise the 1.5B upgrade path (adapter
  config swap) here and confirm it still fits.

**Phase 1 — Port the agent core**
- Bring `agent.py`'s `run_agent()` + `TOOLS`/`TOOL_HANDLERS` over; back it with the
  LocalModelRuntime adapter. Add structured/JSON-constrained tool calling. One tool:
  `recall_memory`. Text-only UI. This is "DecisionTwin, but the model is on the phone."

**Phase 2 — Memory + capture loop**
- Implement `MemorySource` (SQLite + vector index). Build the capture loop: text in →
  agent asks decision questions → append to memory. Port a stored spec → run the
  **reflection job** → write a private report. (Mirrors today's `spec → report`.)

**Phase 3 — Voice-first**
- Add whisper.cpp STT + **AVSpeechSynthesizer TTS (iOS native)**. Make voice the primary
  modality, text the fallback.

**Phase 4 — Local context sources**
- Add `LocationSource` and `TimeSensorSource` as DataSources/tools. Context now enriches
  both capture and recall ("near here, in the evening…").

**Phase 5 — The place-lookup edge (restaurant use case)**
- Implement `PlacesSource` against **OSM/Overpass** with: cache-first lookup, location
  coarsening, query sanitization, consent gate, and a **deep-link-to-Maps** fallback (for
  when Overpass data is thin or the network is down). Ship the end-to-end "where should I
  eat nearby?" flow. Audit that this Overpass call is the *only* outbound call.

**Phase 6 — Always-on hardening**
- Background scheduling for reflection, notifications/nudges, encryption-at-rest,
  battery/thermal tuning, and a privacy dashboard ("what's stored, what (if anything)
  ever leaves the phone, and when").

**Prototype first:** Phases 0–2. If a 0.5B model can run a reliable tool-calling agent
loop over a local memory store on real hardware, the whole product is viable; everything
after is additive.

---

## 10. Decisions (resolved with Gabe)

- ✅ **Primary platform — iOS first.** React Native shell optimized for iOS (Metal
  inference, BGTaskScheduler, AVSpeechSynthesizer); kept cross-platform-ready so Android
  is a later port, not a rewrite.
- ✅ **Place data provider — OpenStreetMap / Overpass** (free, no API key) as the default
  source, with **deep-link-to-Maps** as the fallback. Google Places and Apple MapKit are
  dropped as defaults; the `PlacesSource` adapter keeps them slot-in-able later.
- ✅ **Model footprint — ship 0.5B (Q4)** for widest support and de-risking, with a
  **documented upgrade path to 1.5B** if it underperforms. Because the model lives behind
  the `LocalModelRuntime` adapter, the upgrade is a **config swap, not a rewrite**.
- ✅ **Reflection cadence — user-configurable, defaulting to nightly.**
