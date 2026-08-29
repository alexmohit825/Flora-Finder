import { Request, Response } from "express";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import crypto from "crypto";

// ==========================================
// TWO SERVER-SIDE IN-MEMORY CACHES (Page 3-4)
// ==========================================
// 1. Observation Cache: Kept on the server using normalized image fingerprint plus declared organs labels.
export const serverObservationCache = new Map<string, any>();

// Shared Gemini SDK client initialization
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to strip data-url prefix from base64 strings
function parseBase64Image(base64String: string) {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  return {
    mimeType: "image/jpeg",
    data: base64String,
  };
}

// Helper to generate a unique SHA-256 fingerprint from image payloads and organ labels
export function generateFingerprint(images: string[], organs: string[] = []): string {
  const imageHashes = images.map((img) => {
    try {
      const parsed = parseBase64Image(img);
      return crypto.createHash("sha256").update(parsed.data).digest("hex");
    } catch {
      return crypto.createHash("sha256").update(img).digest("hex");
    }
  });

  const sortedHashes = [...imageHashes].sort();
  const sortedOrgans = [...organs].sort();

  const combinedKey = `${sortedHashes.join(",")}|${sortedOrgans.join(",")}`;
  return crypto.createHash("sha256").update(combinedKey).digest("hex");
}

// Staged, cached plant-identification call using Gemini fast-vision endpoint
async function callVisionModelFast(
  images: string[],
  organs: string[],
  maxResults: number,
  locale: string,
  signal: AbortSignal
): Promise<any> {
  const ai = getAiClient();
  const parts: any[] = [];

  images.forEach((imgBase64, index) => {
    try {
      const parsed = parseBase64Image(imgBase64);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
    } catch (err) {
      console.error(`Error parsing image at index ${index}`, err);
    }
  });

  const userHintText = `The user has supplied ${images.length} images of the same plant or flower. Organs are: ${JSON.stringify(organs || [])}. Limit your candidate matches strictly down to a maximum of ${maxResults} items. Locale reference: ${locale}.`;
  parts.push({ text: userHintText });

  const systemInstruction = `You are a high-fidelity expert botanical identification AI.
Inspect the attached plant or flower image(s) and provide a professional, taxonomy-correct identification result matching the requested JSON format.

Return exactly the top matches up to a maximum of ${maxResults} items. Estimate confidence values accurately.

Configure response to comply strictly with this JSON schema:
{
  "queryId": string (UUID),
  "needsMorePhotos": boolean (ONLY set to true if the image is extremely blurry, pitch black, out of focus, or does not contain any plant material. If a leaf, flower, stem, or partial plant is clearly visible and recognizable, set this to false and confidently identify the plant species),
  "recommendedNextShots": array of strings of recommended organs (choose options from: ["flower", "leaf", "fruit", "bark", "habit", "auto", "root", "stem"]),
  "matches": Array of matching candidate objects, sorted by confidence score (highest first):
    [
      {
        "plantId": string (unique slug, matching scientific name format like 'rosa_canina_dog_rose' or 'lavandula_dentata'),
        "commonName": string (English common name capitalized, e.g., 'Dog Rose'),
        "scientificName": string (botanical binomial, e.g., 'Rosa canina'),
        "family": string (botanical family, e.g., 'Rosaceae'),
        "genus": string (genus name, e.g., 'Rosa'),
        "confidence": number (coefficient between 0.0 and 1.0),
        "rank": number (1-based index ranking of match)
      }
    ],
  "captureHints": Array of strings providing expert advice on what to shoot next to gain certainty.
}`;

  if (signal.aborted) {
    throw new Error("AbortError");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: parts,
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["queryId", "needsMorePhotos", "recommendedNextShots", "matches", "captureHints"],
        properties: {
          queryId: { type: Type.STRING },
          needsMorePhotos: { type: Type.BOOLEAN },
          recommendedNextShots: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["plantId", "commonName", "scientificName", "family", "genus", "confidence", "rank"],
              properties: {
                plantId: { type: Type.STRING },
                commonName: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                family: { type: Type.STRING },
                genus: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                rank: { type: Type.INTEGER }
              }
            }
          },
          captureHints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (signal.aborted) {
    throw new Error("AbortError");
  }

  const resultText = response.text || "{}";
  const resultJson = JSON.parse(resultText.trim());

  if (!resultJson.queryId) {
    resultJson.queryId = crypto.randomUUID();
  }

  // Override provider metadata as mandated in PDF Page 2/3
  resultJson.provider = {
    name: "gemini",
    modelVersion: "fast-vision-route"
  };

  return resultJson;
}

// Primary staged Express handler with built-in timeout & de-duplication
export async function postIdentify(req: Request, res: Response) {
  const controller = new AbortController();
  const signal = controller.signal;

  // Enforce a strict 25-second timeout limit to allow robust Gemini processing
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 25000);

  try {
    const { images, organs, clientHints, locale = "en_US" } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      clearTimeout(timeoutId);
      return res.status(400).json({ error: "At least one image is required for identification." });
    }

    if (images.length > 5) {
      clearTimeout(timeoutId);
      return res.status(400).json({ error: "Maximum of 5 images allowed for multi-image identification." });
    }

    // 1. Deduplication cache check
    const normalizedFingerprint = generateFingerprint(images, organs || []);
    if (serverObservationCache.has(normalizedFingerprint)) {
      console.log(`[Cache Hit - Observation Cache] Returning cached observation for fingerprint: ${normalizedFingerprint}`);
      clearTimeout(timeoutId);
      return res.json(serverObservationCache.get(normalizedFingerprint));
    }

    console.log(`[Identify API] No cache hit. Querying fast-vision model with 5s timeout. Fingerprint: ${normalizedFingerprint}`);

    const maxResults = clientHints?.maxResults || 3;

    // 2. Call the fast vision model passing the AbortSignal
    const finalResult = await callVisionModelFast(images, organs || [], maxResults, locale, signal);

    clearTimeout(timeoutId);

    // Save in server-side cache
    serverObservationCache.set(normalizedFingerprint, finalResult);

    return res.json(finalResult);

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn("[Identify Route Handled Failure / Timeout]", error);

    // Staged fallback / recovery structure (PDF Page 4)
    const isTimeout = signal.aborted || error?.name === "AbortError" || error?.message?.includes("timeout") || error?.message?.includes("Abort");
    const fallbackResponse = {
      queryId: crypto.randomUUID(),
      matches: [],
      needsMorePhotos: true,
      recommendedNextShots: ["leaf"],
      captureHints: [
        isTimeout
          ? "The primary identification model exceeded the speed timeout threshold."
          : "Horticultural services encountered an API connection check failure.",
        "Ensure the lighting is bright and take the shot closer to a single leaf, orchid flower, or stem."
      ],
      provider: {
        name: "system-recovery",
        modelVersion: "fallback-route"
      }
    };

    return res.json(fallbackResponse);
  }
}
