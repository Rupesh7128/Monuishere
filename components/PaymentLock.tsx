
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ShieldCheck, ExternalLink, KeyRound, AlertTriangle, Loader2, XCircle } from 'lucide-react';

interface PaymentLockProps {
  onPaymentVerified: () => void;
}

const PaymentLock: React.FC<PaymentLockProps> = ({ onPaymentVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // SHA-256 Hash of "HIRE-SCHEMA-2025" (Master Key for testing/support)
  const MASTER_KEY_HASH = "8f36c5391517eae39c2847926b05596409745d203916962f9247650596395a12";

  const handlePaymentClick = () => {
    window.open('https://checkout.dodopayments.com/buy/pdt_d7rp85iimkphiaGBV5fxV?quantity=1', '_blank');
  };

  const hashString = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerify = async () => {
    if (isLocked) return;

    const cleanKey = licenseKey.trim();

    // 1. Anti-Brute Force: Lock out after 5 failed attempts
    if (attempts >= 5) {
        setIsLocked(true);
        setError("Too many failed attempts. Please reload the page.");
        return;
    }

    setIsVerifying(true);
    setError(null);

    // Simulate network delay for security theatre (prevents timing attacks)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // 2. Check 1: Cryptographic Hash Check (Secure "Master Key" validation)
        const inputHash = await hashString(cleanKey);
        
        // 3. Check 2: Strict UUID/Order ID Format
        // Regex: 8-4-4-4-12 hex characters OR starts with "pdt_" (Product ID)
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanKey);
        const isDodo = /^pdt_[a-zA-Z0-9]+$/.test(cleanKey);

        if (inputHash === MASTER_KEY_HASH || isUuid || isDodo) {
            // Success
            onPaymentVerified();
        } else {
            // Failure
            setAttempts(prev => prev + 1);
            throw new Error("Invalid License Key.");
        }
    } catch (e) {
        setError("Verification failed. Invalid Key.");
    } finally {
        setIsVerifying(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-zinc-950/50 min-h-[500px]">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
      >
        {/* Header Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600"></div>
        
        <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-lg relative">
                        <Lock className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Unlock Downloads</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
                Download your optimized resume PDF for just $1. Analysis and previews are always free.
            </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
                {[
                    { icon: CheckCircle2, text: "ATS-Optimized PDF", sub: "Clean formatting" },
                    { icon: ShieldCheck, text: "One-Time Payment", sub: "No recurring subscription" }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                        <div className="p-2 rounded-lg bg-zinc-900 text-orange-500">
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-zinc-200">{item.text}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <button 
                    onClick={handlePaymentClick}
                    className="w-full group flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-sm transition-all shadow-lg shadow-white/5 hover:scale-[1.01]"
                >
                    <span>Pay $1 to Download</span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <div className="relative pt-6 mt-2 border-t border-zinc-800/50">
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Already Paid?</label>
                        {error && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1 animate-pulse">
                                {isLocked ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} {error}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex gap-2 relative">
                        <div className="relative flex-1 group">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                type="text" 
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                                placeholder="Enter Order ID"
                                disabled={isVerifying || isLocked}
                                className={`w-full bg-zinc-950 border ${error ? 'border-red-900/50 focus:border-red-500' : 'border-zinc-800 focus:border-orange-500'} rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-700 font-mono disabled:opacity-50`}
                            />
                        </div>
                        <button 
                            onClick={handleVerify}
                            disabled={isVerifying || !licenseKey || isLocked}
                            className="px-5 py-2 rounded-xl font-bold text-xs transition-all border bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'VERIFY'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentLock;
