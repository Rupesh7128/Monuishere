
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle, Target, FileSearch, TrendingUp, Download, ShieldAlert, Info, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const HoverTooltip = ({ children, content }: { children?: React.ReactNode, content: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            className="relative inline-flex items-center justify-center cursor-help"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)}
        >
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full mb-2 w-56 bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-zinc-200 text-xs leading-relaxed p-4 rounded-xl shadow-2xl z-50 pointer-events-none left-1/2 -translate-x-1/2"
                    >
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-r border-b border-white/10"></div>
                        <span className="relative z-10">{content}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/80 border border-white/10 p-4 rounded-xl shadow-2xl max-w-[200px] backdrop-blur-md z-50">
        <p className="text-xs font-mono text-zinc-500 uppercase font-bold mb-1">{payload[0].name}</p>
        <p className={`text-xl font-bold ${payload[0].name === 'Match Score' ? 'text-orange-500' : 'text-zinc-500'}`}>
            {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const scoreData = [
    { name: 'Match Score', value: result.atsScore },
    { name: 'Gap', value: 100 - result.atsScore },
  ];
  const COLORS = ['#F97316', '#27272A'];

  const handleDownloadCSV = () => {
    const headers = ["Category", "Details"];
    const rows = [
      ["ATS Score", result.atsScore.toString()],
      ["Summary", `"${result.summary.replace(/"/g, '""')}"`],
      ["Missing Keywords", `"${result.missingKeywords.join(", ")}"`],
      ["Key Strengths", `"${result.keyStrengths.join(", ")}"`],
      ["Critical Issues", `"${result.criticalIssues.join(", ")}"`]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analysis_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isHighQuality = result.atsScore > 85;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto pb-8">
      <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-between items-center mb-4">
        <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                Diagnostic Report: <span className="text-orange-500 uppercase">{result.contactProfile.name || "Candidate"}</span>
            </h3>
            <p className="text-xs text-zinc-500 ml-3 mt-1">Diagnostic Engine v2.5 Output</p>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all group backdrop-blur-sm"
        >
          <Download className="w-3 h-3 group-hover:text-orange-500 transition-colors" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Score Card */}
      <div className="col-span-1 lg:row-span-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden shadow-xl min-h-[280px]">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">ATS Score</h3>
              <HoverTooltip content="0-100 score based on keyword matching and semantic relevance to the Job Description.">
                  <Info className="w-3.5 h-3.5 text-zinc-600 hover:text-orange-500 transition-colors" />
              </HoverTooltip>
          </div>
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
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-white tracking-tighter">{result.atsScore}</span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">/ 100</span>
          </div>
        </div>
        <div className="w-full text-center mt-4 p-2 rounded-xl bg-zinc-950/30 border border-white/5">
          <p className={`text-sm font-bold ${result.atsScore > 85 ? 'text-green-500' : result.atsScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {result.atsScore > 85 ? 'High Compatibility' : result.atsScore > 60 ? 'Moderate Potential' : 'Low Match'}
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Executive Summary</h3>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed font-light">
          {result.summary}
        </p>
      </div>

      {/* Missing Keywords */}
      <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <FileSearch className="w-4 h-4 text-red-500" />
           <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Gap Analysis</h3>
                <HoverTooltip content="High-value keywords found in the Job Description but missing from your resume.">
                    <Info className="w-3.5 h-3.5 text-zinc-600 hover:text-red-500 transition-colors" />
                </HoverTooltip>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.missingKeywords.length > 0 ? (
            result.missingKeywords.map((keyword, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-red-500/5 text-red-400 border border-red-500/20 rounded-md text-xs">
                {keyword}
              </span>
            ))
          ) : (
            <span className="text-green-500 text-sm italic flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> No major keywords missing. Great job!
            </span>
          )}
        </div>
      </div>

      {/* Critical Issues - Honest Reporting */}
      <div className="col-span-1 md:col-span-1 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className={`w-4 h-4 ${isHighQuality ? 'text-green-500' : 'text-yellow-500'}`} />
           <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                    {isHighQuality ? 'Health Check' : 'Risks'}
                </h3>
           </div>
        </div>
        <ul className="space-y-2.5">
          {result.criticalIssues.length > 0 ? (
            result.criticalIssues.slice(0, 3).map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                <AlertTriangle className="w-3 h-3 text-yellow-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{issue}</span>
              </li>
            ))
          ) : (
            <li className="text-green-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> No critical errors found.
            </li>
          )}
        </ul>
      </div>

      {/* Strengths */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
           <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Core Strengths</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {result.keyStrengths.map((strength, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/30 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
              <span className="text-xs text-zinc-300 font-medium truncate">{strength}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;