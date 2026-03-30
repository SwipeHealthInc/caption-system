// claude.js
// Handles all Claude API calls for caption generation
// Fires 13 parallel calls (one per platform) and returns all results

import { buildSystemPrompt, buildUserPrompt } from '../prompts/system_prompt.js';
import { PLATFORMS } from '../prompts/platforms.js';

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

/**
 * Makes a single Claude API call for one platform
 * @param {string} brand - "jake" or "swipehealth"
 * @param {Object} platform - platform config object from platforms.js
 * @param {string} transcript - cleaned transcript text
 * @returns {Promise<{platformId: string, caption: string, error: string|null}>}
 */
async function generateSingleCaption(brand, platform, transcript) {
  const systemPrompt = buildSystemPrompt(brand, platform.platformContext);
  const userPrompt = buildUserPrompt(transcript);

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    let caption = data.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n")
      .trim();

    // Apply post-processing pipeline
    caption = postProcessCaption(caption, platform);

    return {
      platformId: platform.id,
      displayName: platform.displayName,
      caption,
      error: null
    };

  } catch (err) {
    console.error(`Error generating caption for ${platform.id}:`, err);
    return {
      platformId: platform.id,
      displayName: platform.displayName,
      caption: "",
      error: err.message
    };
  }
}

// ── POST-PROCESSING PIPELINE ──

/**
 * Capitalizes the first letter of every sentence in a caption
 * @param {string} caption
 * @returns {string}
 */
function capitalizeSentences(caption) {
  let result = caption.charAt(0).toUpperCase() + caption.slice(1);
  result = result.replace(/([.!?]\s+)([a-z])/g, (m, boundary, letter) => boundary + letter.toUpperCase());
  result = result.replace(/(\n\s*)([a-z])/g, (m, nl, letter) => nl + letter.toUpperCase());
  return result;
}

/**
 * Checks if a caption contains first-person pronouns (excluding hashtag portion)
 * @param {string} caption
 * @returns {boolean}
 */
function hasPOVFirstPerson(caption) {
  const bodyBeforeHashtags = caption.replace(/((?:\s*#\w+)+)\s*$/, "");
  return /\b(I|I'm|I've|I'll|I'd|Me|My|Mine|Myself|We|We're|We've|We'll|We'd|Our|Ours|Ourselves)\b/.test(bodyBeforeHashtags);
}

/**
 * Applies all post-processing rules to a generated caption
 * @param {string} caption - raw generated caption
 * @param {Object} platform - platform config object
 * @returns {string} - post-processed caption
 */
function postProcessCaption(caption, platform) {
  let processed = caption;

  // Rule 1: Flag first-person in SwipeHealth brand captions
  if (platform.brand === "swipehealth" && hasPOVFirstPerson(processed)) {
    console.warn(`[POV CHECK] First-person pronoun detected in ${platform.id} caption. Review needed.`);
  }

  // Rule 2: Enforce sentence capitalization on X and Threads
  const casingPlatforms = ["x_jake", "x_swipehealth", "threads_jake", "threads_swipehealth"];
  if (casingPlatforms.includes(platform.id)) {
    processed = capitalizeSentences(processed);
  }

  // Rule 3: YouTube SwipeHealth length check
  if (platform.id === "youtube_swipehealth") {
    const body = processed.replace(/((?:\s*#\w+)+)\s*$/, "").trim();
    if (body.length > 100) {
      console.warn(`[LENGTH CHECK] YouTube SwipeHealth caption is ${body.length} chars before hashtags (hard cap: 100).`);
    }
  }

  // Rule 4: Instagram length check
  if (platform.id === "instagram_jake" || platform.id === "instagram_swipehealth") {
    const body = processed.replace(/((?:\s*#\w+)+)\s*$/, "").trim();
    if (body.length > 150) {
      console.warn(`[LENGTH CHECK] Instagram ${platform.id} caption is ${body.length} chars before hashtags (hard cap: 150).`);
    }
  }

  return processed;
}

/**
 * Generates all captions for a given brand in parallel
 * @param {string} brand - "jake" or "swipehealth"
 * @param {string} transcript - cleaned transcript text
 * @param {Function} onProgress - callback(completedCount, totalCount) for progress UI updates
 * @returns {Promise<Array<{platformId, displayName, caption, error}>>}
 */
export async function generateAllCaptions(brand, transcript, onProgress = null) {
  const platforms = PLATFORMS.filter(p => p.brand === brand);
  const total = platforms.length;
  let completed = 0;

  // Fire all calls in parallel
  const promises = platforms.map(platform =>
    generateSingleCaption(brand, platform, transcript).then(result => {
      completed++;
      if (onProgress) onProgress(completed, total);
      return result;
    })
  );

  const results = await Promise.all(promises);
  return results;
}

/**
 * Cleans a raw Whisper transcript before sending to caption generation
 * Removes filler words, fixes punctuation, improves readability
 * @param {string} rawTranscript - raw Whisper output
 * @returns {Promise<string>} - cleaned transcript
 */
export async function cleanTranscript(rawTranscript) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: `You are a transcript editor. Your job is to clean a raw speech-to-text transcript into readable, well-structured text that preserves the speaker's exact words, intent, and personality.

DO:
- Fix punctuation and capitalization
- Remove filler words (um, uh, like, you know — when overused)
- Fix run-on sentences
- Preserve the speaker's natural voice and phrasing
- Keep all key ideas, stories, examples, and specific details

DO NOT:
- Add new information or ideas not in the transcript
- Change the meaning of anything
- Make it sound more formal than the speaker intended
- Remove personality, humor, or casual language

Output ONLY the cleaned transcript. No preamble, no explanation.`,
        messages: [
          {
            role: "user",
            content: `Clean this transcript:\n\n${rawTranscript}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`Transcript clean failed: ${response.status}`);

    const data = await response.json();
    return data.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim();

  } catch (err) {
    console.error("Transcript cleaning failed, using raw:", err);
    // Fall back to raw transcript if cleaning fails
    return rawTranscript;
  }
}
