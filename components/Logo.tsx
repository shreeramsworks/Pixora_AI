import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 120" 
      fill="none" 
      className={className}
      aria-label="Pixora AI Logo"
    >
      <defs>
        <linearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Outer glowing circle */}
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="url(#logo_grad)"
        strokeWidth="6"
        fill="none"
      />

      {/* Outer P shape */}
      <path
        d="M40 28H65Q88 28 88 46Q88 64 65 64H52V92H40Z"
        stroke="url(#logo_grad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner circuit path */}
      <path
        d="M45 38V58Q45 65 52 65H63Q75 65 75 52Q75 40 63 40H58"
        stroke="url(#logo_grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Nodes */}
      <circle cx="45" cy="38" r="3.2" fill="#22d3ee" />
      <circle cx="45" cy="58" r="3.2" fill="#22d3ee" />
      <circle cx="58" cy="40" r="3.2" fill="#38bdf8" />
      <circle cx="52" cy="65" r="3.2" fill="#3b82f6" />

      {/* Lower connection line + node */}
      <path
        d="M52 72V86"
        stroke="url(#logo_grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="52" cy="86" r="3.4" fill="#2563eb" />
    </svg>
  );
};

export default Logo;