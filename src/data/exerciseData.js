// Exercise templates and question banks for lessons
// Languages: Dadjo (Dar Daju Daju) and Ancient Sumerian

import { sumerianExerciseTemplates } from './sumerianExerciseData'

// Exercise type definitions
export const exerciseTypes = {
  MATCH_PAIRS: 'match-pairs',
  TRANSLATE: 'translate',
  DRAG_DROP: 'drag-drop',
  LISTEN_TYPE: 'listen-type',
  SPEAK: 'speak',
  MULTIPLE_CHOICE: 'multiple-choice',
  FILL_BLANK: 'fill-blank',
  WORD_BANK: 'word-bank',
  AUDIO_PICTURE: 'audio-picture',
  READ_SELECT: 'read-select',
}

// Exercise templates by lesson ID (Dadjo: 1–10, Ancient Sumerian: 101–103)
export const exerciseTemplates = {
  ...sumerianExerciseTemplates,
  // Basics 1 - Lesson 1
  1: [
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "na" mean?',
      text: 'na',
      options: ['I', 'You', 'He', 'She'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.MATCH_PAIRS,
      question: 'Match the pairs:',
      pairs: [
        { english: 'I', dadjo: 'na' },
        { english: 'You', dadjo: 'ni' },
        { english: 'He', dadjo: 'ma' },
        { english: 'She', dadjo: 'ce' },
      ],
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'Translate to Dadjo:',
      text: 'I',
      options: ['na', 'ni', 'ma', 'ce'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.FILL_BLANK,
      question: 'Complete the sentence:',
      text: '___ sogo (I have)',
      answer: 'na',
      options: ['na', 'ni', 'ma', 'ce'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'You',
      answer: 'ni',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "ma" mean?',
      options: ['I', 'You', 'He', 'She'],
      correct: 2,
      xp: 10,
    },
    {
      type: exerciseTypes.MATCH_PAIRS,
      question: 'Match the pronouns:',
      pairs: [
        { english: 'We', dadjo: 'oska' },
        { english: 'You (plural)', dadjo: 'oŋa' },
        { english: 'They', dadjo: 'sa' },
      ],
      xp: 10,
    },
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'She',
      answer: 'ce',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'Translate to Dadjo:',
      text: 'They',
      options: ['oska', 'oŋa', 'sa', 'na'],
      correct: 2,
      xp: 10,
    },
    {
      type: exerciseTypes.READ_SELECT,
      question: 'Select the real Dadjo pronouns:',
      words: ['na', 'ni', 'Xyzt', 'ma', 'Qwert', 'ce'],
      correct: ['na', 'ni', 'ma', 'ce'],
      xp: 10,
    },
    {
      type: exerciseTypes.SPEAK,
      question: 'Say this sentence:',
      text: 'na sogo',
      xp: 10,
    },
  ],

  // Basics 2 - Lesson 2
  2: [
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'I have',
      answer: 'na sogo',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "na sogo" mean?',
      options: ['I have', 'I am', 'I go', 'I eat'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.DRAG_DROP,
      question: 'Arrange the words to form a sentence:',
      text: 'I go',
      words: ['na', 'oso', 'ni', 'sogo'],
      correct: ['na', 'oso'],
      xp: 10,
    },
    {
      type: exerciseTypes.FILL_BLANK,
      question: 'Complete the sentence:',
      text: '___ oso (I go)',
      options: ['na', 'ni', 'ma', 'ce'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.MATCH_PAIRS,
      question: 'Match the pairs:',
      pairs: [
        { english: 'I go', dadjo: 'na oso' },
        { english: 'I eat', dadjo: 'na sie' },
        { english: 'I drink', dadjo: 'na uro' },
        { english: 'I have', dadjo: 'na sogo' },
      ],
      xp: 10,
    },
    {
      type: exerciseTypes.WORD_BANK,
      question: 'Form the sentence:',
      text: 'I love you',
      words: ['na', 'turo', 'niŋga', 'ni', 'sogo'],
      correct: ['na', 'turo', 'niŋga'],
      xp: 10,
    },
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'I love you',
      answer: 'na turo niŋga',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'Translate to Dadjo:',
      text: 'I eat',
      options: ['na oso', 'na sie', 'na uro', 'na sogo'],
      correct: 1,
      xp: 10,
    },
    {
      type: exerciseTypes.LISTEN_TYPE,
      question: 'Listen and type what you hear:',
      text: 'na sogo',
      answer: 'na sogo',
      hint: 'Type exactly what you hear',
      xp: 10,
    },
    {
      type: exerciseTypes.FILL_BLANK,
      question: 'Complete the sentence:',
      text: 'ni ___ (you eat)',
      options: ['oso', 'sie', 'uro', 'sogo'],
      correct: 1,
      xp: 10,
    },
    {
      type: exerciseTypes.DRAG_DROP,
      question: 'Arrange the words to form a sentence:',
      text: 'You go',
      words: ['ni', 'oso', 'na', 'sie'],
      correct: ['ni', 'oso'],
      xp: 10,
    },
    {
      type: exerciseTypes.SPEAK,
      question: 'Say this sentence:',
      text: 'na turo niŋga',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "na uro" mean?',
      options: ['I go', 'I eat', 'I drink', 'I have'],
      correct: 2,
      xp: 10,
    },
    {
      type: exerciseTypes.READ_SELECT,
      question: 'Select the real Dadjo words:',
      words: ['sogo', 'oso', 'Xyzt', 'sie', 'Qwert', 'uro'],
      correct: ['sogo', 'oso', 'sie', 'uro'],
      xp: 10,
    },
  ],

  // Common Phrases - Lesson 3
  3: [
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "Ange Angala" mean?',
      options: ['What is your name?', 'How are you?', 'Where are you?', 'I love you'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'What is your name?',
      answer: 'ange angala',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.MATCH_PAIRS,
      question: 'Match the pairs:',
      pairs: [
        { english: 'What is your name?', dadjo: 'Ange Angala' },
        { english: 'I love you', dadjo: 'Na turo niŋga' },
        { english: 'He spoke to me', dadjo: 'Am legeyi tanga' },
      ],
      xp: 10,
    },
    {
      type: exerciseTypes.WORD_BANK,
      question: 'Form the sentence:',
      text: 'I love you',
      words: ['Na', 'turo', 'niŋga', 'Ange', 'Angala'],
      correct: ['Na', 'turo', 'niŋga'],
      xp: 10,
    },
    {
      type: exerciseTypes.FILL_BLANK,
      question: 'Complete the sentence:',
      text: 'Am legeyi ___ (He spoke to me)',
      options: ['tanga', 'niŋga', 'naŋga', 'taŋga'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.DRAG_DROP,
      question: 'Arrange the words to form a sentence:',
      text: 'I saw the man who came',
      words: ['Na', 'ori', 'yewe', 'me', 'ayi'],
      correct: ['Na', 'ori', 'yewe', 'me', 'ayi'],
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'Translate to Dadjo:',
      text: 'He spoke to me',
      options: ['Am legeyi tanga', 'Na turo niŋga', 'Ange Angala', 'Na ori yewe'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.TRANSLATE,
      question: 'Type the Dadjo translation:',
      text: 'I saw the man who came',
      answer: 'na ori yewe me ayi',
      hint: 'Lowercase',
      xp: 10,
    },
    {
      type: exerciseTypes.LISTEN_TYPE,
      question: 'Listen and type what you hear:',
      text: 'Ange Angala',
      answer: 'ange angala',
      hint: 'Type exactly what you hear',
      xp: 10,
    },
    {
      type: exerciseTypes.MULTIPLE_CHOICE,
      question: 'What does "Na ori yewe me ayi" mean?',
      options: ['I saw the man who came', 'I love you', 'What is your name?', 'He spoke to me'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.FILL_BLANK,
      question: 'Complete the sentence:',
      text: 'Na ___ niŋga (I love you)',
      options: ['turo', 'sogo', 'oso', 'sie'],
      correct: 0,
      xp: 10,
    },
    {
      type: exerciseTypes.SPEAK,
      question: 'Say this sentence:',
      text: 'Ange Angala',
      xp: 10,
    },
    {
      type: exerciseTypes.READ_SELECT,
      question: 'Select the real Dadjo phrases:',
      words: ['Ange Angala', 'Na turo niŋga', 'Xyzt', 'Am legeyi tanga', 'Qwert'],
      correct: ['Ange Angala', 'Na turo niŋga', 'Am legeyi tanga'],
      xp: 10,
    },
    {
      type: exerciseTypes.DRAG_DROP,
      question: 'Arrange the words to form a sentence:',
      text: 'You saw the woman that I saw',
      words: ['Ni', 'ori', 'ure', 'me', 'na', 'ori'],
      correct: ['Ni', 'ori', 'ure', 'me', 'na', 'ori'],
      xp: 10,
    },
  ],
}

// Get exercises for a lesson
export function getExercisesForLesson(lessonId) {
  return exerciseTemplates[lessonId] || []
}

// Get random exercises from a pool (for practice sessions)
export function getRandomExercises(count, lessonIds = []) {
  const allExercises = []
  lessonIds.forEach((id) => {
    allExercises.push(...(exerciseTemplates[id] || []))
  })
  
  // Shuffle and return count
  const shuffled = [...allExercises].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
