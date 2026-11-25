import React from 'react';

export const BengaluruPoliceEmblem: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Bengaluru Traffic Police Emblem"
  >
    <circle cx="32" cy="32" r="29" fill="#0A1729" stroke="#D4A64A" strokeWidth="2.5" />
    <circle cx="32" cy="32" r="24" stroke="#D4A64A" strokeWidth="1" strokeDasharray="3 2" />
    <path
      d="M32 10L48 17V30C48 41.5 41 49.5 32 54C23 49.5 16 41.5 16 30V17L32 10Z"
      fill="#102544"
      stroke="#F59E0B"
      strokeWidth="2"
    />
    <path
      d="M32 16L43 21V30C43 38.2 38.2 44.3 32 47.8C25.8 44.3 21 38.2 21 30V21L32 16Z"
      fill="#8B1E2B"
    />
    <circle cx="32" cy="30" r="6" fill="#F59E0B" />
    <path d="M32 21V24M32 36V39M23 30H26M38 30H41" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M29 30H35M32 27V33" stroke="#061326" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const SertosLogo: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex items-center gap-2.5 select-none">
    <svg
      viewBox="0 0 56 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={compact ? 'w-9 h-6 shrink-0' : 'w-12 h-8 shrink-0'}
      aria-hidden="true"
    >
      <path
        d="M2 20H12L16.5 8L22 30L27.5 13L31.5 22L35 18H54"
        stroke="#20E39A"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div className="min-w-0">
      <div className="flex items-center font-extrabold tracking-tight text-white leading-none text-[22px]">
        <span>SERT</span>
        <span className="relative inline-flex items-center justify-center mx-[1px]">
          <span>O</span>
          <svg
            viewBox="0 0 12 12"
            className="w-2.5 h-2.5 absolute text-[#20E39A]"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 2.2V9.8M2.2 6H9.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>
        <span>S</span>
      </div>
      {!compact && (
        <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5 truncate">
          Smart Emergency Response &amp; Traffic Optimization System
        </p>
      )}
    </div>
  </div>
);
