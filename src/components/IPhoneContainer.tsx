import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, ArrowLeft } from "lucide-react";

interface IPhoneContainerProps {
  children: React.ReactNode;
  onHomePress?: () => void;
  onBack?: () => void;
}

export default function IPhoneContainer({ children, onHomePress, onBack }: IPhoneContainerProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center py-6 px-4 font-sans antialiased text-gray-100">
      {/* Dynamic Background Elements for atmosphere */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 rounded-full bg-purple-900/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-72 h-72 rounded-full bg-indigo-950/20 blur-[100px] pointer-events-none"></div>

      {/* Sleek Centered Container representing a beautiful app interface */}
      <div className="w-full max-w-[440px] h-[780px] bg-[#0c1222] rounded-3xl shadow-2xl border border-purple-500/15 flex flex-col overflow-hidden relative">
        {/* Sleek App Branding Bar */}
        <div className="px-6 pt-5 pb-3 bg-[#0a0f1d] border-b border-purple-950/20 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="header-back-button"
                onClick={onBack}
                className="mr-1 p-1.5 rounded-lg bg-purple-950/40 border border-purple-905/30 text-purple-300 hover:text-white transition duration-200 cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                aria-label="Navigate Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {/* The Signature Purple Rose App Icon Launcher Logo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[24%] blur-sm opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-[#1e1135] via-[#2e104e] to-[#4c1d95] rounded-[22%] shadow-md border border-purple-500/35 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-8 h-8 pointer-events-none select-none animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animationDuration: '4s' }}>
                  {/* Elegant green rose leaf */}
                  <path d="M25,55 C15,48 18,30 35,35 C42,37 40,50 25,55 Z" fill="url(#leafGrad2)" />
                  <path d="M25,55 Q30,42 35,35" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                  <path d="M50,18 C30,18 20,40 30,68 C35,78 65,78 70,68 C80,40 70,18 50,18 Z" fill="url(#outerRoseGrad2)" />
                  <path d="M35,42 C28,55 35,72 50,75 C65,72 72,55 65,42 Z" fill="url(#midRoseGrad2)" />
                  <path d="M42,48 C38,55 45,64 50,65 C55,64 62,55 58,48 Z" fill="url(#innerRoseGrad2)" />
                  <circle cx="50" cy="54" r="3" fill="url(#heartRoseGrad2)" />
                  <defs>
                    <linearGradient id="leafGrad2" x1="15" y1="30" x2="35" y2="55">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                    <linearGradient id="outerRoseGrad2" x1="50" y1="18" x2="50" y2="78">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b0764" />
                    </linearGradient>
                    <linearGradient id="midRoseGrad2" x1="50" y1="35" x2="50" y2="75">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#581c87" />
                    </linearGradient>
                    <linearGradient id="innerRoseGrad2" x1="50" y1="44" x2="50" y2="65">
                      <stop offset="0%" stopColor="#d8b4fe" />
                      <stop offset="100%" stopColor="#6b21a8" />
                    </linearGradient>
                    <linearGradient id="heartRoseGrad2" x1="50" y1="49" x2="50" y2="58">
                      <stop offset="0%" stopColor="#f3e8ff" />
                      <stop offset="100%" stopColor="#7e22ce" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-extrabold font-display tracking-tight text-white flex items-center gap-1.5">
                FloraFinder
                <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 font-mono bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-900/30">
                  v1.2
                </span>
              </h1>
              <p className="text-[#8fa2ca] text-[10px]">Taxonomic AI Plant Identifier</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Connected
            </span>
          </div>
        </div>

        {/* Core viewport screen area */}
        <div className="flex-1 overflow-y-auto bg-[#0a0f1d] flex flex-col relative scrollbar-none">
          {children}
        </div>
      </div>

      {/* Decorative caption below */}
      <div className="text-center mt-4 text-xs text-gray-500 max-w-sm px-4">
        Powered by FloraFinder & Pl@ntNet AI Classifier • Styled with custom-woven Purple Rose telemetry.
      </div>
    </div>
  );
}
