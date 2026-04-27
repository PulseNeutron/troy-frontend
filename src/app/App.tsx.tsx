import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, Building2, Brain, ArrowRight, X, MessageCircle, Phone, Menu, Eye, Lightbulb, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import troyLogo from '../imports/troy_logo.jpeg';
import troyCastle2 from '../imports/troy_castle_2.jpg';
import troyTower from '../imports/troy_tower.jpg';
import troyBridge from '../imports/troy_bridge.jpg';
import troyBridge2 from '../imports/troy_bridge_2.png';

const API_BASE = 'http://192.168.1.16:5000';

type AppState = 'home' | 'upload' | 'analyzing' | 'results';

interface AnalysisResult {
  notice: string;
  insight: string;
  tryNext: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const heroSlides = [
    { image: troyCastle2, quote: '"Welcome to my giant castle!"' },
    { image: troyTower,   quote: '"I built the tallest tower ever!"' },
    { image: troyBridge,  quote: '"Look, a bridge for my cars!"' },
    { image: troyBridge2, quote: '"This bridge is so strong!"' },
  ];

  const quickQuestions = [
    'How is this helping my child?',
    'What skills are they practising?',
    'What should we build next?',
    'Is this age-appropriate?',
  ];

  useEffect(() => {
    if (appState === 'home') {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [appState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleStart = () => { setApiError(null); setAppState('upload'); };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) { setApiError('Please upload a JPG or PNG image.'); return; }
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setApiError(null);
    setAppState('analyzing');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('age', String(childAge));
      const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData });
      if (!res.ok) { const t = await res.text(); throw new Error(t || `Server error ${res.status}`); }
      const data = await res.json();
      setAnalysisResult({
        notice:  data.what_we_noticed    || 'Analysis complete.',
        insight: data.creativity_insight || 'Great creativity shown!',
        tryNext: data.try_next           || 'Keep building!',
      });
      setSessionId(data.session_id || null);
      setChatMessages([]);
      setAppState('results');
    } catch (err: any) {
      console.error(err);
      setApiError('Could not reach the server. Make sure the backend is running at ' + API_BASE);
      setAppState('upload');
    }
  };

  const handleSendChat = async (question: string) => {
    const q = question.trim();
    if (!q || isChatLoading) return;
    if (!sessionId) { setChatMessages(prev => [...prev, { role: 'ai', text: 'No active session. Please analyze a photo first.' }]); return; }
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question: q }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer || 'Sorry, no answer received.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null); setAnalysisResult(null); setSessionId(null);
    setChatMessages([]); setChatInput(''); setApiError(null); setChildAge(6);
    setAppState('home');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2D3748] overflow-x-hidden" style={{ fontFamily: 'Quicksand, sans-serif' }}>

      <header className="w-full px-5 py-3 flex items-center justify-between bg-white shadow-sm relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <img src={troyLogo} alt="Troy Logo" className="h-[36px] sm:h-[40px] w-auto object-contain" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-amber-500 hover:text-amber-600 transition-colors p-1">
          <Menu size={32} strokeWidth={2} />
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col">
              <div className="flex justify-end p-5">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"><X size={24} /></button>
              </div>
              <div className="flex flex-col px-6 py-4 gap-6">
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">Home</a>
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">Shop Products</a>
                <a href="#" className="text-xl font-bold text-[#AE6A1C] border-l-4 border-[#AE6A1C] pl-3 -ml-3">AI Play Analysis</a>
                <a href="#" className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C]">Our Story</a>
                <button onClick={() => { setIsMobileMenuOpen(false); setIsContactModalOpen(true); }} className="text-xl font-bold text-gray-800 hover:text-[#AE6A1C] text-left">Contact</button>
                <div className="h-px bg-gray-100 w-full my-2"></div>
                <a href="#" className="text-lg font-semibold text-gray-600 hover:text-amber-500">Login / Sign Up</a>
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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#AE6A1C] leading-tight">
                Discover the <span className="text-[#AE6A1C] relative">magic<svg className="absolute w-full h-2 -bottom-1 left-0 text-amber-300" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> in their play
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">Snap a photo of your child's Troy block creation and let our AI reveal the hidden engineering and learning principles behind it.</p>
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
              <p className="text-sm text-gray-600 px-4">Make sure the entire structure is visible and well-lit.</p>
            </div>

            {/* Age Selector */}
            <div className="w-full bg-white rounded-2xl border border-amber-100 p-4 space-y-2 shadow-sm">
              <label className="text-sm font-bold text-[#AE6A1C] block">
                Child's age: <span className="text-lg">{childAge} years old</span>
              </label>
              <input type="range" min={2} max={12} step={1} value={childAge} onChange={e => setChildAge(Number(e.target.value))} className="w-full accent-amber-500" />
              <div className="flex justify-between text-xs text-gray-400 font-semibold px-1">
                <span>2 yrs</span><span>12 yrs</span>
              </div>
            </div>

            {apiError && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl p-3 text-sm font-semibold">{apiError}</div>
            )}

            <div className="w-full aspect-[4/5] bg-white rounded-3xl border-4 border-dashed border-[#AE6A1C]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-[#AE6A1C] transition-colors cursor-pointer">
              <input type="file" accept="image/png,image/jpeg" capture="environment" onChange={handleImageCapture} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
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
              <p className="text-sm text-gray-600 animate-pulse px-4">Identifying architectural patterns & learning milestones</p>
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {appState === 'results' && analysisResult && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6 pb-12">

            <div className="w-full h-56 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative shrink-0">
              {capturedImage && <img src={capturedImage} alt="Result" className="w-full h-full object-cover" />}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs text-[#AE6A1C] shadow-sm flex items-center gap-1.5">
                <Building2 size={14} /> Structure Identified
              </div>
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-xs text-gray-600 shadow-sm">
                Age {childAge}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-100 space-y-4">
              <h3 className="font-bold text-base text-[#AE6A1C] flex items-center gap-2"><Brain size={18} /> What we found</h3>

              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#FFF9F2] p-4 rounded-2xl flex gap-4 items-start border border-amber-100">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0"><Eye size={18} /></div>
                <div><h4 className="font-bold text-gray-800 text-sm">What we noticed</h4><p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysisResult.notice}</p></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#F0FDF4] p-4 rounded-2xl flex gap-4 items-start border border-emerald-100">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700 shrink-0"><Sparkles size={18} /></div>
                <div><h4 className="font-bold text-gray-800 text-sm">Creativity insight</h4><p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysisResult.insight}</p></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[#EFF6FF] p-4 rounded-2xl flex gap-4 items-start border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-700 shrink-0"><Lightbulb size={18} /></div>
                <div><h4 className="font-bold text-gray-800 text-sm">Try next time</h4><p className="text-sm text-gray-600 mt-1 leading-relaxed">{analysisResult.tryNext}</p></div>
              </motion.div>
            </div>

            {/* Chat */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="bg-[#AE6A1C] px-5 py-3.5 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><MessageCircle size={18} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-white text-sm">Ask about this creation</h3>
                  <p className="text-white/70 text-xs">Get personalised insights for your child</p>
                </div>
              </div>

              <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2">
                {quickQuestions.map(q => (
                  <button key={q} onClick={() => handleSendChat(q)} disabled={isChatLoading} className="text-xs font-semibold border border-amber-200 text-[#AE6A1C] rounded-full px-3 py-1.5 bg-[#FFF9F2] hover:bg-amber-50 transition-colors flex items-center gap-1 disabled:opacity-50">
                    <ChevronRight size={12} />{q}
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 flex flex-col gap-3 min-h-[80px] max-h-[300px] overflow-y-auto">
                {chatMessages.length === 0 && !isChatLoading && (
                  <p className="text-center text-gray-400 text-sm py-4">Tap a question above or type your own below</p>
                )}
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === 'ai' ? 'bg-amber-100 text-amber-700' : 'bg-[#AE6A1C] text-white'}`}>
                      {msg.role === 'ai' ? 'AI' : 'You'}
                    </div>
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-[#FFF9F2] text-gray-700 rounded-bl-sm' : 'bg-[#AE6A1C] text-white rounded-br-sm'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                    <div className="bg-[#FFF9F2] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                      {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full bg-amber-400" animate={{ y: [0,-6,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-amber-100 p-3 flex gap-2">
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendChat(chatInput); }}
                  placeholder="Ask anything about this creation..."
                  disabled={isChatLoading}
                  className="flex-1 bg-[#FFF9F2] border border-amber-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#AE6A1C] transition-colors placeholder:text-gray-400 disabled:opacity-60"
                />
                <button onClick={() => handleSendChat(chatInput)} disabled={isChatLoading || !chatInput.trim()} className="bg-[#AE6A1C] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-amber-700 transition-colors disabled:opacity-50 shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleReset} className="flex-1 bg-white border-2 border-amber-200 text-amber-700 font-bold py-3.5 rounded-2xl shadow-sm hover:bg-amber-50 transition-colors text-sm">Scan Another</button>
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl shadow-[0_4px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-sm">
                Save Memory <ArrowRight size={18} />
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
