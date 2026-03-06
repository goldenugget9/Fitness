/**
 * Adaptive recommendation algorithm.
 *
 * After each workout, call computeRecommendation() with recent set data
 * for an exercise. It returns a { weight, reps, reason } object that gets
 * stored in the recommendations table and displayed to the user on their
 * next visit.
 *
 * Scoring model (per set):
 *   difficulty  : Too Easy → +1.0 | Just Right → 0 | Too Hard → -1.0
 *   RPE         : ≤5 → +0.5 | 6–7 → 0 | ≥8 → -0.5 (capped)
 *   rep comp.   : completed all → 0 | missed reps → -0.75
 *   discomfort  : yes → -1.5 (overrides everything — flag it)
 *
 * Average the per-set scores across the session:
 *   score > +0.5  → increase weight ~5 %  (round to nearest 2.5 lb)
 *   score < -0.5  → decrease weight ~5 %
 *   otherwise     → maintain; if score > +0.25 suggest +1 rep
 */

const WEIGHT_INCREMENT = 2.5; // lbs — round to nearest 2.5

function roundToIncrement(value, increment) {
  return Math.round(value / increment) * increment;
}

function difficultyScore(difficulty) {
  if (!difficulty) return 0;
  switch (difficulty) {
    case 'Too Easy': return 1.0;
    case 'Just Right': return 0;
    case 'Too Hard': return -1.0;
    default: return 0;
  }
}

function rpeScore(rpe) {
  if (rpe == null) return 0;
  if (rpe <= 5) return 0.5;
  if (rpe <= 7) return 0;
  return -0.5;
}

function repCompletionScore(completedAllReps) {
  // completedAllReps is stored as 0/1 in SQLite
  if (completedAllReps == null) return 0;
  return completedAllReps === 1 || completedAllReps === true ? 0 : -0.75;
}

function discomfortScore(discomfort) {
  if (discomfort === 1 || discomfort === true) return -1.5;
  return 0;
}

/**
 * @param {Array} sets - rows from the sets table with post-set fields populated
 * @param {number} currentWeight - last used weight for this exercise
 * @param {number} currentReps - last used reps for this exercise
 * @returns {{ weight: number, reps: number, reason: string, score: number }}
 */
export function computeRecommendation(sets, currentWeight, currentReps) {
  if (!sets || sets.length === 0) {
    return {
      weight: currentWeight,
      reps: currentReps,
      reason: 'No session data yet — start with a comfortable weight.',
      score: 0,
    };
  }

  // Only score sets that have at least one post-set answer filled in
  const answered = sets.filter(
    (s) => s.difficulty != null || s.rpe != null || s.completed_all_reps != null || s.discomfort != null
  );

  if (answered.length === 0) {
    return {
      weight: currentWeight,
      reps: currentReps,
      reason: 'Answer the post-set questions after your next session for personalized recommendations.',
      score: 0,
    };
  }

  // Check for any discomfort — if so, flag before anything else
  const hasDiscomfort = answered.some((s) => s.discomfort === 1 || s.discomfort === true);

  const scores = answered.map((s) => {
    return (
      difficultyScore(s.difficulty) +
      rpeScore(s.rpe) +
      repCompletionScore(s.completed_all_reps) +
      discomfortScore(s.discomfort)
    );
  });

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (hasDiscomfort) {
    return {
      weight: Math.max(currentWeight * 0.9, WEIGHT_INCREMENT),
      reps: currentReps,
      reason: '⚠️ Discomfort was reported. Weight reduced 10% — focus on form and consider a warm-up set.',
      score: avgScore,
    };
  }

  let newWeight = currentWeight;
  let newReps = currentReps;
  let reason = '';

  if (avgScore > 0.5) {
    // Increase weight by ~5%, round to nearest 2.5 lb
    const increase = roundToIncrement(currentWeight * 0.05, WEIGHT_INCREMENT);
    newWeight = currentWeight + Math.max(increase, WEIGHT_INCREMENT);
    reason = `You crushed it! Increasing weight by ${Math.max(increase, WEIGHT_INCREMENT)} lbs based on your effort scores.`;
  } else if (avgScore < -0.5) {
    // Decrease weight by ~5%
    const decrease = roundToIncrement(currentWeight * 0.05, WEIGHT_INCREMENT);
    newWeight = Math.max(currentWeight - Math.max(decrease, WEIGHT_INCREMENT), WEIGHT_INCREMENT);
    reason = `Sets felt tough. Dropping weight by ${Math.max(decrease, WEIGHT_INCREMENT)} lbs to help you nail your reps.`;
  } else if (avgScore > 0.25) {
    // Maintain weight but suggest +1 rep
    newReps = currentReps + 1;
    reason = `Solid session. Try adding one extra rep before stepping up the weight.`;
  } else {
    reason = `Good work — stick with ${currentWeight} lbs × ${currentReps} reps next time.`;
  }

  return { weight: newWeight, reps: newReps, reason, score: avgScore };
}

/**
 * Derives the "current" weight and reps for an exercise from its most recent session.
 */
export function deriveCurrentWeightReps(recentSets) {
  if (!recentSets || recentSets.length === 0) return { weight: 0, reps: 10 };
  // Use the most recent completed set
  const sorted = [...recentSets].sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));
  const latest = sorted[0];
  return { weight: latest.weight || 0, reps: latest.reps || 10 };
}

/**
 * Returns a human-friendly label for a score.
 */
export function scoreLabel(score) {
  if (score > 0.5) return 'Increase';
  if (score < -0.5) return 'Decrease';
  if (score > 0.25) return 'Add a rep';
  return 'Maintain';
}

export function scoreColor(score, colors) {
  if (score > 0.5) return colors.primary;
  if (score < -0.5) return colors.warning;
  if (score > 0.25) return colors.success;
  return colors.textSecondary;
}
