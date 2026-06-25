import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export default Panel
