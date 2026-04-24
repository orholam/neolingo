// Course data structure: Sections → Units → Levels → Lessons

export const courseData = {
  language: 'Dadjo',
  sections: [
    {
      id: 1,
      title: 'Basics',
      units: [
        {
          id: 1,
          title: 'Greetings',
          communicationGoal: 'Introduce yourself and greet others',
          levels: [
            {
              id: 1,
              title: 'Level 1',
              lessons: [
                {
                  id: 1,
                  name: 'Basics 1',
                  exerciseCount: 12,
                  xp: 20,
                },
                {
                  id: 2,
                  name: 'Basics 2',
                  exerciseCount: 14,
                  xp: 20,
                },
              ],
            },
            {
              id: 2,
              title: 'Level 2',
              lessons: [
                {
                  id: 3,
                  name: 'Common Phrases',
                  exerciseCount: 15,
                  xp: 20,
                },
                {
                  id: 4,
                  name: 'Greetings',
                  exerciseCount: 13,
                  xp: 20,
                },
              ],
            },
          ],
        },
        {
          id: 2,
          title: 'Travel',
          communicationGoal: 'Navigate travel situations',
          levels: [
            {
              id: 3,
              title: 'Level 1',
              lessons: [
                {
                  id: 5,
                  name: 'Travel Basics',
                  exerciseCount: 14,
                  xp: 20,
                },
                {
                  id: 6,
                  name: 'Directions',
                  exerciseCount: 16,
                  xp: 20,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: 'Food & Dining',
      units: [
        {
          id: 3,
          title: 'Restaurant',
          communicationGoal: 'Order food and interact at restaurants',
          levels: [
            {
              id: 4,
              title: 'Level 1',
              lessons: [
                {
                  id: 7,
                  name: 'Restaurant Basics',
                  exerciseCount: 15,
                  xp: 20,
                },
                {
                  id: 8,
                  name: 'Ordering Food',
                  exerciseCount: 17,
                  xp: 20,
                },
              ],
            },
          ],
        },
        {
          id: 4,
          title: 'Shopping',
          communicationGoal: 'Shop for groceries and items',
          levels: [
            {
              id: 5,
              title: 'Level 1',
              lessons: [
                {
                  id: 9,
                  name: 'Shopping Basics',
                  exerciseCount: 14,
                  xp: 20,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'Family & Relationships',
      units: [
        {
          id: 5,
          title: 'Family',
          communicationGoal: 'Talk about family members',
          levels: [
            {
              id: 6,
              title: 'Level 1',
              lessons: [
                {
                  id: 10,
                  name: 'Family Members',
                  exerciseCount: 15,
                  xp: 20,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// Helper function to get lesson by ID
export function getLessonById(lessonId, course = courseData) {
  for (const section of course.sections) {
    for (const unit of section.units) {
      for (const level of unit.levels) {
        const lesson = level.lessons.find((l) => l.id === lessonId)
        if (lesson) {
          return { lesson, section, unit, level }
        }
      }
    }
  }
  return null
}

// Helper function to get all lessons in order
export function getAllLessons(course = courseData) {
  const lessons = []
  for (const section of course.sections) {
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

// Helper function to check if lesson is unlocked
export function isLessonUnlocked(lessonId, completedLessons, course = courseData) {
  if (completedLessons.includes(lessonId)) return true

  const allLessons = getAllLessons(course)
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  if (lessonIndex === 0) return true // First lesson is always unlocked
  if (lessonIndex === -1) return false

  // Check if previous lesson is completed
  const previousLesson = allLessons[lessonIndex - 1]
  return completedLessons.includes(previousLesson.id)
}

