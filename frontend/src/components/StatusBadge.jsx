import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  let label = status || 'Applied';
  let badgeStyle = "bg-stone-100 text-[#444444] border-[#E5E5E5]";

  switch (normalized) {
    case 'APPLIED':
    case 'SUBMITTED':
    case 'PENDING':
      label = 'Applied';
      badgeStyle = "bg-stone-100 text-[#666666] border-[#E5E5E5]";
      break;
    case 'UNDER_REVIEW':
    case 'REVIEWING':
    case 'IN_REVIEW':
      label = 'Under Review';
      badgeStyle = "bg-blue-50 text-[#2563EB] border-blue-200/80";
      break;
    case 'SHORTLISTED':
      label = 'Shortlisted';
      badgeStyle = "bg-purple-50 text-purple-700 border-purple-200/80";
      break;
    case 'INTERVIEW':
    case 'INTERVIEWING':
    case 'SCHEDULED':
      label = 'Interview';
      badgeStyle = "bg-amber-50 text-amber-800 border-amber-200/80";
      break;
    case 'OFFERED':
    case 'ACCEPTED':
    case 'HIRED':
      label = 'Offered';
      badgeStyle = "bg-emerald-50 text-[#16A34A] border-emerald-200/80 font-semibold";
      break;
    case 'REJECTED':
    case 'DECLINED':
    case 'CLOSED':
      label = 'Rejected';
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200/80";
      break;
    default:
      label = status;
      break;
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${badgeStyle}`}>
      {label}
    </span>
  );
};
