export const koreanData = {
  language: 'Korean',
  code: 'korean',
  nativeName: '한국어',
  description: 'Hangul, everyday conversation, and 1,000 beginner words',
  icon: '🇰🇷',
  sections: [
    {
      id: 201,
      title: 'Hangul Foundations',
      units: [
        {
          id: 201,
          title: 'First Words',
          communicationGoal: 'Read hangul and recognize core vocabulary',
          levels: [
            {
              id: 201,
              title: 'Level 1',
              lessons: [
                { id: 201, name: 'Greetings & Basics', exerciseCount: 10, xp: 20 },
                { id: 202, name: 'Numbers & Time', exerciseCount: 10, xp: 20 },
              ],
            },
          ],
        },
        {
          id: 202,
          title: 'Daily Life',
          communicationGoal: 'Talk about home, food, and routines',
          levels: [
            {
              id: 202,
              title: 'Level 1',
              lessons: [
                { id: 203, name: 'Home & Family', exerciseCount: 10, xp: 20 },
                { id: 204, name: 'Food & Shopping', exerciseCount: 10, xp: 20 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
