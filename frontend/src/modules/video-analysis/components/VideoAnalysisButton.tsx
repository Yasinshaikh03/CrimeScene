import React from 'react'
import { SparklesIcon } from '../../../components/common/Icons'

interface VideoAnalysisButtonProps {
  onAnalyze: () => void
  disabled: boolean
  isProcessing: boolean
  disabledReason?: string
}

export const VideoAnalysisButton: React.FC<VideoAnalysisButtonProps> = ({
  onAnalyze,
  disabled,
  isProcessing,
  disabledReason
}) => {
  return (
    <div className="analysis-button-wrapper">
      <button
        type="button"
        className={`video-analysis-btn ${isProcessing ? 'processing' : ''}`}
        onClick={onAnalyze}
        disabled={disabled || isProcessing}
      >
        <span className="btn-glow-ring"></span>
        <div className="btn-content">
          <SparklesIcon size={20} className={isProcessing ? 'spin' : ''} />
          <span className="btn-text">
            {isProcessing ? 'Analyzing Video Forensics...' : 'Run CLIP & VCI Video Analysis'}
          </span>
        </div>
      </button>

      {disabled && disabledReason && (
        <span className="btn-disabled-hint">{disabledReason}</span>
      )}
    </div>
  )
}
