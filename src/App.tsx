import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUp, ArrowUpRight, Check, ChevronDown, CircleHelp, FileImage, Fingerprint, LoaderCircle, LockKeyhole, Plus, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { analyzeImage, checkServiceHealth, useMocks } from './api';
import type { AnalysisResponse, VciCell } from './mockData';

const starterDescriptions = [
  'A person walking through a building',
  'A person entering a building',
  'A person leaving a building',
  'A person standing near a vehicle',
];
const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png'];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [descriptions, setDescriptions] = useState(starterDescriptions);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [selected, setSelected] = useState(0);
  const [selectedCell, setSelectedCell] = useState(0);
  const [serviceOnline, setServiceOnline] = useState(false);

  useEffect(() => {
    if (!useMocks) void checkServiceHealth().then(setServiceOnline);
  }, []);

  useEffect(() => {
    if (!image) { setPreview(''); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function acceptFile(file?: File) {
    if (!file) return;
    setError(''); setResponse(null);
    if (!ACCEPTED.includes(file.type)) { setError('This file type is not supported. Choose a JPG, JPEG, or PNG image.'); return; }
    if (file.size > MAX_SIZE) { setError('This image is larger than 20 MB. Choose a smaller file to continue.'); return; }
    setImage(file);
  }

  function updateDescription(index: number, value: string) {
    setDescriptions((current) => current.map((item, i) => i === index ? value : item));
    setResponse(null);
  }

  async function submit() {
    setError('');
    if (!image) { setError('Add an image before starting the analysis.'); return; }
    if (!descriptions.some((item) => item.trim())) { setError('Add at least one description before starting the analysis.'); return; }
    setLoading(true); setResponse(null);
    try {
      const result = await analyzeImage(image, descriptions.map((item) => item.trim()).filter(Boolean));
      setResponse(result); setSelected(0); setSelectedCell(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-blue" /><div className="ambient ambient-violet" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CrimeScene home"><span className="brand-mark"><Fingerprint size={19} /></span><span>crime<span className="brand-light">scene</span></span></a>
        <nav className="nav-links" aria-label="Main navigation"><a href="#analysis" className="nav-active">Workspace</a><a href="#about">About</a></nav>
        <div className="topbar-right"><span className="secure-label"><LockKeyhole size={12} /> Private workspace</span><button className="avatar" aria-label="User profile">S</button></div>
      </header>

      <div className="page" id="top">
        <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Photo analysis</strong><span className="crumb-tag">IMAGE</span></div>
        <section className="page-heading" id="analysis">
          <div><div className="eyebrow"><span className="eyebrow-line" /> VISUAL INTELLIGENCE</div><h1>Photo analysis</h1><p className="intro">Explore how an image aligns with natural-language descriptions using CLIP similarity.</p></div>
          <div className={`service-pill ${loading ? 'service-working' : ''}`}><span className="service-dot" />{loading ? 'Analysis in progress' : useMocks ? 'Mock mode active' : serviceOnline ? 'Analysis service online' : 'Analysis service unavailable'}<ChevronDown size={14} /></div>
        </section>

        <div className="notice"><ShieldCheck size={17} /><p><strong>For research and exploration.</strong> Similarity scores reflect image–text alignment only. They are not probabilities, proof of crime, or evidence of intent.</p><button aria-label="More about score interpretation" title="Scores are relative similarity values, not probabilities."><CircleHelp size={16} /></button></div>

        <div className="workspace-grid">
          <section className="panel upload-panel">
            <div className="section-head"><div className="step-number">01</div><div><h2>Source image</h2><p>Choose a photo to examine</p></div><span className="section-meta">JPG · PNG <span>MAX 20 MB</span></span></div>
            {!image ? <div className={`dropzone ${dragging ? 'dropzone-active' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files[0]); }}>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="visually-hidden" aria-label="Choose a JPG or PNG image" onChange={(e) => acceptFile(e.target.files?.[0])} />
              <div className="upload-icon"><UploadCloud size={22} /></div><p className="drop-title">Drop your image here</p><p className="drop-copy">or <button className="text-button" onClick={() => inputRef.current?.click()}>browse files</button> from your device</p><span className="drop-footnote">Your image stays in this session</span>
            </div> : <div className="image-card"><div className="image-preview-wrap"><img src={preview} alt={`Preview of ${image.name}`} /><div className="image-overlay"><span><Check size={14} /> Image ready</span><button onClick={() => { setImage(null); setResponse(null); }} aria-label="Remove image"><Trash2 size={15} /></button></div></div><div className="file-details"><div className="file-icon"><FileImage size={17} /></div><div className="file-copy"><strong title={image.name}>{image.name}</strong><span>{formatSize(image.size)} <i /> PNG / JPG</span></div><button className="replace-button" onClick={() => inputRef.current?.click()}><RefreshCw size={13} /> Replace</button><input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="visually-hidden" aria-label="Replace image" onChange={(e) => acceptFile(e.target.files?.[0])} /></div></div>}
            <div className="upload-foot"><span><LockKeyhole size={13} /> Processed securely</span><span>Supported: JPEG, PNG</span></div>
          </section>

          <section className="panel descriptions-panel">
            <div className="section-head"><div className="step-number">02</div><div><h2>Compare descriptions</h2><p>What might be happening in this image?</p></div><span className="count-badge">{descriptions.length} prompts</span></div>
            <p className="instructions">Write clear, neutral descriptions. CLIP compares each one with the image.</p>
            <div className="description-list">{descriptions.map((description, index) => <div className="description-row" key={index}><span className="row-index">{String(index + 1).padStart(2, '0')}</span><textarea value={description} onChange={(e) => updateDescription(index, e.target.value)} rows={1} aria-label={`Description ${index + 1}`} placeholder="Describe a scene..." /><button className="icon-button remove-button" aria-label={`Remove description ${index + 1}`} onClick={() => { setDescriptions((items) => items.filter((_, i) => i !== index)); setResponse(null); }} disabled={descriptions.length <= 1}><X size={15} /></button></div>)}</div>
            <button className="add-description" onClick={() => { setDescriptions((items) => [...items, '']); setResponse(null); }}><Plus size={15} /> Add description</button>
            <div className="prompt-tip"><Sparkles size={14} /><span>Tip</span> Try describing different actions or details to compare how they align.
            </div>
          </section>
        </div>

        {error && <div className="error-banner" role="alert"><span className="error-symbol">!</span><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
        <div className="action-row"><span className="action-caption"><Activity size={14} /> Estimated time <strong>~ 5 seconds</strong></span><button className="analyze-button" onClick={submit} disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17} /> Analyzing image</> : <><ScanSearch size={17} /> Analyze photo <ArrowUpRight size={15} /></>}</button></div>

        {loading && <div className="loading-card"><div className="loading-orbit"><ScanSearch size={21} /></div><div><strong>Comparing image and descriptions</strong><p>Preparing similarity results and region analysis…</p></div><div className="loading-bars"><i /><i /><i /></div></div>}

        {response && <section className="results-section" aria-live="polite">
          <div className="results-title-row"><div><div className="eyebrow"><span className="eyebrow-line" /> ANALYSIS OUTPUT</div><h2>Similarity results</h2><p>Descriptions ranked by their image–text similarity score.</p></div><span className={`mode-badge ${useMocks ? 'mock-badge' : ''}`}><span />{useMocks ? 'DEVELOPMENT MOCK DATA' : 'BACKEND RESPONSE'}</span></div>
          {useMocks && <div className="mock-notice"><Sparkles size={14} /><span>Illustrative mock values for interface review. These are not model results.</span></div>}
          <div className="result-layout">
            <div className="panel score-panel"><div className="result-card-heading"><div><h3>Ranked descriptions</h3><p>Higher scores indicate closer alignment</p></div><span className="score-label">SIMILARITY</span></div>
              <div className="rank-list">{response.results.map((item, index) => <button className={`rank-row ${selected === index ? 'rank-selected' : ''}`} key={`${index}-${item.description}`} onClick={() => setSelected(index)}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className="rank-content"><span className="rank-description">{item.description || 'Untitled description'}</span><span className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(item.score / Math.max(response.results[0]?.score || 1, 0.001) * 100, 4)}%` }} /></span></span><span className="score-value">{item.score.toFixed(3)}</span><ArrowUpRight size={14} className="rank-arrow" /></button>)}</div>
              <div className="result-explainer"><CircleHelp size={14} /><p>Scores represent similarity, not confidence or probability. Small score differences should be interpreted cautiously.</p></div>
            </div>
            <div className="panel vci-panel"><div className="result-card-heading"><div><h3>Region contribution</h3><p>How masking a region changes similarity</p></div><span className="vci-mark"><Sparkles size={12} /> VCI</span></div>
              <div className="heatmap-wrap">{preview ? <img src={preview} alt="Selected image with region contribution grid overlay" /> : null}<div className="heatmap-grid">{response.vci.map((cell, index) => { const change = response.originalSimilarity - cell.maskedSimilarity; return <button key={`${cell.row}-${cell.column}`} onClick={() => setSelectedCell(index)} className={`heat-cell ${change > 0 ? 'heat-positive' : 'heat-negative'} ${selectedCell === index ? 'heat-selected' : ''}`} style={{ opacity: 0.20 + Math.min(Math.abs(change) * 4, 0.62) }} title={`Row ${cell.row}, column ${cell.column}: original ${response.originalSimilarity.toFixed(3)}, masked ${cell.maskedSimilarity.toFixed(3)}, change ${change > 0 ? '+' : ''}${change.toFixed(3)}`} aria-label={`Row ${cell.row}, column ${cell.column}; score change ${change > 0 ? 'positive' : 'negative'} ${Math.abs(change).toFixed(3)}`} />; })}</div><span className="grid-caption">4 × 4 region grid</span></div>
              <div className="legend"><span><i className="legend-positive" /> Positive change</span><span><i className="legend-negative" /> Negative change</span></div>
              <div className="vci-stats"><div><span>ORIGINAL SIMILARITY</span><strong>{response.originalSimilarity.toFixed(3)}</strong></div><div><span>MASKED SIMILARITY</span><strong>{response.vci[selectedCell]?.maskedSimilarity.toFixed(3) ?? '—'}</strong></div><div><span>SCORE CHANGE</span><strong className="change-value">{response.vci[selectedCell] ? signed(response.originalSimilarity - response.vci[selectedCell].maskedSimilarity) : '—'}</strong></div></div>
              <div className="grid-table"><div className="grid-table-head"><span>Region</span><span>Masked score</span><span>Change</span></div>{response.vci.map((cell, index) => <VciRow key={`${cell.row}-${cell.column}`} cell={cell} original={response.originalSimilarity} selected={index === selectedCell} onClick={() => setSelectedCell(index)} />)}</div>
              <p className="formula-note">Score change = original similarity − masked similarity</p>
            </div>
          </div>
        </section>}

        <footer className="footer" id="about"><span>CRIMESCENE <i /> PHOTO ANALYSIS</span><span>CLIP similarity is an exploratory signal, not a conclusion.</span><a href="#top">Back to top <ArrowUp size={12} /></a></footer>
      </div>
    </main>
  );
}

function signed(value: number) { return `${value > 0 ? '+' : ''}${value.toFixed(3)}`; }
function VciRow({ cell, original, selected, onClick }: { cell: VciCell; original: number; selected: boolean; onClick: () => void }) {
  const change = original - cell.maskedSimilarity;
  return <button className={`grid-table-row ${selected ? 'grid-row-selected' : ''}`} onClick={onClick}><span>R{cell.row} · C{cell.column}</span><span>{cell.maskedSimilarity.toFixed(3)}</span><strong className={change >= 0 ? 'positive-text' : 'negative-text'}>{signed(change)}</strong></button>;
}

export default App;
