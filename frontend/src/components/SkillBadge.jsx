import React from 'react';

export const SkillBadge = ({ name, importance, isMatched, isMissing }) => {
  let badgeStyle = "bg-[#FAFAF9] text-[#444444] border-[#E5E5E5]";

  if (isMatched) {
    badgeStyle = "bg-emerald-50 text-[#16A34A] border-emerald-200/80 font-medium";
  } else if (isMissing) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200/80 font-medium";
  } else if (importance === 'HIGH') {
    badgeStyle = "bg-blue-50 text-[#2563EB] border-blue-200/80 font-medium";
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${badgeStyle}`}>
      {name}
    </span>
  );
};
