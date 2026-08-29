import { PlantObservation, PlantMatch } from "../types";
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, HelpCircle, Activity, CornerDownRight, Leaf, Shield } from "lucide-react";

interface ResultsViewProps {
  observation: PlantObservation | null;
  loading: boolean;
  loadingStep: number;
  onBack: () => void;
  onViewDetails: (plantId: string) => void;
  onTriggerNewScan: () => void;
}

const SCAN_LOGS = [
  "Initializing vision core diagnostics...",
  "Inspecting image quality & chromatic range...",
  "Segmenting floral leaf nodes and visual organs...",
  "Preparing multi-spectral plant telemetry...",
  "Running Gemini disease pathologist engine...",
  "Formulating botanical recovery treatment plan..."
];

export default function ResultsView({
  observation,
  loading,
  loadingStep,
  onBack,
  onViewDetails,
  onTriggerNewScan,
}: ResultsViewProps) {

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070b14] p-6 text-center h-full space-y-6 fade-in animate-pulse">
        {/* Simple single subtle rotation layout */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/15 border-t-emerald-500 animate-spin"></div>
          <Leaf className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="space-y-1.5 max-w-xs">
          <h3 className="text-sm font-bold font-display text-white">Analyzing Specimen</h3>
          <p className="text-[#a0aec0] text-xs leading-relaxed">
            Botanical identifier matching structures against health database...
          </p>
        </div>

        {/* Diagnostic logs container */}
        <div className="w-full bg-[#0a0f1d] border border-gray-900 rounded-2xl p-4 text-left font-mono text-[10px] space-y-2 max-w-[320px]">
          {SCAN_LOGS.map((log, index) => {
            const isActive = index === loadingStep;
            const isCompleted = index < loadingStep;
            return (
              <div
                key={index}
                className={`flex items-start gap-2 transition-all duration-300 ${
                  isActive ? "text-emerald-400 font-bold" : isCompleted ? "text-emerald-700 font-medium" : "text-gray-700"
                }`}
              >
                <span>{isCompleted ? "✓" : isActive ? "▶" : "○"}</span>
                <span className="leading-normal">{log}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!observation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-gray-300 text-sm font-semibold">No Observation Loaded</p>
        <button onClick={onBack} className="mt-4 text-xs font-bold text-emerald-400">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const matches = observation.matches || [];
  const topMatch = matches[0];
  const confidence = topMatch?.confidence || 0;

  // Confidence assessment band
  let band: "likely" | "tentative" | "low" = "low";
  if (confidence > 0.80) {
    band = "likely";
  } else if (confidence >= 0.50) {
    band = "tentative";
  }

  const diagnosis = observation.diseaseDiagnosis;

  return (
    <div className="flex-1 flex flex-col p-5 bg-[#080d19] overflow-y-auto space-y-5 scrollbar-none fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-[#8fa2ca] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-[#022c22]/40 border border-[#047857]/30 px-2 py-0.5 rounded-full">
          {diagnosis ? "Botanical Rx Node" : "Inference Node"}
        </span>
      </div>

      {/* CONFIDENCE BAND RECOGNITION CARD (Only show if not diagnosis) */}
      {!diagnosis && band === "likely" && (
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-3xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Likely Match Confirmed
            </h4>
            <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
              Successfully identified <strong>{topMatch.commonName}</strong> with high confidence.
            </p>
          </div>
        </div>
      )}

      {!diagnosis && band === "tentative" && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-3xl p-4 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Tentative Candidates
            </h4>
            <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
              Review our top potential taxonomic matches sorted below.
            </p>
          </div>
        </div>
      )}

      {!diagnosis && band === "low" && (
        <div className="bg-red-950/30 border border-red-800/40 rounded-3xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
              Low Certainty Detection
            </h4>
            <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
              Visual inputs were ambiguous. Supplementary photos may assist.
            </p>
          </div>
        </div>
      )}

      {/* 1. TOP SECTION: SUBMITTED SPECIMEN */}
      <div className="flex flex-col items-center">
        <div className="w-full relative rounded-2xl overflow-hidden border border-[#1e2f50]/40 shadow-lg bg-[#0c1322]">
          <img
            src={observation.photos[0]?.previewUrl}
            alt="Submitted specimen"
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          {diagnosis && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-white font-bold flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${diagnosis.isDiseased ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {diagnosis.isDiseased ? `${diagnosis.severity} Severity` : "Pristine Health"}
            </div>
          )}
        </div>
      </div>

      {/* DYNAMICS SWITCH: CLINICAL HEALTH DIAGNOSIS VS SPECIES CLASSIFIER */}
      {diagnosis ? (
        <div className="space-y-5">
          
          {/* Health Score Progress Ring Bar */}
          <div className="bg-[#11182c]/85 border border-[#1e2f50]/40 rounded-3xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Diagnosis Overview</span>
              <h3 className="text-lg font-bold text-white font-display leading-tight">{diagnosis.diseaseName}</h3>
              <p className="text-[11px] italic text-[#8fa2ca]">{diagnosis.scientificName || "N/A"}</p>
            </div>
            
            {/* Visual Circular progress score */}
            <div className="flex flex-col items-center shrink-0 ml-4 relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 relative" style={{
                borderColor: diagnosis.healthScore > 75 ? '#10b981' : diagnosis.healthScore > 40 ? '#f59e0b' : '#ef4444'
              }}>
                <span className="text-sm font-bold text-white font-mono">{diagnosis.healthScore}%</span>
              </div>
              <span className="text-[9px] text-[#8fa2ca] mt-1 font-semibold uppercase tracking-widest">Health Score</span>
            </div>
          </div>

          {/* Symptoms and Etiology Causes */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Observed Symptoms */}
            <div className="bg-[#11182c]/85 border border-[#1e2f50]/30 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 font-display flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Observed Symptoms
              </h4>
              <ul className="space-y-1.5">
                {diagnosis.symptoms.map((symptom, idx) => (
                  <li key={idx} className="text-gray-300 text-[11px] leading-relaxed flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-1 shrink-0">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pathological Causes */}
            <div className="bg-[#11182c]/85 border border-[#1e2f50]/30 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#8fa2ca] font-display flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Likely Trigger Causes
              </h4>
              <ul className="space-y-1.5">
                {diagnosis.causes.map((cause, idx) => (
                  <li key={idx} className="text-gray-300 text-[11px] leading-relaxed flex items-start gap-1.5">
                    <span className="text-indigo-400 mt-1 shrink-0">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Clinical Curative RX Treatment Care Plan */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-display flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Botanist RX Treatment Plan
            </h4>

            <div className="space-y-3.5">
              
              {/* Rx Column 1: Immediate Triage */}
              <div className="bg-[#11182c]/90 border-l-4 border-red-500 rounded-r-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-red-500">Step 1: Immediate Triage</span>
                <p className="text-gray-200 text-xs leading-relaxed font-semibold">{diagnosis.treatment.immediate}</p>
              </div>

              {/* Rx Column 2: Organic Recovery */}
              <div className="bg-[#11182c]/90 border-l-4 border-emerald-500 rounded-r-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">Step 2: Organic Treatment</span>
                <p className="text-gray-200 text-xs leading-relaxed">{diagnosis.treatment.organic}</p>
              </div>

              {/* Rx Column 3: Chemical Option */}
              <div className="bg-[#11182c]/90 border-l-4 border-indigo-500 rounded-r-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400">Step 3: Chemical Solution</span>
                <p className="text-gray-200 text-xs leading-relaxed">{diagnosis.treatment.chemical}</p>
              </div>

            </div>
          </div>

          {/* Long Term Preventive Actions */}
          <div className="bg-[#11182c]/85 border border-emerald-500/10 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 font-display flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Recurrence Prevention Guidelines
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {diagnosis.prevention.map((prevent, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#0c1322] p-2.5 rounded-xl border border-emerald-500/5">
                  <span className="text-emerald-500 shrink-0 text-xs font-bold font-mono">#{idx+1}</span>
                  <p className="text-gray-300 text-[11px] leading-relaxed">{prevent}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* STANDARD CANDIDATES MATCH LIST */
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-display">
            Identified Candidates
          </h4>

          <div className="space-y-3">
            {matches.slice(0, 3).map((match, index) => (
              <button
                key={match.plantId}
                onClick={() => onViewDetails(match.plantId)}
                className="w-full text-left rounded-2xl border border-[#1e2f50]/40 bg-[#11182c] hover:bg-[#15203b] p-4 transition-all duration-200 cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">
                    {match.commonName}
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                    {(match.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-xs italic text-gray-400">
                  {match.scientificName}
                </div>
                <div className="text-[11px] text-[#8fa2ca] mt-1.5 flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-emerald-400" />
                  Top {index === 0 ? 'match' : `candidate #${index + 1}`} based on visual leaf/petal segments.
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. GUIDANCE SECTION */}
      {!diagnosis && observation.needsMorePhotos && (
        <div className="mt-4 rounded-2xl border border-amber-900/30 bg-amber-950/20 p-3.5 text-xs text-amber-300">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Supplemental photo recommended
          </div>
          {observation.recommendedNextShots?.length > 0 && (
            <div className="mb-1 leading-normal">
              Recommended next angles: <strong className="text-white">{observation.recommendedNextShots.join(', ')}</strong>
            </div>
          )}
          {observation.captureHints?.map((hint, idx) => (
            <div key={idx} className="text-gray-300 mt-1 leading-relaxed">• {hint}</div>
          ))}
        </div>
      )}

      {/* NEW SCAN TRIGGER BUTTON */}
      <button
        id="btn-trigger-new-scan"
        onClick={onTriggerNewScan}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.985] shadow shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer shrink-0 mt-4"
      >
        <Sparkles className="w-4 h-4" />
        {diagnosis ? "Diagnose New Plant" : "Analyze New Specimen"}
      </button>

    </div>
  );
}
