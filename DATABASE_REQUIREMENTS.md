# Database Requirements

This document outlines the database schema and data structures needed to support the current state of the language learning application.

## Overview

The application currently uses localStorage for data persistence. To migrate to a database-backed system, you'll need to support the following data structures and operations.

## Core Tables

### 1. Users Table

**Purpose**: Store user account information

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique user identifier
- `email`: User email (unique, for login)
- `password_hash`: Hashed password
- `name`: User's display name
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### 2. User Progress Table

**Purpose**: Track user's learning progress, XP, and daily statistics

```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  daily_xp INTEGER DEFAULT 0,
  last_daily_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Fields**:
- `id`: Unique progress record identifier
- `user_id`: Foreign key to users table
- `total_xp`: Total experience points earned
- `daily_xp`: Experience points earned today
- `last_daily_reset`: Timestamp of last daily XP reset (used to reset daily_xp at midnight)

**Operations Needed**:
- Get user progress by user_id
- Update total_xp and daily_xp
- Reset daily_xp when a new day starts
- Increment XP when exercises are completed

---

### 3. Completed Lessons Table

**Purpose**: Track which lessons each user has completed

```sql
CREATE TABLE completed_lessons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

**Fields**:
- `id`: Unique record identifier
- `user_id`: Foreign key to users table
- `lesson_id`: ID of the completed lesson (references lesson data)
- `completed_at`: Timestamp when lesson was completed

**Operations Needed**:
- Check if a lesson is completed for a user
- Mark a lesson as completed
- Get all completed lessons for a user
- Get completion count for progress calculations
- Check if a lesson is unlocked (based on previous lesson completion)

**Lesson Unlocking Logic**:
- The first lesson (lesson_id = 1) is always unlocked
- A lesson is unlocked if the previous lesson (in sequential order) is completed
- Lessons are ordered by their `lesson_id` in the course data structure
- Locked lessons cannot be accessed until the prerequisite lesson is completed

**Example Query - Check if lesson is unlocked**:
```sql
-- Check if lesson is unlocked (previous lesson must be completed)
WITH lesson_order AS (
  SELECT lesson_id, 
         LAG(lesson_id) OVER (ORDER BY lesson_id) as previous_lesson_id
  FROM (SELECT DISTINCT lesson_id FROM course_structure ORDER BY lesson_id) lessons
)
SELECT 
  CASE 
    WHEN lo.lesson_id = 1 THEN true  -- First lesson always unlocked
    WHEN EXISTS (
      SELECT 1 FROM completed_lessons cl 
      WHERE cl.user_id = ? AND cl.lesson_id = lo.previous_lesson_id
    ) THEN true
    ELSE false
  END as is_unlocked
FROM lesson_order lo
WHERE lo.lesson_id = ?;
```

---

### 4. Mistakes Table

**Purpose**: Track mistakes made by users for spaced repetition practice

```sql
CREATE TABLE mistakes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL,
  exercise_index INTEGER NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique mistake record identifier
- `user_id`: Foreign key to users table
- `lesson_id`: ID of the lesson where mistake occurred
- `exercise_index`: Index of the exercise within the lesson
- `exercise_type`: Type of exercise (e.g., 'multiple-choice', 'translate', 'match-pairs')
- `timestamp`: When the mistake was made

**Operations Needed**:
- Record a new mistake
- Get mistakes for a specific lesson
- Get mistakes by exercise type
- Get mistakes for spaced repetition (filter by timestamp)
- Clear mistakes for a lesson (when user practices and corrects them)

**Indexes Recommended**:
- `(user_id, lesson_id)` for quick lesson-specific queries
- `(user_id, timestamp)` for spaced repetition queries
- `(user_id, exercise_type)` for type-based queries

---

### 5. Streak Table

**Purpose**: Track daily learning streaks

```sql
CREATE TABLE streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  last_date DATE NOT NULL,
  longest_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Fields**:
