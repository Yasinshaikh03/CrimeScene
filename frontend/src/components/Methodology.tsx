import React from 'react'

export const Methodology: React.FC = () => {
  return (
    <div className="analysis-view" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>📖</span> Forensic Methodology & Scientific Limitations
        </h2>
        <p className="section-subtitle">
          CrimeScene uses contrastive representation learning and counterfactual perturbation to assist human 
          analysts. Review the underlying mathematical principles and limitations to ensure responsible forensic interpretation.
        </p>
      </div>

      {/* Principle 1: CLIP Cosine Similarity */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
          <span>📐</span> 1. OpenAI CLIP Embeddings & Cosine Similarity
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.7 }}>
          CrimeScene utilizes OpenAI’s <code>clip-vit-base-patch32</code> vision-language backbone. Both visual inputs 
          (images or video frames) and natural-language hypotheses are independently mapped into a shared 512-dimensional 
          latent embedding space:
        </p>

        <div style={{ background: 'rgba(10, 17, 32, 0.8)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
          similarity(image, text) = (image_embeds · text_embedsᵀ) / (||image_embeds||₂ × ||text_embeds||₂)
        </div>

        <div className="alert-box alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Critical Distinction: Cosine Similarity vs. Probability</strong>
            <br />
            Cosine similarity scores (typically falling between 0.15 and 0.38 for unconstrained zero-shot queries) measure 
            relative geometric alignment between feature vectors. They are <strong>NOT calibrated probabilities</strong>, 
            confidence percentages, or legal proof that an event took place.
          </div>
        </div>
      </div>

      {/* Principle 2: Visual Counterfactual Intelligence (VCI) */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
          <span>🔬</span> 2. Visual Counterfactual Intelligence (VCI)
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.7 }}>
          Deep neural networks often make decisions based on spurious background correlations (e.g. associating an asphalt 
          road with a car even if the car itself is missing). Visual Counterfactual Intelligence systematically tests hypothesis 
          fragility through spatial occlusions:
        </p>

        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.8 }}>
          <li>
            <strong>Baseline Calculation (S₀):</strong> Compute the unperturbed similarity score between the unaltered evidence 
            image and the target description.
          </li>
          <li>
            <strong>Spatial Grid Perturbation (N × N):</strong> Divide the image into a grid of cells. Mask each cell individually 
            with a neutral grey patch and re-evaluate similarity (S_masked).
          </li>
          <li>
            <strong>Sensitivity Delta (Δ = S₀ - S_masked):</strong> If masking a region significantly reduces similarity (positive Δ), 
            that spatial patch contained key visual tokens that the model relied upon to validate the description.
          </li>
        </ul>

        <div className="alert-box alert-info">
          <span>ℹ️</span>
          <div>
            <strong>Sensitivity vs. Real-World Causation:</strong>
            <br />
            VCI identifies which pixels the <em>neural network attended to</em>. It measures model sensitivity, not real-world 
            physical causality. Examiners must verify that highlighted regions correspond to genuine evidentiary features.
          </div>
        </div>
      </div>

      {/* Principle 3: Video Extraction Limitations */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
          <span>⏱️</span> 3. Temporal Video Sampling & Aliasing
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.7 }}>
          Surveillance footage can span hours with high framerates (25–60 FPS). Analyzing every single frame can be computationally 
          prohibitive. CrimeScene uses configurable temporal interval sampling:
        </p>

        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.8 }}>
          <li>
            <strong>Sampling Interval:</strong> A 2-second interval captures 1 frame every 60 frames (at 30 FPS).
          </li>
          <li>
            <strong>Aliasing Risk:</strong> Rapid micro-events (e.g. concealed weapon draw lasting 0.3 seconds) that occur 
            between sampled timestamps may not appear in the sampled frame list. For high-velocity incidents, reduce the interval 
            to 0.5s.
          </li>
          <li>
            <strong>Compression Artifacts:</strong> Low-bitrate CCTV compression can degrade model embeddings. High-resolution 
            raw footage yields more reliable cosine similarities.
          </li>
        </ul>
      </div>

      {/* Forensic Standards & Disclaimer */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
          <span>⚖️</span> 4. Forensic Compliance & Legal Standards
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The CrimeScene platform is designed as an investigative decision-support tool. In accordance with digital forensics standards 
          (such as ISO/IEC 27037 and the Daubert standard), AI-derived similarity scores and heatmaps should be used to triage footage, 
          guide human review, and generate investigative leads—never as autonomous or unverified evidence in judicial proceedings.
        </p>
      </div>
    </div>
  )
}
