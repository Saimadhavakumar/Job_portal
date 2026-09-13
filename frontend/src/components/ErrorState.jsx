import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = "Something went wrong.",
  description = "We couldn't load the jobs right now.",
  onRetry
}) => {
  return (
    <div className="bg-white rounded-xl p-8 border border-rose-200/80 text-center max-w-md mx-auto space-y-4 my-6">
      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#111111]">{title}</h3>
        <p className="text-xs text-[#666666] leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAFAF9] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] font-semibold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
};
