// path: services/GeminiService.js

// If you're using Expo, prefer EXPO_PUBLIC_GEMINI_API_KEY via app config.
//   app.config.js -> extra: { GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY }
// Or set EXPO_PUBLIC_GEMINI_API_KEY in your .env
import Constants from "expo-constants";

const GEMINI_API_KEY =
  Constants?.expoConfig?.extra?.GEMINI_API_KEY ||
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  "AIzaSyCNJ_tJgtLf1GIQK8c-S6PRg3TnUp3zQf0";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Small helper to fetch with a timeout so the UI isn't stuck forever.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Safely digs the candidate text out of Gemini's response.
 */
function getCandidateText(data) {
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ??
    ""
  );
}

/**
 * Remove code fences, normalize quotes, and try to isolate a JSON block.
 */
function sanitizePotentialJson(text) {
  if (!text) return "";

  // Strip code fences ```json ... ``` or ``` ...
  let t = text.replace(/```json\s*([\s\S]*?)```/gi, "$1").replace(/```\s*([\s\S]*?)```/g, "$1");

  // Replace smart quotes with straight quotes
  t = t
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // Sometimes models prepend/explain; try to grab the outermost { ... }
  const jsonBlock = t.match(/\{[\s\S]*\}/);
  if (jsonBlock) t = jsonBlock[0];

  // Remove trailing commas before } or ] which break JSON.parse
  t = t.replace(/,\s*([}\]])/g, "$1");

  return t.trim();
}

/**
 * Try parsing JSON with a couple of fallbacks.
 */
function tryParseJson(text) {
  if (!text) throw new Error("Empty response from model");
  // First attempt: direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Second: sanitize and parse
    const cleaned = sanitizePotentialJson(text);
    if (!cleaned) throw new Error("No JSON-like content found");
    return JSON.parse(cleaned);
  }
}

/**
 * Build the strict roadmap prompt (JSON only).
 */
function buildRoadmapPrompt(topic, language = "English") {
  return `
You are generating a learning roadmap JSON for a personal mobile app.
CRITICAL OUTPUT RULES:
- Return ONLY a single valid JSON object. No explanations, no prose, no code fences.
- Do NOT include Markdown formatting. All newlines inside strings must be escaped as \\n.
- All strings must be plain text (no backticks).
- Respond in ${language}.
- Keep the whole object under ~3500 tokens.

Requirements:
- Topic: "${topic}"
- Audience: motivated beginner unless otherwise implied.
- Roadmap: practical, hands-on, 8–12 steps.
- Each step should be small enough to complete in 2–5 hours.
- Include at least one concrete code example across the steps (when applicable to the topic).
- Prefer real, widely used resources (official docs, canonical tutorials). 3–6 total resources.

Output JSON shape (MATCH EXACTLY THESE KEYS):
{
  "topic": "${topic}",
  "description": "Brief description (<= 2 sentences).",
  "estimatedTime": "e.g., '4–6 weeks'",
  "difficulty": "Beginner|Intermediate|Advanced",
  "steps": [
    {
      "title": "Step title (action-oriented)",
      "description": "1–2 sentences of context.",
      "details": "Concrete bullet-style guidance separated by \\n- like this",
      "codeExample": "Short code sample if relevant. Escape newlines as \\n. Keep under 40 lines.",
      "resources": ["Official docs – URL", "High-quality guide – URL"],
      "estimatedHours": "2–5 hours"
    }
  ]
}

Content guidelines:
- Use consistent terminology across steps.
- If the topic is broad (e.g., "Web Development"), pick a sensible beginner slice (e.g., "Frontend with React") and say so in "description".
- If code isn’t applicable, set "codeExample": "".
- Resources must be recognizable sources; include the full URL in each string.

Return ONLY the JSON object.
  `.trim();
}

/**
 * Build the focused enhance-step prompt (plain text).
 */
function buildEnhancePrompt(topic, stepTitle, userQuery, language = "English") {
  return `
You are enhancing one roadmap step.
CRITICAL OUTPUT RULES:
- Return ONLY plain text (no JSON, no code fences).
- Keep the answer focused and actionable (<= 300 words).
- If code helps, include a short snippet (<= 30 lines, plain text, no backticks).
- Respond in ${language}.

Context:
- Topic: "${topic}"
- Step: "${stepTitle}"
- User question: "${userQuery}"

Provide:
- A concise explanation.
- 1–3 practical examples or commands (if applicable).
- Common pitfalls or gotchas (brief).
- A tiny checklist of next actions (3–5 bullets).

Avoid:
- Marketing fluff, long history lessons, or excessive theory.
  `.trim();
}

