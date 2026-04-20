
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, MapPin, Leaf, AlertTriangle, MessageSquare, Info, RotateCcw, Check, Sparkles } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult, WildlifeEntry } from '../types';

interface ScannerProps {
  onScanComplete: (item: WildlifeEntry) => void;
  existingSignatures?: string[];
  customLocation?: { lat: number; lng: number };
  initialData?: {
    imageUrl: string | null;
    result: AnalysisResult | null;
    notes: string;
    signature: string | null;
    step: 'SCAN_WILDLIFE' | 'ANALYZING' | 'REVIEW_RESULT';
    base64?: string;
  };
  onOpenMap?: (data: {
    imageUrl: string | null;
    result: AnalysisResult | null;
    notes: string;
    signature: string | null;
    step: 'SCAN_WILDLIFE' | 'ANALYZING' | 'REVIEW_RESULT';
  }) => void;
}

const generateSignature = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

type ScanStep = 'SCAN_WILDLIFE' | 'ANALYZING' | 'REVIEW_RESULT';

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, existingSignatures = [], customLocation, initialData, onOpenMap }) => {
  const [step, setStep] = useState<ScanStep>(initialData?.step || 'SCAN_WILDLIFE');
  const [result, setResult] = useState<AnalysisResult | null>(initialData?.result || null);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [imageSignature, setImageSignature] = useState<string | null>(initialData?.signature || null);
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(customLocation);
  const [userNotes, setUserNotes] = useState<string>(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customLocation) {
      setLocation(customLocation);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location access denied", err),
        { enableHighAccuracy: true }
      );
    }
  }, [customLocation]);

  useEffect(() => {
    if (initialData?.base64 && !result && step === 'ANALYZING') {
      startAnalysis(initialData.base64);
    }
  }, []);

  const startAnalysis = async (base64: string) => {
    try {
      setImageSignature(generateSignature(base64));
      const analysis = await analyzeImage(base64);
      setResult(analysis);
      setStep('REVIEW_RESULT');
    } catch (err) {
      setError("Identification failed.");
      setStep('SCAN_WILDLIFE');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setItemImageUrl(objectUrl);
    setStep('ANALYZING');
    setError(null);
    setUserNotes('');

    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      
      startAnalysis(base64Data);
    } catch (err) {
      setError("Identification failed.");
      setStep('SCAN_WILDLIFE');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleFinalSubmit = () => {
    if (result && itemImageUrl) {
      if (imageSignature && existingSignatures.includes(imageSignature)) {
        setError("This sighting has already been logged!");
        return;
      }

      const newEntry: WildlifeEntry = {
        id: Date.now().toString(),
        itemName: result.itemName,
        scientificName: result.scientificName,
        category: result.category,
        rarity: result.rarity,
        points: result.isInternetImage ? 0 : result.estimatedPoints,
        timestamp: Date.now(),
        imageUrl: itemImageUrl,
        description: result.description,
        conservationStatus: result.conservationStatus,
        location: location,
        imageSignature: imageSignature || undefined,
        userNotes: userNotes,
        isInternetImage: result.isInternetImage
      };
      onScanComplete(newEntry);
      setStep('SCAN_WILDLIFE');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 sm:p-8 relative z-10">
      {step === 'SCAN_WILDLIFE' && (
        <div className="flex flex-col items-center justify-center flex-1 space-y-8 sm:space-y-12 animate-in fade-in zoom-in duration-700">
           <div className="text-center space-y-4">
             <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight text-gradient">Sighting Log</h2>
             <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">Biodiversity Network</p>
           </div>

           {error && (
             <div className="bg-wy-red/10 text-wy-red px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] border border-wy-red/20 backdrop-blur-2xl animate-bounce">
               {error}
             </div>
           )}

           <div className="w-full space-y-6 sm:space-y-8">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full apple-glass rounded-[3rem] sm:rounded-[3.5rem] p-8 sm:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 active:scale-90 group border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                  <div className="bg-white/10 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] group-hover:bg-white/20 transition-all duration-500 group-hover:scale-110 shadow-xl">
                    <Camera className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-[0.1em]">Snap Photo</span>
                </div>
              </button>

              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-4 bg-white/5 border border-white/10 py-6 rounded-[2rem] shadow-xl text-white/60 font-black hover:bg-white/10 transition-all active:scale-95 backdrop-blur-2xl uppercase text-[11px] tracking-[0.3em]"
              >
                <ImageIcon className="w-6 h-6 opacity-40" />
                <span>Photo Gallery</span>
              </button>

              <input ref={cameraInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
           </div>

           <div className="flex flex-col items-center">
            <button 
              onClick={() => onOpenMap?.({
                imageUrl: itemImageUrl,
                result,
                notes: userNotes,
                signature: imageSignature,
                step
              })}
              className="flex items-center space-x-4 px-8 py-4 bg-white/[0.03] text-white/30 rounded-full text-[10px] font-black border border-white/10 backdrop-blur-2xl uppercase tracking-[0.4em] shadow-lg hover:bg-white/10 transition-all active:scale-95"
            >
                <MapPin size={16} className={location ? "text-wy-blue animate-pulse" : ""} />
                <span>{location ? "GPS LOCKED" : "SELECT ON MAP"}</span>
             </button>
           </div>
        </div>
      )}

      {step === 'ANALYZING' && (
        <div className="flex flex-col items-center justify-center flex-1 space-y-12">
          <div className="relative w-80 h-80 rounded-[4rem] overflow-hidden border-[12px] border-white/5 shadow-[0_0_80px_rgba(0,72,152,0.4)] animate-pulse">
            <img src={itemImageUrl!} className="w-full h-full object-cover blur-xl scale-125" />
            <div className="absolute inset-0 bg-wy-blue/10 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-20 h-20 text-white animate-spin opacity-60" />
              <div className="h-1.5 w-40 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-1/2 animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-white font-display font-extrabold text-3xl uppercase tracking-tight text-gradient">Identifying Species</p>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.6em] font-black">Ad Maiorem Dei Gloriam</p>
          </div>
        </div>
      )}

      {step === 'REVIEW_RESULT' && result && (
        <div className="flex flex-col flex-1 animate-in slide-in-from-bottom-24 duration-1000 overflow-hidden py-4 sm:py-6">
          <div className="apple-glass rounded-[3.5rem] sm:rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden border-white/20 flex-1 flex flex-col relative">
            {/* Immersive Image Header */}
            <div className="relative h-72 sm:h-80 flex-shrink-0">
              <img src={itemImageUrl!} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              
              {/* Floating Badge for Points */}
              <div className="absolute top-6 right-6 bg-white text-stone-950 px-5 py-3 rounded-2xl shadow-2xl flex flex-col items-center border border-white/20 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Merit</span>
                <span className="text-2xl font-display font-black tracking-tighter">+{result.isInternetImage ? 0 : result.estimatedPoints}</span>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="px-3 py-1 bg-wy-blue/80 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{result.category}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{result.rarity}</span>
                  </div>
                </div>
                <h3 className="text-white text-4xl sm:text-5xl font-display font-extrabold tracking-tight leading-none drop-shadow-2xl">{result.itemName}</h3>
                <p className="text-white/40 text-sm font-medium mt-2 italic tracking-wide">{result.scientificName}</p>
              </div>
              
              {result.isInternetImage && (
                <div className="absolute top-6 left-6 right-24 bg-wy-red/90 backdrop-blur-2xl text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 z-20 border border-white/20 animate-in fade-in slide-in-from-top-2 duration-500">
                  <AlertTriangle size={20} className="flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">Internet Image Detected</span>
                    <span className="text-[7px] opacity-70 font-bold uppercase tracking-widest">Strike 1/2: Ban Imminent</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 sm:p-10 space-y-8 flex-1 overflow-y-auto no-scrollbar bg-stone-950/40">
              {error && (
                <div className="bg-wy-red/10 text-wy-red px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-wy-red/20 backdrop-blur-2xl animate-bounce text-center">
                  {error}
                </div>
              )}

              {/* Location & Status Row */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onOpenMap?.({
                    imageUrl: itemImageUrl,
                    result,
                    notes: userNotes,
                    signature: imageSignature,
                    step
                  })}
                  className={`flex-1 px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 border ${location ? 'bg-wy-blue/10 border-wy-blue/30 text-wy-blue' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  <MapPin size={16} className={location ? "animate-pulse" : ""} />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em]">{location ? "GPS Locked" : "Set Location"}</span>
                </button>
                <div className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Conservation</span>
                  <span className="text-xs font-bold text-white/80">{result.conservationStatus}</span>
                </div>
              </div>

              {/* Description Block */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 ml-2">
                  <div className="w-1 h-3 bg-wy-blue rounded-full" />
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Field Observation</span>
                </div>
                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10 backdrop-blur-2xl">
                  <p className="text-sm text-white/70 leading-relaxed font-medium italic">"{result.description}"</p>
                </div>
              </div>

              {/* Scientific Fact - "The Knowledge" */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-wy-blue/20 to-wy-red/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-start space-x-5 p-7 bg-stone-900/80 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
                  <div className="bg-wy-blue/20 p-3 rounded-2xl">
                    <Info className="w-6 h-6 text-wy-blue" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-wy-blue uppercase tracking-[0.3em] mb-2">Scientific Insight</h4>
                    <p className="text-xs text-white/50 leading-relaxed italic font-medium">"{result.funFact}"</p>
                  </div>
                </div>
              </div>

              {/* User Notes Input */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center space-x-3 ml-2">
                  <MessageSquare size={14} />
                  <span>Personal Notes</span>
                </label>
                <textarea 
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Where did you find it? Any special behavior?"
                  className="w-full p-6 bg-white/[0.02] border border-white/10 rounded-3xl text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-wy-blue/40 transition-all resize-none h-32 backdrop-blur-2xl font-medium"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-8 bg-stone-950 border-t border-white/10 flex items-center space-x-6 flex-shrink-0">
               <button 
                onClick={() => setStep('SCAN_WILDLIFE')} 
                className="flex-1 py-5 text-white/30 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white/60 transition-all active:scale-95 flex items-center justify-center space-x-2"
               >
                 <RotateCcw size={14} />
                 <span>Retake</span>
               </button>
               <button 
                onClick={handleFinalSubmit} 
                className="flex-[2] py-5 bg-white text-stone-950 font-black rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:bg-stone-100 transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3"
               >
                 <Check size={18} strokeWidth={3} />
                 <span>Log Sighting</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
