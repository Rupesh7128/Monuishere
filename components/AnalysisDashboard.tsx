import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle, Target, FileSearch, TrendingUp, Download, ShieldAlert, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const HoverTooltip = ({ children, content }: { children?: React.ReactNode, content: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            className="relative cursor-help"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none"
                    >
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 border-r border-b border-zinc-700"></div>
                        <span className="relative z-10">{content}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const scoreData = [
    { name: 'Match Score', value: result.atsScore },
    { name: 'Gap', value: 100 - result.atsScore },
  ];

  const COLORS = ['#F97316', '#27272A'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleDownloadCSV = () => {
    const headers = ["Category", "Details"];
    const rows = [
      ["ATS Score", result.atsScore.toString()],
      ["Summary", `"${result.summary.replace(/"/g, '""')}"`],
      ["Missing Keywords", `"${result.missingKeywords.join(", ")}"`],
      ["Key Strengths", `"${result.keyStrengths.join(", ")}"`],
      ["Critical Issues", `"${result.criticalIssues.join(", ")}"`]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "monuishere_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto"
    >
      <div className="lg:col-span-4 flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
           <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
           Analysis Overview
        </h3>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all group"
        >
          <Download className="w-3 h-3 group-hover:text-orange-500 transition-colors" />
          Export Data
        </button>
      </div>

      {/* 1. Score Card - Rowspan 2 on large screens */}
      <motion.div 
        variants={item}
        className="lg:row-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
        <div className="w-full flex justify-between items-center mb-4">
          <HoverTooltip content="Calculated based on keyword density, formatting, and semantic relevance to the job description.">
             <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                ATS Score <Info className="w-3 h-3 text-zinc-600" />
             </h3>
          </HoverTooltip>
          <Target className="w-4 h-4 text-orange-500" />
        </div>
        
        <div className="w-40 h-40 relative my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                dataKey="value"
                cornerRadius={5}
                paddingAngle={2}
              >
                {scoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value}%`, '']}
                separator=""
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-white tracking-tighter">{result.atsScore}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">/ 100</span>
          </div>
        </div>

        <div className="w-full text-center mt-6 p-3 rounded-xl bg-zinc-900 border border-zinc-800/50">
          <p className={`text-sm font-bold ${result.atsScore > 75 ? 'text-green-500' : result.atsScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {result.atsScore > 75 ? 'Match Detected' : result.atsScore > 50 ? 'Optimization Needed' : 'Low Relevance'}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Based on keyword density & formatting</p>
        </div>
      </motion.div>

      {/* 2. Summary - Wide */}
      <motion.div 
        variants={item}
        className="md:col-span-2 lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-start relative group hover:border-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors" />
            <HoverTooltip content="A high-level synthesis of your professional profile against the role requirements.">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider border-b border-dashed border-zinc-700 pb-0.5">Executive Summary</h3>
            </HoverTooltip>
        </div>
        <p className="text-zinc-300 text-sm leading-7 font-light">
          {result.summary}
        </p>
      </motion.div>

      {/* 3. Missing Keywords - Mid */}
      <motion.div 
        variants={item}
        className="md:col-span-1 lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative group hover:border-red-900/50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileSearch className="w-4 h-4 text-red-500" />
          <HoverTooltip content="These specific terms were found in the job description but are absent from your resume.">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider border-b border-dashed border-zinc-700 pb-0.5">Gap Analysis (Missing Keywords)</h3>
          </HoverTooltip>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.missingKeywords.length > 0 ? (
            result.missingKeywords.map((keyword, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-red-500/5 text-red-400 border border-red-500/20 rounded-lg text-xs font-mono hover:bg-red-500/10 transition-colors cursor-default"
              >
                {keyword}
              </span>
            ))
          ) : (
            <span className="text-zinc-500 text-sm italic">Resume is well optimized.</span>
          )}
        </div>
      </motion.div>

      {/* 4. Critical Issues */}
      <motion.div 
        variants={item}
        className="md:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative group hover:border-yellow-900/50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-yellow-500" />
          <HoverTooltip content="Structural or formatting errors that may prevent ATS software from reading your resume correctly.">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider border-b border-dashed border-zinc-700 pb-0.5">Formatting Risks</h3>
          </HoverTooltip>
        </div>
        <ul className="space-y-3">
          {result.criticalIssues.length > 0 ? (
            result.criticalIssues.slice(0, 4).map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400">
                <AlertTriangle className="w-3 h-3 text-yellow-600 shrink-0 mt-0.5" />
                <span>{issue}</span>
              </li>
            ))
          ) : (
            <li className="text-zinc-500 text-xs italic">No issues detected.</li>
          )}
        </ul>
      </motion.div>

      {/* 5. Key Strengths - Full Width */}
      <motion.div 
        variants={item}
        className="md:col-span-2 lg:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Candidate Strengths</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {result.keyStrengths.map((strength, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800/50 hover:border-green-900/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-xs text-zinc-300 font-medium">{strength}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisDashboard;