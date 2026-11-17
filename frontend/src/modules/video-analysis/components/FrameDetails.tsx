import React, { useState } from 'react'
import type { ExtractedFrame } from '../types'
import { CloseIcon, FlameIcon, EyeIcon, SparklesIcon, ShieldAlertIcon } from '../../../components/common/Icons'

interface FrameDetailsProps {
  frame: ExtractedFrame
  onClose: () => void
  threshold: number
}

export const FrameDetails: React.FC<FrameDetailsProps> = ({
  frame,
  onClose,
  threshold
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'vci' | 'split'>('split')

  return (
    <div className="frame-details-modal-backdrop" onClick={onClose}>
      <div className="frame-details-dialog glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="dialog-header">
          <div className="dialog-title-wrap">
            <ShieldAlertIcon size={20} className="icon-cyan" />
            <div className="dialog-title-text">
              <h3>Keyframe Forensic Inspection</h3>
              <span className="dialog-subtitle">
                Frame #{frame.index + 1} at timestamp <span className="highlight-pill">{frame.timestampFormatted}</span>
              </span>
            </div>
          </div>

          <div className="dialog-header-actions">
            {frame.vciHeatmapUrl && (
              <div className="view-mode-pill-group">
                <button
                  type="button"
                  className={`mode-btn ${viewMode === 'original' ? 'active' : ''}`}
                  onClick={() => setViewMode('original')}
                >
                  <EyeIcon size={14} />
                  <span>Original</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${viewMode === 'vci' ? 'active' : ''}`}
                  onClick={() => setViewMode('vci')}
                >
                  <FlameIcon size={14} />
                  <span>VCI Heatmap</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                >
                  <span>Side-by-Side</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className="dialog-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="dialog-body">
          {/* Visual Display */}
          <div className="dialog-visual-section">
            {viewMode === 'split' && frame.vciHeatmapUrl ? (
              <div className="split-view-container">
                <div className="split-pane">
                  <span className="pane-label">Original Keyframe</span>
                  <img src={frame.dataUrl} alt="Original keyframe" className="dialog-img" />
                </div>
                <div className="split-pane">
                  <span className="pane-label vci">VCI Counterfactual Heatmap</span>
                  <img src={frame.vciHeatmapUrl} alt="VCI Heatmap" className="dialog-img" />
                </div>
              </div>
            ) : (
              <div className="single-view-container">
                <img
                  src={viewMode === 'vci' && frame.vciHeatmapUrl ? frame.vciHeatmapUrl : frame.dataUrl}
                  alt="Inspected keyframe"
                  className="dialog-img"
                />
                <span className="single-pane-badge">
                  {viewMode === 'vci' ? 'VCI Spatial Attribution Map' : 'Surveillance Keyframe'}
                </span>
              </div>
            )}
          </div>

          {/* Forensic Similarity Breakdown */}
          <div className="dialog-scores-section">
            <div className="scores-header">
              <SparklesIcon size={16} className="icon-violet" />
              <h4>CLIP Similarity Scores for Frame #{frame.index + 1}</h4>
            </div>

            <div className="frame-scores-list">
              {frame.scores.map((item, idx) => {
                const isOverThreshold = item.cosineSimilarity >= threshold
                const isTop = idx === 0

                return (
                  <div
                    key={idx}
                    className={`score-item-row ${isTop ? 'top-match' : ''} ${isOverThreshold ? 'over-threshold' : ''}`}
                  >
                    <div className="score-desc-wrap">
                      <div className="score-desc-title">
                        {isTop && <span className="top-indicator">Top Cue</span>}
                        <span>{item.description}</span>
                      </div>
                      <span className="score-pct">
                        {(item.cosineSimilarity * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="score-bar-track">
                      <div
                        className={`score-bar-fill ${isTop ? 'top' : ''}`}
                        style={{ width: `${Math.min(100, item.cosineSimilarity * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="dialog-forensic-note">
              <span className="note-label">Forensic Notice:</span> Similarity scores represent CLIP cosine embedding distances between visual frame tokens and target prompt text. They are investigative leads, not definitive proof.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
