import React, { useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';

export const VerifiedBadge = ({ size = 'normal', showDetailsOnClick = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isSmall = size === 'small';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (showDetailsOnClick) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 font-semibold rounded-md transition-colors cursor-pointer ${
          isSmall
            ? 'text-[11px] px-1.5 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200/80 hover:bg-emerald-100/80'
            : 'text-xs px-2.5 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-200/80 hover:bg-emerald-100/80'
        }`}
        title="Click to view verification status"
      >
        <span className="font-bold text-[11px]">✓</span> Verified
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E5E5] shadow-xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-[#16A34A]">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Verified Job Listing</h4>
                  <span className="text-[11px] text-[#666666]">Admin Authentication Standard</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#8A8A8A] hover:text-[#111111] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#444444] leading-relaxed">
              <p>
                This opportunity has undergone direct verification by our administration team.
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-[#666666]">
                <li>Direct company relationship or authenticated hiring channel</li>
                <li>Zero generic spam or unauthorized WhatsApp/Telegram redirects</li>
                <li>Reliable application status tracking</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-[#111111] bg-[#FAFAF9] hover:bg-stone-100 border border-[#E5E5E5] rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
