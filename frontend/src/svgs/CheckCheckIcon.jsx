import React from 'react';

export const CheckCheckIcon = ({ size = 16, color = '#a78bfa', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6L7 17l-5-5" />
    <path d="M22 10l-7.5 7.5-1.5-1.5" />
  </svg>
);
