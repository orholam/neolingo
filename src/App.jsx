import { Routes, Route } from 'react-router-dom'
import { usePostAuthRedirect } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Practice from './pages/Practice'
import Dictionary from './pages/Dictionary'
import SumerianDictionary from './pages/SumerianDictionary'
import KoreanDictionary from './pages/KoreanDictionary'
import FlashcardSessions from './pages/FlashcardSessions'
import Flashcards from './pages/Flashcards'
import FlashcardSessionPractice from './pages/FlashcardSessionPractice'
import MasteredWords from './pages/MasteredWords'
import DigitalBrain from './pages/DigitalBrain'
import SemanticBrainMap from './pages/SemanticBrainMap'
import MemoryMap from './pages/MemoryMap'
import Languages from './pages/Languages'
import AppShell from './components/AppShell'
import FocusLayout from './components/FocusLayout'

function App() {
  usePostAuthRedirect()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AppShell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/flashcards" element={<FlashcardSessions />} />
        <Route path="/mastered" element={<MasteredWords />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/sumerian-dictionary" element={<SumerianDictionary />} />
        <Route path="/korean-dictionary" element={<KoreanDictionary />} />
        <Route path="/brain/:langId" element={<DigitalBrain />} />
        <Route path="/brain-map/:langId" element={<SemanticBrainMap />} />
        <Route path="/memory-map/:langId" element={<MemoryMap />} />
      </Route>

      <Route element={<FocusLayout />}>
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/flashcards/new" element={<Flashcards />} />
        <Route path="/flashcards/:sessionId" element={<FlashcardSessionPractice />} />
      </Route>
    </Routes>
  )
}

export default App
