import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, font } from '../theme';
import {
  getWorkoutExercises,
  getSetsForWorkoutExercise,
  logSet,
  savePostSetAnswers,
  completeWorkout,
  removeExerciseFromWorkout,
  getRecommendation,
  getRecentSetsForExercise,
  upsertRecommendation,
} from '../database/db';
import { computeRecommendation, deriveCurrentWeightReps } from '../utils/adaptive';
import SetRow from '../components/SetRow';
import PostSetModal from '../components/PostSetModal';
import RecommendationBadge from '../components/RecommendationBadge';

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;

export default function WorkoutScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const [exercises, setExercises] = useState([]);
  const [setsMap, setSetsMap] = useState({});         // workoutExerciseId → Set[]
  const [recommendMap, setRecommendMap] = useState({}); // exerciseId → recommendation
  const [postSetModal, setPostSetModal] = useState(null); // { setId, exerciseId, workoutExerciseId, setNumber, targetReps }
  const [completed, setCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [workoutId])
  );

  async function loadData() {
    const exs = await getWorkoutExercises(workoutId);
    setExercises(exs);

    const sm = {};
    const rm = {};
    for (const ex of exs) {
      const sets = await getSetsForWorkoutExercise(ex.id);
      sm[ex.id] = sets;

      const rec = await getRecommendation(ex.exercise_id);
      if (rec) rm[ex.exercise_id] = rec;
    }
    setSetsMap(sm);
    setRecommendMap(rm);
  }

  async function handleLogSet(workoutExerciseId, exerciseId, setNumber, weight, reps) {
    const setId = await logSet(workoutExerciseId, setNumber, weight, reps);

    // Refresh sets for this exercise
    const updated = await getSetsForWorkoutExercise(workoutExerciseId);
    setSetsMap((prev) => ({ ...prev, [workoutExerciseId]: updated }));

    // Show post-set questionnaire
    setPostSetModal({ setId, exerciseId, workoutExerciseId, setNumber, targetReps: reps });
  }

  async function handlePostSetSubmit(answers) {
    const { setId, exerciseId, workoutExerciseId } = postSetModal;
    setPostSetModal(null);

    await savePostSetAnswers(setId, answers);

    // Refresh sets
    const updated = await getSetsForWorkoutExercise(workoutExerciseId);
    setSetsMap((prev) => ({ ...prev, [workoutExerciseId]: updated }));

    // Recompute recommendation for this exercise
    await updateRecommendation(exerciseId, workoutExerciseId);
  }

  async function updateRecommendation(exerciseId, workoutExerciseId) {
    const recentSets = await getRecentSetsForExercise(exerciseId, 3);
    const { weight: cw, reps: cr } = deriveCurrentWeightReps(recentSets);
    const { weight, reps, reason } = computeRecommendation(recentSets, cw, cr);
    await upsertRecommendation(exerciseId, weight, reps, reason, workoutId);

    const rec = await getRecommendation(exerciseId);
    if (rec) {
      setRecommendMap((prev) => ({ ...prev, [exerciseId]: rec }));
    }
  }

  function handlePostSetSkip() {
    setPostSetModal(null);
  }

  async function handleFinishWorkout() {
    Alert.alert(
      'Finish Workout',
      'Mark this workout as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            await completeWorkout(workoutId);
            setCompleted(true);
            navigation.goBack();
          },
        },
      ]
    );
  }

  async function handleRemoveExercise(workoutExerciseId) {
    Alert.alert('Remove Exercise', 'Remove this exercise from your workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeExerciseFromWorkout(workoutExerciseId);
          loadData();
        },
      },
    ]);
  }

  function getSetRows(workoutExerciseId, exerciseId) {
    const logged = setsMap[workoutExerciseId] || [];
    const rec = recommendMap[exerciseId];

    // We always show DEFAULT_SETS slots, growing as more are logged
    const total = Math.max(logged.length + 1, DEFAULT_SETS);
    const rows = [];
    for (let i = 1; i <= total; i++) {
      const loggedSet = logged.find((s) => s.set_number === i);
      rows.push({
        setNumber: i,
        weight: loggedSet?.weight ?? rec?.suggested_weight ?? null,
        reps: loggedSet?.reps ?? rec?.suggested_reps ?? DEFAULT_REPS,
        completed: !!loggedSet?.completed,
        answered: loggedSet?.difficulty != null || loggedSet?.rpe != null,
        workoutExerciseId,
        exerciseId,
      });
    }
    return rows;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptySub}>Tap "Add Exercise" to build your workout</Text>
          </View>
        ) : (
          exercises.map((ex) => {
            const rec = recommendMap[ex.exercise_id];
            const setRows = getSetRows(ex.id, ex.exercise_id);
            const muscles = ex.muscle_groups ? ex.muscle_groups.split(',').slice(0, 2).join(', ') : '';

            return (
              <View key={ex.id} style={styles.exerciseBlock}>
                {/* Exercise header */}
                <View style={styles.exHeader}>
                  <View style={styles.exInfo}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exMeta}>{muscles}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveExercise(ex.id)}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Recommendation badge */}
                {rec && (
                  <View style={styles.recWrap}>
                    <RecommendationBadge recommendation={rec} />
                  </View>
                )}

                {/* Column headers */}
                <View style={styles.colHeaders}>
                  <Text style={[styles.colHeader, { width: 36 }]}>SET</Text>
                  <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT</Text>
                  <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
                  <Text style={[styles.colHeader, { width: 52 }]}></Text>
                </View>

                {/* Set rows */}
                {setRows.map((row) => (
                  <SetRow
                    key={row.setNumber}
                    setNumber={row.setNumber}
                    weight={row.weight}
                    reps={row.reps}
                    completed={row.completed}
                    answered={row.answered}
                    onLog={(weight, reps) =>
                      handleLogSet(row.workoutExerciseId, row.exerciseId, row.setNumber, weight, reps)
                    }
                  />
                ))}
              </View>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ExercisePicker', { workoutId })}
        >
          <Text style={styles.addBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>
        {exercises.length > 0 && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishWorkout}>
            <Text style={styles.finishBtnText}>Finish Workout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post-set modal */}
      {postSetModal && (
        <PostSetModal
          visible={!!postSetModal}
          setNumber={postSetModal.setNumber}
          targetReps={postSetModal.targetReps}
          onSubmit={handlePostSetSubmit}
          onSkip={handlePostSetSkip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    gap: spacing.sm,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.sm },
  emptyTitle: { color: colors.textPrimary, fontSize: font.xl, fontWeight: '700' },
  emptySub: { color: colors.textSecondary, fontSize: font.md, textAlign: 'center' },
  exerciseBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  exInfo: { flex: 1, marginRight: spacing.sm },
  exName: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '700' },
  exMeta: { color: colors.textSecondary, fontSize: font.sm, marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  recWrap: { marginBottom: spacing.sm },
  colHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  colHeader: {
    color: colors.textMuted,
    fontSize: font.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  finishBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
});
