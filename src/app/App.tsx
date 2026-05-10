import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Building2, Brain, ArrowRight, X, MessageCircle, Phone, Menu, Eye, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import troyLogo from '../imports/troy_logo-1.jpeg';
import troyCastle2 from '../imports/troy_castle_2.jpg';
import troyTower from '../imports/troy_tower.jpg';
import troyBridge from '../imports/troy_bridge.jpg';
import troyBridge2 from '../imports/troy_bridge_2.png';

const API_BASE = 'https://troy-backend-4-2.onrender.com';

type AppState = 'home' | 'upload' | 'analyzing' | 'results';

interface WhatTheyLearned {
  title: string;
  description: string;
  color: 'cream' | 'green' | 'blue';
}

interface MeterField { score: number; reason: string; }

interface TroyThinkingMeter {
  symmetry:       MeterField;
  creativity:     MeterField;
  spatialSkills:  MeterField;
  stability:      MeterField;
  problemSolving: MeterField;
  focusAndDetail: MeterField;
}

interface AnalysisResult {
  imageStatus: 'valid' | 'invalid';
  buildGuessTitle: string;
  buildGuessSubtitle: string;
  whatWeFoundSummary: string;
  whatTheyLearned: WhatTheyLearned[];
  whatWeNoticed: string[];
  suggestionsForParent: string[];
  nextBuildIdeas: string[];
  troyThinkingMeter: TroyThinkingMeter | null;
  note?: string;
  sessionId: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const heroSlides = [
    { image: troyCastle2, quote: '"Welcome to my giant castle!"' },
    { image: troyTower,   quote: '"I built the tallest tower ever!"' },
    { image: troyBridge,  quote: '"Look, a bridge for my cars!"' },
    { image: troyBridge2, quote: '"This bridge is so strong!"' },
  ];

