// Course data structure for Ancient Sumerian
// Cuneiform Unicode block: U+12000–U+123FF

export const sumerianData = {
  language: 'Ancient Sumerian',
  code: 'sumerian',
  nativeName: '𒅴𒂗𒍪𒆳',
  description: "The world's oldest written language (c. 3100 BCE)",
  icon: '𒀭',
  sections: [
    {
      id: 101,
      title: 'First Signs',
      units: [
        {
          id: 101,
          title: 'Heaven & Earth',
          communicationGoal: 'Read and recognize the first cuneiform signs',
          levels: [
            {
              id: 101,
              title: 'Level 1',
              lessons: [
                { id: 101, name: 'Basic Signs', exerciseCount: 10, xp: 20 },
                { id: 102, name: 'The Elements', exerciseCount: 10, xp: 20 },
              ],
            },
          ],
        },
        {
          id: 102,
          title: 'People & Society',
          communicationGoal: 'Learn words for people and rulers',
          levels: [
            {
              id: 102,
              title: 'Level 1',
              lessons: [
                { id: 103, name: 'People & Royalty', exerciseCount: 10, xp: 20 },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export function getSumerianLessonById(lessonId) {
  for (const section of sumerianData.sections) {
    for (const unit of section.units) {
      for (const level of unit.levels) {
        const lesson = level.lessons.find((l) => l.id === lessonId)
        if (lesson) return { lesson, section, unit, level }
      }
    }
  }
  return null
}

export function getAllSumerianLessons() {
  const lessons = []
  for (const section of sumerianData.sections) {
    for (const unit of section.units) {
      for (const level of unit.levels) {
        for (const lesson of level.lessons) {
          lessons.push({
            ...lesson,
            sectionId: section.id,
            unitId: unit.id,
            levelId: level.id,
          })
        }
      }
    }
  }
  return lessons
}
