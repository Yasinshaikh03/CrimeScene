import React, { useState } from 'react'
import type { AnalysisConfig, CandidateDescription } from '../types'
import { PlusIcon, TrashIcon, SparklesIcon, SlidersIcon, FlameIcon, InfoIcon } from '../../../components/common/Icons'

interface AnalysisOptionsProps {
  descriptions: CandidateDescription[]
  config: AnalysisConfig
  onAddDescription: (text: string) => void
  onRemoveDescription: (id: string) => void
  onUpdateConfig: (newConfig: Partial<AnalysisConfig>) => void
  disabled?: boolean
}

const PRESET_QUERIES = [
  'A suspect wearing a dark hooded jacket',
  'Person carrying an unidentified bag or backpack',
  'Forced entry or tampering with door lock',
  'Physical struggle or rapid aggressive movement',
  'Vehicle fleeing the scene at high speed'
]

export const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({
  descriptions,
  config,
  onAddDescription,
  onRemoveDescription,
  onUpdateConfig,
  disabled = false
}) => {
  const [inputText, setInputText] = useState('')

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || disabled) return
    onAddDescription(inputText.trim())
    setInputText('')
  }

  const handleAddPreset = (preset: string) => {
    if (disabled) return
    if (!descriptions.some((d) => d.text.toLowerCase() === preset.toLowerCase())) {
      onAddDescription(preset)
    }
  }

  return (
    <div className="analysis-options-container">
      {/* 1. Candidate Prompts Section */}
      <div className="options-card glass-panel">
        <div className="options-card-header">
          <div className="card-header-title">
            <SparklesIcon size={18} className="icon-cyan" />
            <h4>Target Forensic Descriptions (CLIP Prompts)</h4>
          </div>
          <span className="card-badge">{descriptions.length} Active</span>
        </div>

        <p className="card-description">
          Enter natural language descriptions of suspicious events, objects, or suspects to match across video keyframes.
        </p>

        {/* Prompt Input Form */}
        <form onSubmit={handleAdd} className="prompt-input-row">
          <input
            type="text"
            className="prompt-text-input"
            placeholder="e.g., A person fleeing through the exit door..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled}
            maxLength={300}
          />
          <button
            type="submit"
            className="prompt-add-btn"
            disabled={disabled || !inputText.trim()}
          >
            <PlusIcon size={16} />
            <span>Add</span>
          </button>
        </form>

        {/* Preset quick buttons */}
        <div className="preset-suggestions">
          <span className="preset-label">Suggested cues:</span>
          <div className="preset-chips">
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip"
                onClick={() => handleAddPreset(preset)}
                disabled={disabled || descriptions.some(d => d.text === preset)}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Active Prompts List */}
        <div className="prompt-list">
          {descriptions.length === 0 ? (
            <div className="prompt-empty-state">
              <InfoIcon size={16} />
              <span>Add at least one forensic target description to begin analysis.</span>
            </div>
          ) : (
            descriptions.map((desc, i) => (
              <div key={desc.id} className="prompt-item">
                <span className="prompt-index">#{i + 1}</span>
                <span className="prompt-text">{desc.text}</span>
                <button
                  type="button"
                  className="prompt-remove-btn"
                  onClick={() => onRemoveDescription(desc.id)}
                  disabled={disabled}
                  title="Remove prompt"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Analysis Tuning Configuration */}
      <div className="options-card glass-panel">
        <div className="options-card-header">
          <div className="card-header-title">
            <SlidersIcon size={18} className="icon-violet" />
            <h4>Detection & VCI Settings</h4>
          </div>
          <span className="card-badge settings">Parameters</span>
        </div>

        <div className="settings-grid">
          {/* Sampling Rate */}
          <div className="setting-control">
            <div className="setting-label-row">
              <span className="setting-title">Frame Sampling Rate</span>
              <span className="setting-val">{config.sampleRate} fps</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.25"
              value={config.sampleRate}
              onChange={(e) => onUpdateConfig({ sampleRate: parseFloat(e.target.value) })}
              disabled={disabled}
              className="styled-slider"
            />
            <span className="setting-hint">Higher fps analyzes more frames but increases processing time.</span>
          </div>

          {/* Confidence Threshold */}
          <div className="setting-control">
            <div className="setting-label-row">
              <span className="setting-title">Similarity Threshold</span>
              <span className="setting-val">{Math.round(config.confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={config.confidenceThreshold}
              onChange={(e) => onUpdateConfig({ confidenceThreshold: parseFloat(e.target.value) })}
              disabled={disabled}
              className="styled-slider"
            />
            <span className="setting-hint">Scores above this threshold are highlighted as high-confidence matches.</span>
          </div>

          {/* Visual Counterfactual Intelligence (VCI) Toggle */}
          <div className="setting-toggle-row">
            <div className="toggle-info">
              <div className="toggle-title-wrap">
                <FlameIcon size={16} className="icon-rose" />
                <span className="toggle-title">Visual Counterfactual Intelligence (VCI)</span>
              </div>
              <p className="toggle-desc">
                Synthesize forensic counterfactual heatmaps showing salient spatial regions driving CLIP similarity.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.enableVCI}
                onChange={(e) => onUpdateConfig({ enableVCI: e.target.checked })}
                disabled={disabled}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
