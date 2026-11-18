import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CircleHelp,
  FileImage,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  ScanSearch,
} from './icons';
import { analyzeImage, checkServiceHealth, useMocks } from './services/photoService';
import type { AnalysisResponse } from './types';
import './PhotoAnalysis.css';

const STARTER_DESCRIPTIONS = [
  'A person walking through a building',
  'A person entering a building',
  'A person leaving a building',
  'A person standing near a vehicle',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB limit
const ACCEPTED = ['image/jpeg', 'image/png', 'image/jpg'];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function signed(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(4)}`;
}

function relativeWidth(scores: number[], score: number) {
  const low = Math.min(...scores);
  const high = Math.max(...scores);
  return high === low ? 100 : Math.round(18 + ((score - low) / (high - low)) * 82);
}

export const PhotoAnalysisPage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef('');

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [descriptions, setDescriptions] = useState(STARTER_DESCRIPTIONS);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [selected, setSelected] = useState(0);
  const [selectedCell, setSelectedCell] = useState(0);
  const [serviceOnline, setServiceOnline] = useState(false);

  const selectedOriginal = response?.results[selected]?.score ?? 0;

  useEffect(() => {
    let ignore = false;
    checkServiceHealth()
      .then((healthy) => {
        if (!ignore) setServiceOnline(healthy);
      })
      .catch(() => {
        if (!ignore) setServiceOnline(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function acceptFile(file?: File) {
    if (!file) return;
    setError('');
    setResponse(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidType =
      ACCEPTED.includes(file.type) || ['jpg', 'jpeg', 'png'].includes(ext || '');

    if (!isValidType) {
      setError('This file type is not supported. Choose a JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('This image is larger than 10 MB. Choose a smaller file to continue.');
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);
    setPreview(previewUrlRef.current);
    setImage(file);
  }

  function removeImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = '';
    setPreview('');
    setImage(null);
    setResponse(null);
  }

  function updateDescription(index: number, value: string) {
    setDescriptions((current) =>
      current.map((item, i) => (i === index ? value : item))
    );
    setResponse(null);
  }

  function addDescription() {
    setDescriptions((current) => [...current, '']);
    setResponse(null);
  }

  function removeDescription(index: number) {
    setDescriptions((current) => current.filter((_, i) => i !== index));
    setResponse(null);
  }

  async function submit() {
    setError('');
    if (!image) {
      setError('Add an image before starting the analysis.');
      return;
    }
    const cleanDescriptions = descriptions.map((item) => item.trim()).filter(Boolean);
    if (cleanDescriptions.length === 0) {
      setError('Add at least one description before starting the analysis.');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await analyzeImage(image, cleanDescriptions);
      setResponse(result);
      setSelected(0);
      setSelectedCell(0);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong during image analysis. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="photo-analysis-page">
      <div className="breadcrumbs">
        <span>Workspace</span>
        <span className="crumb-slash">/</span>
        <strong>Photo analysis</strong>
        <span className="crumb-tag">IMAGE EVIDENCE</span>
      </div>

      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> VISUAL INTELLIGENCE
          </div>
          <h1>Photo Analysis & Spatial VCI</h1>
          <p className="intro">
            Evaluate forensic alignment between photographic evidence and candidate hypotheses using OpenAI CLIP ViT-B/32.
          </p>
        </div>

        <div
          className={`service-pill ${loading ? 'service-working' : ''} ${
            useMocks ? 'service-mock' : serviceOnline ? '' : 'service-offline'
          }`}
        >
          <span className="service-dot" />
          {loading
            ? 'Analysis in progress'
            : useMocks
            ? 'Mock data mode'
            : serviceOnline
            ? 'FastAPI Backend Online'
            : 'Backend Disconnected'}
        </div>
      </section>

      {error && (
        <div className="notice error-banner">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            type="button"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="workspace-grid">
        {/* Step 1: Image Upload */}
        <div className="panel upload-panel">
          <div className="section-head">
            <span className="step-number">01</span>
            <h3 className="section-title">Evidence Photo</h3>
            <span className="section-meta">JPG, JPEG, PNG ≤ 10 MB</span>
          </div>

          {!preview ? (
            <div
              className={`dropzone ${dragging ? 'dropzone-dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud size={32} className="dropzone-icon" />
              <p className="dropzone-title">Upload Evidence Image</p>
              <p className="dropzone-hint">
                Drag and drop your photographic evidence file here, or click to browse
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => acceptFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div>
              <div className="image-preview-wrap">
                <img src={preview} alt="Evidence preview" />
              </div>
              <div className="preview-actions">
                <div className="file-info">
                  <span className="file-name">
                    <FileImage size={14} /> {image?.name}
                  </span>
                  <span className="file-size">{image ? formatSize(image.size) : ''}</span>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={removeImage}
                  disabled={loading}
                >
                  <Trash2 size={12} /> Replace Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Target Descriptions */}
        <div className="panel descriptions-panel">
          <div className="section-head">
            <span className="step-number">02</span>
            <h3 className="section-title">Forensic Candidate Descriptions</h3>
            <span className="section-meta">{descriptions.length} Hypotheses</span>
          </div>

          <div className="descriptions-list">
            {descriptions.map((desc, idx) => (
              <div key={idx} className="desc-input-row">
                <span className="desc-index">#{idx + 1}</span>
                <input
                  type="text"
                  className="desc-input"
                  value={desc}
                  placeholder={`Candidate hypothesis #${idx + 1}...`}
                  onChange={(e) => updateDescription(idx, e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="desc-btn-del"
                  onClick={() => removeDescription(idx)}
                  disabled={loading || descriptions.length <= 1}
                  title="Remove description"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-add-desc"
            onClick={addDescription}
            disabled={loading || descriptions.length >= 10}
          >
            <Plus size={14} /> Add Candidate Description
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="action-row">
        <button
          type="button"
          className="analyze-button"
          onClick={submit}
          disabled={loading || !image || !descriptions.some((d) => d.trim())}
        >
          {loading ? (
            <>
              <LoaderCircle size={16} className="spinner" /> Analyzing Photo with PyTorch CLIP...
            </>
          ) : (
            <>
              <ScanSearch size={16} /> Run Forensic Photo Analysis
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {response && (
        <section className="results-section">
          <div className="result-layout">
            {/* Left: Ranked Descriptions */}
            <div className="panel score-panel">
              <div className="result-card-heading">
                <div>
                  <h3>Ranked Descriptions</h3>
                  <p>Higher scores indicate closer multi-modal alignment</p>
                </div>
                <span className="score-label">CLIP COSINE SIMILARITY</span>
              </div>

              <div className="rank-list">
                {response.results.map((item, index) => (
                  <button
                    key={`${index}-${item.description}`}
                    className={`rank-row ${selected === index ? 'rank-selected' : ''}`}
                    onClick={() => setSelected(index)}
                    type="button"
                  >
                    <span className="rank-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="rank-content">
                      <span className="rank-description">{item.description}</span>
                      <span className="bar-track">
                        <span
                          className="bar-fill"
                          style={{
                            width: `${relativeWidth(
                              response.results.map((r) => r.score),
                              item.score
                            )}%`,
                          }}
                        />
                      </span>
                    </span>
                    <span className="score-value">{item.score.toFixed(4)}</span>
                    <ArrowUpRight size={14} className="rank-arrow" />
                  </button>
                ))}
              </div>

              <div className="result-explainer">
                <CircleHelp size={14} />
                <p>
                  {response.note ||
                    'Similarity scores are not probabilities or proof of an event.'}
                </p>
              </div>
            </div>

            {/* Right: VCI Region Contribution */}
            <div className="panel vci-panel">
              <div className="result-card-heading">
                <div>
                  <h3>Region Contribution</h3>
                  <p>How masking an image region shifts similarity</p>
                </div>
                <span className="vci-mark">
                  <Sparkles size={12} /> VCI 4×4
                </span>
              </div>

              <div className="vci-stats">
                <div>
                  <span>ORIGINAL SIMILARITY</span>
                  <strong>{selectedOriginal.toFixed(4)}</strong>
                </div>
                <div>
                  <span>MASKED SIMILARITY</span>
                  <strong>
                    {response.vci?.[selectedCell]?.maskedSimilarity.toFixed(4) ?? '—'}
                  </strong>
                </div>
                <div>
                  <span>SCORE CHANGE</span>
                  <strong className="change-value">
                    {response.vci?.[selectedCell]
                      ? signed(
                          selectedOriginal -
                            response.vci[selectedCell].maskedSimilarity
                        )
                      : '—'}
                  </strong>
                </div>
              </div>

              {response.vci && response.vci.length > 0 ? (
                <>
                  <div className="heatmap-wrap">
                    {preview && (
                      <img
                        src={preview}
                        alt="Evidence with region contribution grid overlay"
                      />
                    )}
                    <div className="heatmap-grid">
                      {response.vci.map((cell, index) => {
                        const change = selectedOriginal - cell.maskedSimilarity;
                        return (
                          <button
                            key={`${cell.row}-${cell.column}`}
                            onClick={() => setSelectedCell(index)}
                            className={`heat-cell ${
                              change > 0 ? 'heat-positive' : 'heat-negative'
                            } ${selectedCell === index ? 'heat-selected' : ''}`}
                            style={{
                              opacity:
                                0.2 + Math.min(Math.abs(change) * 4, 0.62),
                            }}
                            type="button"
                            title={`Row ${cell.row}, Col ${cell.column}: masked ${cell.maskedSimilarity.toFixed(
                              4
                            )}, change ${signed(change)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="legend">
                    <span>
                      <i className="legend-positive" /> Positive change (decisive region)
                    </span>
                    <span>
                      <i className="legend-negative" /> Negative change
                    </span>
                  </div>
                </>
              ) : (
                <div className="vci-unavailable">
                  <Sparkles size={16} />
                  <strong>VCI analysis is not available yet</strong>
                  <p>
                    The backend currently returns image similarity scores only. Region masking will appear here when the VCI endpoint is ready. Score change = original similarity − masked similarity.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
