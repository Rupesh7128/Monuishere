
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FileData, AnalysisResult, GeneratorType, ContactProfile } from '../types';
import { generateContent, calculateImprovedScore, refineContent } from '../services/geminiService';
import { MessageSquare, FileText, Mail, FileDown, FileOutput, X, Loader2, Minimize2, Maximize2, UserCircle, Camera, Wand2, Moon, Sun, Send, Youtube, GraduationCap, TrendingUp, Download, Link, Check, Linkedin, Copy, Lock, Edit2, CheckCircle2 } from 'lucide-react';
import PaymentLock from './PaymentLock';

interface ContentGeneratorProps {
  resumeFile: FileData;
  jobDescription: string;
  analysis: AnalysisResult;
}

const ACCENT_COLORS = [
    { name: 'Executive Orange', value: '#F97316' },
    { name: 'Deep Blue', value: '#2563EB' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Slate', value: '#475569' },
];

const LANGUAGES = [
    "English", "Spanish", "French", "German", "Hindi", "Mandarin", "Portuguese", "Arabic"
];

// --- CHAT SIDEBAR ---
const ChatSidebar = ({ 
    show, onClose, onRefine, onQuickAction, chatInput, setChatInput, isRefining, isLightMode 
}: any) => {
    if (!show) return null;
    return (
        <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`border-l flex flex-col absolute md:relative right-0 top-0 bottom-0 z-40 w-full md:w-[300px] h-full shadow-2xl ${isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}
        >
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-zinc-700' : 'text-zinc-400'}`}>AI Editor</span>
                <button onClick={onClose}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button onClick={() => onQuickAction('shorten')} disabled={isRefining} className="p-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 flex flex-col items-center gap-1">
                        <Minimize2 className="w-4 h-4" /> Shorten
                    </button>
                    <button onClick={() => onQuickAction('expand')} disabled={isRefining} className="p-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 flex flex-col items-center gap-1">
                        <Maximize2 className="w-4 h-4" /> Expand
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-zinc-800/50">
                <div className="relative">
                    <textarea 
                        value={chatInput}
                        onChange={(e: any) => setChatInput(e.target.value)}
                        placeholder="E.g. 'Make the summary more punchy'..."
                        className={`w-full rounded-lg text-sm p-3 pr-10 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-orange-500 ${isLightMode ? 'bg-white border border-zinc-300 text-black' : 'bg-zinc-950 border border-zinc-800 text-white'}`}
                        onKeyDown={(e: any) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onRefine(); }}}
                    />
                    <button 
                        onClick={onRefine}
                        disabled={isRefining || !chatInput.trim()}
                        className="absolute bottom-3 right-3 p-1.5 bg-orange-600 rounded-md text-white hover:bg-orange-500 disabled:opacity-50"
                    >
                        {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ resumeFile, jobDescription, analysis }) => {
  const [activeTab, setActiveTab] = useState<GeneratorType>(GeneratorType.ATS_RESUME);
  const [generatedData, setGeneratedData] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const [isLightMode, setIsLightMode] = useState(false);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Profile Verification
  const [isProfileVerified, setIsProfileVerified] = useState(false);
  const [profileData, setProfileData] = useState<ContactProfile>(analysis.contactProfile);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [editingVerified, setEditingVerified] = useState(false);

  // Settings
  const [tailorExperience, setTailorExperience] = useState(false);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  
  // Email/LinkedIn Settings
  const [emailChannel, setEmailChannel] = useState<'Email' | 'LinkedIn'>('Email');
  const [emailScenario, setEmailScenario] = useState('Follow-up');

  // Chat / Refinement
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Sharing
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Payment
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentLock, setShowPaymentLock] = useState(false);
  
  // Manual Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // EAGER LOADING
  useEffect(() => {
    if (isProfileVerified) {
        generateAllContent();
    }
  }, [isProfileVerified, selectedLanguage]);

  const generateAllContent = async () => {
    await handleGenerate(GeneratorType.ATS_RESUME, true);
    
    const queue = [
        { type: GeneratorType.COVER_LETTER, delay: 3000 },
        { type: GeneratorType.INTERVIEW_PREP, delay: 6000 },
        { type: GeneratorType.LEARNING_PATH, delay: 9000 },
        { type: GeneratorType.EMAIL_TEMPLATE, delay: 12000 },
        { type: GeneratorType.MARKET_INSIGHTS, delay: 15000 }
    ];

    queue.forEach(item => {
        setTimeout(() => {
             if (!generatedData[item.type]) handleGenerate(item.type, true);
        }, item.delay);
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (type: GeneratorType, forceRefresh = false) => {
    if (generatedData[type] && !forceRefresh) return;

    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setError(null);

    try {
        const content = await generateContent(
            type, 
            resumeFile, 
            jobDescription, 
            analysis,
            { 
                verifiedProfile: profileData,
                tailorExperience: tailorExperience && type === GeneratorType.ATS_RESUME,
                language: selectedLanguage,
                emailChannel: emailChannel,
                emailScenario: emailScenario
            }
        );
        setGeneratedData(prev => ({ ...prev, [type]: content }));

        if (type === GeneratorType.ATS_RESUME) {
            calculateImprovedScore(content, jobDescription).then(score => setOptimizedScore(score));
        }
    } catch (err: any) {
        if (activeTab === type) setError(err.message || "Generation failed.");
    } finally {
        setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleRefine = async () => {
      if (!chatInput.trim() || !generatedData[activeTab]) return;
      setIsRefining(true);
      try {
          const newContent = await refineContent(
              generatedData[activeTab], 
              chatInput, 
              activeTab === GeneratorType.ATS_RESUME ? jobDescription : "Professional Context"
          );
          setGeneratedData(prev => ({ ...prev, [activeTab]: newContent }));
          setChatInput("");
      } catch (e) {
          setError("Failed to refine content.");
      } finally {
          setIsRefining(false);
      }
  };

  const handleQuickAction = async (action: 'shorten' | 'expand') => {
      const prompt = action === 'shorten' 
        ? "Shorten this content by 20% while keeping key metrics." 
        : "Expand on the key points with more professional detail.";
      setChatInput(prompt);
      setIsRefining(true);
      try {
          const newContent = await refineContent(
              generatedData[activeTab], 
              prompt, 
              activeTab === GeneratorType.ATS_RESUME ? jobDescription : "Context"
          );
          setGeneratedData(prev => ({ ...prev, [activeTab]: newContent }));
          setChatInput("");
      } finally {
          setIsRefining(false);
      }
  };
  
  const handleCopyText = () => {
      const content = generatedData[activeTab];
      if (content) {
          navigator.clipboard.writeText(content);
          setShowCopyToast(true);
          setTimeout(() => setShowCopyToast(false), 3000);
      }
  };

  const handleDownloadClick = () => {
      if (isPaid) {
          handleDownloadPDF();
      } else {
          setShowPaymentLock(true);
      }
  }

  const handleDownloadPDF = async () => {
    const content = generatedData[activeTab];
    if (!content) return;

    setIsDownloading('pdf');
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        const container = document.createElement('div');
        // STRICT HARVARD STYLE
        container.style.width = '8.5in'; 
        container.style.padding = '0.5in 0.75in';
        container.style.color = '#000000'; 
        container.style.background = '#ffffff'; 
        container.style.fontFamily = '"Times New Roman", Times, serif';
        container.style.fontSize = '10pt';
        container.style.lineHeight = '1.25';
        
        let htmlContent = content
            // H1 Name
            .replace(/^# (.*$)/gim, `<div style="text-align: center; margin-bottom: 5px;"><h1 style="font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; padding: 0;">$1</h1></div>`)
            // H2 Section Headers
            .replace(/^## (.*$)/gim, `<h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-top: 15px; margin-bottom: 6px; padding-bottom: 2px;">$1</h2>`)
            // H3 Role/Company
            .replace(/^### (.*$)/gim, `<h3 style="font-size: 10.5pt; font-weight: bold; margin-top: 8px; margin-bottom: 2px;">$1</h3>`)
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Bullets
            .replace(/^\s*-\s(.*$)/gim, `<li style="margin-bottom: 2px; margin-left: 20px;">$1</li>`)
            // Convert LinkedIn links in text to anchors
            .replace(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/gi, '<a href="https://$1" style="color: black; text-decoration: none;">$1</a>')
            // Newlines
            .replace(/\n\n/gim, '<br/>');

        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        const opt = {
            margin: 0, 
            filename: `Optimized_${activeTab.replace(/\s/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // @ts-ignore
        await window.html2pdf().set(opt).from(container).save();
        document.body.removeChild(container);
    } catch (e) {
        setError("PDF Download Failed.");
    } finally {
        setIsDownloading(null);
    }
  };
  
  const handleDownloadTXT = () => {
      const content = generatedData[activeTab];
      if (!content) return;
      const element = document.createElement("a");
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Optimized_${activeTab.replace(/\s/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  const tabs = [
    { id: GeneratorType.ATS_RESUME, icon: FileOutput, label: 'Full ATS Resume' },
    { id: GeneratorType.LEARNING_PATH, icon: GraduationCap, label: 'Skill Gap & Learning' },
    { id: GeneratorType.COVER_LETTER, icon: FileText, label: 'Cover Letter' },
    { id: GeneratorType.INTERVIEW_PREP, icon: MessageSquare, label: 'Interview' },
    { id: GeneratorType.EMAIL_TEMPLATE, icon: Mail, label: 'Outreach' },
    { id: GeneratorType.MARKET_INSIGHTS, icon: TrendingUp, label: 'Market Insights' },
  ];

  const handleYoutubeSearch = (query: string) => {
    const cleanQuery = query.replace(/['"]+/g, '').replace('Youtube:', '').trim();
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`, '_blank');
  };

  const renderContent = () => {
    const isResume = activeTab === GeneratorType.ATS_RESUME;
    const h1Color = isLightMode ? 'text-zinc-900' : 'text-white';
    const textColor = isLightMode ? 'text-zinc-800' : 'text-zinc-300';
    const borderColor = isLightMode ? 'border-zinc-200' : 'border-zinc-800';

    if (activeTab === GeneratorType.MARKET_INSIGHTS) {
        let json;
        try {
            json = JSON.parse(generatedData[activeTab]);
        } catch (e) {
            // Fallback to text if parsing fails
        }

        if (json) {
            const cardBg = isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-white/10';
            const cardTitle = 'text-zinc-500 text-xs font-bold uppercase mb-2';
            const cardValue = isLightMode ? 'text-zinc-900' : 'text-white';
            const cardText = isLightMode ? 'text-zinc-700' : 'text-zinc-300';
            
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`${cardBg} p-6 rounded-xl border`}>
                            <h3 className={cardTitle}>Verdict</h3>
                            <p className={`${cardValue} text-lg font-bold`}>{json.verdict || "N/A"}</p>
                        </div>
                        <div className={`${cardBg} p-6 rounded-xl border`}>
                            <h3 className={cardTitle}>Salary Range</h3>
                            <p className="text-green-500 text-lg font-bold">{json.salary_range || "N/A"}</p>
                        </div>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl border`}>
                        <h3 className={cardTitle}>Culture & WFH</h3>
                        <p className={`${cardText} text-sm leading-relaxed`}>{json.culture_wfh}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className={`${cardBg} p-6 rounded-xl border`}>
                            <h3 className={cardTitle}>Pros</h3>
                            <ul className="space-y-2">
                                {json.pros?.map((p: string, i: number) => <li key={i} className={`text-xs flex items-start gap-2 ${cardText}`}><Check className="w-3 h-3 text-green-500 mt-0.5" /> {p}</li>)}
                            </ul>
                        </div>
                        <div className={`${cardBg} p-6 rounded-xl border`}>
                            <h3 className={cardTitle}>Cons</h3>
                            <ul className="space-y-2">
                                {json.cons?.map((p: string, i: number) => <li key={i} className={`text-xs flex items-start gap-2 ${cardText}`}><X className="w-3 h-3 text-red-500 mt-0.5" /> {p}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (isEditing) {
        return (
            <textarea
                value={generatedData[activeTab]}
                onChange={(e) => setGeneratedData(prev => ({ ...prev, [activeTab]: e.target.value }))}
                className={`w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none ${isLightMode ? 'bg-white text-zinc-900 border border-zinc-200 rounded' : 'bg-zinc-950 text-zinc-300'}`}
            />
        );
    }

    const content = (
        <ReactMarkdown
            components={{
                h1: ({node, ...props}) => (
                    <h1 className={`text-2xl sm:text-4xl font-bold mb-2 text-center uppercase tracking-wide border-b ${borderColor} pb-4 ${h1Color}`} {...props} />
                ),
                h2: ({node, ...props}) => (
                    <h2 
                        className={`text-lg sm:text-xl font-bold mt-8 mb-4 uppercase tracking-widest border-b ${borderColor} pb-2 flex items-center gap-2`} 
                        style={{ color: accentColor.value }}
                        {...props} 
                    />
                ),
                h3: ({node, ...props}) => <h3 className={`text-base sm:text-lg font-bold mt-6 mb-2 ${isLightMode ? 'text-zinc-800' : 'text-zinc-100'}`} {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 my-4 pl-0" {...props} />,
                li: ({node, ...props}) => (
                    <li className={`flex items-start gap-3 text-sm sm:text-base leading-relaxed group ${textColor}`}>
                        <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-all" style={{ backgroundColor: accentColor.value }} />
                        <span className="flex-1">{props.children}</span>
                    </li>
                ),
                p: ({node, ...props}) => {
                    const text = String(props.children);
                    if (text.includes("Youtube:")) {
                        return (
                            <button 
                                onClick={() => handleYoutubeSearch(text)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full my-2 transition-all shadow-md hover:shadow-lg"
                            >
                                <Youtube className="w-3.5 h-3.5" /> Watch Tutorial
                            </button>
                        );
                    }
                    return <p className={`mb-4 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed ${textColor}`} {...props} />;
                },
                a: ({node, ...props}) => (
                    <a className="text-orange-500 hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                strong: ({node, ...props}) => <strong className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`} {...props} />,
                blockquote: ({node, ...props}) => (
                     <blockquote className={`border-l-4 border-orange-500 pl-4 my-4 italic ${isLightMode ? 'bg-zinc-50 text-zinc-700' : 'bg-zinc-900/50 text-zinc-400'} p-3 rounded-r-lg`} {...props} />
                )
            }}
        >
            {generatedData[activeTab]}
        </ReactMarkdown>
    );

    if (isResume && profilePhoto) {
        return (
            <div>
                <div className="flex justify-center mb-6">
                    <div className="p-1 rounded-full shadow-lg" style={{ backgroundColor: accentColor.value }}>
                        <img src={profilePhoto} alt="Profile" className={`w-24 h-24 rounded-full object-cover border-4 ${isLightMode ? 'border-white' : 'border-zinc-900'}`} />
                    </div>
                </div>
                {content}
            </div>
        );
    }
    return content;
  };

  if (!isProfileVerified) {
     const fields = [
         { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your Name' },
         { key: 'email', label: 'Email', type: 'email', placeholder: 'email@address.com' },
         { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 234 567 890' },
         { key: 'linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'linkedin.com/in/you' },
     ];

     return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-purple-500"></div>
                <div className="flex justify-center mb-4">
                     <div className="bg-zinc-800 p-3 rounded-full">
                        <UserCircle className="w-8 h-8 text-orange-500" />
                     </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    Verify Your Profile
                </h2>
                <p className="text-zinc-500 text-sm text-center mb-8">
                    Review extracted details and fill in missing information.
                </p>
                
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => setShowPhotoUpload(true)}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors duration-500 bg-zinc-950`} style={{ borderColor: accentColor.value }}>
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                            )}
                        </div>
                        <p className="mt-2 text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-2 rounded">(Optional)</p>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>
                
                <div className="space-y-4 mb-8">
                     {/* Missing Fields - Always Input */}
                     {fields.filter(f => !analysis.contactProfile[f.key as keyof ContactProfile]).map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">{field.label}</label>
                            <input 
                                type={field.type} 
                                placeholder={field.placeholder} 
                                value={(profileData as any)[field.key]} 
                                onChange={e => setProfileData({...profileData, [field.key]: e.target.value})} 
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                     ))}

                     {/* Found Fields - Read Only unless editing */}
                     {fields.filter(f => !!analysis.contactProfile[f.key as keyof ContactProfile]).length > 0 && (
                        <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-green-500 uppercase flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Information
                                </span>
                                <button 
                                    onClick={() => setEditingVerified(!editingVerified)}
                                    className="text-[10px] text-zinc-500 hover:text-white underline flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    {editingVerified ? 'Done' : 'Edit'}
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {fields.filter(f => !!analysis.contactProfile[f.key as keyof ContactProfile]).map(field => (
                                    <div key={field.key}>
                                        {editingVerified ? (
                                            <div>
                                                 <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">{field.label}</label>
                                                 <input 
                                                    type={field.type} 
                                                    value={(profileData as any)[field.key]} 
                                                    onChange={e => setProfileData({...profileData, [field.key]: e.target.value})} 
                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-500 text-xs uppercase w-24 shrink-0">{field.label}</span>
                                                <span className="text-zinc-200 font-medium truncate text-right flex-1">{(profileData as any)[field.key]}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}
                </div>

                <button onClick={() => setIsProfileVerified(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-lg text-sm tracking-wide">
                    Confirm & Unlock Editor
                </button>
            </motion.div>
        </div>
     );
  }

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-500 ${isLightMode ? 'bg-zinc-100' : 'bg-zinc-950'}`}>
        
        {/* PAYMENT LOCK MODAL */}
        <AnimatePresence>
            {showPaymentLock && (
                <div className="absolute inset-0 z-50">
                    <PaymentLock onPaymentVerified={() => { setIsPaid(true); setShowPaymentLock(false); }} />
                    <button 
                        onClick={() => setShowPaymentLock(false)}
                        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            )}
        </AnimatePresence>

        {/* Toast for Copy */}
        <AnimatePresence>
            {showCopyToast && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg"
                >
                    <Check className="w-3.5 h-3.5" /> Copied to Clipboard
                </motion.div>
            )}
        </AnimatePresence>

      <div className={`flex flex-col border-b shrink-0 ${isLightMode ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-zinc-800'}`}>
        {/* Tabs - Scrollable on mobile */}
        <div className="px-2 sm:px-4 pt-4 overflow-x-auto scrollbar-hide w-full">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-medium rounded-t-lg transition-all border-t border-x flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? isLightMode 
                        ? 'text-zinc-900 bg-white border-zinc-200 border-b-white'
                        : 'text-white bg-zinc-950 border-zinc-800 border-b-zinc-950'
                    : 'text-zinc-500 border-transparent hover:bg-zinc-800/50'
                }`}
              >
                  {loadingStates[tab.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />}
                  {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar - Scrollable on Mobile */}
        <div className={`px-2 sm:px-4 py-2 flex items-center gap-3 border-t overflow-x-auto scrollbar-hide w-full ${isLightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <div className="flex items-center gap-2 sm:gap-4 min-w-max">
                 {activeTab === GeneratorType.ATS_RESUME && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setTailorExperience(!tailorExperience)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border transition-all ${tailorExperience ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'border-zinc-700 text-zinc-500'}`}
                        >
                            <Wand2 className="w-3 h-3" /> <span className="hidden sm:inline">Update Past Experience</span><span className="sm:hidden">Update Exp</span>
                        </button>
                        
                        <div className="h-4 w-[1px] bg-zinc-700 mx-1 sm:mx-2"></div>
                        
                        {ACCENT_COLORS.map(color => (
                            <button
                                key={color.name}
                                onClick={() => setAccentColor(color)}
                                className={`w-3 h-3 rounded-full border ${accentColor.name === color.name ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                style={{ backgroundColor: color.value }}
                            />
                        ))}
                    </div>
                )}
                
                {activeTab === GeneratorType.EMAIL_TEMPLATE && (
                    <div className="flex items-center gap-2">
                        <select
                            value={emailChannel}
                            onChange={(e) => setEmailChannel(e.target.value as any)}
                            className={`text-[10px] border rounded p-1 ${isLightMode ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-zinc-800 border-zinc-700 text-white'}`}
                        >
                            <option value="Email">Email</option>
                            <option value="LinkedIn">LinkedIn</option>
                        </select>
                        
                        {emailChannel === 'Email' && (
                             <select
                                value={emailScenario}
                                onChange={(e) => setEmailScenario(e.target.value)}
                                className={`text-[10px] border rounded p-1 ${isLightMode ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-zinc-800 border-zinc-700 text-white'}`}
                            >
                                <option value="Follow-up">Follow-up</option>
                                <option value="Networking">Networking</option>
                                <option value="Accept Offer">Accept Offer</option>
                                <option value="Decline Offer">Decline</option>
                            </select>
                        )}
                        <button onClick={() => handleGenerate(activeTab, true)} className="text-[10px] text-orange-500 underline">Generate</button>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2 ml-auto min-w-max">
                <select 
                    value={selectedLanguage}
                    onChange={(e) => { setSelectedLanguage(e.target.value); handleGenerate(activeTab, true); }}
                    className={`text-[10px] border rounded p-1 ${isLightMode ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-zinc-800 text-white border-zinc-700'}`}
                >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>

                <div className="h-4 w-[1px] bg-zinc-700 mx-1 sm:mx-2"></div>
                
                 {/* Toggle Edit Mode */}
                 <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] sm:text-xs font-medium border transition-colors ${isEditing ? 'bg-orange-500 text-white border-orange-600' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                >
                    {isEditing ? 'Done Editing' : 'Manual Edit'}
                </button>

                <button
                    onClick={() => setIsLightMode(!isLightMode)}
                    className={`p-1.5 rounded transition-colors ${isLightMode ? 'bg-zinc-200 hover:bg-zinc-300' : 'hover:bg-zinc-800'}`}
                >
                    {isLightMode ? <Moon className="w-3.5 h-3.5 text-zinc-600" /> : <Sun className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
                
                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] sm:text-xs font-medium border transition-colors ${showChat ? 'bg-orange-500 text-white border-orange-600' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                >
                    <MessageSquare className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refine</span>
                </button>

                <div className="flex gap-1">
                    <button
                        onClick={handleCopyText}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-colors border ${isLightMode ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'}`}
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* DOWNLOAD BUTTONS WITH PAYMENT LOCK */}
                    <button
                        onClick={handleDownloadClick}
                        disabled={!!isDownloading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-black text-[10px] sm:text-xs font-bold rounded transition-colors disabled:opacity-50 relative"
                    >
                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isPaid ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-orange-600" />)}
                        PDF
                    </button>
                    <button
                        onClick={handleDownloadTXT}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-colors border ${isLightMode ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'}`}
                    >
                        TXT
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 md:px-12 max-w-5xl mx-auto w-full relative transition-colors duration-300 ${isLightMode ? 'bg-white' : 'bg-zinc-950'}`}>
             {loadingStates[activeTab] && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-[1px] ${isLightMode ? 'bg-white/80' : 'bg-zinc-950/80'}`}>
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                  <p className="font-mono text-xs text-zinc-500">Generating...</p>
                </div>
             )}

             <AnimatePresence mode="wait">
                 <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pb-20 min-h-[500px]"
                 >
                    {generatedData[activeTab] ? renderContent() : !loadingStates[activeTab] && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <p className="text-zinc-500 font-mono text-sm">Ready to generate.</p>
                            <button onClick={() => handleGenerate(activeTab, true)} className="mt-2 text-xs text-orange-500 hover:underline">Start</button>
                        </div>
                    )}
                 </motion.div>
             </AnimatePresence>
          </div>

          <AnimatePresence>
            {showChat && (
                <ChatSidebar 
                    show={showChat}
                    onClose={() => setShowChat(false)}
                    onRefine={handleRefine}
                    onQuickAction={handleQuickAction}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    isRefining={isRefining}
                    isLightMode={isLightMode}
                />
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentGenerator;
