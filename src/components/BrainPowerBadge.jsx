import { useNavigate } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { getCourse, getLanguageId } from '../data/courses'
import { useBrainPower } from '../hooks/useBrainPower'

/**
 * Live brain score for the selected language — header chrome.
 */
export default function BrainPowerBadge({ className = '' }) {
  const navigate = useNavigate()
  const { selectedCourseId } = useSelectedLanguage()
  const course = getCourse(selectedCourseId)
  const languageId = getLanguageId(selectedCourseId)
  const { score } = useBrainPower(languageId)

  return (
    <button
      type="button"
      onClick={() => navigate(`/brain/${course.id}`)}
      title={`${course.label} brain power`}
      className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
    >
      <span className="text-lg leading-none" aria-hidden>
        🧠
      </span>
      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm tabular-nums">{score}</span>
    </button>
  )
}
