import { Navigate } from 'react-router-dom'

export default function MasteredWords() {
  return <Navigate to="/flashcards?tab=mastered" replace />
}
