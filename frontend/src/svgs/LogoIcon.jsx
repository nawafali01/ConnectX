import React from 'react';

export const LogoIcon = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`connectx-logo-svg ${className}`}
  >
    <defs>
      <linearGradient id="cx-grad-main" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--primary-400)" />
        <stop offset="50%" stopColor="var(--primary-600)" />
        <stop offset="100%" stopColor="var(--primary-800)" />
      </linearGradient>
      <linearGradient id="cx-glow" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    {/* Outer Rounded Squircle */}
    <rect
      x="4"
      y="4"
      width="56"
      height="56"
      rx="18"
      fill="url(#cx-grad-main)"
    />

    {/* Subtle Inner Glow Rim */}
    <rect
      x="5"
      y="5"
      width="54"
      height="54"
      rx="17"
      stroke="url(#cx-glow)"
      strokeWidth="1.5"
      strokeOpacity="0.7"
    />

    {/* Intersecting 'X' */}
    <path
      d="M19 19L45 45M45 19L19 45"
      stroke="#ffffff"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Central Hub */}
    <circle cx="32" cy="32" r="5.5" fill="#ffffff" />
    <circle cx="32" cy="32" r="2.5" fill="var(--primary-600)" />

    {/* Corner Nodes */}
    <circle cx="19" cy="19" r="3" fill="#ffffff" />
    <circle cx="45" cy="45" r="3" fill="#ffffff" />
    <circle cx="45" cy="19" r="3" fill="#ffffff" />
    <circle cx="19" cy="45" r="3" fill="#ffffff" />
  </svg>
);
