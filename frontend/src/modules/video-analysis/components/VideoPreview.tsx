import React, { useRef, useState, useEffect, useMemo } from 'react'
import { PlayIcon, PauseIcon } from '../../../components/common/Icons'
import { formatTimestamp } from '../services/mockVideoService'

interface VideoPreviewProps {
  videoFile: File
  onMetadataLoaded: (meta: { duration: number; width: number; height: number }) => void
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoFile,
  onMetadataLoaded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const videoSrc = useMemo(() => {
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(videoSrc)
    }
  }, [videoSrc])

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0
      const width = videoRef.current.videoWidth || 0
      const height = videoRef.current.videoHeight || 0
      setDuration(dur)
      onMetadataLoaded({ duration: dur, width, height })
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime
      setCurrentTime(targetTime)
    }
  }

  return (
    <div className="video-preview-wrapper glass-panel">
      <div className="video-player-container">
        <video
          ref={videoRef}
          src={videoSrc}
          className="video-element"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={togglePlay}
          playsInline
        />

        {/* Center Play Overlay when paused */}
        {!isPlaying && (
          <button
            type="button"
            className="center-play-btn"
            onClick={togglePlay}
            aria-label="Play video"
          >
            <PlayIcon size={28} />
          </button>
        )}

        {/* Video Forensic Status Overlay Tag */}
        <div className="video-overlay-badge">
          <span className="live-dot"></span>
          <span>VIDEO FEED</span>
        </div>
      </div>

      {/* Custom Control Bar */}
      <div className="video-controls-bar">
        <button
          type="button"
          className="ctrl-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>

        <span className="time-display current">{formatTimestamp(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="video-scrubber"
          aria-label="Video timeline scrubber"
        />

        <span className="time-display total">{formatTimestamp(duration)}</span>
      </div>
    </div>
  )
}