/**
 * If the model returns non‑JSON, we can ask Gemini to repair it into valid JSON.
 */
async function repairJsonWithGemini(badText, language = "English") {
  const prompt = `
Repair the following text into a single valid JSON object that strictly matches this schema:

{
  "topic": "string",
  "description": "string",
  "estimatedTime": "string",
  "difficulty": "Beginner|Intermediate|Advanced",
  "steps": [
    {
      "title": "string",
      "description": "string",
      "details": "string",
      "codeExample": "string",
      "resources": ["string"],
      "estimatedHours": "string"
    }
  ]
}

CRITICAL RULES:
- Output ONLY the JSON. No prose, no code fences.
- No markdown. Escape all newlines inside strings as \\n.
- Respond in ${language}.

Text to repair:
${badText}
  `.trim();

  const res = await fetchWithTimeout(
    `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini JSON repair error: ${res.status}`);
  }
  const data = await res.json();
  return getCandidateText(data);
}

/**
 * Normalize Gemini JSON to the storage shape your app uses:
 * {
 *   topic: string,
 *   steps: [
 *     { id, title, done, details, notes, expanded, meta? }
 *   ]
 * }
 * - We keep a lightweight `meta` with the extra info in case you want it in UI later.
 */
function normalizeToStorageShape(roadmap) {
  const topic = roadmap?.topic ?? "Untitled";
  const stepsIn = Array.isArray(roadmap?.steps) ? roadmap.steps : [];

  const steps = stepsIn.map((s, i) => {
    const title = s?.title ?? `Step ${i + 1}`;
    const detailsParts = [];

    if (s?.details) detailsParts.push(s.details);
    if (s?.codeExample) detailsParts.push(`Example:\n${s.codeExample}`);

    return {
      id: `step_${i}`, // helpful for FlatList keys
      title,
      done: false,
      details: detailsParts.join("\n\n").trim(),
      notes: "",
      expanded: false,
      // optional metadata you can surface in an accordion footer, etc.
      meta: {
        description: s?.description ?? "",
        resources: Array.isArray(s?.resources) ? s.resources : [],
        estimatedHours: s?.estimatedHours ?? "",
      },
    };
  });

  return { topic, steps };
}

class GeminiService {
  /**
   * Generate a roadmap for a topic and return it already normalized
   * to your local storage structure (offline‑ready).
   *
   * @param {string} topic
   * @param {{language?: string}} options
   * @returns {Promise<{topic: string, steps: Array}>}
   */
  async generateRoadmap(topic, options = {}) {
    const language = options.language || "English";
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      throw new Error(
        "Missing GEMINI API key. Set EXPO_PUBLIC_GEMINI_API_KEY or expo.extra.GEMINI_API_KEY."
      );
    }
    if (!topic || !topic.trim()) {
      throw new Error("Topic is required");
    }

    const prompt = buildRoadmapPrompt(topic.trim(), language);

    try {
      const response = await fetchWithTimeout(
        `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let text = getCandidateText(data);

      let roadmapJson;
      try {
        roadmapJson = tryParseJson(text);
      } catch (parseErr) {
        // One repair attempt via Gemini, then parse again
        const repaired = await repairJsonWithGemini(text, language);
        roadmapJson = tryParseJson(repaired);
      }

      // Finally, map to your offline storage shape
      const storageReady = normalizeToStorageShape(roadmapJson);
      return storageReady;
    } catch (error) {
      console.error("Error generating roadmap:", error);
      throw error;
    }
  }

  /**
   * Answer a focused question about a specific step.
   * Returns plain text suitable for showing inline in your UI.
   *
   * @param {string} topic
   * @param {string} stepTitle
   * @param {string} userQuery
   * @param {{language?: string}} options
   * @returns {Promise<string>}
   */
  async enhanceStep(topic, stepTitle, userQuery, options = {}) {
    const language = options.language || "English";
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      throw new Error(
        "Missing GEMINI API key. Set EXPO_PUBLIC_GEMINI_API_KEY or expo.extra.GEMINI_API_KEY."
      );
    }
    if (!topic || !stepTitle || !userQuery) {
      throw new Error("topic, stepTitle, and userQuery are required");
    }

    try {
      const prompt = buildEnhancePrompt(topic, stepTitle, userQuery, language);

      const response = await fetchWithTimeout(
        `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = getCandidateText(data) || "";
      // Ensure we only return plain text (no fences)
      return text.replace(/```[\s\S]*?```/g, "").trim();
    } catch (error) {
      console.error("Error enhancing step:", error);
      throw error;
    }
  }
}

export default new GeminiService();
