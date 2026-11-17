import React from 'react'
import type { ProcessingStatus } from '../types'
import { SparklesIcon, LayersIcon, FlameIcon, CheckCircleIcon } from '../../../components/common/Icons'

interface ProcessingStateProps {
  status: ProcessingStatus
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ status }) => {
  const stages = [
    { key: 'extracting_frames', label: 'Frame Extraction', icon: LayersIcon },
    { key: 'computing_clip', label: 'CLIP Cosine Similarity', icon: SparklesIcon },
    { key: 'generating_vci', label: 'VCI Counterfactual Heatmaps', icon: FlameIcon },
    { key: 'completed', label: 'Completed', icon: CheckCircleIcon }
  ]

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'extracting_frames': return 0
      case 'computing_clip': return 1
      case 'generating_vci': return 2
      case 'completed': return 3
      default: return 0
    }
  }

  const currentIdx = getStageIndex(status.stage)

  return (
    <div className="processing-state-card glass-panel">
      <div className="processing-header">
        <div className="processing-spinner">
          <div className="spinner-core"></div>
        </div>
        <div className="processing-title-block">
          <h3 className="processing-title">Analyzing Video Surveillance Stream</h3>
          <p className="processing-message">{status.message}</p>
        </div>
        <div className="processing-percent">{status.progress}%</div>
      </div>

      {/* Progress Bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.max(5, status.progress)}%` }}
        >
          <div className="progress-glow"></div>
        </div>
      </div>

      {/* Stage Steps */}
      <div className="processing-stages">
        {stages.map((stageItem, idx) => {
          const Icon = stageItem.icon
          const isDone = idx < currentIdx || status.stage === 'completed'
          const isCurrent = idx === currentIdx && status.stage !== 'completed'

          return (
            <div
              key={stageItem.key}
              className={`stage-step ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
            >
              <div className="step-circle">
                <Icon size={14} />
              </div>
              <span className="step-label">{stageItem.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
