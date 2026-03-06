import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, font } from '../theme';
import { getWorkouts, getWorkoutExercises, getSetsForWorkoutExercise } from '../database/db';

export default function HistoryScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getWorkouts(50).then(setWorkouts);
    }, [])
  );

  if (workouts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No workouts yet</Text>
        <Text style={styles.emptySub}>Complete your first workout to see history here.</Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.startBtnText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <WorkoutHistoryCard
            workout={item}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
          />
        )}
      />
    </View>
  );
}

function WorkoutHistoryCard({ workout, onPress }) {
  const date = new Date(workout.date);
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.dateBox}>
        <Text style={styles.dayStr}>{dayStr}</Text>
        <Text style={styles.dateStr}>{dateStr}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>
          {workout.exercise_count} Exercise{workout.exercise_count !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.cardMeta}>
          {workout.set_count} set{workout.set_count !== 1 ? 's' : ''} · {timeStr}
        </Text>
      </View>
      <View style={[styles.statusBadge, !workout.completed && styles.incompleteBadge]}>
        <Text style={[styles.statusText, !workout.completed && styles.incompleteText]}>
          {workout.completed ? '✓ Done' : 'Partial'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md },
  empty: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.sm },
  emptyTitle: { color: colors.textPrimary, fontSize: font.xl, fontWeight: '700' },
  emptySub: { color: colors.textSecondary, fontSize: font.md, textAlign: 'center' },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    marginTop: spacing.md,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dateBox: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 64,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  dayStr: { color: colors.primary, fontSize: font.xs, fontWeight: '700', textTransform: 'uppercase' },
  dateStr: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '800' },
  cardBody: { flex: 1, padding: spacing.md },
  cardTitle: { color: colors.textPrimary, fontSize: font.md, fontWeight: '700' },
  cardMeta: { color: colors.textSecondary, fontSize: font.sm, marginTop: 2 },
  statusBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: spacing.md,
  },
  incompleteBadge: { backgroundColor: colors.warningDim },
  statusText: { color: colors.primary, fontSize: font.xs, fontWeight: '600' },
  incompleteText: { color: colors.warning },
});
