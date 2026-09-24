import DictionaryView from '../components/DictionaryView'
import { dadjoDictionary } from '../data/dadjoDictionary'

export default function Dictionary() {
  return (
    <DictionaryView
      variant="dadjo"
      icon="📚"
      title="Dadjo–English Dictionary"
      subtitle={`Type in Dadjo or English to search ${dadjoDictionary.length.toLocaleString()} entries.`}
      entries={dadjoDictionary}
      searchPlaceholder="Search by Dadjo word, pronunciation, or English meaning..."
    />
  )
}
