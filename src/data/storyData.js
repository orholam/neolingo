// Interactive story data

export const stories = [
  {
    id: 1,
    title: 'Meeting María',
    level: 'Beginner',
    xp: 30,
    segments: [
      {
        id: 1,
        text: 'Hola! Me llamo María. ¿Cómo te llamas?',
        translation: "Hello! My name is María. What's your name?",
        audio: null, // Placeholder for audio
      },
      {
        id: 2,
        type: 'choice',
        question: 'How do you respond?',
        choices: [
          {
            text: 'Me llamo Juan',
            translation: 'My name is Juan',
            correct: true,
            nextSegment: 3,
          },
          {
            text: 'Mucho gusto',
            translation: 'Nice to meet you',
            correct: false,
            nextSegment: 3,
            feedback: "That's polite, but she asked for your name!",
          },
        ],
      },
      {
        id: 3,
        text: 'Mucho gusto, Juan! ¿De dónde eres?',
        translation: 'Nice to meet you, Juan! Where are you from?',
      },
      {
        id: 4,
        type: 'question',
        question: 'What does "¿De dónde eres?" mean?',
        options: [
          "Where are you from?",
          "How are you?",
          "What's your name?",
          "How old are you?",
        ],
        correct: 0,
        xp: 10,
      },
      {
        id: 5,
        type: 'choice',
        question: 'María asks where you are from. What do you say?',
        choices: [
          {
            text: 'Soy de Estados Unidos',
            translation: 'I am from the United States',
            correct: true,
            nextSegment: 6,
          },
          {
            text: 'Estoy bien',
            translation: 'I am fine',
            correct: false,
            nextSegment: 6,
            feedback: "That means 'I am fine', not where you're from!",
          },
        ],
      },
      {
        id: 6,
        text: '¡Qué interesante! Yo soy de España. ¿Hablas español?',
        translation: 'How interesting! I am from Spain. Do you speak Dadjo?',
      },
      {
        id: 7,
        type: 'question',
        question: 'What does "¿Hablas español?" mean?',
        options: [
          'Do you speak Dadjo?',
          'Do you like Dadjo?',
          'Are you Dadjo?',
          'Do you study Dadjo?',
        ],
        correct: 0,
        xp: 10,
      },
      {
        id: 8,
        text: '¡Perfecto! Fue un placer conocerte, Juan. ¡Hasta luego!',
        translation: 'Perfect! It was a pleasure to meet you, Juan. See you later!',
      },
      {
        id: 9,
        type: 'question',
        question: 'What does "Hasta luego" mean?',
        options: ['Hello', 'Thank you', 'See you later', 'Goodbye'],
        correct: 2,
        xp: 10,
      },
    ],
  },
  {
    id: 2,
    title: 'At the Restaurant',
    level: 'Beginner',
    xp: 30,
    segments: [
      {
        id: 1,
        text: 'Buenos días. Bienvenido al restaurante.',
        translation: 'Good morning. Welcome to the restaurant.',
      },
      {
        id: 2,
        type: 'question',
        question: 'What does "Bienvenido" mean?',
        options: ['Welcome', 'Goodbye', 'Thank you', 'Please'],
        correct: 0,
        xp: 10,
      },
      {
        id: 3,
        text: '¿Qué desea comer?',
        translation: 'What would you like to eat?',
      },
      {
        id: 4,
        type: 'choice',
        question: 'The waiter asks what you want to eat. What do you say?',
        choices: [
          {
            text: 'Quiero una pizza, por favor',
            translation: 'I want a pizza, please',
            correct: true,
            nextSegment: 5,
          },
          {
            text: 'Tengo hambre',
            translation: 'I am hungry',
            correct: false,
            nextSegment: 5,
            feedback: "That's not what you want to eat!",
          },
        ],
      },
      {
        id: 5,
        text: 'Muy bien. ¿Y para beber?',
        translation: 'Very good. And to drink?',
      },
      {
        id: 6,
        type: 'choice',
        question: 'The waiter asks what you want to drink. What do you say?',
        choices: [
          {
            text: 'Un agua, por favor',
            translation: 'A water, please',
            correct: true,
            nextSegment: 7,
          },
          {
            text: 'Tengo sed',
            translation: 'I am thirsty',
            correct: false,
            nextSegment: 7,
            feedback: "That's not what you want to drink!",
          },
        ],
      },
      {
        id: 7,
        text: 'Perfecto. Aquí tiene su comida. ¡Buen provecho!',
        translation: 'Perfect. Here is your food. Enjoy your meal!',
      },
      {
        id: 8,
        type: 'question',
        question: 'What does "Buen provecho" mean?',
        options: [
          'Enjoy your meal',
          'Thank you',
          'You are welcome',
          'Good morning',
        ],
        correct: 0,
        xp: 10,
      },
      {
        id: 9,
        text: 'Gracias. La comida está deliciosa.',
        translation: 'Thank you. The food is delicious.',
      },
    ],
  },
]

// Get story by ID
export function getStoryById(storyId) {
  return stories.find((s) => s.id === storyId) || null
}

// Get all stories
export function getAllStories() {
  return stories
}

