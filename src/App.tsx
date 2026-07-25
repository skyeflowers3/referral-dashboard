import { useState } from 'react'
import { DashboardView } from './components/DashboardView'
import { NavBar, type AppView } from './components/NavBar'
import { TrackerView } from './components/TrackerView'

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('tracker')

  return (
    <div className="min-h-screen">
      <NavBar activeView={activeView} onChange={setActiveView} />
      <main>
        {activeView === 'tracker' ? <TrackerView /> : <DashboardView />}
      </main>
    </div>
  )
}
