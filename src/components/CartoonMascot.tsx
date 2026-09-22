import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type MascotField = 'name' | 'phone' | 'email' | 'password' | 'confirmPassword' | null;

interface CartoonMascotProps {
  focusedField: MascotField;
  isPasswordVisible: boolean;
  isLoading: boolean;
  hasError: boolean;
  mode: 'register' | 'login';
}

export const CartoonMascot: React.FC<CartoonMascotProps> = ({
  focusedField,
  isPasswordVisible,
  isLoading,
  hasError,
  mode,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [pawWave, setPawWave] = useState(false);

  // Natural spontaneous blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const isPasswordFocused =
    focusedField === 'password' || focusedField === 'confirmPassword';
  const isCoveringEyes = isPasswordFocused && !isPasswordVisible;
  const isPeeking = isPasswordFocused && isPasswordVisible;

  // Eye gaze coordinates based on input field focused
  let pupilX = 0;
  let pupilY = 0;
  let headTilt = 0;

  if (focusedField === 'name') {
    pupilX = -3;
    pupilY = 4;
    headTilt = -3;
  } else if (focusedField === 'phone') {
    pupilX = 3;
    pupilY = 4;
    headTilt = 3;
  } else if (focusedField === 'email') {
    pupilX = 0;
    pupilY = 5;
    headTilt = 0;
  } else if (hasError) {
    pupilX = 0;
    pupilY = -2;
    headTilt = -4;
  }

  // Comic bubble message
  const getBubbleMessage = () => {
    if (isLoading) return 'Creating your wallet... ✨';
    if (hasError) return 'Oops! Please check details 😿';
    if (isCoveringEyes) return "No peeking, it's a secret! 🙈";
    if (isPeeking) return "I see you! 👀";
    if (focusedField === 'name') return 'Nice to meet you! 😸';
    if (focusedField === 'phone') return 'Nigerian number ready? 📱';
    if (focusedField === 'email') return 'Your email looks great! 💌';
    if (mode === 'register') return 'Join QuickPay today! 🎉';
    return 'Welcome back! 👋';
  };

  return (
    <div className="flex flex-col items-center select-none relative mb-1">
      {/* Cartoon Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={getBubbleMessage()}
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative mb-2 px-3 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-full shadow-xs text-xs font-semibold flex items-center gap-1.5"
        >
          <span>{getBubbleMessage()}</span>
          {/* Little speech arrow pointing down */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-emerald-200 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* SVG Cartoon Mascot Character */}
      <div
        className="w-36 h-28 relative cursor-pointer"
        onClick={() => setPawWave(true)}
        onAnimationEnd={() => setPawWave(false)}
        title="Tap me!"
      >
        <motion.svg
          viewBox="0 0 160 130"
          className="w-full h-full overflow-visible"
          animate={{
            rotate: hasError ? [-3, 3, -3, 0] : headTilt,
            y: isLoading ? [-2, 2, -2] : [0, -1.5, 0],
          }}
          transition={{
            rotate: { duration: 0.35 },
            y: { repeat: Infinity, duration: isLoading ? 0.6 : 2.5, ease: 'easeInOut' },
          }}
        >
          <defs>
            <radialGradient id="catBodyGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FFFEEF" />
              <stop offset="85%" stopColor="#F5EEDB" />
              <stop offset="100%" stopColor="#E9DEC4" />
            </radialGradient>
            <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB1B8" />
              <stop offset="100%" stopColor="#FF8595" />
            </linearGradient>
            <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Torso / Emerald QuickPay Hoodie */}
          <path
            d="M 40 120 C 40 100 60 95 80 95 C 100 95 120 100 120 120 Z"
            fill="url(#hoodieGrad)"
            stroke="#065F46"
            strokeWidth="2.5"
          />
          {/* QuickPay gold mini zip tag */}
          <circle cx="80" cy="103" r="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />

          {/* Left Cat Ear */}
          <motion.g
            animate={{
              rotate: hasError ? -8 : focusedField ? -4 : [0, -3, 0],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{ transformOrigin: '48px 45px' }}
          >
            <path
              d="M 38 48 Q 30 18 55 24 Z"
              fill="url(#catBodyGrad)"
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 40 43 Q 36 24 50 28 Z"
              fill="url(#innerEarGrad)"
            />
          </motion.g>

          {/* Right Cat Ear */}
          <motion.g
            animate={{
              rotate: hasError ? 8 : focusedField ? 4 : [0, 3, 0],
            }}
            transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '112px 45px' }}
          >
            <path
              d="M 122 48 Q 130 18 105 24 Z"
              fill="url(#catBodyGrad)"
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 120 43 Q 124 24 110 28 Z"
              fill="url(#innerEarGrad)"
            />
          </motion.g>

          {/* Head Shape */}
          <ellipse
            cx="80"
            cy="65"
            rx="45"
            ry="38"
            fill="url(#catBodyGrad)"
            stroke="#475569"
            strokeWidth="2.5"
          />

          {/* Forehead Soft Cute Hair Tuft */}
          <path
            d="M 77 30 Q 80 24 82 30 Q 85 26 86 31"
            fill="none"
            stroke="#78716C"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Rosy Cheeks */}
          <circle cx="50" cy="74" r="7" fill="#FECDD3" opacity="0.8" />
          <circle cx="110" cy="74" r="7" fill="#FECDD3" opacity="0.8" />

          {/* Cute Whiskers */}
          {/* Left whiskers */}
          <line x1="38" y1="71" x2="22" y2="69" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="37" y1="76" x2="21" y2="78" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right whiskers */}
          <line x1="122" y1="71" x2="138" y2="69" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="123" y1="76" x2="139" y2="78" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />

          {/* EYES SECTION */}
          {/* Left Eye */}
          <g transform="translate(60, 60)">
            {isCoveringEyes || (isBlinking && !isPasswordFocused) ? (
              // Closed eye (happy arch)
              <path
                d="M -9 2 Q 0 -5 9 2"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                {/* Eye White */}
                <ellipse cx="0" cy="0" rx="9" ry="10" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                {/* Pupil with motion tracking */}
                <motion.g
                  animate={{
                    x: pupilX,
                    y: pupilY,
                  }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <circle cx="0" cy="0" r="5.5" fill="#1E293B" />
                  {/* Glossy specular highlight */}
                  <circle cx="-1.8" cy="-2" r="2.2" fill="#FFFFFF" />
                  <circle cx="2" cy="2" r="1.1" fill="#FFFFFF" />
                </motion.g>
              </>
            )}
          </g>

          {/* Right Eye */}
          <g transform="translate(100, 60)">
            {(isCoveringEyes && !isPeeking) || (isBlinking && !isPasswordFocused) ? (
              // Closed eye (happy arch)
              <path
                d="M -9 2 Q 0 -5 9 2"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                {/* Eye White */}
                <ellipse cx="0" cy="0" rx="9" ry="10" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                {/* Pupil with motion tracking */}
                <motion.g
                  animate={{
                    x: pupilX,
                    y: pupilY,
                  }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <circle cx="0" cy="0" r="5.5" fill="#1E293B" />
                  {/* Glossy specular highlight */}
                  <circle cx="-1.8" cy="-2" r="2.2" fill="#FFFFFF" />
                  <circle cx="2" cy="2" r="1.1" fill="#FFFFFF" />
                </motion.g>
              </>
            )}
          </g>

          {/* Cute Pink Triangular Cat Nose */}
          <polygon points="77,71 83,71 80,75" fill="#F43F5E" />

          {/* Cat Mouth (W-Smile or Surprised 'o' when loading) */}
          {isLoading ? (
            <ellipse cx="80" cy="80" rx="3.5" ry="4" fill="#F43F5E" stroke="#334155" strokeWidth="1.5" />
          ) : hasError ? (
            <path
              d="M 76 81 Q 80 77 84 81"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 75 76 Q 78 81 80 76 Q 82 81 85 76"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* PAWS (With Peek-a-boo Animation) */}
          {/* Left Paw */}
          <motion.g
            animate={
              isCoveringEyes
                ? { x: 12, y: -24, rotate: -22 }
                : pawWave
                ? { x: 0, y: -15, rotate: [0, -25, 0, -25, 0] }
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ transformOrigin: '50px 105px' }}
          >
            <ellipse
              cx="52"
              cy="98"
              rx="12"
              ry="9"
              fill="url(#catBodyGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Paw toe lines */}
            <path d="M 48 94 L 48 99 M 54 94 L 54 99" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
            {/* Soft pink paw pad */}
            <circle cx="52" cy="101" r="3" fill="#FDA4AF" opacity="0.6" />
          </motion.g>

          {/* Right Paw */}
          <motion.g
            animate={
              isCoveringEyes
                ? isPeeking
                  ? { x: -6, y: -8, rotate: 10 } // Lowered paw when peeking
                  : { x: -12, y: -24, rotate: 22 } // Covering eye fully
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ transformOrigin: '110px 105px' }}
          >
            <ellipse
              cx="108"
              cy="98"
              rx="12"
              ry="9"
              fill="url(#catBodyGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Paw toe lines */}
            <path d="M 104 94 L 104 99 M 110 94 L 110 99" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" />
            {/* Soft pink paw pad */}
            <circle cx="108" cy="101" r="3" fill="#FDA4AF" opacity="0.6" />
          </motion.g>
        </motion.svg>
      </div>
    </div>
  );
};
