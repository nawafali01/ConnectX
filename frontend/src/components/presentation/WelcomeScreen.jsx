import React from 'react';
import { LogoIcon } from '../../svgs/LogoIcon';
import { ArrowRightIcon } from '../../svgs/ArrowRightIcon';
import { SparklesIcon } from '../../svgs/SparklesIcon';
import { APP_CONFIG } from '../../constants/appConfig';

export const WelcomeScreen = ({ onNext }) => {
  return (
    <div className="onboarding-card welcome-screen-view">
      {/* Centered Content Group */}
      <div className="welcome-center-group">
        <div className="logo-wrapper">
          <div className="logo-glow-ring" />
          <LogoIcon size={84} />
        </div>

        <h1 className="brand-title">
          <span className="gradient-text">{APP_CONFIG.name}</span>
        </h1>

        <p className="brand-tagline">
          {APP_CONFIG.tagline}
        </p>

        {/* Feature Highlights */}
        {/* <div className="feature-pill-row">
          <span className="feature-pill">
            <SparklesIcon size={14} color="#7c3aed" /> Instant Chat
          </span>
          <span className="feature-pill">
            ⚡ Multi-User Room
          </span>
          <span className="feature-pill">
            🔒 Privacy First
          </span>
        </div> */}

        {/* Action Button — inline with content */}
        <button
          id="btn-welcome-next"
          className="btn-primary-purple"
          onClick={onNext}
          aria-label="Get started and create profile"
          style={{ marginTop: '12px' }}
        >
          <span>Get Started</span>
          <ArrowRightIcon size={20} />
        </button>
      </div>
    </div>
  );
};
