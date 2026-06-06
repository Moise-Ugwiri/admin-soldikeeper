# SoldiKeeper Marketing Video Suite v2

> Lives inside **admin-client/remotion**. Cloud renders are triggered from the Media Studio UI
> via GitHub Actions workflow at `admin-client/.github/workflows/render.yml`.

7 high-quality animated videos built with [Remotion](https://www.remotion.dev/) for every platform.

## Videos

| ID | Platform | Dimensions | Duration | Description |
|----|----------|-----------|----------|-------------|
| `YouTube` | YouTube | 1920×1080 | 60s | Full brand story — 8 scenes |
| `TikTok` | TikTok / Reels | 1080×1920 | 30s | Hook-first vertical format |
| `Instagram` | Instagram Square | 1080×1080 | 15s | Clean, minimal |
| `LinkedIn` | LinkedIn | 1920×1080 | 45s | Professional / B2B angle |
| `FeatureReceipt` | Any | 1920×1080 | 25s | Receipt Scanner spotlight |
| `FeatureBudget` | Any | 1920×1080 | 25s | Smart Budgets spotlight |
| `FeatureSplit` | Any | 1920×1080 | 25s | Bill Splitting spotlight |

---

## Setup

```bash
cd remotion   # from admin-client root
npm install
```

---

## Preview (Remotion Studio)

Opens an interactive browser preview — scrub through any video in real-time:

```bash
npm run studio
```

---

## Render individual videos

```bash
npm run render:youtube      # → out/youtube-full-promo.mp4
npm run render:tiktok       # → out/tiktok-reels-short.mp4
npm run render:instagram    # → out/instagram-square.mp4
npm run render:linkedin     # → out/linkedin-promo.mp4
npm run render:receipt      # → out/feature-receipt-scan.mp4
npm run render:budget       # → out/feature-smart-budget.mp4
npm run render:split        # → out/feature-split-bills.mp4
```

## Render ALL videos at once

```bash
npm run render:all
```

Output files land in `./out/`.

---

## Adding Audio 🎵

Audio is **disabled by default** so videos render cleanly without any audio files present.

### Step 1 — Get free royalty-free music

All tracks below are from [Pixabay](https://pixabay.com/music/) — free for commercial use, no attribution required:

| File | Suggested track | URL |
|------|----------------|-----|
| `main-theme.mp3` | "Corporate Motivation" by Lesfm | https://pixabay.com/music/upbeat-corporate-motivation-159610/ |
| `short-hook.mp3` | "Energetic Upbeat Hip-Hop" | https://pixabay.com/music/beats-energetic-upbeat-hip-hop-123095/ |
| `feature-sting.mp3` | "Tech Corporate Logo" | https://pixabay.com/music/corporate-tech-logo-6892/ |
| `cta-outro.mp3` | "Positive Upbeat" | https://pixabay.com/music/upbeat-positive-upbeat-122742/ |

Download each → rename → drop in `public/audio/`.

### Step 2 — Enable audio

In `src/audioConfig.js`, change:

```js
export const AUDIO_ENABLED = false;
// ↓
export const AUDIO_ENABLED = true;
```

### Which audio plays where

| Video | Audio file |
|-------|-----------|
| YouTube | `main-theme.mp3` |
| LinkedIn | `main-theme.mp3` |
| TikTok | `short-hook.mp3` |
| Instagram | `short-hook.mp3` |
| FeatureReceipt | `feature-sting.mp3` |
| FeatureBudget | `feature-sting.mp3` |
| FeatureSplit | `feature-sting.mp3` |

---

## Customisation

- **Brand colors / fonts** → `src/theme.js`
- **Animation helpers** → `src/animations.js`
- **Phone mockup / dashboard content** → `src/components/PhoneMockup.jsx`
- **Logo** → `src/components/Logo.jsx`

---

## Requirements

- Node.js 18+
- `npm install` (Remotion v4 + React 19)
- For renders: `ffmpeg` must be available on PATH (`sudo apt install ffmpeg` or `brew install ffmpeg`)

---

## File structure

```
soldikeeper-videos-v2/
├── package.json
├── src/
│   ├── index.jsx               ← All 7 compositions registered here
│   ├── theme.js                ← Brand design tokens
│   ├── animations.js           ← Animation helpers
│   ├── audioConfig.js          ← Audio on/off + file paths
│   └── compositions/
│       ├── FullPromoYouTube.jsx
│       ├── TikTokShort.jsx
│       ├── InstagramSquare.jsx
│       ├── LinkedInPromo.jsx
│       ├── FeatureReceipt.jsx
│       ├── FeatureBudget.jsx
│       └── FeatureSplit.jsx
├── src/components/
│   ├── Logo.jsx
│   ├── GradientBg.jsx
│   └── PhoneMockup.jsx
└── public/
    └── audio/             ← Drop MP3 files here
```
