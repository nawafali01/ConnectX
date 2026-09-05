import React, { useState, useRef, useEffect } from 'react';
import { THEME_PRESETS } from '../../hooks/useTheme';

export function ThemeCustomizer({ theme, onSetColors, onApplyPreset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [primary, setPrimary] = useState(theme.primary);
  const [secondary, setSecondary] = useState(theme.secondary);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const panelRef = useRef(null);

  // Sync local state when external theme changes
  useEffect(() => {
    setPrimary(theme.primary);
    setSecondary(theme.secondary);
  }, [theme]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleApplyCustom = () => {
    onSetColors(primary, secondary);
  };

  const handlePresetClick = (preset) => {
    onApplyPreset(preset);
    setPrimary(preset.primary);
    setSecondary(preset.secondary);
  };

  // Check which preset is currently active
  const activePresetId = THEME_PRESETS.find(
    (p) => p.primary === theme.primary && p.secondary === theme.secondary
  )?.id;

  return (
    <div className="theme-customizer-wrapper" ref={panelRef}>
      {/* Floating Trigger Button */}
      <button
        id="theme-customizer-btn"
        className={`theme-fab-btn ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        title="Customize Theme"
        aria-label="Open theme customizer"
      >
        <span className="theme-fab-icon">🎨</span>
        <span
          className="theme-fab-swatch"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="theme-panel" role="dialog" aria-label="Theme customizer">
          {/* Header */}
          <div className="theme-panel-header">
            <div className="theme-panel-title-group">
              <span className="theme-panel-icon">🎨</span>
              <div>
                <h3 className="theme-panel-title">Theme Colors</h3>
                <p className="theme-panel-subtitle">Apni marzi sy customize karo</p>
              </div>
            </div>
            <button
              className="theme-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Live Preview Strip */}
          <div
            className="theme-preview-strip"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
          >
            <span className="theme-preview-label">Live Preview</span>
            <div className="theme-preview-dots">
              <span style={{ background: '#ffffff55' }} />
              <span style={{ background: '#ffffff99' }} />
              <span style={{ background: '#ffffffcc' }} />
            </div>
          </div>

          {/* Tab Bar */}
          <div className="theme-tabs">
            <button
              className={`theme-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              ✨ Presets
            </button>
            <button
              className={`theme-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              🖌️ Custom
            </button>
          </div>

          {/* Presets Grid */}
          {activeTab === 'presets' && (
            <div className="theme-presets-grid">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`theme-preset-chip ${activePresetId === preset.id ? 'active' : ''}`}
                  onClick={() => handlePresetClick(preset)}
                  title={preset.name}
                >
                  <span
                    className="preset-swatch"
                    style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                  />
                  <span className="preset-name">{preset.name}</span>
                  {activePresetId === preset.id && (
                    <span className="preset-active-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Custom Color Pickers */}
          {activeTab === 'custom' && (
            <div className="theme-custom-pickers">
              <div className="color-picker-group">
                <label className="color-picker-label" htmlFor="primary-color-input">
                  <span
                    className="color-picker-swatch"
                    style={{ background: primary }}
                  />
                  Primary Color
                </label>
                <div className="color-picker-row">
                  <input
                    id="primary-color-input"
                    type="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="native-color-input"
                  />
                  <span className="color-hex-tag">{primary.toUpperCase()}</span>
                </div>
                <p className="color-hint">Buttons, icons, bubbles</p>
              </div>

              <div className="color-picker-group">
                <label className="color-picker-label" htmlFor="secondary-color-input">
                  <span
                    className="color-picker-swatch"
                    style={{ background: secondary }}
                  />
                  Secondary Color
                </label>
                <div className="color-picker-row">
                  <input
                    id="secondary-color-input"
                    type="color"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="native-color-input"
                  />
                  <span className="color-hex-tag">{secondary.toUpperCase()}</span>
                </div>
                <p className="color-hint">Gradients, accents, orbs</p>
              </div>

              {/* Preview of custom combo */}
              <div
                className="custom-combo-preview"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                <span>Preview</span>
              </div>

              <button
                id="apply-custom-theme-btn"
                className="btn-apply-theme"
                onClick={handleApplyCustom}
              >
                ✓ Apply Colors
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="theme-panel-footer">
            <span className="theme-footer-info">💾 Auto-saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
