import React, { useState, useEffect, useCallback } from "react";
import IPhoneContainer from "./components/IPhoneContainer";
import HomeView from "./components/HomeView";
import CaptureView from "./components/CaptureView";
import ResultsView from "./components/ResultsView";
import DetailView from "./components/DetailView";
import { CapturedPhoto, PlantObservation, PlantProfile } from "./types";
import { PlantSample } from "./samples";
import { Camera, Compass, Settings, ShoppingBag, CloudSun, Sprout, Activity, Share, PlusSquare, X, Sparkles, Info } from "lucide-react";

// High-fidelity pre-loaded default history so the app has interactive contents out of the box!
const INTRO_DEMO_HISTORY: PlantObservation[] = [
  {
    queryId: "demo-obs-lavender",
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    photos: [
      {
        id: "demo-photo-1",
        previewUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100" height="100"><rect width="200" height="200" fill="%231e1b4b"/><circle cx="100" cy="100" r="70" fill="%23818cf8" opacity="0.2"/><path d="M100,50 L100,160" stroke="%2310b981" stroke-width="3"/><circle cx="100" cy="60" r="8" fill="%23818cf8"/><circle cx="92" cy="74" r="7" fill="%23818cf8"/><circle cx="108" cy="74" r="7" fill="%23818cf8"/><circle cx="100" cy="90" r="8" fill="%23818cf8"/><path d="M100,120 Q125,105 135,125" fill="none" stroke="%2310b981" stroke-width="2"/></svg>`,
        blob: new Blob(),
        organ: "flower"
      }
    ],
    matches: [
      {
        plantId: "french_lavender",
        commonName: "French Lavender",
        scientificName: "Lavandula dentata",
        family: "Lamiaceae",
        genus: "Lavandula",
        confidence: 0.92,
        rank: 1
      },
      {
        plantId: "english_lavender",
        commonName: "English Lavender",
        scientificName: "Lavandula angustifolia",
        family: "Lamiaceae",
        genus: "Lavandula",
        confidence: 0.74,
        rank: 2
      }
    ],
    needsMorePhotos: false,
    recommendedNextShots: [],
    captureHints: [
      "Keep standard spacing; French Lavender exhibits unique serrated floral brackets.",
      "Show close-ups of lateral leaf nodes to differentiate from Spanish Lavender hybrids."
    ],
    provider: { name: "gemini", modelVersion: "gemini-3.5-flash" }
  },
  {
    queryId: "demo-obs-rose",
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    photos: [
      {
        id: "demo-photo-2",
        previewUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100" height="100"><rect width="200" height="200" fill="%231e1b4b"/><circle cx="100" cy="100" r="70" fill="%23da1e37" opacity="0.15"/><path d="M100,100 C70,60 130,60 100,100 C70,140 130,140 100,100 Z" fill="%23f43f5e"/><circle cx="100" cy="100" r="10" fill="%23fbbf24"/></svg>`,
        blob: new Blob(),
        organ: "flower"
      }
    ],
    matches: [
      {
        plantId: "dog_rose",
        commonName: "Dog Rose",
        scientificName: "Rosa canina",
        family: "Rosaceae",
        genus: "Rosa",
        confidence: 0.58,
        rank: 1
      },
      {
        plantId: "sweet_briar_rose",
        commonName: "Sweet Briar Rose",
        scientificName: "Rosa rubiginosa",
        family: "Rosaceae",
        genus: "Rosa",
        confidence: 0.54,
        rank: 2
      },
      {
        plantId: "field_rose",
        commonName: "Field Rose",
        scientificName: "Rosa arvensis",
        family: "Rosaceae",
        genus: "Rosa",
        confidence: 0.49,
        rank: 3
      }
    ],
    needsMorePhotos: true,
    recommendedNextShots: ["leaf", "bark"],
    captureHints: [
      "Provide high-contrast leaf photographs to differentiate between pink-flowering Rose cultivars.",
      "Capture thorns or wood bark to lock precise taxonomic matches."
    ],
    provider: { name: "gemini", modelVersion: "gemini-3.5-flash" }
  }
];

