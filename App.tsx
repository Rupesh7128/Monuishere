
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RefreshCcw, Home, Sparkles, AlertCircle, LayoutDashboard, Lock, Activity, MessageCircle, Radar, Scan, Loader2, LogOut, User, X, ChevronLeft, Menu } from 'lucide-react';
import { FileData, AnalysisResult } from './types';
import { analyzeResume } from './services/geminiService';
import ResumeUploader from './components/ResumeUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import ContentGenerator from './components/ContentGenerator';
import LandingPage from './components/LandingPage';

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

const AppContent: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [inputWizardStep, setInputWizardStep] = useState<0 | 1>(0); // 0: Upload, 1: JD
  const [resultTab, setResultTab] = useState<'analysis' | 'generator'>('analysis');
  
  const [resumeFile, setResumeFile] = useState<FileData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                setView('app');
            }
        } catch (e) {
            console.error("Failed to restore session", e);
        }
    }
  }, []);

  useEffect(() => {
    if (step === 'results' && analysisResult && resumeFile) {
        localStorage.setItem('hireSchemaSession', JSON.stringify({
            resumeFile,
            jobDescription,
            analysisResult
        }));
    }
  }, [step, analysisResult, resumeFile, jobDescription]);

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
        const byteCharacters = atob(resumeFile.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setIsResumePreviewOpen(true);
    } catch (e) {
        alert("Could not open preview.");
    }
  };

  const handleAnalysis = async () => {
    if (!resumeFile || !jobDescription) {
      setError('Required Data Missing: Please provide both a PDF resume and a job description.');
      return;
    }
    
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(resumeFile, jobDescription);
      setAnalysisResult(result);
      setStep('results');
      setResultTab('analysis'); 
    } catch (err: any) {
      setError(err.message || 'Analysis Failed: Unable to process the file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    if (confirm("Are you sure? This will clear your current session.")) {
        localStorage.removeItem('hireSchemaSession');
        setStep('input');
        setInputWizardStep(0);
        setAnalysisResult(null);
        setResumeFile(null);
        setJobDescription('');
        setError(null);
    }
  };

  // Handle file from Landing Page Upload
  const handleLandingStart = (file?: FileData) => {
    if (file) {
        setResumeFile(file);
        setInputWizardStep(1); // Jump to JD step if file provided
    }
    setView('app');
    setStep('input');
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-100 overflow-hidden">
      
      <AnimatePresence>
        {isResumePreviewOpen && pdfBlobUrl && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full max-w-7xl mx-auto flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-950">
                        <h3 className="font-bold text-white text-sm">Resume Preview</h3>
                        <button onClick={() => setIsResumePreviewOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 bg-zinc-800 relative">
                        <iframe src={pdfBlobUrl} className="w-full h-full absolute inset-0 border-0" title="Resume Preview" />
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-[60]">
            <div onClick={() => { setView('landing'); setIsMobileMenuOpen(false); }} className="cursor-pointer hover:opacity-90 flex-shrink-0">
               <AnimatedLogo />
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
                 <button onClick={resetApp} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                    <RefreshCcw className="w-3 h-3" /> <span className="hidden sm:inline">RESET SESSION</span>
                 </button>
               )}
               {view === 'landing' && (
                   <>
                       <button 
                         onClick={() => setView('app')} 
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
                         onClick={() => { setView('app'); setIsMobileMenuOpen(false); }} 
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
                            <p className="text-zinc-400 text-sm lg:text-base max-w-2xl mx-auto lg:mx-0">Upload resume and JD.</p>
                         </div>
                       </div>

                      {/* --- MOBILE WIZARD / DESKTOP SPLIT --- */}
                      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                        {/* Step 1: Upload (Visible if Step 0 or Desktop) */}
                        <div className={`${inputWizardStep === 0 ? 'flex' : 'hidden lg:flex'} flex-col h-full lg:h-72`}>
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
                        <div className={`${inputWizardStep === 1 ? 'flex' : 'hidden lg:flex'} flex-col h-full lg:h-72`}>
                           <div className="lg:hidden flex items-center gap-2 mb-2">
                                <button onClick={() => setInputWizardStep(0)} className="text-zinc-500 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                                <h3 className="text-sm font-bold text-zinc-500">STEP 2: JOB DESCRIPTION</h3>
                           </div>
                           <div className="relative flex-1 group">
                                <textarea 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste Job Description here..."
                                className="w-full h-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-300 focus:outline-none focus:border-orange-500/50 resize-none font-mono backdrop-blur-sm"
                                />
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
                          disabled={isAnalyzing || !resumeFile || !jobDescription}
                          className={`relative overflow-hidden group w-full lg:w-auto flex items-center justify-center gap-3 py-4 px-12 rounded-sm font-mono font-bold text-sm tracking-wide transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                            isAnalyzing 
                              ? 'bg-zinc-800 text-orange-500 border border-orange-500/20 cursor-wait' 
                              : (!resumeFile || !jobDescription)
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
                            <Sparkles className={`w-4 h-4 ${resultTab === 'generator' ? 'text-orange-500' : ''}`} />
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
                           <span className="text-green-500">● SESSION SAVED</span>
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
