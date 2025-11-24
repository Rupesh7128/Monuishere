import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Zap, FileCheck, ArrowRight, Hexagon, BarChart3, Lock, Cpu, Eye, ShieldAlert, Fingerprint, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black text-white selection:bg-orange-500/30">
      
      {/* Fixed Background Noise */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      
      {/* Floating Logo (Fixed) */}
      <div className="fixed top-6 left-6 z-50 mix-blend-difference pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="border border-white/20 p-1.5 rounded-lg bg-black/20 backdrop-blur-sm">
                <Hexagon className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <span className="text-xl tracking-tight text-white flex items-baseline drop-shadow-lg">
              <span className="font-black">MONU</span>
              <span className="text-sm font-serif italic text-orange-500 mx-1 font-light">is</span>
              <span className="font-black">HERE</span>
            </span>
         </div>
      </div>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative h-screen min-h-[600px] snap-start flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600/20 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] opacity-40"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center flex flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">
              System Online
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 leading-[0.9]">
            CAREER<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-600">ARCHITECT</span>
          </h1>

          <p className="max-w-xl text-lg text-zinc-400 mb-10 leading-relaxed font-light">
            Deconstruct the hiring algorithm. <br />
            We reverse-engineer Job Descriptions to build the perfect applicant profile.
          </p>

          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase transition-all hover:scale-105 hover:bg-orange-500 hover:text-white"
          >
            Launch Interface
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-orange-500/50 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="absolute bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 text-zinc-600"
        >
            <ChevronDown className="w-6 h-6" />
        </motion.div>

        {/* NEWS TICKER - Breaking News Style */}
        <div className="absolute bottom-0 w-full bg-zinc-950 border-t border-orange-900/30 backdrop-blur-md py-3 z-20">
            <div className="flex animate-marquee whitespace-nowrap">
            {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="flex items-center gap-8 mx-8 text-xs md:text-sm font-mono tracking-widest font-bold uppercase text-zinc-400">
                    <span className="text-orange-500">BREAKING:</span>
                    <span className="text-white">KEYWORD GAP ANALYSIS</span>
                    <span>///</span>
                    <span className="text-white">AI COVER LETTERS</span>
                    <span>///</span>
                    <span className="text-white">INTERVIEW PREP</span>
                    <span>///</span>
                    <span className="text-white">ATS SCORE OPTIMIZATION</span>
                    <span>///</span>
                </div>
            ))}
            </div>
        </div>
      </section>

      {/* --- SECTION 2: THE PROBLEM --- */}
      <section className="relative h-screen min-h-[600px] snap-start bg-zinc-950 flex items-center justify-center p-6 border-t border-zinc-900">
         <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
             >
                 <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6">
                     <ShieldAlert className="w-6 h-6 text-red-500" />
                 </div>
                 <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                     The <span className="text-red-500">Black Hole</span>.
                 </h2>
                 <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                     75% of resumes are rejected by ATS algorithms before a human ever sees them. Your skills aren't the problem—your formatting and keywords are.
                 </p>
                 <div className="flex items-center gap-4 text-sm font-mono text-red-400">
                     <span>01. PARSING ERRORS</span>
                     <span>02. MISSING KEYWORDS</span>
                 </div>
             </motion.div>
             
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden"
             >
                 <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#ef4444_100%)] opacity-20 animate-spin duration-[10s]"></div>
                 <div className="text-center z-10">
                     <div className="text-6xl font-bold text-white mb-2">75%</div>
                     <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Rejection Rate</div>
                 </div>
             </motion.div>
         </div>
      </section>

      {/* --- SECTION 3: THE SOLUTION --- */}
      <section className="relative h-screen min-h-[600px] snap-start bg-zinc-900 flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-6xl w-full text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-orange-500/10 text-orange-500">
                    <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8">
                    See What <br/><span className="text-orange-500">AI Sees</span>
                </h2>
                <p className="max-w-2xl mx-auto text-xl text-zinc-400 font-light mb-12">
                    MonuisHere uses Gemini 2.0 Flash to mimic enterprise ATS logic. We scan your resume against the job description to reveal exactly why you're not getting called back.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
                {['Semantic Matching', 'Entity Extraction', 'Sentiment Analysis', 'Format Validation'].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-black/50 border border-zinc-800 text-xs font-mono text-zinc-300 uppercase tracking-wide">
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
      </section>

      {/* --- SECTION 4: FEATURES --- */}
      <section className="relative h-screen min-h-[600px] snap-start bg-black flex items-center justify-center p-6">
         <div className="max-w-7xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<Target className="text-orange-500" />}
                    title="Diagnostic Scan"
                    desc="Upload your PDF. Our engine extracts structural data and compares it against the target JD in real-time."
                    delay={0}
                />
                <FeatureCard 
                    icon={<Fingerprint className="text-orange-500" />}
                    title="Identity Optimization"
                    desc="We identify missing keywords and skills. Then, we rewrite your content to match the employer's language perfectly."
                    delay={0.2}
                />
                <FeatureCard 
                    icon={<Cpu className="text-orange-500" />}
                    title="Asset Generation"
                    desc="Instantly generate tailored resumes, persuasive cover letters, and interview Q&A kits based on the analysis."
                    delay={0.4}
                />
            </div>
         </div>
      </section>

      {/* --- SECTION 5: STATS/TRUST --- */}
      <section className="relative h-screen min-h-[600px] snap-start bg-zinc-950 flex items-center justify-center p-6 border-t border-zinc-900">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-12">
                  <StatItem value="300%" label="Increase in Interview Callbacks" />
                  <StatItem value="15s" label="Average Analysis Time" />
                  <StatItem value="10k+" label="Resumes Optimized" />
              </div>
              <div className="flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-6">Proven Results.</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8">
                      "I applied to 50 jobs with no response. After using MonuisHere to tailor my resume for a specific role at a FAANG company, I got an interview the next day."
                  </p>
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
                      <div>
                          <p className="font-bold text-white">Alex Chen</p>
                          <p className="text-xs text-zinc-500 font-mono">Senior Software Engineer</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- SECTION 6: CTA --- */}
      <section className="relative h-screen min-h-[600px] snap-start bg-orange-600 flex items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center"
          >
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8">
                  READY TO <br/> DOMINATE?
              </h2>
              <button 
                onClick={onStart}
                className="bg-black text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-2xl"
              >
                  GET STARTED NOW <ArrowRight />
              </button>
              <p className="mt-6 text-orange-200 font-mono text-sm uppercase tracking-widest opacity-80">
                  No account required for initial scan
              </p>
          </motion.div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="p-10 rounded-[2rem] border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors group h-full flex flex-col"
  >
    <div className="w-14 h-14 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{desc}</p>
  </motion.div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-l-4 border-orange-500 pl-6"
    >
        <div className="text-5xl md:text-6xl font-black text-white mb-1">{value}</div>
        <div className="text-zinc-500 font-mono uppercase tracking-widest text-sm">{label}</div>
    </motion.div>
)

export default LandingPage;