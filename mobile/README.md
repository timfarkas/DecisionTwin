# DecisionTwin — iOS App (front-end scaffold)

A private, always-on, on-device **decision companion**. This folder is the
**iOS-first React Native (Expo)** front end described in
[`../.reports/mobile-architecture-plan.md`](../.reports/mobile-architecture-plan.md).

This is **UI scaffolding**. The on-device LLM (Qwen2.5 via llama.cpp/MLC) is
**mocked** behind a `LocalModelRuntime` adapter (`src/runtime/`), so the whole app
runs and is reviewable today with no model, no API key, and no network.

---

## What's here

```
mobile/
├─ app/                      # expo-router screens (file-based navigation)
│  ├─ _layout.tsx            # root layout; warms the (mock) runtime on launch
│  └─ (tabs)/
│     ├─ _layout.tsx         # bottom tab bar
│     ├─ index.tsx           # Companion — voice-first capture (+ text fallback)
│     ├─ journal.tsx         # Journal / personal memory
│     ├─ reflect.tsx         # Reflection report + open decisions
│     └─ settings.tsx        # Model choice · reflection cadence · privacy/location
├─ src/
│  ├─ theme/                 # warm palette, typography, spacing tokens
│  ├─ components/            # Screen, Card, AppButton, MicButton, ChatBubble, …
│  ├─ runtime/               # LocalModelRuntime interface + MockModelRuntime stub
│  └─ data/                  # types + mock personal corpus (Maya's journal)
└─ app.json                  # Expo config (bundle id: com.decisiontwin.app)
```

---

## Prerequisites

- **macOS** with **Xcode** installed (from the App Store), opened once to accept its
  license and install components.
- **Node.js 18+** and npm (this project was built with Node 26 / npm 11).
- For a physical iPhone: a **free Apple ID** (no paid Developer Program needed).

---

## 1. Install dependencies

```bash
cd mobile
npm install
```

## 2. Run on the iOS Simulator (fastest)

```bash
# from the mobile/ folder
npx expo run:ios
```

This builds the native iOS app and launches it in the Simulator. The first build
takes a few minutes; later runs are fast.

> Quicker JS-only preview (Expo Go / Metro), if you prefer:
> ```bash
> npx expo start        # then press "i" to open the iOS Simulator
> ```

## 3. Run on a physical iPhone (free Apple ID sideload)

1. Plug the iPhone into the Mac with a cable and **trust** the computer on the phone.
2. Open the generated Xcode workspace:
   ```bash
   npx expo prebuild --platform ios   # generates the ios/ project (first time only)
   open ios/DecisionTwin.xcworkspace
   ```
3. In Xcode:
   - Select the **DecisionTwin** target → **Signing & Capabilities**.
   - **Team:** choose your personal team (click *Add an Account…* and sign in with your
     free Apple ID if it isn't listed).
   - Change the **Bundle Identifier** to something unique if Xcode reports a conflict
     (e.g. `com.<yourname>.decisiontwin`).
4. At the top, pick your iPhone as the run destination and press **▶ Run**.
5. On the iPhone, approve the developer certificate:
   **Settings → General → VPN & Device Management → (your Apple ID) → Trust**.
6. Launch **DecisionTwin** from the home screen.

> One-line alternative that also builds to the device:
> ```bash
> npx expo run:ios --device
> ```
> (Xcode signing must be configured once as in step 3.)

**Free Apple ID caveats:** sideloaded apps expire after **7 days** (re-run to refresh),
and you can have a limited number of sideloaded apps at once. This is fine for
development and review.

---

## ⚠️ On-device model must be tested on real hardware

The conversational intelligence is currently a **stub** (`src/runtime/MockModelRuntime`)
that returns canned, reflective replies — great for reviewing the UI, but it is **not**
the real model.

When the real runtime is wired in (llama.cpp/MLC running Qwen2.5 0.5B → 1.5B), its
**latency, memory use, battery draw, and thermal behavior can only be judged on a
physical iPhone.** The Simulator runs on your Mac's CPU/GPU and will **not** reflect
real on-device inference performance. Always validate model behavior — and the 0.5B → 1.5B
upgrade decision — on actual hardware.

Swapping the stub for the real model is a **config change, not a rewrite**: provide a
class implementing `LocalModelRuntime` and select it in `src/runtime/index.ts`. No UI
code changes.

---

## Privacy boundary (by design)

Everything — journal, memory, and the model — stays on the device. The **only** feature
that ever uses the network is **nearby place lookup** (OpenStreetMap/Overpass), which
sends only a coarse location and a generic query, never personal data. See the
architecture plan for details.