- `id`: Unique streak record identifier
- `user_id`: Foreign key to users table
- `current_streak`: Current consecutive days of learning
- `last_date`: Last date the user completed a lesson/practice
- `longest_streak`: User's longest streak ever achieved
- `updated_at`: Last update timestamp

**Operations Needed**:
- Get current streak for a user
- Update streak when user completes a lesson/practice
- Check if streak is maintained today
- Reset streak if user missed a day
- Increment streak if user continues from yesterday

**Logic**:
- If last_date is today: no change
- If last_date is yesterday: increment streak
- If last_date is 2+ days ago: reset streak to 1

---

### 6. Gems Table

**Purpose**: Track user's gem currency

```sql
CREATE TABLE gems (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 500,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Fields**:
- `id`: Unique gem record identifier
- `user_id`: Foreign key to users table
- `amount`: Current gem balance (default: 500 starting gems)
- `updated_at`: Last update timestamp

**Operations Needed**:
- Get gem balance for a user
- Add gems (when completing lessons, daily goals)
- Spend gems (when refilling hearts)
- Check if user can afford a purchase

**Gem Earning Rules** (current implementation):
- 10 gems per lesson completed
- 20 gems for reaching daily goal

**Gem Spending Rules** (current implementation):
- 100 gems to refill hearts

---

### 7. Hearts Table

**Purpose**: Track user's hearts (lives) system

```sql
CREATE TABLE hearts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  current_hearts INTEGER DEFAULT 5,
  max_hearts INTEGER DEFAULT 5,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

**Fields**:
- `id`: Unique heart record identifier
- `user_id`: Foreign key to users table
- `current_hearts`: Current number of hearts (0-5)
- `max_hearts`: Maximum hearts (default: 5)
- `last_update`: Timestamp of last heart change (used for regeneration)

**Operations Needed**:
- Get current hearts for a user
- Lose a heart (when user makes a mistake)
- Refill hearts (when user spends gems)
- Regenerate hearts over time (1 heart every 4 hours)
- Check if user has hearts available

**Heart Regeneration Logic**:
- 1 heart regenerates every 4 hours
- Maximum of 5 hearts
- Calculate regeneration based on time difference since `last_update`

---

## Data Relationships

```
users (1) ──< (many) user_progress
users (1) ──< (many) completed_lessons
users (1) ──< (many) mistakes
users (1) ──< (1) streaks
users (1) ──< (1) gems
users (1) ──< (1) hearts
```

## API Endpoints Needed

### User Management
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Progress Management
- `GET /api/progress` - Get user's progress data
- `POST /api/progress/xp` - Add XP
- `POST /api/progress/lesson/:lessonId/complete` - Mark lesson as completed
- `GET /api/progress/lessons/completed` - Get all completed lessons
- `GET /api/progress/lessons/:lessonId/completed` - Check if lesson is completed
- `GET /api/progress/lessons/:lessonId/unlocked` - Check if lesson is unlocked
- `GET /api/progress/lessons/status` - Get all lessons with completion and unlock status

### Mistakes
- `POST /api/mistakes` - Record a mistake
- `GET /api/mistakes` - Get user's mistakes (with filters)
- `GET /api/mistakes/lesson/:lessonId` - Get mistakes for a lesson
- `DELETE /api/mistakes/lesson/:lessonId` - Clear mistakes for a lesson

### Streak
- `GET /api/streak` - Get current streak
- `POST /api/streak/update` - Update streak (called when lesson/practice completed)

### Gems
- `GET /api/gems` - Get gem balance
- `POST /api/gems/add` - Add gems
- `POST /api/gems/spend` - Spend gems
- `GET /api/gems/can-afford/:amount` - Check if user can afford amount

### Hearts
- `GET /api/hearts` - Get current hearts
- `POST /api/hearts/lose` - Lose a heart
- `POST /api/hearts/refill` - Refill hearts (spends gems)

## Data Migration from localStorage

When migrating from localStorage to database:

