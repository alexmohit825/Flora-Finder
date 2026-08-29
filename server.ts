import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import crypto from "crypto";
import { postIdentify } from "./fast-identify-backend";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up large JSON body limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini SDK client initialization (lazy / safely guarded)
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
  // If no prefix, default to image/jpeg
  return {
    mimeType: "image/jpeg",
    data: base64String,
  };
}

// ==========================================
// TWO SERVER-SIDE IN-MEMORY CACHES (Page 3-4)
// ==========================================
// 1. Observation Cache: Delegates to fast-identify-backend
// 2. Plant Profile Cache: Keyed by plantId used by detail screen to avoid querying same metadata.
const serverPlantProfileCache = new Map<string, any>();

// 1. PRIMARY PLANT IDENTIFICATION API ENDPOINT
// Post endpoint matching schema requested in PDF page 2 and page 5
app.post("/api/v1/identify", postIdentify);

// 1b. NEW PLANT DISEASE DIAGNOSIS API ENDPOINT (Fix My Plant)
app.post("/api/v1/diagnose", async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "At least one image is required for plant diagnosis." });
    }

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
        console.error(`Error parsing diagnosis image at index ${index}`, err);
      }
    });

    const promptText = "Analyze the health of this botanical specimen. Identify any signs of disease, pests, under/overwatering, nutrient deficiency, or other physiological plant disorders. Provide detailed organic and chemical recovery treatment and preventive instructions.";
    parts.push({ text: promptText });

    const systemInstruction = `You are a certified master plant pathologist and digital botanist.
Analyze the attached image(s) of a plant and provide a professional, taxonomy-correct disease and health diagnosis.
Estimate confidence values precisely. Be specific with treatments.

Configure response to comply strictly with this JSON schema:
{
  "queryId": string (UUID),
  "isDiseased": boolean (true if any disease, pest, nutrient deficiency, or disorder is detected; false if completely healthy),
  "healthScore": number (integer between 0 and 100, where 100 is pristine health),
  "diseaseName": string (English name, e.g., 'Powdery Mildew', 'Spider Mites', 'Nitrogen Deficiency', 'Healthy' if perfectly green and normal),
  "scientificName": string (scientific name of pathogen or issue, e.g., 'Podosphaera pannosa', or 'N/A' if healthy),
  "confidence": number (coefficient between 0.0 and 1.0),
  "severity": string (must be exactly one of: "Healthy", "Low", "Medium", "High"),
  "symptoms": array of strings (observed physical symptoms on leaves, stem, or flowers),
  "causes": array of strings (what likely triggered this condition under typical environments),
  "treatment": {
    "immediate": string (the first immediate rescue step to take),
    "organic": string (nature-friendly, biological, or household recovery options),
    "chemical": string (chemical cures, fungicides, or pesticides to apply if necessary)
  },
  "prevention": array of strings (long-term preventative care habits to prevent recurrence)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["queryId", "isDiseased", "healthScore", "diseaseName", "scientificName", "confidence", "severity", "symptoms", "causes", "treatment", "prevention"],
          properties: {
            queryId: { type: Type.STRING },
            isDiseased: { type: Type.BOOLEAN },
            healthScore: { type: Type.INTEGER },
            diseaseName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            severity: { type: Type.STRING },
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            causes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            treatment: {
              type: Type.OBJECT,
              required: ["immediate", "organic", "chemical"],
              properties: {
                immediate: { type: Type.STRING },
                organic: { type: Type.STRING },
                chemical: { type: Type.STRING }
              }
            },
            prevention: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText.trim());

    if (!resultJson.queryId) {
      resultJson.queryId = crypto.randomUUID();
    }

    resultJson.provider = {
      name: "gemini",
      modelVersion: "disease-analyzer-route"
    };

    return res.json(resultJson);
  } catch (error: any) {
    console.error("[Diagnose API Error]", error);
    return res.status(500).json({
      error: "Botanical diagnosis services encountered a processing failure.",
      details: error?.message || error
    });
  }
});

// 2. DETAILED PLANT PROFILE ENDPOINT
// Get endpoint matching schema requested in PDF page 7
app.get("/api/v1/plants/:plantId", async (req, res) => {
  try {
    const { plantId } = req.params;

    // Check server plant profile cache first
    if (serverPlantProfileCache.has(plantId)) {
      console.log(`[Cache Hit - Plant Profile Cache] Returning cached profile for ${plantId}`);
      return res.json(serverPlantProfileCache.get(plantId));
    }

    const ai = getAiClient();

    const prompt = `Provide the detailed botanical and care profile for the plant characterized by ID or name: '${plantId}'.
