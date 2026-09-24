import DictionaryView from '../components/DictionaryView'
import { sumerianDictionary } from '../data/sumerianDictionary'
import { sumerianData } from '../data/sumerianCourseData'

export default function SumerianDictionary() {
  return (
    <DictionaryView
      variant="sumerian"
      icon={sumerianData.icon}
      title="Ancient Sumerian–English Dictionary"
      subtitle={`${sumerianData.description} • Demo lexicon with ${sumerianDictionary.length} entries.`}
      entries={sumerianDictionary}
      searchPlaceholder="Search by headword, cuneiform sign, or English meaning..."
      searchExtraFields={['script']}
    />
  )
}
