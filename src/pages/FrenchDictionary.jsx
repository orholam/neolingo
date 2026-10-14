import DictionaryView from '../components/DictionaryView'
import { frenchDictionary } from '../data/frenchDictionary'
import { frenchData } from '../data/frenchCourseData'

export default function FrenchDictionary() {
  return (
    <DictionaryView
      variant="french"
      icon={frenchData.icon}
      title="French–English Dictionary"
      subtitle={`${frenchData.description} • ${frenchDictionary.length.toLocaleString()} entries.`}
      entries={frenchDictionary}
      searchPlaceholder="Search by French, pronunciation, or English meaning..."
    />
  )
}
