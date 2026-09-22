import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction } from '../types';
import {
  updateUserBalance,
  formatNaira,
  addTransaction,
} from '../data/storage';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Coins,
  PartyPopper,
} from 'lucide-react';
import coinMascotImg from '../assets/images/cute_tap_mascot_1789756816723.jpg';
import starMascotImg from '../assets/images/happy_star_mascot_1789756830039.jpg';

interface EarnPageProps {
  user: User;
  onBack: () => void;
  onBalanceUpdated: (updatedUser: User) => void;
}

// 8 Vivid color palettes that dynamically morph with each tap
const COLOR_PALETTES = [
  {
    name: 'Electric Emerald',
    gradient: 'from-[#10b981] via-[#059669] to-[#047857]',
    glow: 'rgba(16, 185, 129, 0.65)',
    border: '#34d399',
    accentText: 'text-emerald-300',
    ring: 'border-emerald-400',
  },
  {
    name: 'Cyan Laser',
    gradient: 'from-[#06b6d4] via-[#0284c7] to-[#1d4ed8]',
    glow: 'rgba(6, 182, 212, 0.65)',
    border: '#38bdf8',
    accentText: 'text-cyan-300',
    ring: 'border-cyan-400',
  },
  {
    name: 'Neon Cyber Purple',
    gradient: 'from-[#a855f7] via-[#9333ea] to-[#6b21a8]',
    glow: 'rgba(168, 85, 247, 0.7)',
    border: '#c084fc',
    accentText: 'text-purple-300',
    ring: 'border-purple-400',
  },
  {
    name: 'Hot Magenta Pink',
    gradient: 'from-[#ec4899] via-[#db2777] to-[#be185d]',
    glow: 'rgba(236, 72, 153, 0.7)',
    border: '#f472b6',
    accentText: 'text-pink-300',
    ring: 'border-pink-400',
  },
  {
    name: 'Golden Sun & Amber',
    gradient: 'from-[#fbbf24] via-[#f59e0b] to-[#d97706]',
    glow: 'rgba(251, 191, 36, 0.75)',
    border: '#fde047',
    accentText: 'text-amber-300',
    ring: 'border-amber-400',
  },
  {
    name: 'Blazing Sunset Coral',
    gradient: 'from-[#f97316] via-[#ea580c] to-[#c2410c]',
    glow: 'rgba(249, 115, 22, 0.7)',
    border: '#fb923c',
    accentText: 'text-orange-300',
    ring: 'border-orange-400',
  },
  {
    name: 'Cosmic Ruby Storm',
    gradient: 'from-[#f43f5e] via-[#e11d48] to-[#9f1239]',
    glow: 'rgba(244, 63, 94, 0.7)',
    border: '#fb7185',
    accentText: 'text-rose-300',
    ring: 'border-rose-400',
  },
  {
    name: 'Holographic Rainbow',
    gradient: 'from-[#8b5cf6] via-[#ec4899] to-[#3b82f6]',
    glow: 'rgba(139, 92, 246, 0.75)',
    border: '#e879f9',
    accentText: 'text-fuchsia-300',
    ring: 'border-fuchsia-400',
  },
];

// Fun cheering cartoon mascot dialogs
const MASCOT_QUOTES = [
  'Woohoo! +₦0.50! 💰',
  'Keep Tapping! 🚀',
  'Speed Demon! ⚡',
  'Money Rain! 💸',
  'You Are On Fire! 🔥',
  'Cha-Ching! 🤑',
  'Awesome Combo! 🌟',
  'Fast Hands! 💥',
  'Rich Vibes! 💎',
  'Leveling Up! 🎉',
  'Super Tapper! 🏆',
  'Keep It Going! ✨',
];

interface FloatingReward {
  id: number;
  x: number;
  y: number;
  value: string;
  rotation: number;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
}

