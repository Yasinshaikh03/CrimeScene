import { useState } from 'react'
import { Header } from './components/common/Header'
import type { ActiveTab } from './types/navigation'
import { VideoAnalysisPage } from './modules/video-analysis/VideoAnalysisPage'
import { PhotoAnalysisPage } from './modules/photo-analysis/PhotoAnalysisPage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('video-analysis')

  return (
    <div className="app-shell">
      {/* CrimeScene Shared Header & Navigation */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main View Router / Tab Switcher */}
      <div className="app-content">
        {activeTab === 'video-analysis' && <VideoAnalysisPage />}
        {activeTab === 'photo-analysis' && <PhotoAnalysisPage />}
      </div>

      {/* Forensic Disclaimer Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>CrimeScene Forensic Intelligence • CLIP ViT-B/32 & Visual Counterfactuals</span>
          <span className="footer-divider">•</span>
          <span>Investigative intelligence tool — not definitive proof of guilt</span>
        </div>
      </footer>
    </div>
  )
}

export default App
