
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RefreshCcw, Home, Sparkles, AlertCircle, LayoutDashboard, Lock, Activity, MessageCircle, Radar, Scan, Loader2, LogOut, User, X, ChevronLeft, Menu, Link as LinkIcon, FileText, Globe, ChevronDown, Check, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { FileData, AnalysisResult } from './types';
import { analyzeResume } from './services/geminiService';
import { logEvent, logPageView } from './services/analytics';
import ResumeUploader from './components/ResumeUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import ContentGenerator from './components/ContentGenerator';
import LandingPage from './components/LandingPage';
import LegalPages from './components/LegalPages';

export const AnimatedLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 select-none whitespace-nowrap ${className}`}>
    <div className="relative w-8 h-8 flex items-end justify-between overflow-hidden shrink-0">
      {/* Dynamic Data Bars Logo */}
      <motion.div 
        animate={{ height: ["30%", "80%", "40%", "30%"] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-1.5 bg-orange-600 rounded-t-sm"
      />
      <motion.div 
        animate={{ height: ["50%", "100%", "60%", "50%"] }} 
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        className="w-1.5 bg-orange-500 rounded-t-sm"
      />
      <motion.div 
        animate={{ height: ["40%", "70%", "90%", "40%"] }} 
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="w-1.5 bg-orange-400 rounded-t-sm"
      />
       <motion.div 
        animate={{ height: ["60%", "30%", "70%", "60%"] }} 
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="w-1.5 bg-white rounded-t-sm"
      />
    </div>
    <span className="text-lg font-black font-mono tracking-tighter text-white">
      HIRE<span className="text-orange-500">SCHEMA</span>
    </span>
  </div>
);

const LANGUAGES = [
    "English", "Spanish", "French", "German", "Hindi", "Mandarin", "Portuguese", "Japanese", "Korean"
];

const AppContent: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app' | 'legal'>('landing');
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  const [step, setStep] = useState<'input' | 'results'>('input');
  const [inputWizardStep, setInputWizardStep] = useState<0 | 1>(0); // 0: Upload, 1: JD
  const [jobInputMode, setJobInputMode] = useState<'link' | 'text'>('link'); // Default to Link

  const [resultTab, setResultTab] = useState<'analysis' | 'generator'>('analysis');
  
  const [resumeFile, setResumeFile] = useState<FileData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Payment State - Persisted
  // DEFAULT TRUE FOR TESTING as requested
  const [isPaid, setIsPaid] = useState(true);
  
  // Language Persistence
  const [appLanguage, setAppLanguage] = useState("English");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1.0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll State for Header Shrinking
  const [isScrolled, setIsScrolled] = useState(false);

  // --- SCROLL HANDLER ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  // --- ROUTING & ANALYTICS ---
  useEffect(() => {
    // Check URL for legal pages
    const path = window.location.pathname;
    if (path === '/privacy') {
      setView('legal');
      setLegalPage('privacy');
    } else if (path === '/terms') {
      setView('legal');
      setLegalPage('terms');
    } else if (path === '/cookies') {
      setView('legal');
      setLegalPage('cookies');
    }

    logPageView(view === 'landing' ? 'Landing Page' : view === 'legal' ? `Legal - ${path}` : 'App Dashboard');
    
    // Reset scroll state on view change
    setIsScrolled(false);
  }, [view]);

  // --- STATE PERSISTENCE ---
  useEffect(() => {
    const savedSession = localStorage.getItem('hireSchemaSession');
    if (savedSession) {
        try {
            const data = JSON.parse(savedSession);
            if (data.analysisResult) {
                setResumeFile(data.resumeFile);
                setJobDescription(data.jobDescription);
                setAnalysisResult(data.analysisResult);
                setStep('results');
                
                // If saved session has paid=true, keep it true. 
                // Since default is now true for testing, this just ensures consistency.
                if (data.isPaid !== undefined) setIsPaid(data.isPaid);
                
                if (data.language) setAppLanguage(data.language);
                
                // Only go to app if not on a legal page
                if (window.location.pathname === '/') {
                    setView('app');
                }
                logEvent('session_restored');
            }
        } catch (e) {
            console.error("Failed to restore session", e);
        }
    }
  }, []);

  useEffect(() => {
    if (step === 'results' && analysisResult && resumeFile) {
        try {
            localStorage.setItem('hireSchemaSession', JSON.stringify({
                resumeFile,
                jobDescription,
                analysisResult,
                isPaid, // Save payment status
                language: appLanguage
            }));
        } catch (e) {
            console.warn("Storage Quota Exceeded: Could not save session.", e);
            // Optionally clear old data or just fail silently but log it
        }
    }
  }, [step, analysisResult, resumeFile, jobDescription, isPaid, appLanguage]);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
        setAnalysisProgress(0);
        interval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 90) return prev; 
                return prev + Math.random() * 5;
            });
        }, 200);
    } else {
        setAnalysisProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    return () => {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const handlePreviewResume = () => {
    if (!resumeFile) return;
    try {
        logEvent('preview_resume_input');
        const byteCharacters = atob(resumeFile.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setPreviewZoom(1.0); // Reset zoom
        setIsResumePreviewOpen(true);
    } catch (e) {
        alert("Could not open preview.");
    }
  };
  
  const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 0.25, 0.5));
  
  const handleDownloadOriginal = () => {
      if (!pdfBlobUrl || !resumeFile) return;
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = resumeFile.name;
      link.click();
      logEvent('download_original_pdf');
  };

  const handleAnalysis = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first.');
      return;
    }
    
    // We allow analysis without JD, but give a warning via Gemini result
    
    setError(null);
    setIsAnalyzing(true);
    logEvent('analysis_started');

    try {
      const result = await analyzeResume(resumeFile, jobDescription);
      setAnalysisResult(result);
      setStep('results');
      
      // Force user to Analysis tab first to see scores
      setResultTab('analysis');
      
      logEvent('analysis_success', { ats_score: result.atsScore });
    } catch (err: any) {
      setError(err.message || 'Analysis Failed: Unable to process the file.');
      logEvent('analysis_failed', { error: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    if (confirm("Start a new session? This will clear all current data.")) {
        logEvent('session_reset');
        localStorage.removeItem('hireSchemaSession');
        // Force reload to ensure completely fresh state for new session
        window.location.reload();
    }
  };

  // Handle file from Landing Page Upload
  const handleLandingStart = (intent: 'scan' | 'optimize' | 'launch', file?: FileData) => {
    logEvent('app_launch_click', { intent });
    
    if (file) {
        setResumeFile(file);
        setInputWizardStep(1); // Jump to JD step if file provided
        logEvent('file_uploaded_landing');
    }

    // Explicit Routing based on Intent
    if (intent === 'optimize') {
        setResultTab('generator');
    } else if (intent === 'scan') {
        setResultTab('analysis');
    } 
    // 'launch' just goes to app, maintaining current state or default

    setView('app');
    
    // If we have a result already (restored session), ensure we see it
    if (analysisResult && step === 'results') {
        // do nothing, already there
    } else {
        setStep('input');
    }
    
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    logEvent('nav_click', { section: id });
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLegalBack = () => {
    setView('landing');
    window.history.pushState({}, '', '/');
    window.scrollTo(0,0);
  };

  // --- RENDER LEGAL PAGES ---
  if (view === 'legal' && legalPage) {
    return <LegalPages page={legalPage} onBack={handleLegalBack} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-100 overflow-hidden">
      
      <AnimatePresence>
        {isResumePreviewOpen && pdfBlobUrl && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full max-w-7xl mx-auto flex flex-col bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="flex justify-between items-center p-3 sm:p-4 border-b border-white/10 bg-zinc-950">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-white text-sm hidden sm:block">Resume Preview</h3>
                            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                <button onClick={handleZoomOut} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom Out">
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-mono w-12 text-center text-zinc-400">{Math.round(previewZoom * 100)}%</span>
                                <button onClick={handleZoomIn} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Zoom In">
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleDownloadOriginal}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors border border-zinc-700"
                            >
                                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download Original</span>
                            </button>
                            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                            <button onClick={() => setIsResumePreviewOpen(false)} className="p-2 hover:bg-red-900/50 hover:text-red-500 rounded-lg text-zinc-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-zinc-900/50 relative overflow-auto flex justify-center p-4 sm:p-8">
                        <motion.div 
                            style={{ scale: previewZoom }}
                            className="origin-top shadow-2xl"
                        >
                            <iframe 
                                src={pdfBlobUrl} 
                                className="w-[8.5in] h-[11in] bg-white border-0" 
                                title="Resume Preview" 
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <header 
        className={`fixed z-[60] flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? 'top-4 h-14 w-[90%] max-w-5xl left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-zinc-900/80 backdrop-blur-xl px-6 shadow-2xl' 
            : 'top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/80 backdrop-blur-md px-4 sm:px-6 w-full'
        }`}
      >
            <div onClick={() => { setView('landing'); setIsMobileMenuOpen(false); window.history.pushState({}, '', '/'); }} className="cursor-pointer hover:opacity-90 flex-shrink-0">
               <AnimatedLogo className={isScrolled ? 'scale-90' : ''} />
            </div>
            
            {view === 'landing' && (
                <nav className="hidden md:flex items-center gap-6">
                    <button onClick={() => scrollToSection('features')} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Features</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Pricing</button>
                    <button onClick={() => scrollToSection('data-safety')} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Data Safety</button>
                    <button onClick={() => scrollToSection('faq')} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">FAQs</button>
                </nav>
            )}

            <div className="flex items-center gap-3">
               {view === 'app' && (
                 <>
                   {/* Language Selector */}
                   <div className="relative">
                        <button 
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded hover:bg-zinc-900"
                        >
                            <Globe className="w-3 h-3" />
                            <span className="hidden sm:inline">{appLanguage}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                        <AnimatePresence>
                            {isLangMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100] py-1"
                                >
                                    {LANGUAGES.map(lang => (
                                        <button 
                                            key={lang}
                                            onClick={() => { setAppLanguage(lang); setIsLangMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-zinc-800 ${appLanguage === lang ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-400 hover:text-white'}`}
                                        >
                                            {lang}
                                            {appLanguage === lang && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                   </div>

                   <button onClick={resetApp} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded hover:bg-zinc-900">
                      <RefreshCcw className="w-3 h-3" /> <span className="hidden sm:inline">RESET</span>
                   </button>
                 </>
               )}
               {view === 'landing' && (
                   <>
                       <button 
                         onClick={() => handleLandingStart('launch')} 
                         className="hidden md:block px-4 sm:px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] sm:text-xs font-mono font-bold rounded-sm shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                       >
                           LAUNCH APP
                       </button>
                       <button 
                         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                         className="md:hidden p-2 text-zinc-400 hover:text-white"
                       >
                           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                       </button>
                   </>
               )}
            </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && view === 'landing' && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 top-16 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 md:hidden flex flex-col p-6"
            >
                <div className="flex flex-col gap-6 items-center pt-8">
                    <button onClick={() => scrollToSection('features')} className="text-xl font-bold text-zinc-300 hover:text-orange-500 transition-colors">Features</button>
                    <button onClick={() => scrollToSection('pricing')} className="text-xl font-bold text-zinc-300 hover:text-orange-500 transition-colors">Pricing</button>
                    <button onClick={() => scrollToSection('data-safety')} className="text-xl font-bold text-zinc-300 hover:text-orange-500 transition-colors">Data Safety</button>
                    <button onClick={() => scrollToSection('faq')} className="text-xl font-bold text-zinc-300 hover:text-orange-500 transition-colors">FAQs</button>
                    
                    <div className="w-20 h-px bg-zinc-800 my-4"></div>
                    
                    <button 
                         onClick={() => { handleLandingStart('launch'); setIsMobileMenuOpen(false); }} 
                         className="w-full max-w-xs px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold rounded shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] text-center"
                    >
                         LAUNCH APP
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow flex flex-col pt-16 h-screen max-h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              className="flex-1 overflow-y-auto h-full scroll-smooth custom-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onScroll={handleScroll}
            >
              <LandingPage onStart={handleLandingStart} />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              className="flex-1 overflow-hidden flex flex-col w-full max-w-[1600px] mx-auto"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <main className="flex-1 min-h-0 relative flex flex-col p-2 sm:p-4 lg:p-6">
                <AnimatePresence mode="wait">
                  {step === 'input' ? (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-5xl mx-auto h-full flex flex-col justify-center pb-8 overflow-y-auto w-full scrollbar-hide relative px-2"
                      onScroll={handleScroll}
                    >
                       <AnimatePresence>
                        {isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/10"
                            >
                                <div className="w-full max-w-md space-y-8 p-8 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                                        <div className="relative w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                                            <Radar className="w-12 h-12 text-orange-500 animate-[spin_3s_linear_infinite]" />
                                        </div>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                                            <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-orange-500" /> ANALYZING</span>
                                            <span className="text-orange-500 font-bold">{Math.round(analysisProgress)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                            <motion.div className="h-full bg-orange-500" style={{ width: `${analysisProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                       </AnimatePresence>

                       <div className="mb-4 lg:mb-6 text-center lg:text-left mt-2 lg:mt-0 flex justify-between items-end">
                         <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">New Analysis</h2>
                            <p className="text-zinc-400 text-sm lg:text-base max-w-2xl mx-auto lg:mx-0">Upload resume and paste job description or link.</p>
                         </div>
                       </div>

                      {/* --- MOBILE WIZARD / DESKTOP SPLIT --- */}
                      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                        {/* Step 1: Upload (Visible if Step 0 or Desktop) */}
                        <div className={`${inputWizardStep === 0 ? 'flex' : 'hidden lg:flex'} flex-col h-full lg:h-80`}>
                            <h3 className="lg:hidden text-sm font-bold text-zinc-500 mb-2">STEP 1: UPLOAD RESUME</h3>
                            <div className="flex-1">
                                <ResumeUploader onFileUpload={setResumeFile} currentFile={resumeFile} onPreview={handlePreviewResume} />
                            </div>
                            <div className="lg:hidden mt-4">
                                <button 
                                    onClick={() => setInputWizardStep(1)} 
                                    disabled={!resumeFile}
                                    className="w-full py-3 bg-zinc-800 text-white rounded font-bold disabled:opacity-50"
                                >
                                    NEXT: ADD JOB DESCRIPTION
                                </button>
                            </div>
                        </div>

                        {/* Step 2: JD (Visible if Step 1 or Desktop) */}
                        <div className={`${inputWizardStep === 1 ? 'flex' : 'hidden lg:flex'} flex-col h-full lg:h-80`}>
                           <div className="lg:hidden flex items-center gap-2 mb-2">
                                <button onClick={() => setInputWizardStep(0)} className="text-zinc-500 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                                <h3 className="text-sm font-bold text-zinc-500">STEP 2: JOB DETAILS</h3>
                           </div>
                           
                           {/* JD Input Selector */}
                           <div className="flex gap-2 mb-3 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 self-start">
                                <button 
                                    onClick={() => setJobInputMode('link')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${jobInputMode === 'link' ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <LinkIcon className="w-3 h-3" /> Job Link
                                </button>
                                <button 
                                    onClick={() => setJobInputMode('text')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${jobInputMode === 'text' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <FileText className="w-3 h-3" /> Text
                                </button>
                           </div>

                           <div className="relative flex-1 group h-full">
                                {jobInputMode === 'link' ? (
                                     <div className="h-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center gap-4">
                                         <div className="text-center">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <LinkIcon className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1">Paste Job Post URL</h4>
                                            <p className="text-zinc-500 text-xs mb-4">LinkedIn, Indeed, Glassdoor, or Company Site.</p>
                                         </div>
                                         <input 
                                            type="text"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-orange-500 outline-none transition-colors"
                                         />
                                         <p className="text-[10px] text-zinc-600 text-center">We will automatically extract job details from the link.</p>
                                     </div>
                                ) : (
                                    <textarea 
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste full job description text here..."
                                        className="w-full h-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 resize-none font-mono backdrop-blur-sm"
                                    />
                                )}
                           </div>
                        </div>
                      </div>

                      {error && (
                        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg flex items-center gap-3 text-red-400 text-sm mx-auto w-full lg:w-2/3 backdrop-blur-sm">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <span className="font-medium">{error}</span>
                        </div>
                      )}

                      <div className="flex justify-center lg:justify-end pb-4">
                        <button 
                          onClick={handleAnalysis}
                          disabled={isAnalyzing || !resumeFile}
                          className={`relative overflow-hidden group w-full lg:w-auto flex items-center justify-center gap-3 py-4 px-12 rounded-sm font-mono font-bold text-sm tracking-wide transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                            isAnalyzing 
                              ? 'bg-zinc-800 text-orange-500 border border-orange-500/20 cursor-wait' 
                              : (!resumeFile)
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-500'
                          }`}
                        >
                            {/* Pulsing Background for Loading State */}
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/50 via-orange-500/50 to-orange-600/50 animate-pulse"></div>
                            )}

                            <span className="relative z-10 flex items-center gap-2">
                                {isAnalyzing ? 'INITIALIZING...' : `INITIALIZE ANALYSIS`}
                                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                            </span>
                            {!isAnalyzing && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col h-full overflow-hidden"
                    >
                      <div className="flex justify-center mb-4 shrink-0">
                        <div className="bg-zinc-900/40 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-1">
                          <button
                            onClick={() => setResultTab('analysis')}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              resultTab === 'analysis' 
                                ? 'bg-zinc-800 text-white shadow-sm' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <LayoutDashboard className={`w-4 h-4 ${resultTab === 'analysis' ? 'text-orange-500' : ''}`} />
                            <span className="hidden sm:inline">Diagnostic</span>
                            <span className="sm:hidden">Data</span>
                          </button>
                          <button
                            onClick={() => setResultTab('generator')}
                            className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              resultTab === 'generator' 
                                ? 'bg-zinc-800 text-white shadow-sm' 
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <div className="relative">
                                {!isPaid && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-orange-500" />}
                                <Sparkles className={`w-4 h-4 ${resultTab === 'generator' ? 'text-orange-500' : ''}`} />
                            </div>
                            <span className="hidden sm:inline">Editor</span>
                            <span className="sm:hidden">Editor</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 relative bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <AnimatePresence mode="wait">
                          {resultTab === 'analysis' ? (
                             <motion.div 
                                key="analysis-view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-6"
                             >
                                {analysisResult && <AnalysisDashboard result={analysisResult} />}
                             </motion.div>
                          ) : (
                            <motion.div 
                                key="generator-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col"
                             >
                                {analysisResult && (
                                <ContentGenerator 
                                    resumeFile={resumeFile!} 
                                    jobDescription={jobDescription} 
                                    analysis={analysisResult} 
                                    isPaid={isPaid}
                                    onPaymentSuccess={() => setIsPaid(true)}
                                    appLanguage={appLanguage}
                                    setAppLanguage={setAppLanguage}
                                />
                                )}
                             </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="shrink-0 pt-3 flex justify-between items-center text-[10px] text-zinc-600 font-mono">
                         <div className="flex gap-4">
                           <span>STATUS: ONLINE</span>
                           {/* Add persistence indicator */}
                           <span className="text-green-500">● SESSION ACTIVE (LOCAL)</span>
                         </div>
                        <span>SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppContent;
