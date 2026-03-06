// SQL schema for the adaptive workout app

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_groups TEXT NOT NULL,
    equipment TEXT NOT NULL,
    category TEXT NOT NULL,
    instructions TEXT
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    notes TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (workout_id) REFERENCES workouts(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL,
    reps INTEGER,
    completed INTEGER DEFAULT 0,
    rpe INTEGER,
    difficulty TEXT,
    completed_all_reps INTEGER,
    actual_reps INTEGER,
    discomfort INTEGER DEFAULT 0,
    discomfort_note TEXT,
    logged_at TEXT,
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL UNIQUE,
    suggested_weight REAL,
    suggested_reps INTEGER,
    adjustment_reason TEXT,
    based_on_workout_id INTEGER,
    updated_at TEXT,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );
`;

// Each table as its own statement for expo-sqlite
export const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_groups TEXT NOT NULL,
    equipment TEXT NOT NULL,
    category TEXT NOT NULL,
    instructions TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    notes TEXT,
    completed INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (workout_id) REFERENCES workouts(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  )`,
  `CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL,
    reps INTEGER,
    completed INTEGER DEFAULT 0,
    rpe INTEGER,
    difficulty TEXT,
    completed_all_reps INTEGER,
    actual_reps INTEGER,
    discomfort INTEGER DEFAULT 0,
    discomfort_note TEXT,
    logged_at TEXT,
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
  )`,
  `CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL UNIQUE,
    suggested_weight REAL,
    suggested_reps INTEGER,
    adjustment_reason TEXT,
    based_on_workout_id INTEGER,
    updated_at TEXT,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  )`,
];
