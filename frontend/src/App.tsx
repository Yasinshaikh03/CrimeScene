import { useState, useEffect, useCallback } from 'react'
import { Header, type TabType } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { ImageAnalysis } from './components/ImageAnalysis'
import { VCIAnalysis } from './components/VCIAnalysis'
import { VideoAnalysis } from './components/VideoAnalysis'
import { Methodology } from './components/Methodology'
import { apiService } from './services/api'
import './App.css'

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null)
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false)

  const checkBackendHealth = useCallback(() => {
    setCheckingHealth(true)
    apiService
      .checkHealth()
      .then((res) => {
        setBackendHealthy(res?.status === 'healthy')
      })
      .catch(() => {
        setBackendHealthy(false)
      })
      .finally(() => {
        setCheckingHealth(false)
      })
  }, [])

  useEffect(() => {
    let ignore = false

    apiService
      .checkHealth()
      .then((res) => {
        if (!ignore) {
          setBackendHealthy(res?.status === 'healthy')
        }
      })
      .catch(() => {
        if (!ignore) {
          setBackendHealthy(false)
        }
      })

    const interval = setInterval(() => {
      apiService
        .checkHealth()
        .then((res) => {
          if (!ignore) {
            setBackendHealthy(res?.status === 'healthy')
          }
        })
        .catch(() => {
          if (!ignore) {
            setBackendHealthy(false)
          }
        })
    }, 30000)

    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="app-container">
      {/* Top Navigation & Status Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        backendHealthy={backendHealthy}
        checkingHealth={checkingHealth}
        onRefreshHealth={checkBackendHealth}
      />

      {/* Main Content Pane */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard onNavigate={setActiveTab} backendHealthy={backendHealthy} />
        )}
        {activeTab === 'image' && <ImageAnalysis />}
        {activeTab === 'vci' && <VCIAnalysis />}
        {activeTab === 'video' && <VideoAnalysis />}
        {activeTab === 'methodology' && <Methodology />}
      </main>

      {/* System Footer */}
      <footer className="app-footer">
        <div>
          CrimeScene v1.0.0 — CLIP-Based Video and Image Analysis with Visual Counterfactual Intelligence
        </div>
        <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Forensic Decision Support System • Built with FastAPI, PyTorch CLIP ViT-B/32, OpenCV & React TypeScript
        </div>
      </footer>
    </div>
  )
}

export default App
