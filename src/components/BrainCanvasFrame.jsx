/**
 * Sized container for react-three-fiber canvases.
 * Percentage heights fail inside flex layouts without an explicit block height.
 */
export default function BrainCanvasFrame({
  children,
  className = '',
  /** stretch to parent height (semantic map below fixed header) */
  fill = false,
  /** embedded in AppShell (digital brain page) */
  embedded = false,
}) {
  const heightClass = fill
    ? 'h-full min-h-[320px]'
    : embedded
      ? 'h-[calc(100dvh-12rem)] min-h-[540px] md:h-[calc(100dvh-10rem)]'
      : 'h-[220px] min-h-[180px]'

  return (
    <div className={`relative w-full overflow-hidden ${heightClass} ${className}`}>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
