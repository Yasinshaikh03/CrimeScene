import React from 'react'
import type { TabType } from './Header'

interface DashboardProps {
  onNavigate: (tab: TabType) => void
  backendHealthy: boolean | null
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, backendHealthy }) => {
  return (
    <div className="dashboard-view">
      {/* Hero Section */}
      <div className="glass-panel glass-panel-glow hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge badge-cyan">Forensic AI Platform</span>
            <span className="badge badge-violet">OpenAI CLIP ViT-B/32</span>
          </div>
          <h1 className="hero-title">
            CLIP-Based Video & Image Analysis with <br />
            <span className="gradient-text">Visual Counterfactual Intelligence</span>
          </h1>
          <p className="hero-description">
            CrimeScene brings deep neural scene understanding to physical security footage and digital evidence. 
            Rank textual hypotheses against visual scenes, interrogate model reasoning with spatial counterfactual grid perturbations, 
            and track forensic events across video timelines with millisecond accuracy.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('image')}>
              <span>Analyze Image Evidence</span>
              <span>→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('vci')}>
              <span>Launch VCI Heatmap</span>
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('video')}>
              <span>Process Video Footage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="dashboard-grid">
        {/* Pillar 1: Image Analysis */}
        <div className="glass-panel feature-card" onClick={() => onNavigate('image')}>
          <div className="feature-icon" style={{ color: 'var(--accent-cyan)' }}>🖼️</div>
          <h3 className="feature-title">Multi-Hypothesis Image Analysis</h3>
          <p className="feature-desc">
            Compare evidence photographs against custom crime scene descriptions. CLIP calculates normalized cosine 
            similarity scores to rank competing investigative theories.
          </p>
          <div className="feature-footer">
            <span className="badge badge-cyan">Cosine Similarity</span>
            <span className="feature-link">Explore Tool →</span>
          </div>
        </div>

        {/* Pillar 2: VCI */}
        <div className="glass-panel feature-card" onClick={() => onNavigate('vci')}>
          <div className="feature-icon" style={{ color: 'var(--accent-violet)' }}>🔬</div>
          <h3 className="feature-title">Visual Counterfactual Intelligence (VCI)</h3>
          <p className="feature-desc">
            Inspect model sensitivity by systematically perturbing spatial grid regions. 
            Identify exactly which physical regions in an image supported or refuted a given description.
          </p>
          <div className="feature-footer">
            <span className="badge badge-violet">Explainable AI (XAI)</span>
            <span className="feature-link">Explore Tool →</span>
          </div>
        </div>

        {/* Pillar 3: Video Timeline */}
        <div className="glass-panel feature-card" onClick={() => onNavigate('video')}>
          <div className="feature-icon" style={{ color: 'var(--accent-blue)' }}>🎥</div>
          <h3 className="feature-title">Surveillance Video Timeline</h3>
          <p className="feature-desc">
            Ingest MP4/AVI/MOV CCTV footage. Samples key frames at custom intervals, generates visual previews, 
            and tracks target activity through temporal similarity curves.
          </p>
          <div className="feature-footer">
            <span className="badge badge-cyan">Temporal Tracking</span>
            <span className="feature-link">Explore Tool →</span>
          </div>
        </div>
      </div>

      {/* System Status & Architecture Overview */}
      <div className="glass-panel info-panel">
        <h3 className="section-title">
          <span>⚙️</span> System Architecture & Diagnostic State
        </h3>
        <div className="info-grid">
          <div className="info-stat">
            <div className="stat-label">FastAPI Backend Status</div>
            <div className="stat-value">
              <span
                className={`dot ${
                  backendHealthy === true ? 'dot-emerald' : backendHealthy === false ? 'dot-rose' : 'dot-amber'
                }`}
              />
              <span style={{ marginLeft: 8 }}>
                {backendHealthy === true ? 'Operational (Port 8000)' : backendHealthy === false ? 'Disconnected' : 'Checking'}
              </span>
            </div>
          </div>

          <div className="info-stat">
            <div className="stat-label">Vision-Language Backbone</div>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
              OpenAI CLIP (ViT-B/32)
            </div>
          </div>

          <div className="info-stat">
            <div className="stat-label">Execution Architecture</div>
            <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>
              Non-Blocking Worker Pool
            </div>
          </div>

          <div className="info-stat">
            <div className="stat-label">Video Processing Engine</div>
            <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
              OpenCV Frame Seeking (RGB)
            </div>
          </div>
        </div>

        <div className="forensic-disclaimer">
          <strong>Forensic Notice:</strong> Similarity scores generated by contrastive vision-language models 
          measure statistical alignment in an embedding space, not factual ground truth or legal guilt. All findings 
          must be corroborated by forensic examiners.
        </div>
      </div>
    </div>
  )
}
