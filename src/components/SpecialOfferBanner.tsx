import React from 'react';
import { ChevronRight, Tag } from 'lucide-react';
import promoImg from '../assets/images/quickpay_promo_gift_1789754802129.jpg';

interface SpecialOfferBannerProps {
  onCheckPromo: () => void;
}

export const SpecialOfferBanner: React.FC<SpecialOfferBannerProps> = ({ onCheckPromo }) => {
  return (
    <section className="w-full max-w-xl mx-auto px-4 sm:px-6 py-2">
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between gap-3">
        {/* Left Side Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mb-1">
            <Tag className="w-3 h-3" />
            <span>Special Offer</span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            Discounted Airtime & Data
          </h4>

          <p className="text-xs text-slate-500 mt-0.5 mb-2.5">
            Save up to 3% on every recharge today.
          </p>

          <button
            type="button"
            id="check-promo-banner-btn"
            onClick={onCheckPromo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            <span>View offers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side Visual */}
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-100 p-1 flex items-center justify-center">
          <img
            src={promoImg}
            alt="QuickPay Promo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};
