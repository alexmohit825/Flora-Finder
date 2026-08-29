import { CapturedPhoto, PlantObservation } from "../types";
import { PLANT_SAMPLES, PlantSample } from "../samples";
import { Camera, Calendar, ArrowRight, Trash2, Sprout, Activity } from "lucide-react";

interface HomeViewProps {
  history: PlantObservation[];
  onStartCapture: (mode: "identify" | "fix_plant") => void;
  onSelectSample: (sample: PlantSample) => void;
  onOpenObservation: (obs: PlantObservation) => void;
  onClearHistory: () => void;
  onDeleteObservation: (queryId: string) => void;
}

export default function HomeView({
  history,
  onStartCapture,
  onSelectSample,
  onOpenObservation,
  onClearHistory,
  onDeleteObservation,
}: HomeViewProps) {
  
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-6 scrollbar-none fade-in">
      
      {/* Brand & Stats card */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          {/* Mini Purple Rose Brand Icon */}
          <div className="w-10 h-10 bg-gradient-to-tr from-[#1e1135] to-[#4c1d95] rounded-xl flex items-center justify-center shadow-lg border border-purple-500/20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Elegant green rose leaf */}
              <path d="M25,55 C15,48 18,30 35,35 C42,37 40,50 25,55 Z" fill="url(#miniLeafGrad)" />
              <path d="M50,18 C30,18 20,40 30,68 C35,78 65,78 70,68 C80,40 70,18 50,18 Z" fill="url(#miniOuterRoseGrad)" />
              <path d="M35,42 C28,55 35,72 50,75 C65,72 72,55 65,42 C60,35 40,35 35,42 Z" fill="url(#miniMidRoseGrad)" />
              <path d="M42,48 C38,55 45,64 50,65 C55,64 62,55 58,48 Z" fill="url(#miniInnerRoseGrad)" />
              <circle cx="50" cy="54" r="3" fill="url(#miniHeartRoseGrad)" />
              <circle cx="38" cy="46" r="1.2" fill="white" opacity="0.8" />
              <defs>
                <linearGradient id="miniLeafGrad" x1="15" y1="30" x2="35" y2="55">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="miniOuterRoseGrad" x1="50" y1="18" x2="50" y2="78">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>
                <linearGradient id="miniMidRoseGrad" x1="50" y1="35" x2="50" y2="75">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>
                <linearGradient id="miniInnerRoseGrad" x1="50" y1="44" x2="50" y2="65">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
                <linearGradient id="miniHeartRoseGrad" x1="50" y1="49" x2="50" y2="58">
                  <stop offset="0%" stopColor="#f3e8ff" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-display">
              iOS Botanical AI
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display leading-tight">
              FloraFinder
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-900/30 px-2.5 py-1 rounded-full">
          <Sprout className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-purple-300 font-mono text-xs font-semibold">{history.length}</span>
        </div>
      </div>

      {/* Dual Module Bento Launcher Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        
        {/* Module 1: Identify Species */}
        <div 
          className="bg-[#11182c]/80 rounded-3xl p-4 border border-purple-500/20 shadow-xl relative overflow-hidden flex flex-col items-center text-center animate-fade-in"
        >
          {/* Pulsing neon waves under launcher */}
          <div className="absolute right-[-10%] top-[-10%] w-24 h-24 rounded-full bg-purple-700/10 blur-xl"></div>
          
          <button
            id="btn-home-start-capture-identify"
            onClick={() => onStartCapture("identify")}
            className="relative group focus:outline-none mb-3 mt-1 transition-transform duration-300 hover:scale-[1.04] active:scale-[0.96] cursor-pointer p-0 bg-transparent border-0"
            title="Launch Species Scanner"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-[24%] opacity-20 blur-sm group-hover:opacity-40 group-hover:scale-105 transition-all duration-300 animate-pulse"></div>
            
            <div className="relative w-20 h-20 bg-gradient-to-tr from-[#110924] via-[#240842] to-[#4c1d95] rounded-[20px] shadow-lg border-2 border-purple-400/30 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-[66px] h-[66px] pointer-events-none select-none transition-transform duration-500 group-hover:rotate-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25,55 C15,48 18,30 35,35 C42,37 40,50 25,55 Z" fill="url(#heroLeafGrad)" />
                <path d="M25,55 Q30,42 35,35" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                <path d="M50,18 C30,18 20,40 30,68 C35,78 65,78 70,68 C80,40 70,18 50,18 Z" fill="url(#heroOuterRoseGrad)" />
                <path d="M35,42 C28,55 35,72 50,75 C65,72 72,55 65,42 C60,35 40,35 35,42 Z" fill="url(#heroMidRoseGrad)" />
                <path d="M42,48 C38,55 45,64 50,65 C55,64 62,55 58,48 M49,52 A1.5,1.5 0 0 1 52,53" fill="url(#heroInnerRoseGrad)" />
                <circle cx="38" cy="46" r="1.5" fill="white" opacity="0.8" />
                <circle cx="62" cy="54" r="1.2" fill="white" opacity="0.75" />
                <circle cx="48" cy="32" r="2" fill="white" opacity="0.25" />
                <path d="M0,0 Q50,45 100,0 L100,0 L0,0 Z" fill="white" opacity="0.04" />
                <defs>
                  <linearGradient id="heroLeafGrad" x1="15" y1="30" x2="35" y2="55">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="heroOuterRoseGrad" x1="50" y1="18" x2="50" y2="78">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#7e22ce" />
                    <stop offset="100%" stopColor="#3b0764" />
                  </linearGradient>
                  <linearGradient id="heroMidRoseGrad" x1="50" y1="35" x2="50" y2="75">
                    <stop offset="0%" stopColor="#d8b4fe" />
                    <stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                  <linearGradient id="heroInnerRoseGrad" x1="50" y1="44" x2="50" y2="65">
                    <stop offset="0%" stopColor="#f3e8ff" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-x-0 bottom-0 py-0.5 bg-purple-950/70 border-t border-purple-500/20 text-[7px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                Species
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none"></div>
            </div>
          </button>

          <h3 className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            <Camera className="w-3 h-3 text-purple-400" />
            Identify Species
          </h3>
          <p className="text-gray-400 text-[9.5px] mt-1 leading-normal max-w-[130px]">
            Scan specimen to identify taxonomy, family, and exact genus.
          </p>
        </div>

        {/* Module 2: Fix My Plant */}
        <div 
          className="bg-[#11182c]/80 rounded-3xl p-4 border border-emerald-500/20 shadow-xl relative overflow-hidden flex flex-col items-center text-center animate-fade-in"
        >
          {/* Soft atmospheric gradient highlights */}
          <div className="absolute left-[-10%] bottom-[-10%] w-24 h-24 rounded-full bg-emerald-500/5 blur-xl"></div>
          
          <button
            id="btn-home-start-capture-fixplant"
            onClick={() => onStartCapture("fix_plant")}
            className="relative group focus:outline-none mb-3 mt-1 transition-transform duration-300 hover:scale-[1.04] active:scale-[0.96] cursor-pointer p-0 bg-transparent border-0"
            title="Launch Plant Doctor"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-[24%] opacity-20 blur-sm group-hover:opacity-40 group-hover:scale-105 transition-all duration-300 animate-pulse"></div>
            
            <div className="relative w-20 h-20 bg-gradient-to-tr from-[#021814] via-[#052d24] to-[#0d5345] rounded-[20px] shadow-lg border-2 border-emerald-400/30 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-[66px] h-[66px] pointer-events-none select-none transition-transform duration-500 group-hover:rotate-6 animate-pulse" style={{ animationDuration: '3s' }} fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Elegant green diagnostics leaf */}
                <path d="M50,15 C22,35 25,75 50,85 C75,75 78,35 50,15 Z" fill="url(#docLeafGrad)" />
                {/* Glowing medical cross */}
                <path d="M42,42 H48 V36 H52 V42 H58 V46 H52 V52 H48 V46 H42 Z" fill="#ffffff" opacity="0.9" />
                {/* Diagnostics Scanner rays */}
                <line x1="15" y1="46" x2="85" y2="46" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" opacity="0.6"/>
                <circle cx="28" cy="35" r="1.5" fill="white" opacity="0.8" />
                <circle cx="72" cy="55" r="1.2" fill="white" opacity="0.75" />
                <path d="M0,0 Q50,45 100,0 L100,0 L0,0 Z" fill="white" opacity="0.04" />
                <defs>
                  <linearGradient id="docLeafGrad" x1="50" y1="15" x2="50" y2="85">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-x-0 bottom-0 py-0.5 bg-emerald-950/80 border-t border-emerald-500/20 text-[7px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                Doctor AI
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none"></div>
            </div>
          </button>

          <h3 className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            Fix My Plant
          </h3>
          <p className="text-gray-400 text-[9.5px] mt-1 leading-normal max-w-[130px]">
            Diagnose leaf damage, pests, spot disease & get cures.
          </p>
        </div>
        
      </div>


      {/* Quick Play Samples Gallery */}
      <div className="space-y-2.5">
        <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-display">
          Quick Play Samples
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {PLANT_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              id={`btn-sample-${idx}`}
              onClick={() => onSelectSample(sample)}
              className="flex flex-col items-center bg-[#11192e] hover:bg-[#16213e] p-2 rounded-xl transition-all duration-200 cursor-pointer border border-[#1e2e4e]/30 group active:scale-95"
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#2b3e64] bg-[#0c1322] flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[9px] text-[#8fa2ca] font-medium mt-1 truncate max-w-full leading-tight text-center">
                {sample.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Identifications List */}
      <div className="flex-1 flex flex-col min-h-0 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-display">
            Recent Observations
          </h4>
          {history.length > 0 && (
            <button
              id="clear-all-history"
              onClick={onClearHistory}
              className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-950/20 py-0.5 px-2 rounded-md border border-red-900/30 active:scale-95 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#11192e]/40 rounded-3xl border border-[#1e2e4e]/30 border-dashed">
            <div className="bg-[#122136] p-4 rounded-full mb-3 text-emerald-400">
              <Sprout className="w-7 h-7" />
            </div>
            <p className="text-gray-300 text-xs font-semibold leading-relaxed">
              No Local Identifications Yet
            </p>
            <p className="text-gray-500 text-[11px] mt-1 line-clamp-2 leading-normal">
              Press the green button above or choose an interactive sample to explore our taxonomy database.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 max-h-[220px]">
            {history.map((obs) => {
              const primaryMatch = obs.matches[0];
              const highConfidence = primaryMatch?.confidence >= 0.8;
              const hasAlternate = obs.matches.length > 1;

              return (
                <div
                  key={obs.queryId}
                  className="bg-[#11182c] hover:bg-[#151f38] px-3.5 py-3 rounded-2xl border border-[#1e2f50]/40 transition-all duration-200 flex items-center justify-between group active:scale-[0.982]"
                >
                  <button
                    onClick={() => onOpenObservation(obs)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#2b3e64] bg-[#0c1322] shrink-0">
                      <img
                        src={obs.photos[0]?.previewUrl}
                        alt={primaryMatch?.commonName || "Plant"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-white truncate max-w-[180px]">
                        {primaryMatch?.commonName || "Unknown Plant"}
                      </h5>
                      <p className="text-[10px] text-gray-400 italic truncate max-w-[180px]">
                        {primaryMatch?.scientificName || "N/A"}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          highConfidence 
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-900/40" 
                            : "bg-amber-950/70 text-amber-400 border border-amber-900/40"
                        }`}>
                          {Math.round((primaryMatch?.confidence || 0) * 100)}% Conf
                        </span>
                        <span className="text-[9px] text-gray-500 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDate(obs.timestamp)}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onDeleteObservation(obs.queryId)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-gray-500 p-2 transition-all duration-150 rounded-lg hover:bg-red-950/20 active:scale-90"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR CODE GENERATOR CARD AT THE BOTTOM */}
      <div className="pt-2">
        <div className="bg-[#11192e]/85 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 bg-emerald-500/5 w-24 h-24 rounded-full"></div>
          
          <div className="bg-white p-1 rounded-xl shrink-0 shadow-lg shadow-black/40">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=92x92&color=0b0f19&data=${encodeURIComponent(window.location.href || "https://ai.studio/build")}`}
              alt="Scan on iOS"
              className="w-[92px] h-[92px]"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1 z-10">
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 font-display">
              Test Live on iPhone
            </h5>
            <p className="text-xs font-bold text-white leading-tight">
              Scan QR to Open Mobile App
            </p>
            <p className="text-[10px] text-gray-400 leading-normal">
              Acquire photo streams with physical camera lenses for high-fidelity on-site testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
