import * as SQLite from 'expo-sqlite';
import { TABLE_STATEMENTS } from './schema';
import { SEED_EXERCISES } from './seeds';

let _db = null;

export async function getDb() {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('adaptive_workout.db');
    await _db.execAsync('PRAGMA journal_mode = WAL;');
    await _db.execAsync('PRAGMA foreign_keys = ON;');
  }
  return _db;
}

export async function initDb() {
  const db = await getDb();

  // Create all tables
  for (const stmt of TABLE_STATEMENTS) {
    await db.execAsync(stmt);
  }

  // Seed exercises if not present
  const count = await db.getFirstAsync('SELECT COUNT(*) as count FROM exercises');
  if (count.count === 0) {
    await seedExercises(db);
  }

  return db;
}

async function seedExercises(db) {
  for (const ex of SEED_EXERCISES) {
    await db.runAsync(
      `INSERT INTO exercises (name, muscle_groups, equipment, category, instructions)
       VALUES (?, ?, ?, ?, ?)`,
      [ex.name, ex.muscle_groups, ex.equipment, ex.category, ex.instructions]
    );
  }
}

// ── Workout CRUD ───────────────────────────────────────────────────────────────

export async function createWorkout(notes = '') {
  const db = await getDb();
  const date = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO workouts (date, notes, completed) VALUES (?, ?, 0)',
    [date, notes]
  );
  return result.lastInsertRowId;
}

export async function completeWorkout(workoutId) {
  const db = await getDb();
  await db.runAsync('UPDATE workouts SET completed = 1 WHERE id = ?', [workoutId]);
}

export async function getWorkouts(limit = 20) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT w.*,
       COUNT(DISTINCT we.exercise_id) as exercise_count,
       COUNT(s.id) as set_count
     FROM workouts w
     LEFT JOIN workout_exercises we ON we.workout_id = w.id
     LEFT JOIN sets s ON s.workout_exercise_id = we.id AND s.completed = 1
     GROUP BY w.id
     ORDER BY w.date DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getWorkoutById(workoutId) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM workouts WHERE id = ?', [workoutId]);
}

// ── Workout Exercise CRUD ─────────────────────────────────────────────────────

export async function addExerciseToWorkout(workoutId, exerciseId, sortOrder = 0) {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)',
    [workoutId, exerciseId, sortOrder]
  );
  return result.lastInsertRowId;
}

export async function getWorkoutExercises(workoutId) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT we.*, e.name, e.muscle_groups, e.equipment, e.category
     FROM workout_exercises we
     JOIN exercises e ON e.id = we.exercise_id
     WHERE we.workout_id = ?
     ORDER BY we.sort_order`,
    [workoutId]
  );
}

export async function removeExerciseFromWorkout(workoutExerciseId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM sets WHERE workout_exercise_id = ?', [workoutExerciseId]);
  await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', [workoutExerciseId]);
}

// ── Set CRUD ──────────────────────────────────────────────────────────────────

export async function getSetsForWorkoutExercise(workoutExerciseId) {
  const db = await getDb();
  return db.getAllAsync(
    'SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number',
    [workoutExerciseId]
  );
}

export async function logSet(workoutExerciseId, setNumber, weight, reps) {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    'SELECT id FROM sets WHERE workout_exercise_id = ? AND set_number = ?',
    [workoutExerciseId, setNumber]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE sets SET weight = ?, reps = ?, completed = 1, logged_at = ?
       WHERE id = ?`,
      [weight, reps, new Date().toISOString(), existing.id]
    );
    return existing.id;
  } else {
    const result = await db.runAsync(
      `INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed, logged_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [workoutExerciseId, setNumber, weight, reps, new Date().toISOString()]
    );
    return result.lastInsertRowId;
  }
}

export async function savePostSetAnswers(setId, { rpe, difficulty, completedAllReps, actualReps, discomfort, discomfortNote }) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE sets SET
       rpe = ?, difficulty = ?, completed_all_reps = ?,
       actual_reps = ?, discomfort = ?, discomfort_note = ?
     WHERE id = ?`,
    [rpe, difficulty, completedAllReps ? 1 : 0, actualReps, discomfort ? 1 : 0, discomfortNote || null, setId]
  );
}

// ── Exercise queries ──────────────────────────────────────────────────────────

export async function getAllExercises() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM exercises ORDER BY category, name');
}

export async function getExerciseById(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM exercises WHERE id = ?', [id]);
}

export async function searchExercises(query) {
  const db = await getDb();
  const q = `%${query}%`;
  return db.getAllAsync(
    `SELECT * FROM exercises
     WHERE name LIKE ? OR muscle_groups LIKE ? OR category LIKE ?
     ORDER BY category, name`,
    [q, q, q]
  );
}

// ── Recommendation queries ────────────────────────────────────────────────────

export async function getRecommendation(exerciseId) {
  const db = await getDb();
  return db.getFirstAsync(
    'SELECT * FROM recommendations WHERE exercise_id = ?',
    [exerciseId]
  );
}

export async function upsertRecommendation(exerciseId, suggestedWeight, suggestedReps, adjustmentReason, workoutId) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO recommendations (exercise_id, suggested_weight, suggested_reps, adjustment_reason, based_on_workout_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(exercise_id) DO UPDATE SET
       suggested_weight = excluded.suggested_weight,
       suggested_reps = excluded.suggested_reps,
       adjustment_reason = excluded.adjustment_reason,
       based_on_workout_id = excluded.based_on_workout_id,
       updated_at = excluded.updated_at`,
    [exerciseId, suggestedWeight, suggestedReps, adjustmentReason, workoutId, new Date().toISOString()]
  );
}

// Returns last N sessions of set data for an exercise (for adaptive algorithm)
export async function getRecentSetsForExercise(exerciseId, limit = 3) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT s.*, w.id as workout_id, w.date as workout_date
     FROM sets s
     JOIN workout_exercises we ON we.id = s.workout_exercise_id
     JOIN workouts w ON w.id = we.workout_id
     WHERE we.exercise_id = ? AND s.completed = 1
     ORDER BY w.date DESC, s.set_number DESC
     LIMIT ?`,
    [exerciseId, limit * 6]  // ~6 sets per session
  );
}

export async function getExerciseHistory(exerciseId) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT
       w.id as workout_id,
       w.date as workout_date,
       s.set_number,
       s.weight,
       s.reps,
       s.rpe,
       s.difficulty,
       s.completed_all_reps,
       s.discomfort
     FROM sets s
     JOIN workout_exercises we ON we.id = s.workout_exercise_id
     JOIN workouts w ON w.id = we.workout_id
     WHERE we.exercise_id = ? AND s.completed = 1
     ORDER BY w.date DESC, s.set_number ASC`,
    [exerciseId]
  );
}
