import React, { useState, useMemo } from 'react'
import type { ExtractedFrame } from '../types'
import { FrameCard } from './FrameCard'
import { LayersIcon, AlertCircleIcon } from '../../../components/common/Icons'

interface FrameGalleryProps {
  frames: ExtractedFrame[]
  selectedFrameId?: string
  onSelectFrame: (frame: ExtractedFrame) => void
  threshold: number
}

export const FrameGallery: React.FC<FrameGalleryProps> = ({
  frames,
  selectedFrameId,
  onSelectFrame,
  threshold
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'high_confidence'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'score'>('time')

  const filteredFrames = useMemo(() => {
    let result = [...frames]

    if (filterMode === 'high_confidence') {
      result = result.filter((f) => f.topScore >= threshold)
    }

    if (sortBy === 'score') {
      result.sort((a, b) => b.topScore - a.topScore)
    } else {
      result.sort((a, b) => a.timestamp - b.timestamp)
    }

    return result
  }, [frames, filterMode, sortBy, threshold])

  const highConfidenceCount = frames.filter((f) => f.topScore >= threshold).length

  return (
    <div className="frame-gallery-container glass-panel">
      <div className="gallery-header">
        <div className="gallery-title-wrap">
          <LayersIcon size={20} className="icon-cyan" />
          <div className="gallery-title-text">
            <h3>Extracted Keyframe Analysis Gallery</h3>
            <span className="gallery-subtitle">
              {frames.length} frames analyzed ({highConfidenceCount} suspicious matches above {(threshold * 100).toFixed(0)}% threshold)
            </span>
          </div>
        </div>

        {/* Gallery Controls & Filters */}
        <div className="gallery-toolbar">
          <div className="filter-pill-group">
            <button
              type="button"
              className={`pill-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All ({frames.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${filterMode === 'high_confidence' ? 'active' : ''}`}
              onClick={() => setFilterMode('high_confidence')}
            >
              Alerts ({highConfidenceCount})
            </button>
          </div>

          <div className="sort-select-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time' | 'score')}
              className="styled-select"
            >
              <option value="time">Timeline Order</option>
              <option value="score">Highest Match First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Frame Cards Grid */}
      {filteredFrames.length === 0 ? (
        <div className="gallery-empty">
          <AlertCircleIcon size={24} />
          <p>No frames matched the active filter threshold ({(threshold * 100).toFixed(0)}%).</p>
          <button
            type="button"
            className="reset-filter-btn"
            onClick={() => setFilterMode('all')}
          >
            Show All Frames
          </button>
        </div>
      ) : (
        <div className="frames-grid">
          {filteredFrames.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              isSelected={frame.id === selectedFrameId}
              onSelect={onSelectFrame}
              threshold={threshold}
            />
          ))}
        </div>
      )}
    </div>
  )
}
