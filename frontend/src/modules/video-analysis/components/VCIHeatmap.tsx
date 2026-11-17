import React, { useState } from 'react'
import type { ExtractedFrame } from '../types'
import { FlameIcon } from '../../../components/common/Icons'

interface VCIHeatmapProps {
  frames: ExtractedFrame[]
  selectedFrameId?: string
  onSelectFrame: (frame: ExtractedFrame) => void
}

export const VCIHeatmap: React.FC<VCIHeatmapProps> = ({
  frames,
  selectedFrameId,
  onSelectFrame
}) => {
  const [blendOpacity, setBlendOpacity] = useState<number>(0.7)

  // Find currently active frame or default to frame with highest topScore
  const activeFrame = 
    frames.find((f) => f.id === selectedFrameId) || 
    [...frames].sort((a, b) => b.topScore - a.topScore)[0] || 
    frames[0]

  if (!activeFrame || !activeFrame.vciHeatmapUrl) {
    return null
  }

  return (
    <div className="vci-heatmap-section glass-panel">
      <div className="vci-header">
        <div className="vci-title-wrap">
          <FlameIcon size={22} className="icon-rose" />
          <div className="vci-title-text">
            <h3>Visual Counterfactual Intelligence (VCI) Spatial Attribution</h3>
            <span className="vci-subtitle">
              Spatially identifies visual features directly contributing to the model's forensic alignment
            </span>
          </div>
        </div>

        <div className="vci-badge">
          <span>Counterfactual Active</span>
        </div>
      </div>

      <div className="vci-interactive-layout">
        {/* Interactive Viewer with Opacity Blend */}
        <div className="vci-canvas-wrapper">
          <div className="vci-image-container">
            {/* Base Image */}
            <img
              src={activeFrame.dataUrl}
              alt="Raw surveillance keyframe"
              className="vci-base-img"
            />
            {/* Heatmap Layer with variable opacity */}
            <img
              src={activeFrame.vciHeatmapUrl}
              alt="VCI Attribution Heatmap"
              className="vci-overlay-img"
              style={{ opacity: blendOpacity }}
            />

            <div className="vci-overlay-controls">
              <span className="vci-time-tag">{activeFrame.timestampFormatted}</span>
              <span className="vci-prompt-tag">Target: {activeFrame.topDescription}</span>
            </div>
          </div>

          {/* Opacity slider */}
          <div className="vci-slider-row">
            <span className="slider-label">Raw Frame</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blendOpacity}
              onChange={(e) => setBlendOpacity(parseFloat(e.target.value))}
              className="vci-opacity-slider"
              aria-label="VCI Heatmap blend opacity"
            />
            <span className="slider-label">VCI Heatmap ({(blendOpacity * 100).toFixed(0)}%)</span>
          </div>
        </div>

        {/* Heatmap Legend & Explanation */}
        <div className="vci-insights-panel">
          <h4 className="insights-title">Forensic Spatial Attribution</h4>
          <p className="insights-desc">
            VCI systematically perturbs spatial patches to isolate counterfactual regions without which the CLIP similarity drops significantly.
          </p>

          <div className="vci-legend">
            <div className="legend-gradient-bar"></div>
            <div className="legend-labels">
              <span>Neutral / Background</span>
              <span>High Critical Salience</span>
            </div>
          </div>

          <div className="vci-target-box">
            <div className="target-label">Top Matched Prompt:</div>
            <div className="target-value">"{activeFrame.topDescription}"</div>
            <div className="target-score">
              Attribution Confidence: <strong>{(activeFrame.topScore * 100).toFixed(1)}%</strong>
            </div>
          </div>

          {/* Keyframe Selector Carousel */}
          <div className="vci-quick-frames">
            <span className="quick-frames-title">Switch Inspected Keyframe:</span>
            <div className="quick-frames-scroll">
              {frames.slice(0, 8).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`quick-frame-thumb ${f.id === activeFrame.id ? 'active' : ''}`}
                  onClick={() => onSelectFrame(f)}
                >
                  <img src={f.dataUrl} alt={`Frame at ${f.timestampFormatted}`} />
                  <span className="thumb-time">{f.timestampFormatted}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
