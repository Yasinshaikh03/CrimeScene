import React from 'react'
import type { RankedDescriptionResult, ExtractedFrame } from '../types'
import { SparklesIcon, EyeIcon } from '../../../components/common/Icons'

interface SimilarityResultsProps {
  rankedResults: RankedDescriptionResult[]
  frames: ExtractedFrame[]
  onSelectFrameById: (frameId: string) => void
  threshold: number
}

export const SimilarityResults: React.FC<SimilarityResultsProps> = ({
  rankedResults,
  frames,
  onSelectFrameById,
  threshold
}) => {
  return (
    <div className="similarity-results-card glass-panel">
      <div className="results-header">
        <div className="results-title-wrap">
          <SparklesIcon size={20} className="icon-cyan" />
          <div className="results-title-text">
            <h3>Overall Ranked Similarity Matches</h3>
            <span className="results-subtitle">
              Ranked by peak multi-modal CLIP cosine similarity across video timeline
            </span>
          </div>
        </div>

        <div className="results-stats-badge">
          <span>{rankedResults.length} Cues Evaluated</span>
        </div>
      </div>

      <div className="ranked-list">
        {rankedResults.map((result, index) => {
          const isHigh = result.peakSimilarity >= threshold
          const rank = index + 1
          const matchedFrame = frames.find((f) => f.id === result.bestFrameId)

          return (
            <div
              key={result.description}
              className={`ranked-item-row ${rank === 1 ? 'first-place' : ''} ${isHigh ? 'alert-match' : ''}`}
            >
              <div className="rank-badge">
                <span>#{rank}</span>
              </div>

              {matchedFrame && (
                <div
                  className="matched-frame-mini"
                  onClick={() => onSelectFrameById(result.bestFrameId)}
                  title="Click to view peak frame"
                >
                  <img src={matchedFrame.dataUrl} alt="Peak keyframe thumbnail" />
                  <span className="mini-time">{result.bestTimestampFormatted}</span>
                </div>
              )}

              <div className="ranked-content">
                <div className="ranked-top-row">
                  <span className="ranked-description">{result.description}</span>
                  <div className="ranked-score-wrap">
                    <span className="peak-label">Peak Match:</span>
                    <span className={`peak-value ${isHigh ? 'high' : ''}`}>
                      {(result.peakSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="ranked-bar-track">
                  <div
                    className={`ranked-bar-fill ${rank === 1 ? 'top-fill' : ''} ${isHigh ? 'alert-fill' : ''}`}
                    style={{ width: `${Math.min(100, result.peakSimilarity * 100)}%` }}
                  />
                </div>

                <div className="ranked-footer-row">
                  <span className="best-time-text">
                    Peak occurrence at <strong>{result.bestTimestampFormatted}</strong>
                  </span>
                  <button
                    type="button"
                    className="jump-frame-btn"
                    onClick={() => onSelectFrameById(result.bestFrameId)}
                  >
                    <EyeIcon size={14} />
                    <span>Inspect Peak Frame</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
