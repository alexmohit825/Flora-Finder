import React, { useState, useEffect, lazy, Suspense } from "react";
import { ArrowLeft, Sprout, Sun, Droplets, Compass, AlertTriangle, MessageSquare, ShieldAlert } from "lucide-react";
import { PlantProfile } from "../types";

const FeedbackForm = lazy(() => import("./FeedbackForm"));

interface DetailViewProps {
  plantId: string;
  onBack: () => void;
  queryId?: string;
  profileCache: Record<string, PlantProfile>;
  onCacheProfile: (plantId: string, profile: PlantProfile) => void;
}

export default function DetailView({
  plantId,
  onBack,
  queryId,
  profileCache,
  onCacheProfile,
}: DetailViewProps) {
  const [profile, setProfile] = useState<PlantProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle for dynamic lazy loading trigger
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!plantId) return;

    const cached = profileCache[plantId];
    if (cached) {
      setProfile(cached);
    }

    const controller = new AbortController();
    const { signal } = controller;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v1/plants/${encodeURIComponent(plantId)}`, { signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data: PlantProfile = await res.json();
        setProfile(data);
        onCacheProfile(plantId, data);
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // ignore aborted requests
        setError('Could not load details.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      controller.abort();
    };
  }, [plantId, profileCache, onCacheProfile]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-5 bg-[#080d19] overflow-y-auto space-y-6 fade-in scrollbar-none">
        <button onClick={onBack} className="text-xs text-gray-500 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Shimmer skeleton loader */}
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-[#16213a] rounded-md w-2/3"></div>
          <div className="h-4 bg-[#16213a] rounded-md w-1/3"></div>
          <div className="aspect-video bg-[#16213a] rounded-2xl w-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-[#16213a] rounded-md w-full"></div>
            <div className="h-4 bg-[#16213a] rounded-md w-full"></div>
            <div className="h-4 bg-[#16213a] rounded-md w-5/6"></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 bg-[#16213a] rounded-xl"></div>
            <div className="h-24 bg-[#16213a] rounded-xl"></div>
            <div className="h-24 bg-[#16213a] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#080d19] space-y-4">
        <div className="bg-red-950/40 p-4 rounded-full text-red-400 border border-red-900/40">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-white text-sm">Profile Load Failed</h3>
          <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-bold text-emerald-400 bg-emerald-950/50 py-1.5 px-4 rounded-full border border-emerald-900/40 active:scale-95"
        >
          Return to Results
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-5 bg-[#080d19] overflow-y-auto space-y-5 scrollbar-none fade-in">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8fa2ca] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Matches
        </button>
        <span className="text-[9px] uppercase font-bold text-[#8fa2ca] bg-[#16203a] py-0.5 px-2.5 rounded-full border border-[#2b3e64]">
          {profile.category || "Flora Profile"}
        </span>
      </div>

      {/* Main headings */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
          {profile.commonName}
        </h2>
        <p className="text-xs text-emerald-400 italic font-mono mt-0.5">
          {profile.scientificName}
        </p>
      </div>

      {/* Botanical Description block */}
      <div className="bg-[#11192e] border border-[#1e2f52]/40 rounded-3xl p-4.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold font-display text-white">
          <Sprout className="w-4 h-4 text-emerald-400" />
          Horticultural Overview
        </div>
        <p className="text-[11.5px] text-gray-400 leading-relaxed font-sans">
          {profile.description || "No description currently cataloged for this taxonomic target."}
        </p>
      </div>

      {/* Bento Care Grid */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase font-bold tracking-widest text-gray-500 font-display">
          Care Guidance Profile
        </h4>

        <div className="grid grid-cols-3 gap-3">
          
          {/* Sunlight */}
          <div className="bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="bg-amber-950/50 p-1.5 rounded-xl text-amber-400 border border-amber-900/40 w-fit">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-amber-400/80 uppercase font-display select-none">Sunlight</span>
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed mt-0.5 line-clamp-3" title={profile.care.sun}>
                {profile.care.sun}
              </p>
            </div>
          </div>

          {/* Water */}
          <div className="bg-sky-950/20 border border-sky-900/30 p-3.5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="bg-sky-950/50 p-1.5 rounded-xl text-sky-400 border border-sky-900/40 w-fit">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-sky-400/80 uppercase font-display select-none">Watering</span>
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed mt-0.5 line-clamp-3" title={profile.care.water}>
                {profile.care.water}
              </p>
            </div>
          </div>

          {/* Soil */}
          <div className="bg-orange-950/10 border border-orange-900/30 p-3.5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="bg-orange-950/30 p-1.5 rounded-xl text-orange-400 border border-orange-900/40 w-fit">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-orange-400/80 uppercase font-display select-none">Soil Bed</span>
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed mt-0.5 line-clamp-3" title={profile.care.soil}>
                {profile.care.soil}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* TOXICITY WARNING CARD */}
      <div className="bg-red-950/15 border border-red-950 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold font-display text-red-400 select-none">
          <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
          Toxicity Metrics
        </div>
        <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed pt-1">
          <div className="border-r border-red-950/40 pr-3">
            <span className="text-gray-500 font-bold uppercase text-[8px] tracking-wider">Human Risk</span>
            <p className="text-gray-300 mt-0.5">{profile.toxicity.human}</p>
          </div>
          <div>
            <span className="text-gray-500 font-bold uppercase text-[8px] tracking-wider">Domestic Pets</span>
            <p className="text-gray-300 mt-0.5">{profile.toxicity.pets}</p>
          </div>
        </div>
      </div>

      {/* FEEDBACK CORRECTION SHEET WRAPPER */}
      <div className="border border-gray-900 bg-[#060a12] rounded-2xl py-1 overflow-hidden">
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-900/30 transition-all text-xs text-gray-400 font-medium cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-semibold text-gray-300">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Submit Diagnostic Feedback
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-gray-950 rounded text-[#8fa2ca]">
            {showFeedback ? "Hide" : "Expand"}
          </span>
        </button>

        {showFeedback && (
          <div className="bg-[#03060c] p-4 text-left border-t border-gray-950">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-6 text-xs text-[#8fa2ca] animate-pulse">
                  Loading Diagnostic Platform...
                </div>
              }
            >
              <FeedbackForm queryId={queryId} />
            </Suspense>
          </div>
        )}
      </div>

    </div>
  );
}
