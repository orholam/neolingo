/** Vertical offset below fixed FocusHeader (matches min-h + py on FocusHeader) */
export const FOCUS_HEADER_OFFSET = 'pt-20 sm:pt-[5.25rem]'

export default function FocusPageContent({ children, className = '' }) {
  return (
    <div className={`${FOCUS_HEADER_OFFSET} pb-10 ${className}`.trim()}>{children}</div>
  )
}
