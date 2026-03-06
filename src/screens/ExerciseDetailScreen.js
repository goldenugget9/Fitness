import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { getExerciseById, getExerciseHistory, getRecommendation } from '../database/db';
import RecommendationBadge from '../components/RecommendationBadge';

export default function ExerciseDetailScreen({ route }) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState(null);
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    loadData();
  }, [exerciseId]);

  async function loadData() {
    const ex = await getExerciseById(exerciseId);
    setExercise(ex);

    const hist = await getExerciseHistory(exerciseId);
    setHistory(hist);

    const rec = await getRecommendation(exerciseId);
    setRecommendation(rec);
  }

  if (!exercise) return null;

  const muscles = exercise.muscle_groups ? exercise.muscle_groups.split(',').map(m => m.trim()) : [];
  const equipment = exercise.equipment ? exercise.equipment.split(',').map(e => e.trim()) : [];

  // Group history by workout session
  const sessions = groupByWorkout(history);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Title */}
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.category}>{exercise.category}</Text>

      {/* Muscles */}
      <View style={styles.pills}>
        {muscles.map((m) => (
          <View key={m} style={styles.pill}>
            <Text style={styles.pillText}>{m}</Text>
          </View>
        ))}
      </View>

      {/* Equipment */}
      {equipment.length > 0 && (
        <Text style={styles.equipment}>{equipment.join(' · ')}</Text>
      )}

      {/* Recommendation */}
      {recommendation ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Session Recommendation</Text>
          <RecommendationBadge recommendation={recommendation} />
          <Text style={styles.reasonText}>{recommendation.adjustment_reason}</Text>
          <Text style={styles.recDate}>
            Based on workout from {new Date(recommendation.updated_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}
          </Text>
        </View>
      ) : (
        <View style={styles.noRecCard}>
          <Text style={styles.noRecTitle}>No recommendation yet</Text>
          <Text style={styles.noRecSub}>
            Answer the post-set questions during your workout — the app will suggest weight & reps for your next visit.
          </Text>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To</Text>
          <Text style={styles.instructions}>{exercise.instructions}</Text>
        </View>
      )}

      {/* History */}
      {sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {sessions.map((session) => (
            <View key={session.workout_id} style={styles.sessionCard}>
              <Text style={styles.sessionDate}>
                {new Date(session.workout_date).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
              </Text>
              {session.sets.map((s) => (
                <View key={s.set_number} style={styles.setHistoryRow}>
                  <Text style={styles.setNum}>{s.set_number}</Text>
                  <Text style={styles.setWeight}>{s.weight} lbs</Text>
                  <Text style={styles.setReps}>× {s.reps}</Text>
                  {s.rpe != null && (
                    <View style={styles.rpeBadge}>
                      <Text style={styles.rpeText}>RPE {s.rpe}</Text>
                    </View>
                  )}
                  {s.difficulty && (
                    <View style={[styles.diffBadge, diffColor(s.difficulty)]}>
                      <Text style={styles.diffText}>{s.difficulty}</Text>
                    </View>
                  )}
                  {(s.discomfort === 1) && (
                    <Text style={styles.warningFlag}>⚠️</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function groupByWorkout(history) {
  const map = {};
  for (const row of history) {
    if (!map[row.workout_id]) {
      map[row.workout_id] = {
        workout_id: row.workout_id,
        workout_date: row.workout_date,
        sets: [],
      };
    }
    map[row.workout_id].sets.push(row);
  }
  return Object.values(map).sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));
}

function diffColor(difficulty) {
  switch (difficulty) {
    case 'Too Easy': return { backgroundColor: colors.successDim };
    case 'Too Hard': return { backgroundColor: colors.dangerDim };
    default: return { backgroundColor: colors.primaryDim };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  title: { color: colors.textPrimary, fontSize: font.xxl, fontWeight: '800', marginBottom: 4 },
  category: {
    color: colors.textMuted,
    fontSize: font.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xs },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { color: colors.textSecondary, fontSize: font.xs, fontWeight: '500' },
  equipment: { color: colors.textMuted, fontSize: font.sm, marginBottom: spacing.md },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: font.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: font.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  recDate: { color: colors.textMuted, fontSize: font.xs, marginTop: 4 },
  noRecCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  noRecTitle: { color: colors.textPrimary, fontSize: font.md, fontWeight: '700', marginBottom: 4 },
  noRecSub: { color: colors.textSecondary, fontSize: font.sm, lineHeight: 20 },
  instructions: { color: colors.textSecondary, fontSize: font.md, lineHeight: 22 },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionDate: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  setHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  setNum: {
    color: colors.textMuted,
    fontSize: font.sm,
    width: 16,
    fontWeight: '600',
  },
  setWeight: { color: colors.textPrimary, fontSize: font.md, fontWeight: '600', width: 60 },
  setReps: { color: colors.textSecondary, fontSize: font.md, flex: 1 },
  rpeBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rpeText: { color: colors.textSecondary, fontSize: font.xs, fontWeight: '600' },
  diffBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  diffText: { color: colors.textSecondary, fontSize: font.xs, fontWeight: '600' },
  warningFlag: { fontSize: 14 },
});