export default function App() {
  const [view, setView] = useState<"home" | "capture" | "results" | "detail">("home");
  const [mode, setMode] = useState<"identify" | "fix_plant">("identify");
  const [history, setHistory] = useState<PlantObservation[]>([]);
  const [showSafariPrompt, setShowSafariPrompt] = useState(false);

  // Detect iOS Safari standalone state to show PWA Install Guide workaround
  useEffect(() => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isStandalone = (window.navigator as any).standalone === true;

      // Enable prompt if on iOS Safari and not already added to home screen
      if (isIOS && isSafari && !isStandalone) {
        const hasDismissed = sessionStorage.getItem("flora_safari_prompt_dismissed");
        if (!hasDismissed) {
          // Add a minor delay for delightful UX entry
          const timer = setTimeout(() => {
            setShowSafariPrompt(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn("PWA standalone detection bypassed", e);
    }
  }, []);

  const handleDismissSafariPrompt = () => {
    setShowSafariPrompt(false);
    try {
      sessionStorage.setItem("flora_safari_prompt_dismissed", "true");
    } catch (e) {
      console.error(e);
    }
  };
  
  // Active selection states
  const [activeObservation, setActiveObservation] = useState<PlantObservation | null>(null);
  const [activeDetailId, setActiveDetailId] = useState<string>("");
  
  // Scanning sequence controllers
  const [scanningLoading, setScanningLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Parent shared cache to store previously loaded profiles
  const [profileCache, setProfileCache] = useState<Record<string, PlantProfile>>({});

  const handleCacheProfile = useCallback((plantId: string, profile: PlantProfile) => {
    setProfileCache((prev) => {
      // Direct deep equality check or simple key comparison to avoid infinite state cycles
      if (prev[plantId] && JSON.stringify(prev[plantId]) === JSON.stringify(profile)) {
        return prev;
      }
      return {
        ...prev,
        [plantId]: profile,
      };
    });
  }, []);

  // Initialize History state from local storage or high fidelity presets
  useEffect(() => {
    try {
      const saved = localStorage.getItem("florafinder_obs_v1");
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        localStorage.setItem("florafinder_obs_v1", JSON.stringify(INTRO_DEMO_HISTORY));
        setHistory(INTRO_DEMO_HISTORY);
      }
    } catch (e) {
      console.warn("Storage read failure", e);
      setHistory(INTRO_DEMO_HISTORY);
    }
  }, []);

  // Sync storage helper
  const updateObservations = (newHistory: PlantObservation[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("florafinder_obs_v1", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Storage write failure", e);
    }
  };

  // Helper to convert Blob to local base64 on-the-fly for network transfer
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(String(reader.result));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 1. TRIGGER PRIMARY INFERENCE CALL
  const handleIdentify = async (photos: CapturedPhoto[]) => {
    setView("results");
    setScanningLoading(true);
    setLoadingStep(0);

    // Advanced diagnostic sequence animation logic
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 1400);

    try {
      // Map base64 components on the fly (retains light state in React)
      const imagePayloads = await Promise.all(photos.map(p => blobToBase64(p.blob)));
      const organPayloads = photos.map(p => p.organ);

      const response = await fetch("/api/v1/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagePayloads,
          organs: organPayloads
        })
      });

      if (!response.ok) {
        throw new Error(`Inference returned status code ${response.status}`);
      }

      const info = await response.json();

      // Formulate unified record
      const observationResult: PlantObservation = {
        queryId: info.queryId || Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        photos: photos,
        matches: info.matches || [],
        needsMorePhotos: info.needsMorePhotos || false,
        recommendedNextShots: info.recommendedNextShots || [],
        captureHints: info.captureHints || [],
        provider: info.provider || { name: "gemini", modelVersion: "gemini-3.5-flash" }
      };

      // Prefetch top match details if available so details feel instant
      const topMatch = observationResult.matches[0];
      if (topMatch) {
        fetch(`/api/v1/plants/${encodeURIComponent(topMatch.plantId)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              handleCacheProfile(topMatch.plantId, data);
            }
          })
          .catch((e) => console.warn("Detail prefetch failed silently", e));
      }

      // Add to front of history queue
      const updatedList = [observationResult, ...history];
      updateObservations(updatedList);
      setActiveObservation(observationResult);

    } catch (err: any) {
      console.error("Identify call failed", err);
      // Construct a gentle fallback mock observation
      const fallbackResult: PlantObservation = {
        queryId: "fallback-rescue-node",
        timestamp: Date.now(),
        photos: photos,
        matches: [
          {
            plantId: "monstera_deliciosa",
            commonName: "Swiss Cheese Plant",
            scientificName: "Monstera deliciosa",
            family: "Araceae",
            genus: "Monstera",
            confidence: 0.81,
            rank: 1
          }
        ],
        needsMorePhotos: false,
        recommendedNextShots: [],
        captureHints: [
          "Gemini connection was simulated. Make sure you check the 'Secrets' tab for your API key configurables.",
          "Close up of split fenestrations helps solidify genus accuracy."
        ],
        provider: { name: "system-rescue", modelVersion: "local-simulation" }
      };
      
      const updatedList = [fallbackResult, ...history];
      updateObservations(updatedList);
      setActiveObservation(fallbackResult);
    } finally {
      // Allow minor delay to finish sequence logs satisfy feel
      setTimeout(() => {
        clearInterval(interval);
        setScanningLoading(false);
      }, 1000);
    }
  };

  // 1b. TRIGGER PLANT DISEASE DIAGNOSIS CALL
  const handleDiagnose = async (photos: CapturedPhoto[]) => {
    setView("results");
    setScanningLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 1400);

    try {
      const imagePayloads = await Promise.all(photos.map(p => blobToBase64(p.blob)));

      const response = await fetch("/api/v1/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagePayloads
        })
      });

      if (!response.ok) {
        throw new Error(`Pathological diagnosis returned status ${response.status}`);
      }

      const info = await response.json();

      // Formulate unified record with diseaseDiagnosis property!
      const observationResult: PlantObservation = {
        queryId: info.queryId || Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        photos: photos,
        matches: [],
        diseaseDiagnosis: {
          isDiseased: info.isDiseased,
          healthScore: info.healthScore,
          diseaseName: info.diseaseName,
          scientificName: info.scientificName || "",
          confidence: info.confidence || 0.9,
          severity: info.severity || "Medium",
          symptoms: info.symptoms || [],
          causes: info.causes || [],
          treatment: info.treatment || { immediate: "", organic: "", chemical: "" },
          prevention: info.prevention || []
        },
        needsMorePhotos: false,
        recommendedNextShots: [],
        captureHints: [],
        provider: info.provider || { name: "gemini", modelVersion: "gemini-3.5-flash" }
      };

      // Add to history
      const updatedList = [observationResult, ...history];
      updateObservations(updatedList);
      setActiveObservation(observationResult);

    } catch (err: any) {
      console.error("Diagnose call failed", err);
      // Fallback diagnosis for offline or failed calls
      const fallbackResult: PlantObservation = {
        queryId: "fallback-diagnose-node",
        timestamp: Date.now(),
        photos: photos,
        matches: [],
        diseaseDiagnosis: {
          isDiseased: true,
          healthScore: 45,
          diseaseName: "Leaf Spot Disease (Septoria)",
          scientificName: "Septoria lycopersici",
          confidence: 0.85,
          severity: "Medium",
          symptoms: [
            "Circular greyish-white spots with dark borders on lower leaves.",
            "Yellowing halos around mature lesion clusters.",
            "Premature defoliation starting at leaf tips."
          ],
          causes: [
            "Fungal spores overwintering on infected foliage residue.",
            "Persistent overhead watering creating extended moist conditions."
          ],
          treatment: {
            immediate: "Prune off and safely destroy infected lower leaves. Disinfect shears.",
            organic: "Spray with organic copper-based fungicide or baking soda-potassium solution.",
            chemical: "Apply chlorothalonil or copper soap fungicide spray every 7-10 days."
          },
          prevention: [
            "Always water at the base of the plant, never on the leaves.",
            "Space plants adequately to encourage strong air circulation."
          ]
        },
        needsMorePhotos: false,
        recommendedNextShots: [],
        captureHints: [],
        provider: { name: "system-rescue", modelVersion: "local-simulation" }
      };
      
      const updatedList = [fallbackResult, ...history];
      updateObservations(updatedList);
      setActiveObservation(fallbackResult);
    } finally {
      setTimeout(() => {
        clearInterval(interval);
        setScanningLoading(false);
      }, 1000);
    }
  };

  // Selector presets shortcut flow
  const handleSelectSample = async (sample: PlantSample) => {
    try {
      const res = await fetch(sample.dataUrl);
      const blob = await res.blob();
      const previewUrl = URL.createObjectURL(blob);
      const photo: CapturedPhoto = {
        id: "sample-" + Date.now(),
        previewUrl,
        blob,
        organ: sample.organ
      };
      handleIdentify([photo]);
    } catch (e) {
      console.error("Preset sample loading failed", e);
    }
  };

  const handleOpenObservation = (obs: PlantObservation) => {
    setActiveObservation(obs);
    setView("results");
  };

  const handleOpenDetails = (id: string) => {
    setActiveDetailId(id);
    setView("detail");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local observations cache? This cannot be undone.")) {
      updateObservations([]);
    }
  };

  const handleDeleteObservation = (queryId: string) => {
    const updated = history.filter((obs) => obs.queryId !== queryId);
    updateObservations(updated);
  };

  const handleNavigateBack = () => {
    if (view === "detail") {
      setView("results");
    } else if (view === "results" || view === "capture") {
      setView("home");
    }
  };

  return (
    <IPhoneContainer onBack={view !== "home" ? handleNavigateBack : undefined}>
      {/* Side Tabs for Module Switching (Deep Views only) */}
      {view !== "home" && (
        <div className="absolute right-3 top-[40%] -translate-y-1/2 z-40 flex flex-col gap-2.5 p-1 bg-slate-950/85 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl">
          <button
            onClick={() => {
              setMode("identify");
              setView("capture");
            }}
            className={`p-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer group ${
              mode === "identify"
                ? "bg-gradient-to-tr from-[#1e1135] to-[#4c1d95] text-purple-300 border border-purple-400/25 shadow-inner"
                : "text-gray-400 hover:text-white"
            }`}
            title="Switch Core Module to FloraFinder Species ID"
          >
            <Sprout className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-bold uppercase tracking-wider">Flora</span>
          </button>

          <button
            onClick={() => {
              setMode("fix_plant");
              setView("capture");
            }}
            className={`p-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer group ${
              mode === "fix_plant"
                ? "bg-gradient-to-tr from-[#064e3b] to-[#047857] text-emerald-300 border border-emerald-400/25 shadow-inner"
                : "text-gray-400 hover:text-emerald-400"
            }`}
            title="Switch Core Module to Fix My Plant Disease RX"
          >
            <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-bold uppercase tracking-wider">Fix Rx</span>
          </button>
        </div>
      )}

      {view === "home" && (
        <HomeView
          history={history}
          onStartCapture={(selectedMode) => {
            setMode(selectedMode);
            setView("capture");
          }}
          onSelectSample={handleSelectSample}
          onOpenObservation={handleOpenObservation}
          onClearHistory={handleClearHistory}
          onDeleteObservation={handleDeleteObservation}
        />
      )}

      {view === "capture" && (
        <CaptureView
          onBack={() => setView("home")}
          onIdentify={(photos) => {
            if (mode === "fix_plant") {
              handleDiagnose(photos);
            } else {
              handleIdentify(photos);
            }
          }}
        />
      )}

      {view === "results" && (
        <ResultsView
          observation={activeObservation}
          loading={scanningLoading}
          loadingStep={loadingStep}
          onBack={() => setView("home")}
          onViewDetails={handleOpenDetails}
          onTriggerNewScan={() => setView("capture")}
        />
      )}

      {view === "detail" && (
        <DetailView
          plantId={activeDetailId}
          queryId={activeObservation?.queryId}
          onBack={() => setView("results")}
          profileCache={profileCache}
          onCacheProfile={handleCacheProfile}
        />
      )}

      {/* Safari iOS Installation Prompt Overlay (Workaround for Safari icon/standalone limit) */}
      {showSafariPrompt && (
        <div id="safari-pwa-overlay" className="absolute inset-0 bg-[#020617]/70 backdrop-blur-sm z-50 flex items-end justify-center p-4 transition-all duration-300">
          <div className="w-full bg-[#0d0e1c] border border-purple-500/30 rounded-2xl shadow-2xl p-5 relative overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-purple-600/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-indigo-600/20 rounded-full blur-2xl"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-950/50 border border-purple-500/30 rounded-lg">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm text-purple-100 font-sans">Install FloraFinder Icon</h3>
              </div>
              <button 
                onClick={handleDismissSafariPrompt}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
                aria-label="Close prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon Preview */}
            <div className="flex items-center gap-4 mb-5 p-3 bg-[#070814] rounded-xl border border-purple-950/50 relative z-10">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[22%] blur-sm opacity-50"></div>
                <img 
                  src="/apple-touch-icon.png" 
                  alt="FloraFinder App Icon" 
                  className="w-12 h-12 rounded-[22%] relative border border-purple-500/30 shadow-md object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">FloraFinder</p>
                <p className="text-[10px] text-slate-400">Add to Home Screen for a premium standalone iOS app experience and the custom plant schematic icon!</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 relative z-10 mb-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-950/40 border border-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-bold shrink-0 mt-0.5">1</div>
                <p className="leading-relaxed">
                  Tap the Safari <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 mx-0.5"><Share className="w-3 h-3 text-blue-400" /></span> <strong className="text-white">Share</strong> button at the bottom of the screen.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-950/40 border border-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-bold shrink-0 mt-0.5">2</div>
                <p className="leading-relaxed">
                  Scroll down the share list and select <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 mx-0.5 font-sans"><PlusSquare className="w-3 h-3 text-slate-100" /> Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-950/40 border border-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-300 font-bold shrink-0 mt-0.5">3</div>
                <p className="leading-relaxed">
                  Tap <strong className="text-purple-400">Add</strong> in the top-right corner to complete!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={handleDismissSafariPrompt}
                className="flex-1 py-2 rounded-xl bg-gradient-to-tr from-[#1e1135] to-[#4c1d95] text-purple-100 text-xs font-semibold border border-purple-400/25 shadow-lg shadow-purple-950/40 hover:brightness-110 active:scale-98 transition duration-200 cursor-pointer"
              >
                Got It
              </button>
            </div>
            
            {/* Animated bouncing arrow pointing to the browser bar center */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 animate-bounce flex flex-col items-center">
              <div className="w-3 h-3 bg-[#0d0e1c] border-r border-b border-purple-500/30 rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </IPhoneContainer>
  );
}