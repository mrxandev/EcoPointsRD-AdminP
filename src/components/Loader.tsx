type LoaderProps = {
  message?: string
}

function Loader({ message = 'Cargando informacion...' }: LoaderProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-4 py-8 text-center text-on-surface-variant">
      <span className="loader-spinner" aria-hidden="true" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  )
}

export default Loader
