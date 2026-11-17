import React from 'react'

export type TabType = 'dashboard' | 'image' | 'vci' | 'video' | 'methodology'

interface HeaderProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
  backendHealthy: boolean | null
  checkingHealth: boolean
  onRefreshHealth: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  backendHealthy,
  checkingHealth,
  onRefreshHealth,
}) => {
  return (
    <header className="header-bar">
      <div className="header-container">
        {/* Logo & Branding */}
        <div className="brand" onClick={() => onSelectTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <span className="icon-crosshair">✛</span>
          </div>
          <div>
            <div className="brand-title">
              Crime<span className="gradient-text">Scene</span>
            </div>
            <div className="brand-tagline">Forensic Vision Intelligence</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => onSelectTab('image')}
          >
            Image Analysis
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'vci' ? 'active' : ''}`}
            onClick={() => onSelectTab('vci')}
          >
            VCI Heatmap
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => onSelectTab('video')}
          >
            Video Timeline
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'methodology' ? 'active' : ''}`}
            onClick={() => onSelectTab('methodology')}
          >
            Methodology
          </button>
        </nav>

        {/* Live Backend Connection Status */}
        <div className="header-status">
          <button
            className="health-badge-btn"
            onClick={onRefreshHealth}
            title="Click to re-check API connection"
          >
            <span
              className={`dot ${
                checkingHealth
                  ? 'dot-amber'
                  : backendHealthy === true
                  ? 'dot-emerald'
                  : backendHealthy === false
                  ? 'dot-rose'
                  : 'dot-amber'
              }`}
            />
            <span className="status-label">
              {checkingHealth
                ? 'Checking...'
                : backendHealthy === true
                ? 'API Online'
                : backendHealthy === false
                ? 'API Offline'
                : 'Connecting'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
