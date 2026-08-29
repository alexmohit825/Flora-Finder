import React, { useState } from "react";
import { Check, Star, MessageSquare } from "lucide-react";

interface FeedbackFormProps {
  queryId?: string;
}

export default function FeedbackForm({ queryId }: FeedbackFormProps) {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [altName, setAltName] = useState("");
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId: queryId || "playground-session",
          isCorrect: isCorrect === true,
          selectedAlternative: altName || "N/A",
          comments: comments || "N/A",
          rating: rating,
        }),
      });
      if (res.ok) {
        setFeedbackSuccess(true);
      }
    } catch (err) {
      console.error("Feedback error", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (feedbackSuccess) {
    return (
      <div className="text-center py-4 space-y-2">
        <div className="inline-flex bg-emerald-950 p-2 rounded-full text-emerald-400 mb-1 border border-emerald-900">
          <Check className="w-5 h-5" />
        </div>
        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Correction Submitted</h5>
        <p className="text-[10.5px] text-gray-400 max-w-[240px] mx-auto leading-relaxed">
          Thank you! Your feedback helps calibrate the FloraFinder and Pl@ntNet models.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
      <div>
        <span className="text-[9px] uppercase font-bold text-gray-500">Was this prediction accurate?</span>
        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={() => setIsCorrect(true)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isCorrect === true
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-gray-900 text-gray-500 border-transparent hover:bg-gray-800"
            }`}
          >
            Yes, spot on
          </button>
          <button
            type="button"
            onClick={() => setIsCorrect(false)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isCorrect === false
                ? "bg-red-950 text-red-400 border-red-900"
                : "bg-gray-900 text-gray-500 border-transparent hover:bg-gray-800"
            }`}
          >
            No, incorrect
          </button>
        </div>
      </div>

      {isCorrect === false && (
        <div className="space-y-1 animate-fadeIn duration-200">
          <label className="text-[9px] uppercase font-bold text-gray-500">Suggested Correct Species (Optional)</label>
          <input
            type="text"
            value={altName}
            onChange={(e) => setAltName(e.target.value)}
            placeholder="e.g. Lavender Rose"
            className="w-full bg-[#0d1424] px-3 py-1.5 rounded-lg border border-gray-900 focus:border-red-900 outline-none text-xs text-white"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[9px] uppercase font-bold text-gray-500">Confidence Calibration comments</label>
        <textarea
          rows={2}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter any distinct notes or focus complaints..."
          className="w-full bg-[#0d1424] px-3 py-1.5 rounded-lg border border-gray-900 focus:border-emerald-900 outline-none text-xs text-white resize-none"
        />
      </div>

      {/* Star performance rating */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase font-bold text-gray-500">Rating performance</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="p-1 cursor-pointer focus:outline-none"
            >
              <Star className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-700"}`} />
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submittingFeedback || isCorrect === null}
        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
          isCorrect !== null
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-gray-900 text-gray-600 cursor-not-allowed"
        }`}
      >
        {submittingFeedback ? "Transmitting Feed..." : "Send Botanical Correction"}
      </button>
    </form>
  );
}
