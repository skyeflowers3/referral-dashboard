export type AppView = 'tracker' | 'dashboard'

interface NavBarProps {
  activeView: AppView
  onChange: (view: AppView) => void
}

const tabs: { id: AppView; label: string }[] = [
  { id: 'tracker', label: 'Tracker' },
  { id: 'dashboard', label: 'Dashboard' },
]

export function NavBar({ activeView, onChange }: NavBarProps) {
  return (
    <header className="border-b border-line bg-surface-elevated/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            GT Referral Program
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Family referrals · enrollment pipeline
          </p>
        </div>

        <nav
          className="inline-flex rounded-lg border border-line bg-surface p-1"
          aria-label="Primary"
        >
          {tabs.map((tab) => {
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={[
                  'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-ink-muted hover:bg-white hover:text-ink',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
