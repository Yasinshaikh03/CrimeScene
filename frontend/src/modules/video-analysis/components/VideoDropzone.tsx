import React, { useRef, useState } from 'react'
import { UploadCloudIcon, VideoIcon } from '../../../components/common/Icons'
import { formatBytes } from '../services/videoService'

interface VideoDropzoneProps {
  onVideoSelected: (file: File) => void
  onError: (errorMessage: string) => void
  disabled?: boolean
}

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi']
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi']
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB limit for responsive in-browser analysis

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onVideoSelected,
  onError,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndHandleFile = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidExtension = ALLOWED_EXTENSIONS.includes(extension)
    const isValidMime = ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isValidExtension && !isValidMime) {
      onError(`Unsupported video format "${file.name}". Supported formats: MP4, MOV, AVI.`)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError(`File is too large (${formatBytes(file.size)}). Maximum allowed size is 100 MB.`)
      return
    }

    if (file.size === 0) {
      onError('Selected video file is empty.')
      return
    }

    onVideoSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0])
      // Reset input value so same file can be re-selected if removed
      e.target.value = ''
    }
  }

  return (
    <div
      className={`video-dropzone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          fileInputRef.current?.click()
        }
      }}
      aria-label="Upload video file for analysis"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div className="dropzone-glow"></div>

      <div className="dropzone-content">
        <div className="dropzone-icon-ring">
          <UploadCloudIcon size={32} />
        </div>

        <div className="dropzone-text">
          <h3 className="dropzone-title">Upload Crime Scene Surveillance Video</h3>
          <p className="dropzone-subtitle">
            Drag and drop your footage here, or <span className="browse-link">browse from device</span>
          </p>
        </div>

        <div className="dropzone-specs">
          <span className="spec-badge">
            <VideoIcon size={13} /> MP4, MOV, AVI
          </span>
          <span className="spec-divider">•</span>
          <span className="spec-item">Max 100 MB</span>
          <span className="spec-divider">•</span>
          <span className="spec-item">Temporal Sampling Enabled</span>
        </div>
      </div>
    </div>
  )
}