Return a structured JSON document conforming strictly to the requested schema. Make sure the care guidance is highly specific to this exact genus/species.

JSON Schema format:
{
  "plantId": string,
  "commonName": string,
  "scientificName": string,
  "description": string (detailed historical, botanical description, highlight native habitat and growth styles),
  "category": string (e.g. "Succulent", "Shrub", "Fern", "Tree", "Wildflower", "Indoor Climber"),
  "care": {
    "sun": string (sunlight requirements e.g. "Direct morning sun..."),
    "water": string (watering cycles e.g. "Water twice a week..."),
    "soil": string (soil composition e.g. "Slightly acidic, loamy soil...")
  },
  "toxicity": {
    "human": string (toxicity rating to humans),
    "pets": string (toxicity rating to cats, dogs, or livestock)
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["plantId", "commonName", "scientificName", "description", "category", "care", "toxicity"],
          properties: {
            plantId: { type: Type.STRING },
            commonName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            care: {
              type: Type.OBJECT,
              required: ["sun", "water", "soil"],
              properties: {
                sun: { type: Type.STRING },
                water: { type: Type.STRING },
                soil: { type: Type.STRING }
              }
            },
            toxicity: {
              type: Type.OBJECT,
              required: ["human", "pets"],
              properties: {
                human: { type: Type.STRING },
                pets: { type: Type.STRING }
              }
            }
          }
        },
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText.trim());

    // Cache the result in server map
    serverPlantProfileCache.set(plantId, resultJson);

    return res.json(resultJson);
  } catch (error: any) {
    console.error("[Plant Detail API Error]", error);
    return res.status(500).json({
      error: "Could not retrieve plant details.",
      details: error?.message || error
    });
  }
});

// 3. FEEDBACK SUBMISSION ENDPOINT
// Post endpoint matching placeholder in PDF page 7
app.post("/api/v1/feedback", (req, res) => {
  const { queryId, isCorrect, selectedAlternative, comments } = req.body;
  console.log(`[Feedback Received] Query ID: ${queryId}, Correct: ${isCorrect}, Selected: ${selectedAlternative}, Notes: ${comments}`);
  return res.json({
    status: "success",
    message: "Thank you for supporting community accuracy checks! Feedback submitted."
  });
});

