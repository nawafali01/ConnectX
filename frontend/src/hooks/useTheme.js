import { useState, useEffect, useCallback } from 'react';

// Helper: convert hex to RGB components
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 124, g: 58, b: 237 };
}

// Helper: generate a tint (mix with white)
function tint(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const t = amount / 100;
  const nr = Math.round(r + (255 - r) * t);
  const ng = Math.round(g + (255 - g) * t);
  const nb = Math.round(b + (255 - b) * t);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// Helper: darken a hex color
function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const t = amount / 100;
  const nr = Math.max(0, Math.round(r * (1 - t)));
  const ng = Math.max(0, Math.round(g * (1 - t)));
  const nb = Math.max(0, Math.round(b * (1 - t)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// Predefined theme presets
export const THEME_PRESETS = [
  {
    id: 'purple',
    name: 'Royal Purple',
    emoji: '💜',
    primary: '#7c3aed',
    secondary: '#9333ea',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    emoji: '💙',
    primary: '#2563eb',
    secondary: '#0ea5e9',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    emoji: '💚',
    primary: '#059669',
    secondary: '#10b981',
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    emoji: '🌸',
    primary: '#e11d48',
    secondary: '#f43f5e',
  },
  {
    id: 'amber',
    name: 'Sunset',
    emoji: '🔥',
    primary: '#d97706',
    secondary: '#f59e0b',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    emoji: '🌌',
    primary: '#4338ca',
    secondary: '#6366f1',
  },
  {
    id: 'teal',
    name: 'Teal',
    emoji: '🩵',
    primary: '#0d9488',
    secondary: '#14b8a6',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    emoji: '❤️',
    primary: '#b91c1c',
    secondary: '#dc2626',
  },
];

const DEFAULT_THEME = THEME_PRESETS[0];
const STORAGE_KEY = 'connectx_theme';

function applyThemeToDOM(primary, secondary) {
  const root = document.documentElement;
  const { r: pr, g: pg, b: pb } = hexToRgb(primary);
  const { r: sr, g: sg, b: sb } = hexToRgb(secondary);

  // RGB string for rgba() usage in CSS
  root.style.setProperty('--primary-rgb', `${pr}, ${pg}, ${pb}`);

  // Generate full palette from primary
  root.style.setProperty('--primary-50', tint(primary, 97));
  root.style.setProperty('--primary-100', tint(primary, 92));
  root.style.setProperty('--primary-200', tint(primary, 82));
  root.style.setProperty('--primary-300', tint(primary, 65));
  root.style.setProperty('--primary-400', tint(primary, 45));
  root.style.setProperty('--primary-500', tint(primary, 20));
  root.style.setProperty('--primary-600', primary);
  root.style.setProperty('--primary-700', shade(primary, 10));
  root.style.setProperty('--primary-800', shade(primary, 22));
  root.style.setProperty('--primary-900', shade(primary, 38));

  // Gradients using both primary + secondary
  root.style.setProperty(
    '--grad-primary',
    `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${shade(primary, 8)} 100%)`
  );
  root.style.setProperty(
    '--grad-primary-hover',
    `linear-gradient(135deg, ${tint(primary, 15)} 0%, ${tint(secondary, 15)} 50%, ${shade(primary, 5)} 100%)`
  );
  root.style.setProperty(
    '--grad-purple-bubble',
    `linear-gradient(135deg, ${primary} 0%, ${shade(primary, 12)} 60%, ${shade(primary, 25)} 100%)`
  );
  root.style.setProperty(
    '--grad-glow',
    `radial-gradient(circle at center, rgba(${pr}, ${pg}, ${pb}, 0.25) 0%, rgba(${pr}, ${pg}, ${pb}, 0) 70%)`
  );
  root.style.setProperty(
    '--grad-light-card',
    `linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(${pr}, ${pg}, ${pb}, 0.04) 100%)`
  );

  // Borders & shadows
  root.style.setProperty('--color-border-subtle', `rgba(${pr}, ${pg}, ${pb}, 0.16)`);
  root.style.setProperty('--color-border-glow', `rgba(${pr}, ${pg}, ${pb}, 0.4)`);

  root.style.setProperty('--shadow-sm', `0 2px 8px rgba(${pr}, ${pg}, ${pb}, 0.08)`);
  root.style.setProperty('--shadow-md', `0 8px 24px rgba(${pr}, ${pg}, ${pb}, 0.14)`);
  root.style.setProperty('--shadow-lg', `0 16px 40px rgba(${pr}, ${pg}, ${pb}, 0.22)`);
  root.style.setProperty('--shadow-glow', `0 0 35px rgba(${pr}, ${pg}, ${pb}, 0.4)`);

  // Background orbs & page gradient
  root.style.setProperty('--orb-primary-color', `rgba(${pr}, ${pg}, ${pb}, 0.45)`);
  root.style.setProperty('--orb-secondary-color', `rgba(${sr}, ${sg}, ${sb}, 0.38)`);

  // Update body background
  document.body.style.backgroundImage = `
    radial-gradient(at 15% 15%, rgba(${pr}, ${pg}, ${pb}, 0.35) 0px, transparent 50%),
    radial-gradient(at 85% 85%, rgba(${sr}, ${sg}, ${sb}, 0.28) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(${Math.round((pr + sr) / 2)}, ${Math.round((pg + sg) / 2)}, ${Math.round((pb + sb) / 2)}, 0.18) 0px, transparent 65%)
  `;

  // Scrollbar
  root.style.setProperty('--scrollbar-thumb', `rgba(${pr}, ${pg}, ${pb}, 0.2)`);
  root.style.setProperty('--scrollbar-thumb-hover', `rgba(${pr}, ${pg}, ${pb}, 0.4)`);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { primary: DEFAULT_THEME.primary, secondary: DEFAULT_THEME.secondary };
    } catch {
      return { primary: DEFAULT_THEME.primary, secondary: DEFAULT_THEME.secondary };
    }
  });

  // Apply on mount & whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme.primary, theme.secondary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const setColors = useCallback((primary, secondary) => {
    setTheme({ primary, secondary });
  }, []);

  const applyPreset = useCallback((preset) => {
    setTheme({ primary: preset.primary, secondary: preset.secondary });
  }, []);

  return { theme, setColors, applyPreset };
}
