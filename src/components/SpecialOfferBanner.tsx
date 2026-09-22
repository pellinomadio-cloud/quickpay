import React from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import promoImg from '../assets/images/quickpay_promo_gift_1789754802129.jpg';

interface SpecialOfferBannerProps {
  onCheckPromo: () => void;
}

export const SpecialOfferBanner: React.FC<SpecialOfferBannerProps> = ({ onCheckPromo }) => {
  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-6 py-3">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#02331f] via-[#04442a] to-[#032e1d] dark:from-[#012416] dark:via-[#02311e] dark:to-[#012014] p-5 text-white shadow-lg shadow-emerald-950/20 dark:shadow-black/50 border border-emerald-500/20 dark:border-emerald-500/30 overflow-hidden flex items-center justify-between">
        
        {/* Subtle decorative golden ribbon waves at bottom right */}
        <div className="absolute -bottom-10 -right-6 w-52 h-40 bg-gradient-to-tr from-amber-400/20 via-emerald-400/10 to-transparent rounded-full blur-xl pointer-events-none" />

        {/* Left Side Content */}
        <div className="relative z-10 max-w-[62%] sm:max-w-[65%] flex flex-col items-start">
          {/* Flame Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold shadow-sm mb-2">
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Special Offer</span>
          </div>

          {/* Heading */}
          <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug tracking-tight mb-1">
            Get Amazing Deals & Exciting Rewards!
          </h4>

          {/* Subtext */}
          <p className="text-[11px] sm:text-xs text-emerald-100/80 mb-3.5 leading-normal">
            Buy data, airtime and more at the best rates.
          </p>

          {/* Yellow Pill Button: Check Promo > */}
          <button
            type="button"
            id="check-promo-banner-btn"
            onClick={onCheckPromo}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#f4be38] hover:bg-[#e6b12f] text-slate-950 font-bold text-xs shadow-md shadow-amber-950/20 transition cursor-pointer active:scale-95"
          >
            <span>Check Promo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side Visual: 3D Gift Box with Gold Coins */}
        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 shrink-0 -mr-2">
          <img
            src={promoImg}
            alt="QuickPay Promo Gift"
            className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
};
