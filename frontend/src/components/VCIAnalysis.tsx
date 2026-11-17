import React, { useState, useRef } from 'react'
import { apiService } from '../services/api'
import type { VCIAnalysisResponse, VCIRegion } from '../types/api'

export const VCIAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState<string>('a suspect holding a handgun')
  const [gridSize, setGridSize] = useState<number>(4)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [vciResult, setVciResult] = useState<VCIAnalysisResponse | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<VCIRegion | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<VCIRegion | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65)

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
    setVciResult(null)
    setSelectedRegion(null)
    setHoveredRegion(null)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setVciResult(null)
    setSelectedRegion(null)
    setHoveredRegion(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyzeVCI = async () => {
    if (!selectedFile) {
      setError('Please upload an evidence image first.')
      return
    }

    if (!description.trim()) {
      setError('Please provide a target description to evaluate.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await apiService.analyzeImageVCI(selectedFile, description.trim(), gridSize)
      setVciResult(result)
      setSelectedRegion(null)
      setHoveredRegion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Visual Counterfactual analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  // Compute color based on sensitivity change
  const getRegionStyle = (region: VCIRegion) => {
    const isSelected = selectedRegion && selectedRegion.row === region.row && selectedRegion.column === region.column
    const isHovered = hoveredRegion && hoveredRegion.row === region.row && hoveredRegion.column === region.column

    // Find max positive delta in results to scale color intensity
    const maxDelta = vciResult?.regions.reduce((max, r) => Math.max(max, r.similarity_change), 0.05) || 0.1
    const intensity = Math.min(Math.max(region.similarity_change / maxDelta, 0), 1)

    let bgColor = 'rgba(100, 116, 139, 0.1)'
    let borderColor = 'rgba(100, 116, 139, 0.3)'

    if (region.similarity_change > 0.005) {
      // Positive impact: masking this patch hurt similarity (meaning this patch supports the hypothesis)
      bgColor = `rgba(6, 182, 212, ${intensity * overlayOpacity})`
      borderColor = isSelected || isHovered ? '#38bdf8' : `rgba(6, 182, 212, 0.6)`
    } else if (region.similarity_change < -0.005) {
      // Negative impact: masking this patch helped similarity
      bgColor = `rgba(244, 63, 94, ${Math.abs(region.similarity_change) * 5 * overlayOpacity})`
      borderColor = isSelected || isHovered ? '#f43f5e' : `rgba(244, 63, 94, 0.5)`
    }

    if (isSelected || isHovered) {
      borderColor = '#f8fafc'
    }

    return {
      backgroundColor: bgColor,
      border: `2px solid ${borderColor}`,
      cursor: 'pointer',
      boxShadow: isSelected || isHovered ? '0 0 12px rgba(255, 255, 255, 0.7)' : 'none',
      transition: 'all 0.15s ease',
      zIndex: isSelected || isHovered ? 10 : 1,
    }
  }

  const activeRegion = hoveredRegion || selectedRegion

  return (
    <div className="analysis-view">
      <div className="section-header">
        <h2 className="section-title">
          <span>🔬</span> Visual Counterfactual Intelligence (VCI)
        </h2>
        <p className="section-subtitle">
          Interrogate neural model reasoning with spatial perturbation counterfactuals: 
          <em> "What if this region were removed? How does model confidence change?"</em>
          A positive drop indicates that the masked region contained decisive visual evidence supporting the hypothesis.
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
        {/* Left Column: Form Controls */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title">1. VCI Experiment Settings</h3>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Evidence Image</label>
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
                <div className="dropzone-icon">🔬</div>
                <div className="dropzone-text">Upload image for counterfactual testing</div>
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

          {/* Target Hypothesis */}
          <div className="form-group">
            <label className="form-label">Target Forensic Hypothesis to Interrogate</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. a suspect holding a handgun, blood stains on carpet"
            />
            <div className="form-hint">
              VCI masks spatial regions to test sensitivity specifically toward this description.
            </div>
          </div>

          {/* Grid Size Slider */}
          <div className="form-group">
            <label className="form-label">
              Spatial Grid Density: {gridSize} × {gridSize} ({gridSize * gridSize} total regions)
            </label>
            <div className="range-container">
              <input
                type="range"
                className="range-slider"
                min={2}
                max={8}
                step={1}
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
              />
              <span className="range-value">{gridSize}×{gridSize}</span>
            </div>
            <div className="form-hint">
              Higher grid density provides finer spatial localization (3×3 or 4×4 recommended for speed).
            </div>
          </div>

          {/* Overlay Opacity Slider (visible when results exist) */}
          {vciResult && (
            <div className="form-group">
              <label className="form-label">Heatmap Overlay Opacity: {Math.round(overlayOpacity * 100)}%</label>
              <div className="range-container">
                <input
                  type="range"
                  className="range-slider"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                />
                <span className="range-value">{Math.round(overlayOpacity * 100)}%</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={handleAnalyzeVCI}
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Perturbing {gridSize * gridSize} Grid Regions...</span>
              </>
            ) : (
              <>
                <span>Compute VCI Sensitivity Map</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Heatmap Overlay & Inspector */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="card-title">2. Counterfactual Heatmap & Region Inspector</h3>

          {!vciResult && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🗺️</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Heatmap Generated Yet</div>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                Upload an image, set a hypothesis, and compute VCI to explore region sensitivities.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: 36, height: 36, marginBottom: 16 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Systematically Masking {gridSize * gridSize} Image Patches...
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Running counterfactual perturbation passes through OpenAI CLIP
              </p>
            </div>
          )}

          {vciResult && previewUrl && (
            <div>
              {/* Baseline Metrics Bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140, padding: 10, background: 'rgba(10, 17, 32, 0.7)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline Similarity</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {vciResult.original_similarity.toFixed(4)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 140, padding: 10, background: 'rgba(10, 17, 32, 0.7)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluated Hypothesis</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    "{vciResult.description}"
                  </div>
                </div>
              </div>

              {/* Interactive Heatmap Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid var(--border-glass)',
                  marginBottom: 16,
                }}
              >
                <img
                  src={previewUrl}
                  alt="VCI Base"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />

                {/* CSS Grid Overlay directly over image */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${vciResult.grid_size}, 1fr)`,
                    gridTemplateRows: `repeat(${vciResult.grid_size}, 1fr)`,
                  }}
                >
                  {vciResult.regions.map((region) => (
                    <div
                      key={`${region.row}-${region.column}`}
                      style={getRegionStyle(region)}
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(region)}
                      title={`Region [${region.row}, ${region.column}]: Δ ${region.similarity_change > 0 ? '+' : ''}${region.similarity_change.toFixed(4)}`}
                    />
                  ))}
                </div>
              </div>

              {/* Region Detail Inspector */}
              <div style={{ padding: 14, background: 'rgba(10, 17, 32, 0.8)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeRegion
                      ? `Selected Patch: Row ${activeRegion.row}, Column ${activeRegion.column}`
                      : 'Hover or click any grid cell on the image to inspect region evidence'}
                  </span>
                  {activeRegion && (
                    <span
                      className={`badge ${
                        activeRegion.similarity_change > 0
                          ? 'badge-emerald'
                          : activeRegion.similarity_change < 0
                          ? 'badge-rose'
                          : 'badge-cyan'
                      }`}
                    >
                      Δ {activeRegion.similarity_change > 0 ? '+' : ''}
                      {activeRegion.similarity_change.toFixed(4)}
                    </span>
                  )}
                </div>

                {activeRegion ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <div>
                      Masked Similarity: <strong>{activeRegion.masked_similarity.toFixed(4)}</strong> (Baseline:{' '}
                      {vciResult.original_similarity.toFixed(4)})
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {activeRegion.similarity_change > 0 ? (
                        <span style={{ color: 'var(--accent-emerald)' }}>
                          ✓ High Evidence Impact: Masking this region caused similarity to drop. This spatial patch
                          strongly supports the description "{vciResult.description}".
                        </span>
                      ) : activeRegion.similarity_change < 0 ? (
                        <span style={{ color: 'var(--accent-rose)' }}>
                          ✕ Suppressive Impact: Masking this region increased similarity. This patch may contain features
                          contradicting the description.
                        </span>
                      ) : (
                        <span>Neutral Region: Masking this patch produced negligible change.</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Legend: <span style={{ color: 'var(--accent-cyan)' }}>■ Cyan/Green</span> = Supporting Evidence |{' '}
                    <span style={{ color: 'var(--accent-rose)' }}>■ Red</span> = Contradictory Evidence
                  </div>
                )}
              </div>

              <div className="forensic-disclaimer">
                <strong>VCI XAI Notice:</strong> {vciResult.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
