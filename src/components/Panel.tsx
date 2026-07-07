import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="min-w-0 rounded-[18px] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="min-w-0 break-words text-[17px] font-semibold text-on-surface">{title}</h3>
        {action && <div className="flex shrink-0 items-center">{action}</div>}
      </div>
      {children}
    </section>
  )
}

export default Panel