  useEffect(() => {
    if (appState === 'home') {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const handleStart = () => { setApiError(null); setAppState('upload'); };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.82);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const handleDownloadCard = () => {
    if (!analysisResult?.sessionId) {
      alert('No feedback card available yet. Please analyze an image first.');
      return;
    }
    const downloadUrl = `${API_BASE}/download-card/${analysisResult.sessionId}`;
    window.open(downloadUrl, '_blank');
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setApiError(null);
    setAppState('analyzing');

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressed, 'photo.jpg');
      formData.append('age', '6');

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Server error ${res.status}`);
      }

      setAnalysisResult({
        imageStatus:          data.imageStatus || 'valid',
        buildGuessTitle:      data.buildGuess?.title    || 'Creative Build',
        buildGuessSubtitle:   data.buildGuess?.subtitle || '',
        whatWeFoundSummary:   data.whatWeFound?.summary || '',
        whatTheyLearned:      Array.isArray(data.whatTheyLearned)      ? data.whatTheyLearned      : [],
        whatWeNoticed:        Array.isArray(data.whatWeNoticed)        ? data.whatWeNoticed        : [],
        suggestionsForParent: Array.isArray(data.suggestionsForParent) ? data.suggestionsForParent : [],
        nextBuildIdeas:       Array.isArray(data.nextBuildIdeas)       ? data.nextBuildIdeas       : [],
        troyThinkingMeter: data.troyThinkingMeter || null,
        note:      data.note || '',
        sessionId: data.session_id || '',
      });

      setAppState('results');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || `Could not reach the server at ${API_BASE}`);
      setAppState('upload');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setApiError(null);
    setAppState('home');
  };

  const colorMap = {
    cream: { wrapper: 'bg-[#FFF9F2] border-amber-100',   icon: 'bg-amber-100 text-amber-700' },
    green: { wrapper: 'bg-[#F0FDF4] border-emerald-100', icon: 'bg-emerald-100 text-emerald-700' },
    blue:  { wrapper: 'bg-[#EFF6FF] border-blue-100',    icon: 'bg-blue-100 text-blue-700' },
  };

  const renderBulletCard = (
    title: string,
    items: string[],
    icon: React.ReactNode,
    wrapperClass: string,
    iconClass: string
  ) => {
    if (!items || items.length === 0) return null;
    return (
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className={`${wrapperClass} p-4 rounded-2xl flex gap-4 items-start border`}>
        <div className={`${iconClass} p-2 rounded-xl shrink-0`}>{icon}</div>
        <div className="w-full">
          <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
          <ul className="mt-2 space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2D3748] overflow-x-hidden" style={{ fontFamily: 'Quicksand, sans-serif' }}>

      <header className="w-full px-5 py-4 flex items-center justify-between bg-white relative z-10 border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer -ml-2" onClick={handleReset}>
          <img src={troyLogo} alt="Troy Logo" className="h-[56px] w-auto object-contain" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-amber-500 hover:text-amber-600 transition-colors p-1">
          <Menu size={32} strokeWidth={2} />
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] min-w-[300px] bg-[#F2B705] z-50 flex flex-col">
              <div className="absolute top-6 right-6">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#6B6B6B] p-2 flex items-center justify-center min-h-[44px] min-w-[44px]">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-col pt-[120px] pl-[32px] gap-8">
                <a href="#" className="font-sans font-medium text-[#8A6A2F] uppercase tracking-[0.5px] min-h-[44px] flex items-center w-fit"><span className="border-b-2 border-[#8A6A2F] pb-0.5">HOME</span></a>
                <a href="#" className="font-sans font-medium text-white uppercase tracking-[0.5px] min-h-[44px] flex items-center hover:opacity-80 w-fit">TROY FUN CENTER</a>
                <a href="#" className="font-sans font-medium text-white uppercase tracking-[0.5px] min-h-[44px] flex items-center hover:opacity-80 w-fit">PARTIES</a>
                <a href="#" className="font-sans font-medium text-white uppercase tracking-[0.5px] min-h-[44px] flex items-center hover:opacity-80 w-fit">BUY</a>
                <a href="#" className="font-sans font-medium text-white uppercase tracking-[0.5px] min-h-[44px] flex items-center hover:opacity-80 w-fit">ABOUT US</a>
                <a href="#" className="font-sans font-medium text-white uppercase tracking-[0.5px] min-h-[44px] flex items-center hover:opacity-80 w-fit">CONTACT</a>
              </div>
              <div className="mt-auto pb-[40px] flex flex-col items-center justify-center gap-2 w-full">
                <Phone size={24} strokeWidth={1.5} className="text-white" />
                <a href="tel:9901540581" className="text-white font-sans font-medium text-lg min-h-[44px] flex items-center justify-center">9901540581</a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-72px)] flex flex-col relative px-4 py-8">

        {/* HOME */}
        {appState === 'home' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center gap-8">
            <div className="space-y-3 px-2">
              <h1 className="text-[32px] font-bold text-[#AE6A1C] leading-[1.2] tracking-tight">
                Discover the <span className="relative">magic<svg className="absolute w-full h-2 -bottom-1 left-0 text-[#AE6A1C]/30" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> in their play
              </h1>
              <p className="text-[15px] text-[#4A4A4A] leading-relaxed">Snap a photo of your child's Troy block creation and let our AI reveal the hidden engineering and learning principles behind it.</p>
            </div>
            <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] relative rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white rotate-[-2deg] bg-amber-50">
              <AnimatePresence mode="popLayout">
                <motion.div key={currentSlideIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: 'easeInOut' }} className="absolute inset-0">
                  <img src={heroSlides[currentSlideIndex].image} alt="Troy Block creation" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-medium">{heroSlides[currentSlideIndex].quote}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button onClick={handleStart} className="w-full max-w-[320px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_6px_0_0_#b45309] hover:shadow-[0_3px_0_0_#b45309] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3">
              <Camera size={22} /> Scan a Creation
            </button>
          </motion.div>
        )}

        {/* UPLOAD */}
        {appState === 'upload' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-[320px] mx-auto">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-[#AE6A1C]">Take a Photo</h2>
              <p className="text-sm text-[#4A4A4A] px-4">Make sure the entire structure is visible and well-lit.</p>
            </div>
            {apiError && <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 text-sm font-semibold">{apiError}</div>}
            <div className="w-full aspect-[4/5] bg-white rounded-3xl border-4 border-dashed border-[#AE6A1C]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-[#AE6A1C] transition-colors cursor-pointer">
              <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-20 h-20 bg-[#AE6A1C]/10 text-[#AE6A1C] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} />
              </div>
              <p className="font-semibold text-lg text-[#AE6A1C] text-center">Tap to Open Camera</p>
              <p className="text-sm text-[#AE6A1C]/70 text-center mt-2">or select a photo from your gallery</p>
            </div>
            <button onClick={handleReset} className="text-gray-500 font-medium hover:text-gray-700">Cancel</button>
          </motion.div>
        )}

        {/* ANALYZING */}
        {appState === 'analyzing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-lg opacity-50">
                {capturedImage && <img src={capturedImage} alt="Scanning" className="w-full h-full object-cover grayscale" />}
              </div>
              <motion.div animate={{ y: ['0%', '100%', '0%'] }} transition={{ duration: 2, ease: 'linear', repeat: Infinity }} className="absolute top-0 left-0 w-full h-1 bg-[#AE6A1C] shadow-[0_0_15px_rgba(174,106,28,0.8)] z-10" />
            </div>
            <div className="text-center space-y-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="mx-auto w-10 h-10 text-[#AE6A1C] flex items-center justify-center">
                <Sparkles size={32} />
              </motion.div>
              <h2 className="text-xl font-bold text-[#AE6A1C]">Analyzing Creation...</h2>
              <p className="text-sm text-[#4A4A4A] animate-pulse px-4">Identifying architectural patterns & learning milestones</p>
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {appState === 'results' && analysisResult && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6 pb-12">

            <div className="w-full h-56 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative shrink-0">
              {capturedImage && <img src={capturedImage} alt="Result" className="w-full h-full object-cover" />}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs text-[#AE6A1C] shadow-sm flex items-center gap-1.5">
                <Building2 size={14} /> {analysisResult.imageStatus === 'valid' ? 'Structure Identified' : 'Image Unclear'}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-100 space-y-4">

              {/* Build guess — big title */}
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-extrabold text-[#AE6A1C] leading-snug">{analysisResult.buildGuessTitle}</h2>
                {analysisResult.buildGuessSubtitle ? (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysisResult.buildGuessSubtitle}</p>
                ) : null}
              </div>

              {/* What we found summary */}
              {analysisResult.whatWeFoundSummary ? (
                <div className="bg-[#FFF3E0] p-4 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2"><Brain size={15} /> What we found</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysisResult.whatWeFoundSummary}</p>
                </div>
              ) : null}

              {/* What they learned — colored cards */}
              {analysisResult.whatTheyLearned.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#AE6A1C] flex items-center gap-2"><Sparkles size={15} /> What they learned</h3>
                  {analysisResult.whatTheyLearned.map((item, idx) => {
                    const c = colorMap[item.color] || colorMap.cream;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} className={`${c.wrapper} p-4 rounded-2xl flex gap-4 items-start border`}>
                        <div className={`${c.icon} p-2 rounded-xl shrink-0 text-sm font-bold`}>{idx + 1}</div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* What we noticed (invalid image) */}
              {renderBulletCard('What we noticed',        analysisResult.whatWeNoticed,        <Eye size={18} />,       'bg-[#FFF9F2] border-amber-100',   'bg-amber-100 text-amber-700')}
              {renderBulletCard('Suggestions for parent', analysisResult.suggestionsForParent, <Lightbulb size={18} />, 'bg-[#EFF6FF] border-blue-100',    'bg-blue-100 text-blue-700')}
              {renderBulletCard('Next build ideas',       analysisResult.nextBuildIdeas,       <ArrowRight size={18} />,'bg-[#FDF4FF] border-fuchsia-100', 'bg-fuchsia-100 text-fuchsia-700')}

              {/* Troy Thinking Meter */}
              {analysisResult.troyThinkingMeter && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#FFF9F2] border border-amber-100 p-4 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-[#AE6A1C] flex items-center gap-2">
                    <span>⭐</span> Troy Thinking Meter
                  </h3>
                  {[
                    { label: 'Symmetry',        key: 'symmetry' },
                    { label: 'Creativity',      key: 'creativity' },
                    { label: 'Spatial Skills',  key: 'spatialSkills' },
                    { label: 'Stability',       key: 'stability' },
                    { label: 'Problem Solving', key: 'problemSolving' },
                    { label: 'Focus & Detail',  key: 'focusAndDetail' },
                  ].map(({ label, key }) => {
                    const field = analysisResult.troyThinkingMeter![key as keyof TroyThinkingMeter];
                    const score = Math.max(1, Math.min(5, Number(field?.score || 1)));
                    const reason = field?.reason || '';
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-gray-700 w-32 shrink-0">{label}</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => (
                              <span key={i} className={`text-xl ${i <= score ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-400 w-8 text-right">{score}/5</span>
                        </div>
                        {reason ? <p className="text-xs text-gray-500 leading-relaxed pl-1">{reason}</p> : null}
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {analysisResult.note ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl">
                  <h4 className="font-bold text-gray-800 text-sm">Note</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysisResult.note}</p>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleReset} className="flex-1 bg-white border-2 border-amber-200 text-amber-700 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-amber-50 transition-colors text-sm">Scan Another</button>
              <button onClick={handleDownloadCard} className="flex-1 bg-white border-2 border-amber-200 text-amber-700 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-amber-50 transition-colors text-sm flex items-center justify-center gap-2">
                ⬇ Download Card
              </button>
            </div>
          </motion.div>
        )}

      </main>

      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-[#AE6A1C] mb-2">Get in touch</h3>
            <p className="text-gray-600 mb-6 text-sm">Have questions about Troy blocks? We'd love to help!</p>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-4 bg-[#25D366]/10 text-[#25D366] p-4 rounded-2xl hover:bg-[#25D366]/20 transition-colors font-semibold"><MessageCircle size={24} /> Contact via WhatsApp</a>
              <a href="#" className="flex items-center gap-4 bg-[#AE6A1C]/10 text-[#AE6A1C] p-4 rounded-2xl hover:bg-[#AE6A1C]/20 transition-colors font-semibold"><Phone size={24} /> +91 XXXXX XXXXX</a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
