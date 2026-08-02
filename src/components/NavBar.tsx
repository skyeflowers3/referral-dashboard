export type AppView = 'tracker' | 'dashboard'

interface NavBarProps {
  activeView: AppView
  onChange: (view: AppView) => void
  onGoHome?: () => void
}

const tabs: { id: AppView; label: string }[] = [
  { id: 'tracker', label: 'Tracker' },
  { id: 'dashboard', label: 'Dashboard' },
]

export function NavBar({ activeView, onChange, onGoHome }: NavBarProps) {
  return (
    <header className="border-b border-line bg-surface-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left"
          aria-label="GT Referral Program home"
        >
          <img
            src="/gt-logo.png"
            alt=""
            width={40}
            height={34}
            className="h-9 w-auto shrink-0"
          />
          <span className="font-sans text-[1.35rem] leading-none tracking-tight sm:text-[1.6rem]">
            <span className="font-bold text-navy">GT</span>
            <span className="font-medium text-gold">referral program</span>
          </span>
        </button>

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
