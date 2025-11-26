
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Upload, Search, Zap, ArrowRight, FileText, 
  Globe, Scan, GraduationCap, BrainCircuit, ShieldCheck, 
  ChevronDown, Quote, CheckCircle2, XCircle, ArrowUpRight, Check, Download,
  Scale, Server, X, Award, Shield, Lock, CreditCard, Trash2, ArrowRightCircle,
  Database, UserCheck
} from 'lucide-react';
import { AnimatedLogo } from '../App';
import { FileData } from '../types';

interface LandingPageProps {
  onStart: (file?: FileData) => void;
}

// Consistent Global Button Styles
const ORANGE_BUTTON_STYLE = "px-8 sm:px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm cursor-pointer border-none";
const DARK_BUTTON_STYLE = "px-8 sm:px-10 py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono font-bold text-sm sm:text-base hover:text-white hover:border-orange-500/50 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all rounded-sm backdrop-blur-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]";

// --- MOUSE TRAIL COMPONENT ---
const MouseTrail = () => {
    const [points, setPoints] = useState<{ x: number, y: number, id: number }[]>([]);
    
    useEffect(() => {
        let timeoutId: any;

        const handleMouseMove = (e: MouseEvent) => {
            setPoints(prev => [
                ...prev.slice(-12), 
                { x: e.clientX, y: e.clientY, id: Date.now() }
            ]);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setPoints([]);
            }, 50); // Instantly disappear
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 hidden sm:block">
            {points.map((point, i) => (
                <div 
                    key={point.id}
                    className="absolute w-2 h-2 rounded-full bg-orange-500 blur-[1px]"
                    style={{
                        left: point.x,
                        top: point.y,
                        opacity: (i / points.length),
                        transform: `scale(${i / points.length}) translate(-50%, -50%)`,
                    }}
                />
            ))}
        </div>
    );
};

// --- VISUAL STEP GRAPHIC ---
const StepGraphic = ({ step }: { step: 1 | 2 | 3 }) => {
  return (
    <div className="w-32 h-24 bg-zinc-900 border border-zinc-800 rounded-lg relative mb-8 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-zinc-600 transition-all duration-500 mx-auto">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
       
       {step === 1 && (
         <>
            {/* Upload UI */}
            <div className="w-12 h-16 bg-zinc-800 rounded border border-zinc-700 flex flex-col items-center justify-center gap-1 z-10 shadow-lg group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                <div className="w-8 h-1 bg-zinc-700 rounded-full group-hover:bg-blue-500/50 transition-colors"></div>
            </div>
            {/* Floating particles */}
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
         </>
       )}

       {step === 2 && (
         <>
            {/* Analysis UI */}
             <div className="w-12 h-16 bg-zinc-800 rounded border border-zinc-700 flex flex-col p-1.5 gap-1.5 z-10 shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform">
                <div className="w-8 h-1 bg-zinc-600 rounded-full"></div>
                <div className="w-6 h-1 bg-zinc-600 rounded-full"></div>
                <div className="w-full h-1 bg-red-500/50 rounded-full"></div>
                <div className="w-5 h-1 bg-zinc-600 rounded-full"></div>
                <div className="w-full h-1 bg-red-500/50 rounded-full"></div>
                {/* Scanner Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
            </div>
         </>
       )}

       {step === 3 && (
         <>
            {/* Optimized UI */}
             <div className="w-12 h-16 bg-zinc-800 rounded border border-green-900/50 flex flex-col p-1.5 gap-1.5 z-10 shadow-lg group-hover:scale-110 transition-transform">
                <div className="w-8 h-1 bg-zinc-500 rounded-full"></div>
                <div className="w-full h-1 bg-green-500/80 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                <div className="w-6 h-1 bg-zinc-500 rounded-full"></div>
                <div className="w-full h-1 bg-green-500/80 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-black p-1 rounded-full border-2 border-zinc-900">
                    <Check className="w-2 h-2" />
                </div>
            </div>
         </>
       )}
    </div>
  )
}

