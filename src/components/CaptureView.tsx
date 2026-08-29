import React, { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, RefreshCw, Upload, Image as ImageIcon, Sparkles, X, Swords } from "lucide-react";
import { CapturedPhoto, OrganType } from "../types";
import { PLANT_SAMPLES } from "../samples";

interface CaptureViewProps {
  onBack: () => void;
  onIdentify: (photos: CapturedPhoto[]) => void;
}

export default function CaptureView({ onBack, onIdentify }: CaptureViewProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganType>("auto");
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Attempt to spin up webcam
  useEffect(() => {
    async function startCamera() {
      try {
        setCameraError(false);
        // Using ideal constraints to ensure maximum Safari & iOS WebRTC compatibility
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn("Webcam access failed or denied. Falling back to iOS native camera upload flow.", err);
        setCameraActive(false);
        setCameraError(true);
      }
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from video stream
  const handleSnap = () => {
    if (!videoRef.current || !cameraActive) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const previewUrl = URL.createObjectURL(blob);
          setPhotos((prev) => [
            {
              id: `photo-${Date.now()}`,
              previewUrl,
              blob,
              organ: selectedOrgan,
            },
            ...prev,
          ].slice(0, 3));
        }, 'image/jpeg', 0.8);
      }
    } catch (err) {
      console.error("Failed to capture image", err);
    }
  };

  const removePhoto = (id: string) => {
    const found = photos.find((p) => p.id === id);
    if (found) {
      URL.revokeObjectURL(found.previewUrl);
    }
    setPhotos(photos.filter((p) => p.id !== id));
  };

  // Compression helper
  async function fileToCompressedBlob(file: File, quality = 0.8): Promise<Blob> {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    try {
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(undefined);
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const maxSize = 1600; // keep under this in the largest dimension
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width / height) * maxSize;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');
      ctx.drawImage(img, 0, 0, width, height);
      return await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          quality
        );
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Handle local file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(files);
  };

  const processFiles = async (fileList: FileList) => {
    const spaceLeft = 3 - photos.length;
    if (spaceLeft <= 0) return;

    const filesToProcess = Array.from(fileList).slice(0, spaceLeft);
    for (const file of filesToProcess) {
      try {
        const compressedBlob = await fileToCompressedBlob(file, 0.8);
        const previewUrl = URL.createObjectURL(compressedBlob);
        setPhotos((prev) => {
          const next: CapturedPhoto[] = [
            {
              id: `photo-${Date.now()}`,
              previewUrl,
              blob: compressedBlob,
              organ: selectedOrgan,
            },
            ...prev,
          ];
          return next.slice(0, 3);
        });
      } catch (err) {
        console.error("Failed to compress file", err);
      }
    }
  };

  const updateOrgan = (photoId: string, organ: OrganType) => {
    setPhotos(
      photos.map((p) => (p.id === photoId ? { ...p, organ } : p))
    );
  };

  // Drag-and-drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const loadPresetSample = async (dataUrl: string) => {
    if (photos.length >= 3) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const previewUrl = URL.createObjectURL(blob);
      setPhotos((prev) => [
        {
          id: `sample-${Math.random().toString(36).substring(7)}`,
          previewUrl,
          blob,
          organ: selectedOrgan,
        },
        ...prev,
      ].slice(0, 3));
    } catch (err) {
      console.error("Failed to load sample", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#080d19] relative max-h-full font-sans transition-all duration-300">
      {/* Top action bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-900 shrink-0 z-40 bg-[#090e1c]/80 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8fa2ca] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Camera
        </button>
        <span className="text-xs font-bold font-display text-white tracking-wide">
          Composition {photos.length}/3
        </span>
        <div className="w-12"></div> {/* Spacer balance */}
      </div>

      {/* Main composition container */}
      <div className="flex-1 min-h-0 flex flex-col relative bg-[#04060c]">
        {cameraActive ? (
          /* Live Viewfinder */
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Holographic targeting focus overlays */}
            <div className="absolute inset-8 border border-white/20 pointer-events-none rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg"></div>
              <div className="w-10 h-10 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg"></div>
              <div className="w-10 h-10 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg"></div>
              <div className="w-10 h-10 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg"></div>
              
              <div className="w-12 h-12 rounded-full border border-dashed border-white/40 animate-pulse"></div>
            </div>

            {/* Quick Live Mode Indicator */}
            <div className="absolute top-4 left-4 bg-emerald-500/90 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Live Lens
            </div>
          </div>
        ) : (
          /* fallback uploader simulator file-drop interface with iOS camera explanation */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col items-center justify-center p-5 text-center transition-all relative overflow-y-auto ${
              dragOver ? "bg-[#10b981]/10 border-2 border-dashed border-emerald-400" : "bg-[#050912]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {cameraError && (
              <div className="mb-4 mx-2 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl text-left space-y-2.5 max-w-[320px]">
                <div className="flex items-center gap-2 text-xs font-bold font-display text-emerald-400">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  iPhone Camera Fallback Active
                </div>
                <p className="text-[11px] text-gray-300 leading-normal">
                  iOS Safari runs web pages in a sandboxed mode which often intercepts direct live-stream scripts.
                </p>
                <div className="text-[10.5px] text-[#8fa2ca] space-y-1.5 leading-snug">
                  <div className="flex gap-2 items-start">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                    <span>Tap <strong>Take Photo / Browse</strong> or the bottom shutter button.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                    <span>Natively select <strong>"Take Photo"</strong> to use your iPhone's full 12MP HDR hardware lens!</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#11192e] p-5 rounded-full mb-3 border border-[#1e2f52] shadow-xl text-gray-400 flex items-center justify-center relative">
              <Camera className="w-8 h-8 text-emerald-400" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full text-white">
                <Upload className="w-3.5 h-3.5" />
              </div>
            </div>

            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#8fa2ca] font-display">
              iOS Multi-Image Loader
            </h4>
            
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed max-w-[260px]">
              Shoot photos instantly with your iPhone lens or select from your camera roll.
            </p>

            <button
              id="upload-trigger-btn"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-[#10b981] hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-6 rounded-full transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer font-display"
            >
              <Camera className="w-4 h-4" />
              Take Photo / Browse
            </button>

            {/* Simulated preset injector for instant playground without uploads */}
            <div className="mt-8 pt-6 border-t border-gray-900 w-full max-w-[280px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Playground Injectors
              </span>
              <div className="flex justify-center gap-2 mt-2">
                {PLANT_SAMPLES.map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => loadPresetSample(sample.dataUrl)}
                    className="w-10 h-10 rounded-lg overflow-hidden border border-[#1e2e4e] hover:border-emerald-500 transition-colors bg-[#11192e] relative active:scale-90 cursor-pointer"
                    title={`Inject ${sample.name}`}
                  >
                    <img src={sample.dataUrl} alt={sample.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-500 mt-2">
                Tap an ornament to instantly inject its visual parameters.
              </p>
            </div>
          </div>
        )}

        {/* Selected Photos Tray */}
        <div className="border-t border-gray-900 bg-[#080d1a] px-4 py-3 pb-4 shrink-0 flex flex-col gap-3">
          
          {/* Active selection row */}
          {photos.length > 0 && (
            <div className="flex gap-2 bg-[#04070e] p-2 rounded-2xl border border-gray-900/60 overflow-x-auto">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="w-[90px] bg-[#0c1222] rounded-xl overflow-hidden border border-[#1e2e4e]/40 p-1 flex flex-col items-center shrink-0 relative group"
                >
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-15 active:scale-90 transition-all shadow"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>

                  <div className="w-full h-14 rounded-lg overflow-hidden bg-black relative">
                    <img
                      src={photo.previewUrl}
                      alt="capture"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Organ picker select */}
                  <select
                    value={photo.organ}
                    onChange={(e) => updateOrgan(photo.id, e.target.value as OrganType)}
                    className="w-full text-[9px] bg-black/40 text-emerald-400 font-bold border-none py-0.5 rounded text-center focus:ring-0 mt-1 cursor-pointer outline-none"
                  >
                    <option value="auto" className="bg-[#0c1222] text-white">Auto</option>
                    <option value="flower" className="bg-[#0c1222] text-white">Flower</option>
                    <option value="leaf" className="bg-[#0c1222] text-white">Leaf</option>
                    <option value="fruit" className="bg-[#0c1222] text-white">Fruit</option>
                    <option value="bark" className="bg-[#0c1222] text-white">Bark</option>
                    <option value="habit" className="bg-[#0c1222] text-white">Habit</option>
                  </select>
                </div>
              ))}
              
              {photos.length < 3 && (
                <div className="w-[90px] h-[82px] border border-dashed border-[#1e2e4e] rounded-xl flex flex-col items-center justify-center bg-[#070b13]/60 shrink-0">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span className="text-[9px] text-gray-500 mt-1 font-medium">Slot {photos.length + 1}</span>
                </div>
              )}
            </div>
          )}

          {/* Controls Shutter & Execute Block */}
          <div className="flex items-center justify-between mt-1">
            {/* Shutter Settings */}
            <div className="flex flex-col gap-1 w-20">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Organ Cue</span>
              <div className="flex items-center gap-1 text-[10px]">
                <select
                  value={selectedOrgan}
                  onChange={(e) => setSelectedOrgan(e.target.value as OrganType)}
                  className="bg-gray-900 border-none rounded py-1 px-1.5 text-xs text-gray-200 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="auto">Auto</option>
                  <option value="flower">Flower</option>
                  <option value="leaf">Leaf</option>
                  <option value="fruit">Fruit</option>
                  <option value="bark">Bark</option>
                  <option value="habit">Habit</option>
                </select>
              </div>
            </div>

            {/* iOS style central shutter ring */}
            <div className="flex justify-center items-center">
              {cameraActive ? (
                <button
                  id="camera-shutter-btn"
                  onClick={handleSnap}
                  className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 p-0.5 border-4 border-gray-950 flex items-center justify-center active:scale-90 transition-all duration-150 shadow shadow-emerald-500/10 cursor-pointer"
                  title="Snap photo"
                  disabled={photos.length >= 3}
                >
                  <div className="w-12 h-12 rounded-full border border-gray-950 bg-white"></div>
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-all shadow cursor-pointer border-4 border-gray-950"
                  title="Choose files"
                  disabled={photos.length >= 3}
                >
                  <Upload className="w-5 h-5 animate-pulse" />
                </button>
              )}
            </div>

            {/* Identify Actions button */}
            <div className="w-20 flex justify-end">
              <button
                id="btn-trigger-identify"
                disabled={photos.length === 0}
                onClick={() => onIdentify(photos)}
                className={`text-[11px] font-bold py-2 px-3.5 rounded-full transition-all duration-200 shadow flex items-center gap-1 cursor-pointer ${
                  photos.length > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 active:scale-95"
                    : "bg-gray-900 text-gray-600 cursor-not-allowed"
                }`}
              >
                Scan
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
