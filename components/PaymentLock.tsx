import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, CheckCircle2, ShieldCheck, Zap, ExternalLink, KeyRound, AlertTriangle, Loader2 } from 'lucide-react';

interface PaymentLockProps {
  onPaymentVerified: () => void;
}

// Mock database of valid keys for demonstration
const VALID_KEYS = [
  'MONU-PREM-2024',
  'DODO-TEST-KEY',
  'CAREER-BOOST-99',
  'ADMIN-BYPASS'
];

const PaymentLock: React.FC<PaymentLockProps> = ({ onPaymentVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePaymentClick = () => {
    // Open payment link in new tab
    window.open('https://test.checkout.dodopayments.com/buy/pdt_fRHTeigX5Cf7UXlnCfdi8?quantity=1', '_blank');
  };

  const handleVerify = () => {
    if (licenseKey.length < 5) {
        setError("Invalid Key Format");
        return;
    }
    
    setError(null);
    setIsVerifying(true);
    
    // Simulate API verification
    setTimeout(() => {
      // Check if key exists in our "database" or starts with specific prefix
      const isValid = VALID_KEYS.includes(licenseKey) || licenseKey.startsWith('ORDER-');
      
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
            onPaymentVerified();
        }, 1000);
      } else {
        setError("License Key not found or expired.");
        setIsVerifying(false);
      }
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-zinc-950/50">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
      >
        {/* Header Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-600"></div>
        
        <div className="p-8">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-lg relative">
                        {success ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                            <Lock className="w-8 h-8 text-orange-500" />
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Premium Features Locked</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
                Unlock the Asset Generator to instantly create ATS-optimized resumes, cover letters, and interview kits using advanced AI.
            </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
                {[
                    { icon: Zap, text: "Unlimited AI Asset Generation", sub: "Resumes, Letters, Emails" },
                    { icon: ShieldCheck, text: "ATS Compliance Guarantee", sub: "Parsable formats (PDF/DOCX)" }
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
                    <span>Get Lifetime Access</span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <div className="relative pt-6 mt-2 border-t border-zinc-800/50">
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Verification</label>
                        {error && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {error}
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
                                placeholder="Paste License Key (e.g. MONU-PREM-2024)"
                                className={`w-full bg-zinc-950 border ${error ? 'border-red-900/50 focus:border-red-500' : 'border-zinc-800 focus:border-orange-500'} rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-700 font-mono`}
                            />
                        </div>
                        <button 
                            onClick={handleVerify}
                            disabled={isVerifying || success}
                            className={`px-5 py-2 rounded-xl font-bold text-xs transition-all border ${
                                success 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
                            }`}
                        >
                            {isVerifying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : success ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                'UNLOCK'
                            )}
                        </button>
                    </div>
                    <p className="mt-4 text-[10px] text-zinc-600 text-center font-mono">
                         Processed securely by Dodo Payments
                    </p>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentLock;