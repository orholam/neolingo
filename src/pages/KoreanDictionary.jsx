import DictionaryView from '../components/DictionaryView'
import { koreanDictionary } from '../data/koreanDictionary'
import { koreanData } from '../data/koreanCourseData'

export default function KoreanDictionary() {
  return (
    <DictionaryView
      variant="korean"
      icon={koreanData.icon}
      title="Korean–English Dictionary"
      subtitle={`${koreanData.description} • ${koreanDictionary.length.toLocaleString()} entries.`}
      entries={koreanDictionary}
      searchPlaceholder="Search by Korean, romanization, or English meaning..."
    />
  )
}
