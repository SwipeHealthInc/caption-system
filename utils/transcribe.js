// transcribe.js
// Handles audio/video file transcription via OpenAI Whisper API
// Supports: mp4, mov, mp3, m4a, wav, webm

const WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions";

// Max file size Whisper accepts: 25MB
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Supported file types
const SUPPORTED_TYPES = [
  "audio/mpeg",       // mp3
  "audio/mp4",        // m4a
  "audio/wav",        // wav
  "audio/webm",       // webm audio
  "video/mp4",        // mp4
  "video/quicktime",  // mov
  "video/webm",       // webm video
];

/**
 * Validates a file before attempting transcription
 * @param {File} file
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is ${sizeMB}MB. Maximum size is ${MAX_FILE_SIZE_MB}MB. Try trimming the video or compressing the audio.`
    };
  }

  // Check by extension as fallback (MIME types can be unreliable)
  const ext = file.name.split('.').pop().toLowerCase();
  const supportedExtensions = ["mp3", "mp4", "m4a", "wav", "webm", "mov", "mpeg", "mpga", "oga", "ogg", "flac"];

  if (!SUPPORTED_TYPES.includes(file.type) && !supportedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file type: .${ext}. Supported formats: MP4, MOV, MP3, M4A, WAV, WebM.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Transcribes an audio or video file using OpenAI Whisper
 * @param {File} file - audio or video file
 * @param {string} openaiApiKey - OpenAI API key
 * @param {Function} onProgress - optional progress callback (not supported by Whisper API, but included for UX consistency)
 * @returns {Promise<{transcript: string, error: string|null}>}
 */
export async function transcribeFile(file, openaiApiKey, onProgress = null) {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { transcript: "", error: validation.error };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  // Response format: text gives clean output without timestamps
  formData.append("response_format", "text");

  try {
    if (onProgress) onProgress("Uploading file to Whisper...");

    const response = await fetch(WHISPER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`
        // Note: Do NOT set Content-Type header — browser sets it automatically with boundary for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Whisper API error: ${response.status}`;
      throw new Error(message);
    }

    // Whisper with response_format=text returns plain text directly
    const transcript = await response.text();

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcription returned empty. The audio may be too quiet or contain no speech.");
    }

    return { transcript: transcript.trim(), error: null };

  } catch (err) {
    console.error("Transcription error:", err);
    return {
      transcript: "",
      error: err.message || "Transcription failed. Please try again or paste the transcript manually."
    };
  }
}

/**
 * Formats file size for display
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
