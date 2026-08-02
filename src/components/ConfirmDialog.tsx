import { useCallback, useEffect, useId, useState } from 'react'

export interface ConfirmRequest {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}

interface ConfirmDialogProps extends ConfirmRequest {
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-navy/35"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-lg border border-line bg-surface-elevated p-5 shadow-sm sm:p-6"
      >
        <h2
          id={titleId}
          className="font-display text-2xl font-light text-ink"
        >
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

type PendingConfirm = ConfirmRequest & {
  resolve: (ok: boolean) => void
}

/** Promise-based confirm that renders a site-styled dialog. */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((request: ConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...request, resolve })
    })
  }, [])

  const close = useCallback(
    (ok: boolean) => {
      if (!pending) return
      pending.resolve(ok)
      setPending(null)
    },
    [pending],
  )

  const dialog = pending ? (
    <ConfirmDialog
      title={pending.title}
      description={pending.description}
      confirmLabel={pending.confirmLabel}
      cancelLabel={pending.cancelLabel}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null

  return { confirm, dialog }
}
