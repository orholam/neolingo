import MatchPairs from '../components/exercises/MatchPairs'
import Translate from '../components/exercises/Translate'
import DragDrop from '../components/exercises/DragDrop'
import ListenType from '../components/exercises/ListenType'
import Speak from '../components/exercises/Speak'
import MultipleChoice from '../components/exercises/MultipleChoice'
import FillBlank from '../components/exercises/FillBlank'
import WordBank from '../components/exercises/WordBank'
import AudioPicture from '../components/exercises/AudioPicture'
import ReadSelect from '../components/exercises/ReadSelect'

// Map exercise types to components
const exerciseComponents = {
  'match-pairs': MatchPairs,
  'translate': Translate,
  'drag-drop': DragDrop,
  'listen-type': ListenType,
  'speak': Speak,
  'multiple-choice': MultipleChoice,
  'fill-blank': FillBlank,
  'word-bank': WordBank,
  'audio-picture': AudioPicture,
  'read-select': ReadSelect,
}

// Get the component for an exercise type
export function getExerciseComponent(exerciseType) {
  return exerciseComponents[exerciseType] || null
}

// Create an exercise component instance
export function createExerciseComponent(exercise, onAnswer, disabled, resultState = {}) {
  const Component = getExerciseComponent(exercise.type)
  
  if (!Component) {
    console.error(`Unknown exercise type: ${exercise.type}`)
    return null
  }

  // Pass result state for exercises that need it (MultipleChoice, FillBlank)
  const props = {
    exercise,
    onAnswer,
    disabled,
  }

  if (exercise.type === 'multiple-choice' || exercise.type === 'fill-blank') {
    props.showResult = resultState.showResult || false
    props.isCorrect = resultState.isCorrect || false
    props.selectedAnswer = resultState.selectedAnswer
  }

  return Component
}

// Validate exercise data structure
export function validateExercise(exercise) {
  if (!exercise.type) {
    return { valid: false, error: 'Exercise missing type' }
  }

  if (!exerciseComponents[exercise.type]) {
    return { valid: false, error: `Unknown exercise type: ${exercise.type}` }
  }

  // Type-specific validation
  switch (exercise.type) {
    case 'match-pairs':
      if (!exercise.pairs || !Array.isArray(exercise.pairs)) {
        return { valid: false, error: 'Match pairs exercise missing pairs array' }
      }
      break
    case 'translate':
      if (!exercise.answer) {
        return { valid: false, error: 'Translate exercise missing answer' }
      }
      break
    case 'drag-drop':
    case 'word-bank':
      if (!exercise.words || !Array.isArray(exercise.words)) {
        return { valid: false, error: 'Exercise missing words array' }
      }
      if (!exercise.correct || !Array.isArray(exercise.correct)) {
        return { valid: false, error: 'Exercise missing correct array' }
      }
      break
    case 'multiple-choice':
    case 'fill-blank':
      if (!exercise.options || !Array.isArray(exercise.options)) {
        return { valid: false, error: 'Exercise missing options array' }
      }
      if (exercise.correct === undefined) {
        return { valid: false, error: 'Exercise missing correct index' }
      }
      break
    case 'listen-type':
      if (!exercise.answer) {
        return { valid: false, error: 'Listen type exercise missing answer' }
      }
      break
    case 'read-select':
      if (!exercise.words || !Array.isArray(exercise.words)) {
        return { valid: false, error: 'Read select exercise missing words array' }
      }
      if (!exercise.correct || !Array.isArray(exercise.correct)) {
        return { valid: false, error: 'Read select exercise missing correct array' }
      }
      break
  }

  return { valid: true }
}



