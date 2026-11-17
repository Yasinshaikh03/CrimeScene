import React from 'react'
import type { NavigationProps } from '../../types/navigation'
import { ShieldAlertIcon, VideoIcon, ImageIcon } from './Icons'
import './Header.css'

export const Header: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Brand & Logo */}
        <div className="header-brand" onClick={() => onTabChange('video-analysis')}>
          <div className="brand-icon-wrap">
            <ShieldAlertIcon size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              CrimeScene
              <span className="brand-badge">VCI Engine</span>
            </div>
            <div className="brand-subtitle">
              CLIP Visual Forensics & Counterfactual Intelligence
            </div>
          </div>
        </div>

        {/* Co-existing Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'video-analysis' ? 'active' : ''}`}
            onClick={() => onTabChange('video-analysis')}
            aria-selected={activeTab === 'video-analysis'}
          >
            <VideoIcon size={16} />
            <span>Video Analysis</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'photo-analysis' ? 'active' : ''}`}
            onClick={() => onTabChange('photo-analysis')}
            aria-selected={activeTab === 'photo-analysis'}
          >
            <ImageIcon size={16} />
            <span>Photo Analysis</span>
            <span className="nav-badge-sudev">Sudev</span>
          </button>
        </nav>

        {/* System & Model Status */}
        <div className="header-status">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>ViT-B/32 Ready</span>
          </div>
        </div>
      </div>
    </header>
  )
}
