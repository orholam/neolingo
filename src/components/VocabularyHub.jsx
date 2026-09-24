import { useSearchParams } from 'react-router-dom'
import { useSelectedLanguage } from '../contexts/LanguageContext'
import { COURSES, getLanguageId } from '../data/courses'
import { useWordMastery } from '../hooks/useWordMastery'
import { parseVocabularyTab } from '../config/navigation'
import VocabularyTabs from './VocabularyTabs'
import PracticeTab from './vocabulary/PracticeTab'
import MasteredTab from './vocabulary/MasteredTab'
import HistoryTab from './vocabulary/HistoryTab'

export default function VocabularyHub() {
  const [searchParams] = useSearchParams()
  const tab = parseVocabularyTab(searchParams.get('tab'))
  const { selectedCourseId } = useSelectedLanguage()
  const course = COURSES[selectedCourseId] || COURSES.dadjo
  const languageId = getLanguageId(course.id)
  const dictionary = course.dictionary || []
  const { stats } = useWordMastery(languageId, dictionary)

  return (
    <div className="max-w-5xl mx-auto pb-8 space-y-8">
      <div className="pt-1 pb-5 border-b border-gray-200/80 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{course.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{course.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Vocabulary · {stats.totalUniversalMastered} mastered
              </p>
            </div>
          </div>
          <VocabularyTabs />
        </div>
      </div>

      {tab === 'practice' && <PracticeTab course={course} stats={stats} />}
      {tab === 'mastered' && (
        <MasteredTab course={course} languageId={languageId} dictionary={dictionary} />
      )}
      {tab === 'history' && (
        <HistoryTab languageId={languageId} dictionary={dictionary} />
      )}
    </div>
  )
}
