import type { ComponentType } from 'react'

type StatCardProps = {
  label: string
  value: number
  icon: ComponentType<{ size?: number }>
  tone: string
}

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="rounded-[18px] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-normal text-on-surface-variant">{label}</p>
      <strong className="mt-1 block text-3xl text-on-surface">{value}</strong>
    </article>
  )
}

export default StatCard