// 3b. ICON AND PWA MANIFEST PROXIES (Safari Workarounds)
const SCHEMATIC_PLANT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <!-- Rich Dark Background -->
  <rect width="180" height="180" rx="40" fill="#0b0a1a"/>
  
  <!-- Subtle Blueprint Grid Pattern -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="0.5">
    <line x1="20" y1="0" x2="20" y2="180" />
    <line x1="40" y1="0" x2="40" y2="180" />
    <line x1="60" y1="0" x2="60" y2="180" />
    <line x1="80" y1="0" x2="80" y2="180" />
    <line x1="100" y1="0" x2="100" y2="180" />
    <line x1="120" y1="0" x2="120" y2="180" />
    <line x1="140" y1="0" x2="140" y2="180" />
    <line x1="160" y1="0" x2="160" y2="180" />
    
    <line x1="0" y1="20" x2="180" y2="20" />
    <line x1="0" y1="40" x2="180" y2="40" />
    <line x1="0" y1="60" x2="180" y2="60" />
    <line x1="0" y1="80" x2="180" y2="80" />
    <line x1="0" y1="100" x2="180" y2="100" />
    <line x1="0" y1="120" x2="180" y2="120" />
    <line x1="0" y1="140" x2="180" y2="140" />
    <line x1="0" y1="160" x2="180" y2="160" />
  </g>

  <!-- Symmetrical Circular Targets & Technical Indicators -->
  <circle cx="90" cy="90" r="65" fill="none" stroke="#a78bfa" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="3,3" />
  <circle cx="90" cy="90" r="45" fill="none" stroke="#a78bfa" stroke-opacity="0.06" stroke-width="1" />
  
  <!-- Symmetrical Plant Schematic Stem -->
  <path d="M 90,145 L 90,35" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" />
  
  <!-- Bottom Leaves -->
  <!-- Left Bottom Leaf -->
  <path d="M 90,120 C 70,120 55,105 55,90 C 55,85 65,85 90,105" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-linecap="round" />
  <path d="M 55,90 Q 72,102 90,105" fill="none" stroke="#818cf8" stroke-width="0.75" opacity="0.6" />
  <!-- Right Bottom Leaf -->
  <path d="M 90,120 C 110,120 125,105 125,90 C 125,85 115,85 90,105" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-linecap="round" />
  <path d="M 125,90 Q 108,102 90,105" fill="none" stroke="#818cf8" stroke-width="0.75" opacity="0.6" />

  <!-- Middle Leaves -->
  <!-- Left Middle Leaf -->
  <path d="M 90,95 C 65,95 50,75 50,60 C 50,55 65,55 90,75" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round" />
  <path d="M 50,60 Q 70,70 90,75" fill="none" stroke="#c084fc" stroke-width="0.75" opacity="0.6" />
  <!-- Right Middle Leaf -->
  <path d="M 90,95 C 115,95 130,75 130,60 C 130,55 115,55 90,75" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round" />
  <path d="M 130,60 Q 110,70 90,75" fill="none" stroke="#c084fc" stroke-width="0.75" opacity="0.6" />

  <!-- Top Sprout / Bud -->
  <path d="M 90,60 C 80,50 85,35 90,25 C 95,35 100,50 90,60 Z" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" />
  <line x1="90" y1="60" x2="90" y2="25" stroke="#38bdf8" stroke-width="0.75" opacity="0.6" />

  <!-- Scientific Annotations & Callouts -->
  <!-- Node Markers (Small technical circles) -->
  <circle cx="90" cy="120" r="2.5" fill="#0b0a1a" stroke="#818cf8" stroke-width="1" />
  <circle cx="90" cy="95" r="2.5" fill="#0b0a1a" stroke="#c084fc" stroke-width="1" />
  <circle cx="90" cy="60" r="2.5" fill="#0b0a1a" stroke="#38bdf8" stroke-width="1" />

  <!-- Angle callout line bottom-left -->
  <line x1="55" y1="90" x2="35" y2="90" stroke="#818cf8" stroke-opacity="0.4" stroke-width="0.75" stroke-dasharray="2,2" />
  <circle cx="35" cy="90" r="1.5" fill="#818cf8" />
  
  <!-- Angle callout line mid-right -->
  <line x1="130" y1="60" x2="150" y2="60" stroke="#c084fc" stroke-opacity="0.4" stroke-width="0.75" stroke-dasharray="2,2" />
  <circle cx="150" cy="60" r="1.5" fill="#c084fc" />

  <!-- Technical border frame with tick marks -->
  <rect x="5" y="5" width="170" height="170" rx="35" fill="none" stroke="#c084fc" stroke-opacity="0.15" stroke-width="0.75" />
  
  <!-- Corner Ticks -->
  <path d="M 12,25 L 12,12 L 25,12" fill="none" stroke="#c084fc" stroke-opacity="0.4" stroke-width="1" />
  <path d="M 168,25 L 168,12 L 155,12" fill="none" stroke="#c084fc" stroke-opacity="0.4" stroke-width="1" />
  <path d="M 12,155 L 12,168 L 25,168" fill="none" stroke="#c084fc" stroke-opacity="0.4" stroke-width="1" />
  <path d="M 168,155 L 168,168 L 155,168" fill="none" stroke="#c084fc" stroke-opacity="0.4" stroke-width="1" />

  <!-- Scientific Coordinate Labels -->
  <text x="15" y="160" font-family="monospace" font-size="5" fill="#a78bfa" fill-opacity="0.5">SYS.FLORA.01</text>
  <text x="135" y="22" font-family="monospace" font-size="5" fill="#a78bfa" fill-opacity="0.5">r=180px/1.0x</text>
</svg>`;

app.get("/apple-touch-icon.png", (req, res) => {
  // Return the high-fidelity schematic plant SVG directly.
  // Serving as image/svg+xml ensures perfect scaling on high-density Retina displays.
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
  return res.send(SCHEMATIC_PLANT_SVG);
});

app.get("/favicon.png", (req, res) => {
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
  return res.send(SCHEMATIC_PLANT_SVG);
});

app.get("/site.webmanifest", (req, res) => {
  res.json({
    name: "FloraFinder",
    short_name: "FloraFinder",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1d",
    theme_color: "#0a0f1d",
    orientation: "portrait",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  });
});

// 4. VITE DEV SERVER / STATIC HANDLERS
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Dev middleware integrated successfully");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Botanical Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
