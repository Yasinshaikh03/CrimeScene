import React, { useState } from 'react'
import type {
  VideoMetadataInfo,
  CandidateDescription,
  AnalysisConfig,
  VideoAnalysisResult,
  ProcessingStatus,
  ExtractedFrame
} from './types'
import { VideoDropzone } from './components/VideoDropzone'
import { VideoPreview } from './components/VideoPreview'
import { VideoMetadata } from './components/VideoMetadata'
import { AnalysisOptions } from './components/AnalysisOptions'
import { VideoAnalysisButton } from './components/VideoAnalysisButton'
import { ProcessingState } from './components/ProcessingState'
import { FrameGallery } from './components/FrameGallery'
import { FrameDetails } from './components/FrameDetails'
import { SimilarityResults } from './components/SimilarityResults'
import { VCIHeatmap } from './components/VCIHeatmap'
import { ErrorMessage } from './components/ErrorMessage'
import { runMockVideoAnalysis } from './services/mockVideoService'
import { VideoIcon, InfoIcon } from '../../components/common/Icons'
import './VideoAnalysis.css'

const DEFAULT_PROMPTS: CandidateDescription[] = [
  { id: '1', text: 'A suspect wearing a dark hooded jacket' },
  { id: '2', text: 'Person carrying an unidentified bag or backpack' },
  { id: '3', text: 'Forced entry or tampering with door lock' }
]

const DEFAULT_CONFIG: AnalysisConfig = {
  sampleRate: 0.5, // 1 frame every 2 seconds
  confidenceThreshold: 0.5,
  enableVCI: true
}

