// Exercise data for Ancient Sumerian lessons
// Cuneiform Unicode reference:
//   𒀭 an    = sky / heaven / god (divine determinative)
//   𒆳 ki    = earth / land
//   𒀀 a     = water
//   𒄑 giš   = wood / tree (proper: ĝiš)
//   𒌓 utu   = sun / the sun god
//   𒃲 gal   = great / big
//   𒂗 en    = lord / high priest
//   𒌍 u     = ten / night
//   𒇽 lu2   = man / person
//   𒊩 munus = woman
//   𒅴 lugal = king (lit. "big man": lu₂ + gal)
//   𒊩𒌆 nin  = lady / mistress / queen

// Note: 'dadjo' key is reused as the generic "target language" field
// to stay compatible with the MatchPairs component.

export const sumerianExerciseTemplates = {

  // ── Lesson 101: Basic Signs ─────────────────────────────────────────────────
  101: [
    {
      type: 'multiple-choice',
      question: 'What does the cuneiform sign 𒀭 mean?',
      text: '𒀭',
      options: ['sky / heaven', 'earth / land', 'water', 'tree / wood'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'match-pairs',
      question: 'Match each cuneiform sign to its meaning:',
      pairs: [
        { english: 'sky / heaven', dadjo: '𒀭 (an)' },
        { english: 'earth / land', dadjo: '𒆳 (ki)' },
        { english: 'water',        dadjo: '𒀀 (a)'  },
        { english: 'tree / wood',  dadjo: '𒄑 (giš)' },
      ],
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'Which sign means "earth / land"?',
      options: ['𒀭 (an)', '𒆳 (ki)', '𒀀 (a)', '𒄑 (giš)'],
      correct: 1,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒀭',
      answer: 'an',
      hint: 'This sign means "sky/heaven" and also marks divine names',
      xp: 10,
    },
    {
      type: 'fill-blank',
      question: 'Complete: the sign for "water" is:',
      text: '___ means water',
      options: ['𒀀 (a)', '𒀭 (an)', '𒆳 (ki)', '𒄑 (giš)'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'What does 𒀀 mean?',
      text: '𒀀',
      options: ['fire', 'water', 'earth', 'air'],
      correct: 1,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒆳',
      answer: 'ki',
      hint: 'This sign means "earth" or "land"',
      xp: 10,
    },
    {
      type: 'read-select',
      question: 'Select only the real cuneiform signs:',
      words: ['𒀭', '𒆳', 'ABC', '𒀀', 'XYZ', '𒄑'],
      correct: ['𒀭', '𒆳', '𒀀', '𒄑'],
      xp: 10,
    },
    {
      type: 'drag-drop',
      question: 'Arrange to say "sky and earth" (an ki):',
      text: 'sky earth',
      words: ['an', 'ki', 'a', 'gal'],
      correct: ['an', 'ki'],
      xp: 10,
    },
    {
      type: 'speak',
      question: 'Say these cuneiform signs aloud:',
      text: '𒀭 𒆳  (an ki)',
      xp: 10,
    },
  ],

  // ── Lesson 102: The Elements ────────────────────────────────────────────────
  102: [
    {
      type: 'multiple-choice',
      question: 'The sign 𒌓 (utu) represents:',
      text: '𒌓',
      options: ['the sun', 'the moon', 'the wind', 'the rain'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'match-pairs',
      question: 'Match each sign to its meaning:',
      pairs: [
        { english: 'sun',       dadjo: '𒌓 (utu)' },
        { english: 'great/big', dadjo: '𒃲 (gal)' },
        { english: 'ten/night', dadjo: '𒌍 (u)'   },
        { english: 'lord',      dadjo: '𒂗 (en)'  },
      ],
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'What does 𒃲 (gal) mean?',
      text: '𒃲',
      options: ['small', 'great / big', 'old', 'young'],
      correct: 1,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒌓',
      answer: 'utu',
      hint: 'This is also the name of the Sumerian sun god',
      xp: 10,
    },
    {
      type: 'fill-blank',
      question: 'Complete: 𒃲 means ___',
      text: '𒃲 means ___',
      options: ['great', 'small', 'dark', 'water'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'Which sign means "lord"?',
      options: ['𒌓 (utu)', '𒃲 (gal)', '𒌍 (u)', '𒂗 (en)'],
      correct: 3,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒃲',
      answer: 'gal',
      hint: 'This means "great" or "big"',
      xp: 10,
    },
    {
      type: 'word-bank',
      question: 'Form the Sumerian phrase: "great lord" (en gal)',
      text: 'great lord',
      words: ['en', 'gal', 'an', 'ki', 'utu'],
      correct: ['en', 'gal'],
      xp: 10,
    },
    {
      type: 'read-select',
      question: 'Select the signs related to the sky or heavens:',
      words: ['𒌓 (utu)', '𒀭 (an)', 'KUR', '𒆳 (ki)', '𒃲 (gal)'],
      correct: ['𒌓 (utu)', '𒀭 (an)'],
      xp: 10,
    },
    {
      type: 'speak',
      question: 'Say this Sumerian phrase aloud:',
      text: '𒂗 𒃲  (en gal)',
      xp: 10,
    },
  ],

  // ── Lesson 103: People & Royalty ────────────────────────────────────────────
  103: [
    {
      type: 'multiple-choice',
      question: 'What does 𒇽 (lu₂) mean?',
      text: '𒇽',
      options: ['man / person', 'woman', 'child', 'king'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'match-pairs',
      question: 'Match each sign to its meaning:',
      pairs: [
        { english: 'man / person',     dadjo: '𒇽 (lu₂)'  },
        { english: 'woman',            dadjo: '𒊩 (munus)' },
        { english: 'king',             dadjo: '𒅴 (lugal)' },
        { english: 'lady / mistress',  dadjo: '𒊩𒌆 (nin)'  },
      ],
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'The word "lugal" (𒅴) means:',
      options: ['man', 'woman', 'king', 'god'],
      correct: 2,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒇽',
      answer: 'lu2',
      hint: '"lu₂" means man/person — type it as lu2',
      xp: 10,
    },
    {
      type: 'fill-blank',
      question: 'Complete: 𒊩 (munus) means ___',
      text: '𒊩 means ___',
      options: ['woman', 'man', 'child', 'king'],
      correct: 0,
      xp: 10,
    },
    {
      type: 'multiple-choice',
      question: 'What does 𒊩𒌆 (nin) mean?',
      text: '𒊩𒌆',
      options: ['king', 'god', 'lady / mistress', 'water'],
      correct: 2,
      xp: 10,
    },
    {
      type: 'translate',
      question: 'Type the transliteration of this sign:',
      text: '𒅴',
      answer: 'lugal',
      hint: '"lugal" literally means "big man" (lu₂ + gal)',
      xp: 10,
    },
    {
      type: 'drag-drop',
      question: 'Arrange to say "great king" (lugal gal):',
      text: 'great king',
      words: ['lugal', 'gal', 'an', 'munus'],
      correct: ['lugal', 'gal'],
      xp: 10,
    },
    {
      type: 'read-select',
      question: 'Select only words that refer to people:',
      words: ['lu2', 'an', 'munus', 'ki', 'lugal', 'utu'],
      correct: ['lu2', 'munus', 'lugal'],
      xp: 10,
    },
    {
      type: 'speak',
      question: 'Say this Sumerian phrase aloud:',
      text: '𒅴 𒃲  (lugal gal)',
      xp: 10,
    },
  ],
}