// --- FAQ ITEM COMPONENT ---
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
            >
                <span className={`text-base font-medium transition-colors ${isOpen ? 'text-orange-500' : 'text-zinc-200 group-hover:text-white'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-zinc-400 text-base leading-relaxed max-w-3xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 100]);
  
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64 = base64String.split(',')[1];
            onStart({
                name: file.name,
                type: file.type,
                base64: base64
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a PDF file.");
    }
  };

  const features = [
    {
      title: "ATS Simulation",
      desc: "Run logic modeled on Fortune 500 parsers.",
      micro: "Keyword match, sections, entities.",
      icon: Search
    },
    {
      title: "Smart Optimization",
      desc: "Rewrite bullets with relevant keywords.",
      micro: "No fluff, measurable outcomes.",
      icon: Sparkles
    },
    {
      title: "Cover Letter Engine",
      desc: "Tailored letters that sound like you.",
      micro: "Role-specific hooks.",
      icon: FileText
    },
    {
      title: "Interview Prep",
      desc: "Predicted questions with STAR drafts.",
      micro: "Editable scripts.",
      icon: BrainCircuit
    },
    {
      title: "Skill Gap Bridge",
      desc: "Mini-courses for missing skills.",
      micro: "Quick primers.",
      icon: GraduationCap
    },
    {
      title: "Global Translation",
      desc: "Instantly translate your application.",
      micro: "English, Spanish, French, German + 4 more.",
      icon: Globe
    }
  ];

  const caseStudies = [
      { name: "David Kim", role: "Software Engineer", target: "Senior Backend Dev", before: 62, after: 88, outcome: "3 interviews in 7 days" },
      { name: "Sarah Jenkins", role: "Product Manager", target: "Group PM", before: 55, after: 91, outcome: "Offer received at Fintech Co." },
      { name: "Marcus Johnson", role: "Marketing Director", target: "VP Marketing", before: 71, after: 94, outcome: "Screened by Amazon & Google" },
      { name: "Emily Chen", role: "Data Scientist", target: "Lead Data Scientist", before: 60, after: 92, outcome: "Hired by Spotify" },
      { name: "Michael Ross", role: "Sales Manager", target: "Regional VP", before: 45, after: 85, outcome: "5 callbacks in 1 week" },
      { name: "Jessica Wu", role: "UX Designer", target: "Senior Product Designer", before: 58, after: 89, outcome: "Portfolio review at Airbnb" },
      { name: "James Wilson", role: "DevOps Engineer", target: "SRE Lead", before: 70, after: 95, outcome: "Senior role offer" },
      { name: "Linda Martinez", role: "HR Specialist", target: "People Ops Manager", before: 50, after: 82, outcome: "Interviewed at Netflix" },
      { name: "Robert Taylor", role: "Financial Analyst", target: "Finance Manager", before: 65, after: 88, outcome: "Landed job at Chase" },
      { name: "Priya Patel", role: "Operations Lead", target: "COO (Startup)", before: 55, after: 90, outcome: "2 offers negotiated" }
  ];

  const faqs = [
      { q: "Is my data safe?", a: "We have a Zero Data Retention policy. We do not store your resumes or personal data on our servers. All processing happens in ephemeral memory and is wiped instantly after your session ends." },
      { q: "How does the ATS scoring work?", a: "We evaluate keyword match, section parsing (Experience/Education/Skills), entity/tool detection, and formatting risks. Results vary by ATS; we align to common parsers used by Fortune 500s." },
      { q: "Can I download the optimized resume?", a: "Yes. Analysis is free. Pay $1 per download for optimized resume and cover letter PDFs." },
      { q: "Does it work for all industries?", a: "Best for roles with clear skills (tech, product, design, marketing, ops). Generalist roles supported but scoring is less predictive." },
      { q: "Is this free to use?", a: "Analysis is free. Pay $1 only when you download your optimized documents." },
      { q: "Can I edit AI suggestions?", a: "Yes. You can edit bullets inline before you export." },
      { q: "What languages are supported?", a: "English, Hindi, Spanish, German, French, Portuguese, Mandarin, Arabic." }
  ];

  return (
    <div className="relative w-full bg-black text-white selection:bg-orange-500/30 font-sans overflow-x-hidden pb-0">
      
      <MouseTrail />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 px-6 border-b border-white/10 overflow-hidden bg-zinc-950">
        
        {/* Live Animated Gradient Background */}
        <div className="absolute inset-0 bg-zinc-950 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-orange-600/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
            <div className="absolute -bottom-[40%] left-[20%] w-[80%] h-[80%] rounded-full bg-orange-900/10 blur-[120px] animate-[pulse_12s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
        
        <motion.div 
            style={{ y: yHero }}
            className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
        >
            <p className="text-zinc-500 font-mono text-sm mb-6">HireSchema is built by <span className="text-white font-bold">KoK Labs</span></p>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1] sm:leading-[1]"
            >
                Beat the ATS. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-700">Get interviews faster.</span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-3xl text-lg sm:text-2xl text-zinc-400 mb-10 leading-relaxed font-light"
            >
               Tailor your resume to each job in seconds with transparent scoring and keyword fixes.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
            >
                <div className="relative group w-full sm:w-auto">
                     <button className={ORANGE_BUTTON_STYLE + " w-full"}>
                        OPTIMIZE MY RESUME
                     </button>
                     <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleHeroUpload} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                     />
                </div>
                
                <button
                onClick={() => onStart()}
                className={DARK_BUTTON_STYLE + " w-full sm:w-auto"}
                >
                    TRY FREE SCAN
                </button>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-6 text-xs text-zinc-500 font-mono items-center px-4"
            >
                <span className="flex items-center gap-2 whitespace-nowrap"><ShieldCheck className="w-4 h-4 text-green-500" /> No subscription</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800 hidden sm:block"></span>
                <span className="flex items-center gap-2 whitespace-nowrap"><CreditCard className="w-4 h-4 text-zinc-400" /> Pay $1 per download</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800 hidden sm:block"></span>
                <span className="flex items-center gap-2 whitespace-nowrap"><Lock className="w-4 h-4 text-zinc-400" /> Secure via Dodo Payments</span>
            </motion.div>
        </motion.div>
      </section>

      {/* --- FEATURES CAROUSEL LOOP --- */}
      <div className="w-full border-y border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden py-6">
         <div className="flex animate-marquee gap-16 w-max items-center hover:[animation-play-state:paused]">
            {[...features, ...features].map((f, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default px-4">
                    <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-orange-500/50 transition-colors">
                        <f.icon className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                        <span className="block text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider group-hover:text-white transition-colors">{f.title}</span>
                        <span className="text-[10px] text-zinc-600">{f.micro}</span>
                    </div>
                </div>
            ))}
         </div>
     </div>

      {/* --- VALUE + PROOF BLOCK --- */}
      <section className="py-24 px-6 bg-zinc-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-10">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">Why manual edits fail.</h2>
                    <ul className="space-y-6">
                        <li className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-orange-500 font-bold">1</div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Tailored to each JD in seconds</h3>
                                <p className="text-zinc-500 text-sm">Don't spend hours tweaking. We match context instantly.</p>
                            </div>
                        </li>
                         <li className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-orange-500 font-bold">2</div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Raise ATS match score</h3>
                                <p className="text-zinc-500 text-sm">We find and fix the missing keywords that block you.</p>
                            </div>
                        </li>
                         <li className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-orange-500 font-bold">3</div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Human-ready bullets</h3>
                                <p className="text-zinc-500 text-sm">Real metrics, active voice, and no robotic fluff.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-xl inline-block">
                    <div className="text-3xl font-bold text-white mb-1">80–90+</div>
                    <p className="text-sm text-zinc-500">Average ATS Score after optimization</p>
                </div>
            </div>

            {/* Visual Proof Component */}
            <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 blur-3xl rounded-full"></div>
                <div className="relative z-10 space-y-4">
                    {/* Before Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg opacity-60"
                    >
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase">Original</span>
                        </div>
                        <p className="text-zinc-500 text-sm line-through">Managed a team of 5 people to build the product.</p>
                    </motion.div>

                     {/* Arrow */}
                    <div className="flex justify-center -my-2 relative z-20">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-full p-2">
                            <ArrowDownIcon />
                        </div>
                    </div>

                    {/* After Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900 border border-green-500/30 p-6 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-green-500 uppercase">Optimized</span>
                        </div>
                        <p className="text-zinc-200 text-sm leading-relaxed">
                            Spearheaded a cross-functional <span className="text-green-400 font-bold bg-green-500/10 px-1 rounded">team of 5</span>, deploying the <span className="text-green-400 font-bold bg-green-500/10 px-1 rounded">SaaS platform</span> which increased <span className="text-green-400 font-bold bg-green-500/10 px-1 rounded">user retention by 20%</span>.
                        </p>
                    </motion.div>
                </div>
            </div>

        </div>
      </section>

      {/* --- HOW IT WORKS (VISUAL FLOW) --- */}
      <section className="py-24 px-6 bg-zinc-950 border-b border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
               <div className="text-center mb-20">
                  <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
                  <p className="text-zinc-500">From upload to offer in 3 simple steps.</p>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Visual Connection Line (Desktop) */}
                  <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-zinc-800 z-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent w-1/2 animate-[shimmer_3s_infinite_linear]" style={{ backgroundSize: '200% 100%' }}></div>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center relative group">
                      <StepGraphic step={1} />
                      <h4 className="text-xl font-bold text-white mb-3">Upload & Scan</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                          Upload your PDF resume. We extract text and identify sections instantly using advanced parsing.
                      </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center relative group">
                      <StepGraphic step={2} />
                      <h4 className="text-xl font-bold text-white mb-3">Gap Analysis</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                          Our AI compares your profile against the JD to find missing keywords and formatting risks.
                      </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center relative group">
                      <StepGraphic step={3} />
                      <h4 className="text-xl font-bold text-white mb-3">Optimize & Export</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                          Inject missing keywords and rewrite bullets for maximum ATS impact. Export to PDF.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 px-6 bg-zinc-900/50 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Complete Career Arsenal</h2>
                <p className="text-zinc-500">Everything you need to bypass the robots.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900 border border-white/5 p-8 rounded-lg hover:border-orange-500/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:text-orange-500 transition-colors">
                            <f.icon className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {f.title}
                        </h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                            {f.desc}
                        </p>
                        <p className="text-xs text-zinc-600 font-mono border-t border-white/5 pt-3">
                            {f.micro}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 px-6 bg-zinc-950 border-t border-white/10 scroll-mt-20">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
              <p className="text-zinc-500 mb-12">Free analysis. Pay only when you download.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {/* Free Tier */}
                  <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-4">Analysis</span>
                      <div className="text-4xl font-black text-white mb-6">Free</div>
                      <ul className="space-y-4 text-left w-full mb-8 flex-1">
                          <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-zinc-600" /> ATS Score Calculation</li>
                          <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-zinc-600" /> Keyword Gap Analysis</li>
                          <li className="flex items-center gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-zinc-600" /> Preview rewritten bullets</li>
                      </ul>
                      <button 
                        onClick={() => onStart()} 
                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-sm transition-colors"
                      >
                        Start Analysis
                      </button>
                  </div>

                  {/* Paid Tier */}
                  <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-orange-500/30 p-8 rounded-2xl flex flex-col items-center relative shadow-2xl">
                       <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase">
                           Pay as you go
                       </div>
                      <span className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-4">Results</span>
                      <div className="text-4xl font-black text-white mb-6">$1 <span className="text-base font-normal text-zinc-500">/ download</span></div>
                      <ul className="space-y-4 text-left w-full mb-8 flex-1">
                          <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-orange-500" /> <strong>Optimized Resume PDF</strong></li>
                          <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-orange-500" /> Tailored Cover Letter PDF</li>
                          <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-orange-500" /> Interview Prep Kit Access</li>
                          <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-orange-500" /> Skill Assessment Quizzes</li>
                          <li className="flex items-center gap-3 text-xs text-zinc-500 mt-4 border-t border-white/5 pt-4"><Lock className="w-3 h-3" /> Secure payment via Dodo Payments</li>
                      </ul>
                      <button 
                        onClick={() => onStart()} 
                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded text-sm transition-colors shadow-lg shadow-orange-900/20"
                      >
                        Start Now
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- DATA SAFETY --- */}
      <section id="data-safety" className="py-24 px-6 bg-zinc-900 border-t border-white/10 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mb-6">
                            <Shield className="w-3 h-3" /> SECURITY FIRST
                       </div>
                       <h2 className="text-3xl font-bold text-white mb-6">Your data, protected.</h2>
                       <ul className="space-y-4">
                           <li className="flex items-start gap-3">
                               <Database className="w-5 h-5 text-zinc-500 mt-0.5" />
                               <span className="text-zinc-300 text-sm"><strong>Zero Data Retention.</strong> We do not store your resumes or personal data on our servers.</span>
                           </li>
                           <li className="flex items-start gap-3">
                               <Trash2 className="w-5 h-5 text-zinc-500 mt-0.5" />
                               <span className="text-zinc-300 text-sm">All processing happens in ephemeral memory and is wiped instantly after your session ends.</span>
                           </li>
                           <li className="flex items-start gap-3">
                               <XCircle className="w-5 h-5 text-zinc-500 mt-0.5" />
                               <span className="text-zinc-300 text-sm">We don’t share or sell your data.</span>
                           </li>
                           <li className="flex items-start gap-3">
                               <CreditCard className="w-5 h-5 text-zinc-500 mt-0.5" />
                               <span className="text-zinc-300 text-sm">Payments handled securely by <strong>Dodo Payments</strong>.</span>
                           </li>
                       </ul>
                       <div className="flex gap-4 mt-8">
                           <a href="#" className="text-xs text-zinc-500 underline hover:text-white">Privacy Policy</a>
                           <a href="#" className="text-xs text-zinc-500 underline hover:text-white">Terms of Service</a>
                       </div>
                  </div>
                  <div className="flex-1 w-full flex justify-center">
                      <div className="w-64 h-64 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_linear_infinite]"></div>
                           <ShieldCheck className="w-20 h-20 text-green-500 mb-4" />
                           <div className="px-4 py-1 bg-green-500/10 rounded-full text-green-500 text-xs font-bold">NO STORAGE</div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- CASE STUDIES --- */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto mb-12 text-center">
                 <h2 className="text-3xl font-bold text-white mb-2">Proven Results</h2>
                 <p className="text-zinc-500">Real outcomes from real candidates.</p>
          </div>
          
          <div className="relative w-full overflow-hidden">
               <div className="flex animate-marquee gap-6 w-max hover:[animation-play-state:paused]">
                    {[...caseStudies, ...caseStudies].map((c, i) => (
                        <div key={i} className="w-[300px] md:w-[350px] shrink-0 bg-zinc-900/50 border border-white/5 p-6 rounded-xl hover:border-zinc-700 transition-colors group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-500 text-xs shrink-0">
                                    {c.name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-white font-bold text-sm truncate">{c.name}</h4>
                                    <p className="text-zinc-500 text-xs truncate">{c.role} <ArrowRight className="w-3 h-3 inline mx-1" /> {c.target}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-6 bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                                <div className="text-center">
                                    <div className="text-xs text-zinc-500 uppercase font-bold">Before</div>
                                    <div className="text-xl font-mono text-zinc-400">{c.before}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-600" />
                                <div className="text-center">
                                    <div className="text-xs text-green-500 uppercase font-bold">After</div>
                                    <div className="text-xl font-mono text-green-400 font-bold">{c.after}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Award className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-zinc-300 font-medium">{c.outcome}</p>
                            </div>
                        </div>
                    ))}
               </div>
               {/* Gradient Masks */}
               <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
               <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
          </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 px-6 bg-zinc-950 border-t border-white/10 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
              <div className="space-y-2">
                  {faqs.map((item, i) => (
                      <FAQItem key={i} question={item.q} answer={item.a} />
                  ))}
              </div>
          </div>
      </section>
      
      {/* --- FOOTER --- */}
      <footer className="bg-gradient-to-b from-zinc-950 to-orange-900 border-t border-orange-900/30 pt-20 pb-10 px-6 w-full relative overflow-hidden">
         {/* Subtle overlay */}
         <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
         
         <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <AnimatedLogo className="mb-6" />
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                        HireSchema is built by KoK Labs.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-orange-100 font-bold mb-6 text-sm uppercase tracking-wider">Product</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li><span className="hover:text-white transition-colors cursor-pointer">Resume Scanner</span></li>
                        <li><span className="hover:text-white transition-colors cursor-pointer">Cover Letter Engine</span></li>
                        <li><span className="hover:text-white transition-colors cursor-pointer">Interview Prep</span></li>
                        <li><span className="hover:text-white transition-colors cursor-pointer">$1 Download</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-orange-100 font-bold mb-6 text-sm uppercase tracking-wider">Legal</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                    </ul>
                </div>

                 <div>
                    <h4 className="text-orange-100 font-bold mb-6 text-sm uppercase tracking-wider">Connect</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li><span className="hover:text-white transition-colors cursor-pointer">Twitter / X</span></li>
                        <li><span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span></li>
                        <li><span className="hover:text-white transition-colors cursor-pointer">GitHub</span></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-zinc-500 text-xs">© 2025 HireSchema AI. All rights reserved.</p>
                <div className="flex gap-4">
                     <span className="text-zinc-400 text-xs hover:text-white cursor-pointer flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> System Status: Operational
                     </span>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
)

export default LandingPage;
