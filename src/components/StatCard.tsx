import type { ComponentType } from 'react'

type StatCardProps = {
  label: string
  value: number
  icon: ComponentType<{ size?: number }>
  tone: string
  onClick?: () => void
}

function StatCard({ label, value, icon: Icon, tone, onClick }: StatCardProps) {
  return (
    <article
      onClick={onClick}
      className={`rounded-[18px] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-normal text-on-surface-variant">{label}</p>
      <strong className="mt-1 block text-3xl text-on-surface">{value}</strong>
    </article>
  )
}

export default StatCard
