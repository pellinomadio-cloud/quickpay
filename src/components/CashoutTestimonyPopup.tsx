import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CheckCircle2, X, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatNaira } from '../data/storage';

interface CashoutTestimony {
  id: string;
  name: string;
  location: string;
  amount: number;
  timeAgo: string;
  avatarBg: string;
}

const TESTIMONIALS: Omit<CashoutTestimony, 'id' | 'timeAgo'>[] = [
  { name: 'Emeka Eze', location: 'Ikeja, Lagos', amount: 85000, avatarBg: 'from-emerald-600 to-teal-700' },
  { name: 'Chioma Okonkwo', location: 'Enugu', amount: 120000, avatarBg: 'from-amber-600 to-yellow-600' },
  { name: 'Babatunde Adeleke', location: 'Ibadan, Oyo', amount: 65000, avatarBg: 'from-blue-600 to-indigo-700' },
  { name: 'Fatima Mohammed', location: 'Garki, Abuja', amount: 150000, avatarBg: 'from-purple-600 to-violet-800' },
  { name: 'Osas Ighodaro', location: 'Benin City, Edo', amount: 95000, avatarBg: 'from-emerald-700 to-green-800' },
  { name: 'Blessing Sunday', location: 'Port Harcourt', amount: 110000, avatarBg: 'from-rose-600 to-pink-700' },
  { name: 'Musa Abdullahi', location: 'Kano Central', amount: 175000, avatarBg: 'from-cyan-600 to-blue-700' },
  { name: 'Ngozi Chukwu', location: 'Asaba, Delta', amount: 78000, avatarBg: 'from-amber-700 to-orange-700' },
  { name: 'Kunle Bakare', location: 'Surulere, Lagos', amount: 135000, avatarBg: 'from-teal-600 to-emerald-700' },
  { name: 'Zainab Bello', location: 'Kaduna', amount: 90000, avatarBg: 'from-violet-600 to-purple-700' },
  { name: 'Chukwudi Nwachukwu', location: 'Owerri, Imo', amount: 210000, avatarBg: 'from-emerald-600 to-teal-800' },
  { name: 'Amina Danjuma', location: 'Maitama, Abuja', amount: 165000, avatarBg: 'from-indigo-600 to-blue-800' },
];

export const CashoutTestimonyPopup: React.FC = () => {
  const [currentTestimony, setCurrentTestimony] = useState<CashoutTestimony | null>(null);
  const [visible, setVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentIndexRef = useRef(0);
  const timerRef = useRef<any>(null);

  // Track user interaction to unlock audio
  useEffect(() => {
    const handleUserGesture = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
    window.addEventListener('click', handleUserGesture);
    window.addEventListener('touchstart', handleUserGesture);
    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, []);

  const speakCashout = (testimony: CashoutTestimony) => {
    if (isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const formattedAmount = testimony.amount.toLocaleString('en-NG');
      const text = `${testimony.name} from ${testimony.location} just cashed out ${formattedAmount} Naira from QuickPay!`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Natural, clear announcement cadence
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';

      // Pick best english voice if available
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('en-NG') ||
            v.name.includes('en-GB'))
      );
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback error:', e);
      setIsSpeaking(false);
    }
  };

  const showNextTestimony = () => {
    const item = TESTIMONIALS[currentIndexRef.current % TESTIMONIALS.length];
    currentIndexRef.current += 1;

    const timeOptions = ['Just now', '1 min ago', '2 mins ago', 'Just now', 'Few seconds ago'];
    const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];

    const testimony: CashoutTestimony = {
      ...item,
      id: `cashout_${Date.now()}`,
      timeAgo: randomTime,
    };

    setCurrentTestimony(testimony);
    setVisible(true);

    // Speak announcement
    speakCashout(testimony);

    // Hide after 6.5 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      // Schedule next pop-up in 14-22 seconds
      const nextDelay = 14000 + Math.random() * 8000;
      setTimeout(() => {
        showNextTestimony();
      }, nextDelay);
    }, 6500);
  };

  useEffect(() => {
    // Initial popup fires after 3.5 seconds
    const initialTimer = setTimeout(() => {
      showNextTestimony();
    }, 3500);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (currentTestimony) {
        speakCashout(currentTestimony);
      }
    }
  };

  if (!visible || !currentTestimony) return null;

  const initials = currentTestimony.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <aside
      aria-label="Recent Cashout Alert"
      className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-50 max-w-[340px] w-[calc(100%-24px)] pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100"
    >
      <div className="bg-[#042417]/95 backdrop-blur-md border border-[#ffd778]/40 shadow-2xl rounded-2xl p-3 sm:p-3.5 text-white flex items-start gap-3 relative overflow-hidden ring-1 ring-[#ffd778]/20">
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ffd778]/15 rounded-full blur-xl pointer-events-none" />

        {/* User Avatar */}
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTestimony.avatarBg} flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md border border-white/20`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#ffd778] text-slate-950 text-[9px] font-black uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
              Live Cashout
            </span>
            <span className="text-[10px] text-emerald-300/80 font-medium">
              {currentTestimony.timeAgo}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <h5 className="text-xs font-bold text-white truncate">{currentTestimony.name}</h5>
            <span className="text-[10px] text-emerald-200/80 shrink-0">
              ({currentTestimony.location})
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#ffd778]">
              <span className="text-[11px] text-emerald-200/90 font-medium">Withdrew</span>
              <span className="text-xs sm:text-sm font-black text-[#ffd778] tracking-tight">
                {formatNaira(currentTestimony.amount)}
              </span>
            </div>

            {/* Speaking animation waves */}
            {isSpeaking && !isMuted && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                <span className="w-1 h-2 bg-emerald-400 animate-pulse rounded-full" />
                <span className="w-1 h-3 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-1.5 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                <span className="ml-1 text-[8px]">Announcing</span>
              </span>
            )}
          </div>
        </div>

        {/* Controls: Audio mute/unmute and Close */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute voice announcement' : 'Mute voice announcement'}
            className="p-1 rounded-lg text-emerald-300/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#ffd778]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title="Dismiss"
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
