import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { getWorkoutById, getWorkoutExercises, getSetsForWorkoutExercise } from '../database/db';

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [setsMap, setSetsMap] = useState({});

  useEffect(() => {
    loadData();
  }, [workoutId]);

  async function loadData() {
    const w = await getWorkoutById(workoutId);
    setWorkout(w);

    const exs = await getWorkoutExercises(workoutId);
    setExercises(exs);

    const sm = {};
    for (const ex of exs) {
      sm[ex.id] = await getSetsForWorkoutExercise(ex.id);
    }
    setSetsMap(sm);
  }

  useEffect(() => {
    if (workout) {
      navigation.setOptions({
        title: new Date(workout.date).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        }),
      });
    }
  }, [workout]);

  if (!workout) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {exercises.map((ex) => {
        const sets = setsMap[ex.id] || [];
        const answered = sets.filter((s) => s.difficulty != null || s.rpe != null);
        return (
          <View key={ex.id} style={styles.exBlock}>
            <Text style={styles.exName}>{ex.name}</Text>
            <Text style={styles.exMeta}>{ex.muscle_groups?.split(',').slice(0, 2).join(', ')}</Text>

            {sets.map((s) => (
              <View key={s.id} style={styles.setRow}>
                <Text style={styles.setNum}>{s.set_number}</Text>
                <Text style={styles.weight}>{s.weight} lbs</Text>
                <Text style={styles.reps}>× {s.reps}</Text>
                <View style={styles.tags}>
                  {s.rpe != null && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>RPE {s.rpe}</Text>
                    </View>
                  )}
                  {s.difficulty && (
                    <View style={[styles.tag, diffBg(s.difficulty)]}>
                      <Text style={styles.tagText}>{s.difficulty}</Text>
                    </View>
                  )}
                  {s.completed_all_reps === 0 && (
                    <View style={[styles.tag, { backgroundColor: colors.dangerDim }]}>
                      <Text style={styles.tagText}>{s.actual_reps ?? '?'}/{s.reps} reps</Text>
                    </View>
                  )}
                  {s.discomfort === 1 && (
                    <View style={[styles.tag, { backgroundColor: colors.dangerDim }]}>
                      <Text style={styles.tagText}>⚠️ Pain</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {answered.length > 0 && (
              <Text style={styles.answeredNote}>
                {answered.length}/{sets.length} sets answered
              </Text>
            )}
          </View>
        );
      })}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function diffBg(diff) {
  switch (diff) {
    case 'Too Easy': return { backgroundColor: colors.successDim };
    case 'Too Hard': return { backgroundColor: colors.dangerDim };
    default: return { backgroundColor: colors.primaryDim };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  exBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exName: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '700', marginBottom: 2 },
  exMeta: { color: colors.textSecondary, fontSize: font.sm, marginBottom: spacing.sm },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setNum: { color: colors.textMuted, fontSize: font.sm, width: 20, fontWeight: '600' },
  weight: { color: colors.textPrimary, fontSize: font.md, fontWeight: '600', width: 68 },
  reps: { color: colors.textSecondary, fontSize: font.md, width: 44 },
  tags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: colors.textSecondary, fontSize: font.xs, fontWeight: '500' },
  answeredNote: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
