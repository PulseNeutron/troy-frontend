import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Building2,
  Brain,
  ArrowRight,
  X,
  MessageCircle,
  Phone,
  Menu,
  Eye,
  Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import troyLogo from '../imports/troy_logo.jpeg';
import troyCastle2 from '../imports/troy_castle_2.jpg';
import troyTower from '../imports/troy_tower.jpg';
import troyBridge from '../imports/troy_bridge.jpg';
import troyBridge2 from '../imports/troy_bridge_2.png';

const API_BASE = 'https://troy-backend-4-1.onrender.com';

type AppState = 'home' | 'upload' | 'analyzing' | 'results';

interface LearningCard {
  title: string;
  description: string;
  color: 'cream' | 'green' | 'blue';
}

interface AnalysisResult {
  imageStatus: 'valid' | 'invalid';
  buildGuess: {
    title: string;
    subtitle: string;
  };
  whatWeFound: {
    title: string;
    summary: string;
  };
  whatTheyLearned: LearningCard[];
  whatWeNoticed: string[];
  suggestionsForParent: string[];
  nextBuildIdeas: string[];
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [childAge, setChildAge] = useState(6);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const heroSlides = [
    { image: troyCastle2, quote: '"Welcome to my giant castle!"' },
    { image: troyTower, quote: '"I built the tallest tower ever!"' },
    { image: troyBridge, quote: '"Look, a bridge for my cars!"' },
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

  const handleStart = () => {
    setApiError(null);
    setAppState('upload');
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setApiError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setApiError(null);
    setAppState('analyzing');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('age', String(childAge));

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Server error ${res.status}`);
      }

      const data = await res.json();

      setAnalysisResult({
        imageStatus: data.imageStatus || 'invalid',
        buildGuess: {
          title: data.buildGuess?.title || 'Creative Troy block build',
          subtitle:
            data.buildGuess?.subtitle ||
            'Your little one created a thoughtful Troy block structure!',
        },
        whatWeFound: {
          title: data.whatWeFound?.title || 'What we found',
          summary:
            data.whatWeFound?.summary ||
            'This looks like a meaningful Troy block build.',
        },
        whatTheyLearned: Array.isArray(data.whatTheyLearned) ? data.whatTheyLearned : [],
        whatWeNoticed: Array.isArray(data.whatWeNoticed) ? data.whatWeNoticed : [],
        suggestionsForParent: Array.isArray(data.suggestionsForParent)
          ? data.suggestionsForParent
          : [],
        nextBuildIdeas: Array.isArray(data.nextBuildIdeas) ? data.nextBuildIdeas : [],
      });

      setSessionId(data.session_id || null);
      setAppState('results');
    } catch (err) {
      console.error(err);

      let message = 'Could not reach the server. Make sure the backend is running at ' + API_BASE;

      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || message;
        } catch {
          message = err.message;
        }
      }

      setApiError(message);
      setAppState('upload');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setSessionId(null);
    setApiError(null);
    setChildAge(6);
    setAppState('home');
  };

  const renderLearningCard = (card: LearningCard, index: number) => {
    const colorClasses =
      card.color === 'cream'
        ? 'bg-[#FFF9F2] border-amber-100'
        : card.color === 'green'
          ? 'bg-[#F0FDF4] border-emerald-100'
          : 'bg-[#EFF6FF] border-blue-100';

    const iconClasses =
      card.color === 'cream'
        ? 'bg-amber-100 text-amber-700'
        : card.color === 'green'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-blue-100 text-blue-700';

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * (index + 1) }}
        className={`${colorClasses} p-4 rounded-2xl flex gap-4 items-start border`}
      >
        <div className={`${iconClasses} p-2 rounded-xl shrink-0`}>
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{card.title}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{card.description}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#FFF9F2] text-[#2D3748] overflow-x-hidden"
      style={{ fontFamily: 'Quicksand, sans-serif' }}
    >
      <header className="w-full px-5 py-3 flex items-center justify-between bg-white shadow-sm relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <img
            src={troyLogo}
            alt="Troy Logo"
            className="h-[36px] sm:h-[40px] w-auto object-contain"
          />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-amber-500 hover:text-amber-600 transition-colors p-1"
        >
          <Menu size={32} strokeWidth={2} />
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col px-6 py-4 gap-6">
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">
                  Home
                </a>
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">
                  Shop Products
                </a>
                <a
                  href="#"
                  className="text-xl font-bold text-[#AE6A1C] border-l-4 border-[#AE6A1C] pl-3 -ml-3"
                >
                  AI Play Analysis
                </a>
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">
                  Our Story
                </a>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsContactModalOpen(true);
                  }}
                  className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C] text-left"
                >
                  Contact
                </button>
                <div className="h-px bg-gray-100 w-full my-2" />
                <a href="#" className="text-lg font-semibold text-gray-600 hover:text-amber-500">
                  Login / Sign Up
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-72px)] flex flex-col relative px-4 py-8">
        {appState === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-8"
          >
            <div className="space-y-3 px-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#AE6A1C] leading-tight">
                Discover the{' '}
                <span className="text-[#AE6A1C] relative">
                  magic
                  <svg
                    className="absolute w-full h-2 -bottom-1 left-0 text-amber-300"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,10 Q50,20 100,10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                    />
                  </svg>
                </span>{' '}
                in their play
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Snap a photo of your child's Troy block creation and let our AI reveal the hidden
                engineering and learning principles behind it.
              </p>
            </div>

            <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] relative rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white rotate-[-2deg] bg-amber-50">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={heroSlides[currentSlideIndex].image}
                    alt="Troy Block creation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
                    <span className="text-white font-medium">
                      {heroSlides[currentSlideIndex].quote}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={handleStart}
              className="w-full max-w-[320px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_6px_0_0_#b45309] hover:shadow-[0_3px_0_0_#b45309] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3"
            >
              <Camera size={22} /> Scan a Creation
            </button>
          </motion.div>
        )}

        {appState === 'upload' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-[320px] mx-auto"
          >
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-[#AE6A1C]">Take a Photo - Backend 4-1 Test</h2>
              <p className="text-sm text-gray-600 px-4">
                Make sure the entire structure is visible and well-lit.
              </p>
            </div>

            <div className="w-full bg-white rounded-2xl border border-amber-100 p-4 space-y-2 shadow-sm">
              <label className="text-sm font-bold text-[#AE6A1C] block">
                Child&apos;s age: <span className="text-lg">{childAge} years old</span>
              </label>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={childAge}
                onChange={(e) => setChildAge(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-400 font-semibold px-1">
                <span>2 yrs</span>
                <span>12 yrs</span>
              </div>
            </div>

            {apiError && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 text-sm font-semibold">
                {apiError}
              </div>
            )}

            <div className="w-full aspect-[4/5] bg-white rounded-3xl border-4 border-dashed border-[#AE6A1C]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-[#AE6A1C] transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                capture="environment"
                onChange={handleImageCapture}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-20 h-20 bg-[#AE6A1C]/10 text-[#AE6A1C] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={40} />
              </div>
              <p className="font-semibold text-lg text-[#AE6A1C] text-center">Tap to Open Camera</p>
              <p className="text-sm text-[#AE6A1C]/70 text-center mt-2">
                or select a photo from your gallery
              </p>
            </div>

            <button onClick={handleReset} className="text-gray-500 font-medium hover:text-gray-700">
              Cancel
            </button>
          </motion.div>
        )}

        {appState === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-lg opacity-50">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Scanning"
                    className="w-full h-full object-cover grayscale"
                  />
                )}
              </div>
              <motion.div
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                className="absolute top-0 left-0 w-full h-1 bg-[#AE6A1C] shadow-[0_0_15px_rgba(174,106,28,0.8)] z-10"
              />
            </div>

            <div className="text-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="mx-auto w-10 h-10 text-[#AE6A1C] flex items-center justify-center"
              >
                <Sparkles size={32} />
              </motion.div>
              <h2 className="text-xl font-bold text-[#AE6A1C]">Analyzing Creation...</h2>
              <p className="text-sm text-gray-600 animate-pulse px-4">
                Identifying architectural patterns &amp; learning milestones
              </p>
            </div>
          </motion.div>
        )}

        {appState === 'results' && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-6 pb-12"
          >
            <div className="w-full h-56 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative shrink-0">
              {capturedImage && (
                <img src={capturedImage} alt="Result" className="w-full h-full object-cover" />
              )}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs text-[#AE6A1C] shadow-sm flex items-center gap-1.5">
                <Building2 size={14} /> Structure Identified
              </div>
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs text-gray-600 shadow-sm">
                Age {childAge}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-100 space-y-5">
              <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold uppercase tracking-wide text-[#AE6A1C]">AI Guess</p>
                <h2 className="text-2xl font-extrabold text-[#AE6A1C] mt-1">
                  {analysisResult.buildGuess.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {analysisResult.buildGuess.subtitle}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2">
                  <Brain size={18} /> {analysisResult.whatWeFound.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {analysisResult.whatWeFound.summary}
                </p>
              </div>

              {analysisResult.imageStatus === 'valid' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2">
                    <Sparkles size={18} /> What they learned
                  </h3>

                  {analysisResult.whatTheyLearned.map((card, index) =>
                    renderLearningCard(card, index),
                  )}
                </div>
              )}

              {analysisResult.imageStatus === 'invalid' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2">
                    <Eye size={18} /> What we noticed
                  </h3>

                  <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-amber-100">
                    <ul className="space-y-2">
                      {analysisResult.whatWeNoticed.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2">
                  <Lightbulb size={18} /> Suggestions for parent
                </h3>
                <div className="bg-[#EFF6FF] p-4 rounded-2xl border border-blue-100">
                  <ul className="space-y-2">
                    {analysisResult.suggestionsForParent.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2">
                  <ArrowRight size={18} /> Next build ideas
                </h3>
                <div className="bg-[#FDF2F8] p-4 rounded-2xl border border-pink-100">
                  <ul className="space-y-2">
                    {analysisResult.nextBuildIdeas.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-white border-2 border-amber-200 text-amber-700 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-amber-50 transition-colors text-sm"
              >
                Scan Another
              </button>
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-sm">
                Save Memory <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
          >
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-[#AE6A1C] mb-2">Get in touch</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Have questions about Troy blocks? We'd love to help!
            </p>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-4 bg-[#25D366]/10 text-[#25D366] p-4 rounded-2xl hover:bg-[#25D366]/20 transition-colors font-semibold"
              >
                <MessageCircle size={24} /> Contact via WhatsApp
              </a>
              <a
                href="#"
                className="flex items-center gap-4 bg-[#AE6A1C]/10 text-[#AE6A1C] p-4 rounded-2xl hover:bg-[#AE6A1C]/20 transition-colors font-semibold"
              >
                <Phone size={24} /> +91 XXXXX XXXXX
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
