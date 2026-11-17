import React from 'react'
import type { VideoMetadataInfo } from '../types'
import { formatBytes, formatTimestamp } from '../services/mockVideoService'
import { VideoIcon, TrashIcon, RefreshIcon } from '../../../components/common/Icons'

interface VideoMetadataProps {
  metadata: VideoMetadataInfo
  onReplace: () => void
  onRemove: () => void
  disabled?: boolean
}

export const VideoMetadata: React.FC<VideoMetadataProps> = ({
  metadata,
  onReplace,
  onRemove,
  disabled = false
}) => {
  return (
    <div className="video-metadata-card glass-panel">
      <div className="meta-left">
        <div className="meta-icon-badge">
          <VideoIcon size={20} />
        </div>
        <div className="meta-info">
          <div className="meta-name" title={metadata.name}>
            {metadata.name}
          </div>
          <div className="meta-tags">
            <span className="meta-pill">{formatBytes(metadata.size)}</span>
            <span className="meta-pill">{formatTimestamp(metadata.duration)} duration</span>
            {metadata.width > 0 && (
              <span className="meta-pill">
                {metadata.width} × {metadata.height}
              </span>
            )}
            <span className="meta-pill format">{metadata.type.split('/')[1]?.toUpperCase() || 'VIDEO'}</span>
          </div>
        </div>
      </div>

      <div className="meta-actions">
        <button
          type="button"
          className="meta-btn replace"
          onClick={onReplace}
          disabled={disabled}
          title="Choose a different video"
        >
          <RefreshIcon size={14} />
          <span>Replace</span>
        </button>
        <button
          type="button"
          className="meta-btn remove"
          onClick={onRemove}
          disabled={disabled}
          title="Remove video"
        >
          <TrashIcon size={14} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}
