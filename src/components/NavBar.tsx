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
    <header className="border-b border-line bg-surface-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-2xl font-light tracking-tight text-ink sm:text-[2rem]">
            GT Referral Program
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Family referrals · enrollment pipeline
          </p>
        </div>

        <nav
          className="inline-flex gap-1 rounded-lg border border-line bg-surface-warm p-1"
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
                  'font-utility rounded-md px-4 py-2 text-sm font-medium uppercase tracking-[0.04em] transition-colors',
                  isActive
                    ? 'border border-gold-light bg-accent-soft text-navy'
                    : 'border border-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink',
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
