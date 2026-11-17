import React from 'react'
import { ImageIcon } from './Icons'
import './SudevPlaceholder.css'

export const SudevPlaceholder: React.FC = () => {
  return (
    <div className="sudev-placeholder-container glass-panel">
      <div className="placeholder-icon-ring">
        <ImageIcon size={44} />
      </div>

      <div className="placeholder-content">
        <span className="glass-pill">Module Reserved</span>
        <h2 className="placeholder-title">Sudev's Photo Analysis Module</h2>
        <p className="placeholder-description">
          This workspace is reserved for Sudev's Photo Analysis module. The shared CrimeScene navigation,
          design tokens, and layout architecture are designed to host both Video Analysis and Photo Analysis
          without interference or merge conflicts.
        </p>

        <div className="placeholder-specs-card">
          <div className="spec-row">
            <span className="spec-name">Assigned Developer:</span>
            <span className="spec-val">Sudev</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Backend Endpoint:</span>
            <span className="spec-val">/api/analyze/image</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Model Architecture:</span>
            <span className="spec-val">OpenAI CLIP ViT-B/32</span>
          </div>
        </div>
      </div>
    </div>
  )
}
