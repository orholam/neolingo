import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Practice from './pages/Practice'
import Dictionary from './pages/Dictionary'
import SumerianDictionary from './pages/SumerianDictionary'
import FlashcardSessions from './pages/FlashcardSessions'
import Flashcards from './pages/Flashcards'
import FlashcardSessionPractice from './pages/FlashcardSessionPractice'
import MasteredWords from './pages/MasteredWords'
import DigitalBrain from './pages/DigitalBrain'
import SemanticBrainMap from './pages/SemanticBrainMap'
import Languages from './pages/Languages'
import LearningLayout from './components/LearningLayout'

function App() {
  return (
    <Routes>
      {/* Static pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/languages" element={<Languages />} />

      {/* Learning landing pages — share the persistent sidebar via LearningLayout */}
      <Route element={<LearningLayout />}>
        <Route path="/practice" element={<Practice />} />
        <Route path="/flashcards" element={<FlashcardSessions />} />
      </Route>

      {/* Full-screen activity pages — displace the sidebar */}
      <Route path="/lesson" element={<Lesson />} />
      <Route path="/flashcards/new" element={<Flashcards />} />
      <Route path="/flashcards/:sessionId" element={<FlashcardSessionPractice />} />

      {/* Dictionary & mastery */}
      <Route path="/dictionary" element={<Dictionary />} />
      <Route path="/sumerian-dictionary" element={<SumerianDictionary />} />
      <Route path="/mastered" element={<MasteredWords />} />

      {/* Digital brain */}
      <Route path="/brain/:langId" element={<DigitalBrain />} />
      <Route path="/brain-map/:langId" element={<SemanticBrainMap />} />
    </Routes>
  )
}

export default App
