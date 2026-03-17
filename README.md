# SwipeHealth Caption System

AI-powered caption generator. One transcript in → 13 platform-optimized captions out.

## What It Does

- Select Jake (personal brand) or SwipeHealth (brand)
- Paste a transcript OR upload a video/audio file
- Hit Generate — fires 13 parallel Claude API calls
- Get platform-specific captions for every channel, ready to copy-paste

## Channels Covered

| Platform | Jake | SwipeHealth |
|---|---|---|
| TikTok | ✓ | ✓ |
| LinkedIn | ✓ | ✓ |
| Instagram | ✓ | ✓ |
| Facebook | — | ✓ |
| X (Twitter) | ✓ | ✓ |
| Threads | ✓ | ✓ |
| YouTube Shorts | ✓ | ✓ |

**Total: 13 captions per run**

## Setup

### 1. Clone / open in VS Code
```bash
cd swipehealth-caption-system
code .
```

### 2. No dependencies to install
This is a pure HTML/JS app. No npm, no build step, no server required.

### 3. Run it
Open `index.html` in a browser, OR use VS Code Live Server extension:
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

### 4. API Keys needed
- **Anthropic API key** (required) — get at console.anthropic.com
- **OpenAI API key** (optional) — only needed for video/audio upload transcription via Whisper

Keys are entered in the app UI and stored in session memory only. Never persisted.

## File Structure

```
swipehealth-caption-system/
│
├── index.html                  ← Main app (UI + all logic)
│
├── knowledge/
│   ├── voice_jake.md           ← Jake's full voice profile
│   ├── voice_swipehealth.md    ← SwipeHealth brand voice profile
│   ├── platform_rules.md       ← All 7 platform rules (detailed)
│   └── caption_playbook.md     ← Caption intelligence (update after Step 3)
│
├── prompts/
│   ├── system_prompt.js        ← Prompt builder (voice + playbook combined)
│   └── platforms.js            ← Per-platform prompt configs
│
├── api/
│   └── claude.js               ← Claude API handler (parallel calls)
│
├── utils/
│   └── transcribe.js           ← Whisper transcription handler
│
└── README.md                   ← This file
```

**Note:** `index.html` contains all runtime logic inline (voice profiles, platform configs, API calls) for simplicity and portability. The `/prompts`, `/api`, `/utils` files are modular versions for future refactoring if needed.

## How the System Works

```
User Input (transcript OR video)
    ↓
[If video] → Whisper API → raw transcript → Claude cleanup → clean transcript
    ↓
Brand selected (Jake or SwipeHealth)
    ↓
System prompt assembled:
  Voice Profile + Caption Playbook + Platform-specific rules
    ↓
13 parallel Claude API calls fire simultaneously
    ↓
Results render as each call completes (no waiting for all 13)
    ↓
Copy individual captions or Copy All
```

## Updating the Caption Playbook

After Step 3 (LinkedIn corpus analysis), update `knowledge/caption_playbook.md` with the full playbook output, then update the `CAPTION_PLAYBOOK` const in `index.html` with the condensed version.

## Adding New Platforms

1. Add platform config to `PLATFORMS` array in `index.html`
2. Add detailed rules to `knowledge/platform_rules.md`
3. Done — system picks it up automatically

## Model

Uses `claude-sonnet-4-20250514` for all caption generation and transcript cleanup.

## Known Limitations (V1)

- No direct publishing/scheduling integration (copy-paste to scheduler manually)
- No image/video generation (text captions only)
- No analytics or performance tracking
- File upload max 25MB (Whisper limit)
- Browser-only — no mobile native app