export const EarnPage: React.FC<EarnPageProps> = ({
  user,
  onBack,
  onBalanceUpdated,
}) => {
  // Web Audio Context Synthesizer for instant, zero-latency arcade sounds
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Earning & Tap State
  const [totalTaps, setTotalTaps] = useState(0);
  const [sessionEarned, setSessionEarned] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Cartoon Mascot Popups
  const [mascotVisible, setMascotVisible] = useState(false);
  const [mascotMemeText, setMascotMemeText] = useState(MASCOT_QUOTES[0]);
  const [currentMascotType, setCurrentMascotType] = useState<'coin' | 'star'>('coin');
  const [mascotBounce, setMascotBounce] = useState(false);
  const mascotTimerRef = useRef<number | null>(null);
  const comboTimerRef = useRef<number | null>(null);

  // Visual particles
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  // Sound Engine
  const playFunSound = (currentCombo: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Base coin pitch climbs as combo increases
      const baseFreq = 540 + Math.min(currentCombo * 18, 550);

      // Primary oscillator: playful bell/coin chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // Secondary cute overtone
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(baseFreq * 2.05, now);
      bellGain.gain.setValueAtTime(0.15, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.15);

      // Special milestone celebration sound every 10 taps
      if ((totalTaps + 1) % 10 === 0) {
        const chord = [784, 988, 1175, 1568]; // G major arpeggio
        chord.forEach((freq, idx) => {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
          cGain.gain.setValueAtTime(0.18, now + idx * 0.05);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
          cOsc.connect(cGain);
          cGain.connect(ctx.destination);
          cOsc.start(now + idx * 0.05);
          cOsc.stop(now + idx * 0.05 + 0.18);
        });
      }
    } catch {
      // Audio playback fails safely if blocked
    }
  };

  // Handle Tap Action
  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const TAP_VALUE = 0.5; // 1 tap = 0.5 naira

    // Calculate click coordinates for floating text & particles
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = rect.left + rect.width / 2;
    let clientY = rect.top + rect.height / 2;

    if ('clientX' in e && e.clientX && e.clientY) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Trigger visual press effect
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 90);

    // Increment combo
    const newCombo = combo + 1;
    setCombo(newCombo);

    if (comboTimerRef.current) {
      window.clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = window.setTimeout(() => {
      setCombo(0);
    }, 1800);

    // Play fun audio
    playFunSound(newCombo);

    // Update color palette (advances with every tap to change colors)
    setColorIndex((prev) => (prev + 1) % COLOR_PALETTES.length);

    // Increment Earned amount and Tap counter
    setTotalTaps((prev) => prev + 1);
    setSessionEarned((prev) => prev + TAP_VALUE);

    // Instantly update user balance in storage
    const newBal = +(user.balance + TAP_VALUE).toFixed(2);
    const updated = updateUserBalance(user.id, newBal);
    if (updated) {
      onBalanceUpdated(updated);
    }

    // Spawn Floating "+₦0.50"
    const rewardId = Date.now() + Math.random();
    const newReward: FloatingReward = {
      id: rewardId,
      x: relX + (Math.random() * 40 - 20),
      y: relY - 20,
      value: `+₦0.50`,
      rotation: Math.random() * 20 - 10,
    };
    setFloatingRewards((prev) => [...prev.slice(-12), newReward]);

    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== rewardId));
    }, 850);

    // Spawn colorful confetti bursts around circle
    const colors = ['#fde047', '#34d399', '#38bdf8', '#f472b6', '#fb923c', '#e879f9'];
    const newParticles: ConfettiParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: relX,
      y: relY,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      vx: (Math.random() - 0.5) * 120,
      vy: -Math.random() * 100 - 30,
    }));
    setParticles((prev) => [...prev.slice(-24), ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 600);

    // CARTOON MASCOT POPPING ON SCREEN
    setMascotVisible(true);
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 200);

    // Alternate cartoon or change message periodically
    if (newCombo % 3 === 0 || !mascotVisible) {
      const quote = MASCOT_QUOTES[Math.floor(Math.random() * MASCOT_QUOTES.length)];
      setMascotMemeText(quote);
      setCurrentMascotType(Math.random() > 0.5 ? 'coin' : 'star');
    }

    if (mascotTimerRef.current) {
      window.clearTimeout(mascotTimerRef.current);
    }
    // Mascot stays active while tapping, hides smoothly after 2.5s of inactivity
    mascotTimerRef.current = window.setTimeout(() => {
      setMascotVisible(false);
    }, 2500);
  };

  // When leaving page, persist session summary transaction if user earned rewards
  const handleExit = () => {
    if (sessionEarned > 0) {
      const now = new Date();
      const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const tx: Transaction = {
        id: `tx_tap_earn_${Date.now()}`,
        userId: user.id,
        type: 'cashback',
        title: 'Tap to Earn Rewards',
        subtitle: `${totalTaps} Taps completed (₦0.50/tap)`,
        amount: +sessionEarned.toFixed(2),
        isCredit: true,
        date: dateStr,
        status: 'successful',
        reference: `QP-TAP-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      addTransaction(tx);
    }
    onBack();
  };

  const activePalette = COLOR_PALETTES[colorIndex];

  return (
    <div className="w-full min-h-screen bg-[#07131e] dark:bg-[#020e08] text-white flex flex-col relative overflow-hidden select-none transition-colors duration-200">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left vibrant gradient blob */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30 dark:opacity-20 transition-all duration-700"
          style={{ backgroundColor: activePalette.border }}
        />
        {/* Bottom-right ambient aura */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-600/25 dark:bg-emerald-600/20 blur-3xl" />
        {/* Center glowing aura behind the tap circle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-40 dark:opacity-30 transition-all duration-500"
          style={{ backgroundColor: activePalette.glow }}
        />
        {/* Floating Sparkle Stars in Background */}
        <div className="absolute top-24 left-10 text-amber-300/40 text-xl animate-pulse">★</div>
        <div className="absolute top-36 right-12 text-cyan-300/40 text-lg animate-bounce">✦</div>
        <div className="absolute bottom-40 left-12 text-pink-300/40 text-2xl animate-pulse">★</div>
        <div className="absolute bottom-32 right-14 text-emerald-300/40 text-base animate-bounce">✦</div>
      </div>

      {/* TOP HEADER */}
      <header className="relative z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 dark:border-emerald-900/40 bg-slate-950/60 dark:bg-[#01140d]/80 backdrop-blur-md">
        <button
          type="button"
          id="tap-earn-back-btn"
          onClick={handleExit}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header Title with animated coin spark */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Tap to Earn</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          </h1>
        </div>

        {/* Audio Sound Toggle */}
        <button
          type="button"
          id="toggle-sound-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </header>

      {/* MAIN GAMIFIED TAP TO EARN BODY */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-between px-4 py-4 sm:py-6 max-w-lg mx-auto w-full">
        {/* STATS & REWARDS STRIP */}
        <div className="w-full space-y-2.5">
          {/* Real-time Wallet Balance Bar */}
          <div className="bg-white/10 dark:bg-[#062417]/80 backdrop-blur-md border border-white/15 dark:border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#044329] p-0.5 flex items-center justify-center shadow-md">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-300/70">
                  Live Wallet Balance
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {formatNaira(user.balance)}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Session Gain
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                +{formatNaira(sessionEarned)}
              </span>
            </div>
          </div>

          {/* Rate & Combo Indicator */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-300 dark:text-emerald-200 bg-white/5 dark:bg-emerald-950/40 py-1 px-3 rounded-full border border-white/10 dark:border-emerald-800/40">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>1 Tap = ₦0.50</span>
            </div>

            {combo > 2 && (
              <div className="flex items-center gap-1 font-black text-amber-300 bg-gradient-to-r from-amber-500/20 to-red-500/20 py-1 px-3 rounded-full border border-amber-400/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>COMBO x{combo}!</span>
              </div>
            )}

            <div className="font-bold text-slate-300 dark:text-emerald-200 bg-white/5 dark:bg-emerald-950/40 py-1 px-3 rounded-full border border-white/10 dark:border-emerald-800/40">
              <span>{totalTaps} Taps</span>
            </div>
          </div>
        </div>

        {/* POPPING CARTOON MASCOT OVERLAY */}
        <div className="relative w-full flex flex-col items-center justify-center h-28 my-1">
          {mascotVisible ? (
            <div
              className={`flex items-center gap-3 transition-all duration-200 transform ${
                mascotBounce ? 'scale-110 -translate-y-2' : 'scale-100 translate-y-0'
              }`}
            >
              {/* Animated Mascot Avatar */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-pink-400 to-cyan-400 animate-bounce">
                  <img
                    src={currentMascotType === 'coin' ? coinMascotImg : starMascotImg}
                    alt="QuickPay Mascot"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {/* Cheerful star badge */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md animate-spin" style={{ animationDuration: '6s' }}>
                  ★
                </div>
              </div>

              {/* Cartoon Speech Bubble */}
              <div className="relative bg-white dark:bg-[#062417] text-slate-950 dark:text-white px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-2xl border-2 border-amber-300 dark:border-amber-400 max-w-[200px] sm:max-w-xs animate-in zoom-in-75 duration-150">
                <p className="text-xs sm:text-sm font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                  {mascotMemeText}
                </p>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  +₦0.50 Added Instantly!
                </span>
                {/* Speech Bubble Arrow */}
                <div className="absolute -left-2 bottom-3 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white dark:border-r-[#062417] border-b-8 border-b-transparent" />
              </div>
            </div>
          ) : (
            /* Idle Mascot hint */
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 dark:bg-emerald-950/40 border border-white/10 dark:border-emerald-800/40 text-slate-300 dark:text-emerald-200 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tap the big glowing circle below to earn money!</span>
            </div>
          )}
        </div>

        {/* THE BIG ROUND CIRCLE TO TAP */}
        <div className="relative flex items-center justify-center my-auto py-2">
          {/* Pulsing Concentric Outer Rings */}
          <div
            className={`absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 ${activePalette.ring} opacity-30 animate-ping pointer-events-none`}
            style={{ animationDuration: '3s' }}
          />
          <div
            className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-white/20 opacity-50 pointer-events-none`}
          />

          {/* THE INTERACTIVE BIG ROUND CIRCLE BUTTON */}
          <button
            type="button"
            id="tap-to-earn-circle-btn"
            onClick={handleTap}
            onTouchStart={handleTap}
            className={`relative group w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr ${
              activePalette.gradient
            } p-2 shadow-2xl transition-all duration-150 ease-out cursor-pointer select-none touch-manipulation outline-none flex items-center justify-center ${
              isPressing
                ? 'scale-90 shadow-inner brightness-110'
                : 'hover:scale-105 hover:brightness-105 active:scale-90'
            }`}
            style={{
              boxShadow: `0 0 50px ${activePalette.glow}, inset 0 6px 14px rgba(255,255,255,0.4), inset 0 -8px 16px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Inner Ring with 3D Bevel */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/25 via-transparent to-black/30 p-2 flex flex-col items-center justify-center relative overflow-hidden border border-white/30">
              {/* Radial Specular Highlight */}
              <div className="absolute -top-12 left-1/4 w-3/4 h-24 bg-white/30 rounded-full blur-md pointer-events-none" />

              {/* Center Naira ₦ Emblem */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/40 flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                <span className="text-4xl sm:text-6xl font-black text-white drop-shadow-md tracking-tighter">
                  ₦
                </span>
                <span className="text-[10px] sm:text-xs font-black text-amber-200 tracking-wider uppercase mt-0.5">
                  TAP ME
                </span>
              </div>

              {/* Bottom Label inside circle */}
              <div className="mt-2 text-center">
                <span className="text-[11px] sm:text-xs font-black text-white/95 uppercase tracking-widest drop-shadow">
                  +₦0.50 / Tap
                </span>
                <span className="block text-[9px] font-bold text-white/70">
                  {activePalette.name}
                </span>
              </div>

              {/* FLOATING +₦0.50 REWARDS POPPING UP */}
              {floatingRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="absolute pointer-events-none font-black text-lg sm:text-2xl text-amber-300 drop-shadow-lg animate-out fade-out slide-out-to-top-12 duration-700"
                  style={{
                    left: `${reward.x}px`,
                    top: `${reward.y}px`,
                    transform: `rotate(${reward.rotation}deg)`,
                  }}
                >
                  {reward.value}
                </div>
              ))}

              {/* COLORFUL CONFETTI PARTICLES BURST */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none animate-ping"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                  }}
                />
              ))}
            </div>
          </button>
        </div>

        {/* BOTTOM MOTIVATIONAL BANNER & PALETTE TINT */}
        <div className="w-full text-center space-y-2 pb-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-white shadow-lg">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: activePalette.border }}
            />
            <span className="text-slate-200">Color Stage:</span>
            <span className={activePalette.accentText}>{activePalette.name}</span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Tap repeatedly to change circle colors, trigger cartoon mascots, and grow your wallet balance!
          </p>
        </div>
      </main>
    </div>
  );
};
