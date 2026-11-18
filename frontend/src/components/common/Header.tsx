import React, { useEffect, useState } from 'react'
import type { NavigationProps } from '../../types/navigation'
import { ShieldAlertIcon, VideoIcon, ImageIcon } from './Icons'
import './Header.css'

export const Header: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let ignore = false
    const check = () => {
      fetch('/api/health')
        .then((res) => {
          if (!ignore) setBackendOnline(res.ok)
        })
        .catch(() => {
          if (!ignore) setBackendOnline(false)
        })
    }
    check()
    const timer = setInterval(check, 10000)
    return () => {
      ignore = true
      clearInterval(timer)
    }
  }, [])

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
          </button>
        </nav>

        {/* System & Model Status */}
        <div className="header-status">
          {backendOnline === true ? (
            <div className="status-indicator online">
              <span className="status-dot online"></span>
              <span>FastAPI Backend: Online</span>
            </div>
          ) : backendOnline === false ? (
            <div className="status-indicator warning">
              <span className="status-dot warning"></span>
              <span>FastAPI Backend: Offline</span>
            </div>
          ) : (
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Checking Backend...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
