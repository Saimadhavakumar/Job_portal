import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Briefcase,
  title = "No items found",
  description = "There are no records to display at this time.",
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="bg-white rounded-xl p-10 border border-[#E5E5E5] text-center max-w-md mx-auto space-y-4 my-6">
      <div className="w-12 h-12 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] text-[#8A8A8A] mx-auto flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#111111]">{title}</h3>
        <p className="text-xs text-[#666666] leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