export const VideoAnalysisPage: React.FC = () => {
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadataInfo | null>(null)

  // Options state
  const [descriptions, setDescriptions] = useState<CandidateDescription[]>(DEFAULT_PROMPTS)
  const [config, setConfig] = useState<AnalysisConfig>(DEFAULT_CONFIG)

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    progress: 0,
    message: ''
  })

  // Results & inspection state
  const [results, setResults] = useState<VideoAnalysisResult | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Handlers for video file
  const handleVideoSelected = (file: File) => {
    setVideoFile(file)
    setVideoMetadata({
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      duration: 0,
      width: 0,
      height: 0,
      lastModified: file.lastModified
    })
    setResults(null)
    setSelectedFrame(null)
    setErrorMessage(null)
  }

  const handleMetadataLoaded = (meta: { duration: number; width: number; height: number }) => {
    setVideoMetadata((prev) => (prev ? { ...prev, ...meta } : null))
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setVideoMetadata(null)
    setResults(null)
    setSelectedFrame(null)
    setErrorMessage(null)
  }

  // Handlers for candidate prompts
  const handleAddDescription = (text: string) => {
    setDescriptions((prev) => [
      ...prev,
      { id: Date.now().toString(), text }
    ])
  }

  const handleRemoveDescription = (id: string) => {
    setDescriptions((prev) => prev.filter((d) => d.id !== id))
  }

  const handleUpdateConfig = (newConfig: Partial<AnalysisConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }

  // Run Analysis Workflow
  const handleRunAnalysis = async () => {
    if (!videoFile) {
      setErrorMessage('Please upload a video file first.')
      return
    }

    if (descriptions.length === 0) {
      setErrorMessage('Please add at least one target description for CLIP matching.')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    setResults(null)
    setSelectedFrame(null)

    try {
      const promptTexts = descriptions.map((d) => d.text)
      const analysisOutput = await runMockVideoAnalysis(
        videoFile,
        promptTexts,
        config,
        (status) => setProcessingStatus(status)
      )

      setResults(analysisOutput)
    } catch (err: unknown) {
      console.error('Video analysis failed:', err)
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Video analysis encountered an unexpected error during keyframe extraction.'
      setErrorMessage(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectFrameById = (frameId: string) => {
    if (!results) return
    const frame = results.frames.find((f) => f.id === frameId)
    if (frame) {
      setSelectedFrame(frame)
    }
  }

  return (
    <main className="video-analysis-page">
      {/* Hero Header */}
      <section className="page-hero">
        <div className="hero-tag-row">
          <span className="glass-pill">
            <VideoIcon size={13} />
            Forensic Video Stream Module
          </span>
          <span className="simulation-pill">
            <InfoIcon size={12} />
            Frontend Simulation Mode (Awaiting Backend Route)
          </span>
        </div>

        <h1 className="hero-title">Surveillance Video & Visual Counterfactual Analysis</h1>
        <p className="hero-subtitle">
          Deconstruct footage into keyframes, evaluate zero-shot multi-modal similarity with OpenAI CLIP ViT-B/32,
          and synthesize Visual Counterfactual Intelligence (VCI) heatmaps to localize actionable visual cues.
        </p>
      </section>

      {/* Error Message if present */}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={videoFile ? handleRunAnalysis : undefined}
        />
      )}

      {/* Input Grid: Video Upload/Preview + Prompts & Options */}
      <section className="analysis-input-grid">
        {/* Left Column: Video Uploader or Preview */}
        <div className="input-col-left">
          {!videoFile ? (
            <VideoDropzone
              onVideoSelected={handleVideoSelected}
              onError={(err) => setErrorMessage(err)}
              disabled={isProcessing}
            />
          ) : (
            <div className="video-loaded-container">
              <VideoPreview
                videoFile={videoFile}
                onMetadataLoaded={handleMetadataLoaded}
              />
              {videoMetadata && (
                <VideoMetadata
                  metadata={videoMetadata}
                  onReplace={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.mp4,.mov,.avi'
                    input.onchange = (e: Event) => {
                      const target = e.target as HTMLInputElement
                      if (target.files && target.files[0]) {
                        handleVideoSelected(target.files[0])
                      }
                    }
                    input.click()
                  }}
                  onRemove={handleRemoveVideo}
                  disabled={isProcessing}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Analysis Prompts & Config */}
        <div className="input-col-right">
          <AnalysisOptions
            descriptions={descriptions}
            config={config}
            onAddDescription={handleAddDescription}
            onRemoveDescription={handleRemoveDescription}
            onUpdateConfig={handleUpdateConfig}
            disabled={isProcessing}
          />

          <VideoAnalysisButton
            onAnalyze={handleRunAnalysis}
            disabled={!videoFile || descriptions.length === 0}
            isProcessing={isProcessing}
            disabledReason={
              !videoFile
                ? 'Upload a video to enable analysis'
                : descriptions.length === 0
                ? 'Add at least one target description'
                : undefined
            }
          />
        </div>
      </section>

      {/* Processing State Indicator */}
      {isProcessing && (
        <section className="processing-section">
          <ProcessingState status={processingStatus} />
        </section>
      )}

      {/* Analysis Results Display */}
      {results && !isProcessing && (
        <>
          {/* 1. Ranked Overall Similarity Results */}
          <section className="results-section">
            <SimilarityResults
              rankedResults={results.rankedResults}
              frames={results.frames}
              onSelectFrameById={handleSelectFrameById}
              threshold={config.confidenceThreshold}
            />
          </section>

          {/* 2. Visual Counterfactual Intelligence (VCI) Heatmap Section */}
          {config.enableVCI && (
            <section className="vci-section">
              <VCIHeatmap
                frames={results.frames}
                selectedFrameId={selectedFrame?.id}
                onSelectFrame={(f) => setSelectedFrame(f)}
              />
            </section>
          )}

          {/* 3. Extracted Keyframe Gallery */}
          <section className="gallery-section">
            <FrameGallery
              frames={results.frames}
              selectedFrameId={selectedFrame?.id}
              onSelectFrame={(f) => setSelectedFrame(f)}
              threshold={config.confidenceThreshold}
            />
          </section>
        </>
      )}

      {/* Keyframe Inspector Dialog */}
      {selectedFrame && (
        <FrameDetails
          frame={selectedFrame}
          onClose={() => setSelectedFrame(null)}
          threshold={config.confidenceThreshold}
        />
      )}
    </main>
  )
}