1. **User Registration/Login**: Users will need to create accounts
2. **Data Import**: Optionally allow users to import their localStorage data
3. **Default Values**: New users start with:
   - 500 gems
   - 5 hearts
   - 0 XP
   - 0 streak
   - No completed lessons

## Additional Considerations

### Daily Reset Logic
- Implement a cron job or scheduled task to reset `daily_xp` at midnight for all users
- Or check `last_daily_reset` on each request and reset if needed

### Heart Regeneration
- Can be calculated on-the-fly based on `last_update` timestamp
- Or implement a background job to regenerate hearts periodically

### Performance Optimizations
- Index frequently queried fields (user_id, lesson_id, timestamp)
- Cache user progress data for frequently accessed information
- Consider pagination for mistakes table if it grows large

### Data Validation
- Ensure `current_hearts` stays between 0 and `max_hearts`
- Ensure `gems.amount` never goes negative
- Validate `lesson_id` exists in course data
- Validate `exercise_type` matches allowed types

## Static Data (No Database Needed)

The following data is currently static and doesn't need database storage:
- **Course Data** (`courseData.js`): Sections, units, levels, lessons structure
- **Exercise Data** (`exerciseData.js`): Exercise templates and questions
- **Story Data** (`storyData.js`): Story content and segments

These can remain as static files or be moved to a content management system if needed.

## Example Queries

### Get user's complete progress
```sql
SELECT 
  up.total_xp,
  up.daily_xp,
  s.current_streak,
  g.amount as gems,
  h.current_hearts,
  COUNT(cl.lesson_id) as completed_lessons_count
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN streaks s ON u.id = s.user_id
LEFT JOIN gems g ON u.id = g.user_id
LEFT JOIN hearts h ON u.id = h.user_id
LEFT JOIN completed_lessons cl ON u.id = cl.user_id
WHERE u.id = ?
GROUP BY up.total_xp, up.daily_xp, s.current_streak, g.amount, h.current_hearts;
```

### Get mistakes for spaced repetition
```sql
SELECT * FROM mistakes
WHERE user_id = ?
  AND timestamp < NOW() - INTERVAL '1 day'
ORDER BY timestamp ASC
LIMIT 10;
```

### Check if lesson is unlocked
```sql
-- Lesson is unlocked if previous lesson is completed
-- First lesson (lesson_id = 1) is always unlocked
WITH lesson_order AS (
  SELECT lesson_id, 
         LAG(lesson_id) OVER (ORDER BY lesson_id) as previous_lesson_id
  FROM (SELECT DISTINCT lesson_id FROM course_structure ORDER BY lesson_id) lessons
)
SELECT 
  CASE 
    WHEN lo.lesson_id = 1 THEN true  -- First lesson always unlocked
    WHEN EXISTS (
      SELECT 1 FROM completed_lessons cl 
      WHERE cl.user_id = ? AND cl.lesson_id = lo.previous_lesson_id
    ) THEN true
    ELSE false
  END as is_unlocked
FROM lesson_order lo
WHERE lo.lesson_id = ?;
```

### Get all lessons with unlock status
```sql
-- Get all lessons with their completion and unlock status
WITH lesson_order AS (
  SELECT lesson_id, 
         LAG(lesson_id) OVER (ORDER BY lesson_id) as previous_lesson_id
  FROM (SELECT DISTINCT lesson_id FROM course_structure ORDER BY lesson_id) lessons
)
SELECT 
  lo.lesson_id,
  CASE 
    WHEN lo.lesson_id = 1 THEN true
    WHEN EXISTS (
      SELECT 1 FROM completed_lessons cl 
      WHERE cl.user_id = ? AND cl.lesson_id = lo.previous_lesson_id
    ) THEN true
    ELSE false
  END as is_unlocked,
  EXISTS(
    SELECT 1 FROM completed_lessons cl 
    WHERE cl.user_id = ? AND cl.lesson_id = lo.lesson_id
  ) as is_completed
FROM lesson_order lo
ORDER BY lo.lesson_id;
```

