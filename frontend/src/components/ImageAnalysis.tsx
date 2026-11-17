import React, { useState, useRef } from 'react'
import { apiService } from '../services/api'
import type { ImageAnalysisResponse } from '../types/api'

const PRESET_DESCRIPTIONS = [
  {
    name: 'Weapon & Suspect',
    tags: ['a suspect holding a handgun', 'a knife on the floor', 'person wearing a mask', 'police officer'],
  },
  {
    name: 'Forced Entry',
    tags: ['broken window glass', 'crowbar near door', 'prying open door lock', 'undisturbed entryway'],
  },
  {
    name: 'Vehicle & Traffic',
    tags: ['dark getaway sedan', 'white delivery van', 'emergency vehicle lights', 'empty street at night'],
  },
]

export const ImageAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [descriptionsText, setDescriptionsText] = useState<string>(
    'a suspect holding a weapon, blood stains on the floor, broken glass, security guard'
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ImageAnalysisResponse | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    const validExtensions = ['.jpg', '.jpeg', '.png']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(ext)) {
      setError('Please upload a valid JPG, JPEG, or PNG image.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must not exceed 10 MB.')
      return
    }

    setError(null)
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setResults(null)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload an image before analyzing.')
      return
    }

    if (!descriptionsText.trim()) {
      setError('Please provide at least one text description.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.analyzeImage(selectedFile, descriptionsText)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const loadPreset = (tags: string[]) => {
    setDescriptionsText(tags.join(', '))
  }

  return (
    <div className="analysis-view">
      <div className="section-header">
        <h2 className="section-title">
          <span>🖼️</span> Image Evidence Analysis
        </h2>
        <p className="section-subtitle">
          Submit photographic evidence against candidate investigative hypotheses. CLIP projects text and image 
          into a shared forensic embedding space to determine relative cosine similarity.
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
        {/* Left Column: Upload & Inputs */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title">1. Evidence Input</h3>

          {/* File Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">Upload Image File (JPG, PNG - Max 10MB)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0])
                }
              }}
            />

            {!previewUrl ? (
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
                <div className="dropzone-icon">📷</div>
                <div className="dropzone-text">Click or drag & drop evidence image here</div>
                <div className="dropzone-subtext">JPG, JPEG, PNG up to 10 MB</div>
              </div>
            ) : (
              <div className="file-preview">
                <img src={previewUrl} alt="Evidence preview" />
                <button
                  className="file-remove-btn"
                  onClick={handleClearFile}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Candidate Descriptions */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                2. Candidate Hypotheses
              </label>
              <span className="badge badge-cyan">Flexible Parsing</span>
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              value={descriptionsText}
              onChange={(e) => setDescriptionsText(e.target.value)}
              placeholder="e.g. suspect holding a weapon, blood stain, broken glass (comma or newline separated)"
            />
            <div className="form-hint">
              Supports comma-separated keywords, multiline entries, or natural sentences.
            </div>
          </div>

          {/* Quick Presets */}
          <div className="form-group">
            <label className="form-label">Quick Forensic Presets:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESET_DESCRIPTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadPreset(preset.tags)}
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 10 }}
            onClick={handleAnalyze}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Running CLIP Neural Inference...</span>
              </>
            ) : (
              <>
                <span>Run CLIP Analysis</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Ranked Results */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title">3. Ranked Similarity Findings</h3>
            {results && <span className="badge badge-emerald">Inference Complete</span>}
          </div>

          {!results && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📊</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Analysis Results Yet</div>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                Upload an image and click "Run CLIP Analysis" to see ranked similarity scores.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: 36, height: 36, marginBottom: 16 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Comparing Image Embeddings against Hypotheses...
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Running forward pass through OpenAI CLIP ViT-B/32
              </p>
            </div>
          )}

          {results && (
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Evaluated <strong>{results.total_descriptions}</strong> candidate descriptions for{' '}
                <code>{results.filename}</code>
              </div>

              <div className="similarity-list">
                {results.results.map((item, idx) => {
                  // Normalize score for bar display (CLIP cosine similarities typically range 0.15 - 0.40)
                  const normalizedPct = Math.min(Math.max((item.cosine_similarity - 0.1) / 0.3, 0.05), 1.0) * 100

                  return (
                    <div key={idx} className="similarity-item">
                      <div className="similarity-header">
                        <span className="similarity-desc">
                          {idx === 0 && <span style={{ marginRight: 6 }}>🥇</span>}
                          {item.description}
                        </span>
                        <span className="similarity-score">{item.cosine_similarity.toFixed(4)}</span>
                      </div>
                      <div className="similarity-bar-bg">
                        <div
                          className="similarity-bar-fill"
                          style={{
                            width: `${normalizedPct}%`,
                            background:
                              idx === 0
                                ? 'linear-gradient(90deg, #06b6d4, #10b981)'
                                : 'linear-gradient(90deg, #0284c7, #8b5cf6)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="forensic-disclaimer">
                <strong>Forensic Disclaimer:</strong> {results.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
