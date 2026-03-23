# SwipeHealth Caption System -- Tutorial

Step-by-step guide from opening the app to posting captions.

---

## 1. Sign In

Go to **[swipehealthinc.github.io/caption-system](https://swipehealthinc.github.io/caption-system)**.

Click **Sign in with Google** and use your `@swipehealth.ai` account. Only SwipeHealth domain accounts have access -- any other email gets blocked.

---

## 2. API Keys

Once signed in, you'll see the API Keys section at the top.

**First time:** Paste your key into the input field and click/tab away. It saves to your browser's localStorage automatically. You'll see **"Key saved to browser storage"**.

**Every time after:** The key loads automatically when you open the app. You'll see **"Key loaded from browser storage"**.

All 3 keys (Gemini, Anthropic, OpenAI) are persisted this way. Keys never touch the code or git -- they live only in your browser.

- **Gemini** -- default generation model, get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Anthropic** -- paste your own key if you want to use Claude
- **OpenAI** -- only needed if uploading video/audio files

---

## 3. Select Brand (Step 1)

Pick your brand:

- **Jake (Personal Brand)** -- TikTok, LinkedIn, Instagram, X, Threads, YouTube Shorts (6 captions)
- **SwipeHealth (Brand)** -- TikTok, LinkedIn, Instagram, Facebook, X, Threads, YouTube Shorts (7 captions)

The system knows the voice and tone for each brand.

---

## 4. Add Content (Step 2)

Two options:

- **Paste Transcript** -- drop in your script, talking points, or rough notes from a video you filmed
- **Upload Video / Audio** -- upload a file directly (MP4, MOV, MP3, M4A, WAV, WebM, max 25MB). The system transcribes it using Whisper and cleans it up. Requires an OpenAI key.

For most use cases, paste is the easiest path.

---

## 5. Extra Context (Step 3, Optional)

Steer the output by adding context. Examples:

- "Make this more casual"
- "Target this at gym owners"
- "Use this specific CTA: ..."
- "The tone should be authoritative, not playful"

The AI takes it into account when writing.

---

## 6. Select Platforms (Step 4)

All platforms are on by default. Toggle off any you don't need. The count at the bottom shows how many captions will be generated.

---

## 7. Generate (Step 5)

Hit **Generate All Captions**. A progress bar shows each platform caption being written. Takes about 30 seconds to a minute depending on how many platforms you selected.

---

## 8. Copy & Post (Step 6)

Each caption is tailored to its platform -- character limits, hashtag style, tone, everything.

- Click the **copy button** on any card to grab that caption
- Hit **Copy All** to get everything at once
- Paste straight into each platform and post

---

## 9. Sign Out

Your name and avatar are in the top right. Hit **Sign Out** any time.

---

**That's it -- sign in, paste, generate, copy, post.**
