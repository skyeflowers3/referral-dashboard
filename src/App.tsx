import { useEffect, useState } from 'react'
import { DashboardView } from './components/DashboardView'
import { NavBar, type AppView } from './components/NavBar'
import { ReferrerDetailView } from './components/ReferrerDetailView'
import { TrackerView } from './components/TrackerView'

function readViewFromUrl(): AppView {
  const view = new URLSearchParams(window.location.search).get('view')
  return view === 'dashboard' ? 'dashboard' : 'tracker'
}

function readReferrerFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('referrer')
}

function writeUrl(view: AppView, referrerId: string | null) {
  const params = new URLSearchParams()
  if (view === 'dashboard') params.set('view', 'dashboard')
  if (referrerId) params.set('referrer', referrerId)
  const query = params.toString()
  const next = query ? `?${query}` : window.location.pathname
  window.history.pushState({ view, referrerId }, '', next)
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>(() => readViewFromUrl())
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(() =>
    readReferrerFromUrl(),
  )

  useEffect(() => {
    function onPopState() {
      setActiveView(readViewFromUrl())
      setSelectedReferrerId(readReferrerFromUrl())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function openReferrer(referrerId: string) {
    setSelectedReferrerId(referrerId)
    setActiveView('tracker')
    writeUrl('tracker', referrerId)
  }

  function handleNavChange(view: AppView) {
    setSelectedReferrerId(null)
    setActiveView(view)
    writeUrl(view, null)
  }

  function handleGoHome() {
    setSelectedReferrerId(null)
    setActiveView('tracker')
    writeUrl('tracker', null)
  }

  function handleBackFromReferrer() {
    setSelectedReferrerId(null)
    setActiveView('tracker')
    writeUrl('tracker', null)
  }

  return (
    <div className="min-h-screen">
      <NavBar
        activeView={activeView}
        onChange={handleNavChange}
        onGoHome={handleGoHome}
      />
      <main>
        {activeView === 'dashboard' ? (
          <DashboardView />
        ) : selectedReferrerId ? (
          <ReferrerDetailView
            referrerId={selectedReferrerId}
            onBack={handleBackFromReferrer}
          />
        ) : (
          <TrackerView onOpenReferrer={openReferrer} />
        )}
      </main>
    </div>
  )
}
