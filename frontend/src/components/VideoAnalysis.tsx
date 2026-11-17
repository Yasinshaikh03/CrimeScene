import React, { useState, useRef } from 'react'
import { apiService } from '../services/api'
import type { VideoAnalysisResponse, VideoFrameResult } from '../types/api'

const VIDEO_PRESETS = [
  {
    name: 'Burglary & Intrusion',
    text: 'suspect breaking in, person carrying stolen goods, dark room, flashlight beam',
  },
  {
    name: 'Surveillance & Activity',
    text: 'security camera footage, person running, vehicle arriving, empty hallway',
  },
  {
    name: 'Altercation & Violence',
    text: 'physical fight, person holding weapon, crowd gathering, person on the ground',
  },
]

export const VideoAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [descriptionsText, setDescriptionsText] = useState<string>(
    'burglary suspect breaking in, dark night scene, security camera footage, police car'
  )
  const [intervalSeconds, setIntervalSeconds] = useState<number>(2.0)
  const [maxFrames, setMaxFrames] = useState<number>(15)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [videoResults, setVideoResults] = useState<VideoAnalysisResponse | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<VideoFrameResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    const validExtensions = ['.mp4', '.avi', '.mov']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(ext)) {
      setError('Please upload a supported video format: MP4, AVI, or MOV.')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size must not exceed 100 MB.')
      return
    }

    setError(null)
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreviewUrl(url)
    setVideoResults(null)
    setSelectedFrame(null)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
    }
    setVideoResults(null)
    setSelectedFrame(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!selectedFile) {
      setError('Please select a video file to analyze.')
      return
    }

    if (!descriptionsText.trim()) {
      setError('Please provide at least one text description.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.analyzeVideo(
        selectedFile,
        descriptionsText.trim(),
        intervalSeconds,
        maxFrames
      )
      setVideoResults(response)
      if (response.frames && response.frames.length > 0) {
        setSelectedFrame(response.frames[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analysis-view">
      <div className="section-header">
        <h2 className="section-title">
          <span>🎥</span> Surveillance Video Timeline Analysis
        </h2>
        <p className="section-subtitle">
          Extract key surveillance frames at configurable intervals, generate visual preview thumbnails, 
          and track forensic event likelihood across the temporal timeline.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <span>⚠️</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="two-column-layout">
        {/* Left Column: Video Controls */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title">1. Video Ingestion & Settings</h3>

          {/* Video Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">Upload Video Footage (MP4, AVI, MOV - Max 100MB)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".mp4,.avi,.mov"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0])
                }
              }}
            />

            {!videoPreviewUrl ? (
              <div
                className="dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0])
                  }
                }}
              >
                <div className="dropzone-icon">📼</div>
                <div className="dropzone-text">Click or drag & drop video file here</div>
                <div className="dropzone-subtext">MP4, AVI, MOV up to 100 MB</div>
              </div>
            ) : (
              <div className="file-preview">
                <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '240px' }} />
                <button
                  className="file-remove-btn"
                  onClick={handleClearFile}
                  title="Remove video"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Candidate Descriptions */}
          <div className="form-group">
            <label className="form-label">Candidate Investigative Descriptions</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={descriptionsText}
              onChange={(e) => setDescriptionsText(e.target.value)}
              placeholder="e.g. suspect breaking in, getaway car, police officer (comma or newline separated)"
            />
            <div className="form-hint">
              Supports comma-separated items, line-by-line entries, or full sentences.
            </div>
          </div>

          {/* Presets */}
          <div className="form-group">
            <label className="form-label">Presets:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {VIDEO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDescriptionsText(preset.text)}
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sampling Interval Slider */}
          <div className="form-group">
            <label className="form-label">Sampling Interval: Every {intervalSeconds} seconds</label>
            <div className="range-container">
              <input
                type="range"
                className="range-slider"
                min={0.5}
                max={10.0}
                step={0.5}
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(parseFloat(e.target.value))}
              />
              <span className="range-value">{intervalSeconds}s</span>
            </div>
          </div>

          {/* Max Frames Slider */}
          <div className="form-group">
            <label className="form-label">Max Sampled Frames: {maxFrames} frames</label>
            <div className="range-container">
              <input
                type="range"
                className="range-slider"
                min={1}
                max={30}
                step={1}
                value={maxFrames}
                onChange={(e) => setMaxFrames(parseInt(e.target.value))}
              />
              <span className="range-value">{maxFrames}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={handleAnalyzeVideo}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Decoding Video & Running CLIP...</span>
              </>
            ) : (
              <>
                <span>Extract Frames & Analyze Video</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Timeline & Frame Inspection */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title">2. Video Timeline & Sampled Frames</h3>

          {!videoResults && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⏱️</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Video Analyzed Yet</div>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                Upload a surveillance clip to generate frame previews and timeline similarity curves.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: 36, height: 36, marginBottom: 16 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Seeking Video Keyframes & Computing CLIP Embeddings...
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Sampling at {intervalSeconds}s intervals up to {maxFrames} frames
              </p>
            </div>
          )}

          {videoResults && (
            <div>
              {/* Metadata Badges */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="badge badge-cyan">Duration: {videoResults.duration_seconds}s</span>
                <span className="badge badge-violet">FPS: {videoResults.fps}</span>
                <span className="badge badge-emerald">Analyzed: {videoResults.analyzed_frames} Frames</span>
                <span className="badge badge-amber">Total: {videoResults.total_video_frames} Frames</span>
              </div>

              {/* Horizontal Timeline Strip of Frame Thumbnails */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                  Sampled Frames Timeline (Click frame to inspect):
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    paddingBottom: 10,
                    paddingTop: 4,
                  }}
                >
                  {videoResults.frames.map((frame) => {
                    const isSelected = selectedFrame?.frame_index === frame.frame_index
                    const topResult = frame.results[0]

                    return (
                      <div
                        key={frame.frame_index}
                        onClick={() => setSelectedFrame(frame)}
                        style={{
                          flex: '0 0 130px',
                          cursor: 'pointer',
                          background: 'rgba(10, 17, 32, 0.8)',
                          borderRadius: 8,
                          border: `2px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                          overflow: 'hidden',
                          boxShadow: isSelected ? '0 0 14px rgba(6, 182, 212, 0.5)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Thumbnail image generated by backend */}
                        <div style={{ position: 'relative', width: '100%', height: '85px', background: '#000' }}>
                          {frame.thumbnail_base64 ? (
                            <img
                              src={frame.thumbnail_base64}
                              alt={`Frame ${frame.frame_index}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', color: '#666' }}>
                              No preview
                            </div>
                          )}
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              background: 'rgba(0,0,0,0.75)',
                              color: '#fff',
                              fontSize: '0.68rem',
                              padding: '2px 5px',
                              borderRadius: 4,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {frame.timestamp_seconds.toFixed(1)}s
                          </span>
                        </div>

                        {/* Top Match summary */}
                        <div style={{ padding: '6px 8px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            Score: {topResult ? topResult.cosine_similarity.toFixed(3) : 'N/A'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={topResult?.description}
                          >
                            {topResult?.description || ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Frame Detail Inspector */}
              {selectedFrame && (
                <div style={{ background: 'rgba(10, 17, 32, 0.85)', padding: 16, borderRadius: 10, border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Selected Frame #{selectedFrame.frame_index}
                      </span>
                      <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        at timestamp <strong>{selectedFrame.timestamp_seconds.toFixed(2)}s</strong>
                      </span>
                    </div>
                    <span className="badge badge-cyan">CLIP Similarity Ranking</span>
                  </div>

                  {/* Frame Large Preview + Rankings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start' }}>
                    {selectedFrame.thumbnail_base64 && (
                      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-glass)', background: '#000' }}>
                        <img
                          src={selectedFrame.thumbnail_base64}
                          alt={`Frame ${selectedFrame.frame_index} full preview`}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      {selectedFrame.results.map((resItem, rIdx) => {
                        const pct = Math.min(Math.max((resItem.cosine_similarity - 0.1) / 0.3, 0.05), 1.0) * 100

                        return (
                          <div key={rIdx} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
                              <span style={{ fontWeight: 600, color: rIdx === 0 ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                                {rIdx === 0 && '⭐ '}
                                {resItem.description}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                {resItem.cosine_similarity.toFixed(4)}
                              </span>
                            </div>
                            <div className="similarity-bar-bg" style={{ height: 6 }}>
                              <div
                                className="similarity-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: rIdx === 0 ? 'linear-gradient(90deg, #06b6d4, #10b981)' : 'linear-gradient(90deg, #0284c7, #8b5cf6)',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="forensic-disclaimer">
                <strong>Forensic Disclaimer:</strong> {videoResults.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
