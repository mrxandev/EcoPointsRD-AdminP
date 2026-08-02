import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

type TablePaginationProps = {
  currentPage: number
  itemLabel?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSize: number
  totalItems: number
}

export function TablePagination({
  currentPage,
  itemLabel = 'registros',
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalItems,
}: TablePaginationProps) {
  if (totalItems === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const startItem = (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, totalItems)

  const pageSizeOptions = [
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: 'Todos', value: '10000' },
  ]

  const renderPageButtons = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safePage > 3) pages.push('...')
      const start = Math.max(2, safePage - 1)
      const end = Math.min(totalPages - 1, safePage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (safePage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages.map((p, idx) => {
      if (typeof p === 'string') {
        return (
          <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-on-surface-variant">
            ...
          </span>
        )
      }
      return (
        <button
          key={p}
          className={`h-8 min-w-8 rounded-lg px-2.5 text-xs font-bold transition-all ${
            p === safePage
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      )
    })
  }

  return (
    <div className="table-footer flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-outline-variant bg-surface-container-low rounded-b-xl">
      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
        <span>
          Mostrando <strong className="text-on-surface font-bold">{startItem}-{endItem}</strong> de{' '}
          <strong className="text-on-surface font-bold">{totalItems}</strong> {itemLabel}
        </span>
        <select
          className="h-8 rounded-lg border border-outline-variant bg-surface-container px-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-high focus:border-primary focus:outline-none transition-all cursor-pointer"
          value={String(pageSize)}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value))
            onPageChange(1)
          }}
          aria-label="Cantidad de registros a mostrar por página"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-all"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          title="Página anterior"
          aria-label="Página anterior"
        >
          <FiChevronLeft className="text-lg stroke-[2.5]" />
        </button>

        {renderPageButtons()}

        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-all"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          title="Página siguiente"
          aria-label="Página siguiente"
        >
          <FiChevronRight className="text-lg stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}

export default TablePagination
