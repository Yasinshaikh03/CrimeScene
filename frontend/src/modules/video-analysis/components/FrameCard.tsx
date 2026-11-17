import React, { useState } from 'react'
import type { ExtractedFrame } from '../types'
import { FlameIcon } from '../../../components/common/Icons'

interface FrameCardProps {
  frame: ExtractedFrame
  isSelected: boolean
  onSelect: (frame: ExtractedFrame) => void
  threshold: number
}

export const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  isSelected,
  onSelect,
  threshold
}) => {
  const [showVCI, setShowVCI] = useState(false)
  const isHighConfidence = frame.topScore >= threshold

  const currentImg = showVCI && frame.vciHeatmapUrl ? frame.vciHeatmapUrl : frame.dataUrl

  return (
    <div
      className={`frame-card glass-panel ${isSelected ? 'selected' : ''} ${isHighConfidence ? 'high-confidence' : ''}`}
      onClick={() => onSelect(frame)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(frame)
      }}
    >
      <div className="frame-thumbnail-wrap">
        <img
          src={currentImg}
          alt={`Frame at ${frame.timestampFormatted}`}
          className="frame-thumbnail"
          loading="lazy"
        />

        <div className="frame-badge-row">
          <span className="frame-time-pill">{frame.timestampFormatted}</span>
          {isHighConfidence && <span className="frame-match-pill">Match Alert</span>}
        </div>

        {/* Quick VCI Toggle if heatmap available */}
        {frame.vciHeatmapUrl && (
          <button
            type="button"
            className={`frame-vci-btn ${showVCI ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowVCI(!showVCI)
            }}
            title={showVCI ? 'Show Original Frame' : 'Show VCI Heatmap'}
          >
            <FlameIcon size={13} />
            <span>{showVCI ? 'VCI On' : 'VCI'}</span>
          </button>
        )}
      </div>

      <div className="frame-card-body">
        <div className="frame-top-desc" title={frame.topDescription}>
          {frame.topDescription || 'No prompt match'}
        </div>

        <div className="frame-score-bar-row">
          <div className="score-label-wrap">
            <span className="score-label">CLIP Similarity</span>
            <span className={`score-value ${isHighConfidence ? 'high' : ''}`}>
              {(frame.topScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mini-score-track">
            <div
              className={`mini-score-fill ${isHighConfidence ? 'high' : ''}`}
              style={{ width: `${Math.min(100, frame.topScore * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
