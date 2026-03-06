import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, font } from '../theme';
import { getWorkouts, createWorkout } from '../database/db';

export default function HomeScreen({ navigation }) {
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  async function loadWorkouts() {
    try {
      const ws = await getWorkouts(5);
      setRecentWorkouts(ws);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartWorkout() {
    try {
      const workoutId = await createWorkout();
      navigation.navigate('Workout', { workoutId });
    } catch (e) {
      Alert.alert('Error', 'Could not create workout. Please try again.');
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Ready to train?</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Start workout CTA */}
        <TouchableOpacity style={styles.startCard} onPress={handleStartWorkout} activeOpacity={0.85}>
          <View style={styles.startContent}>
            <Text style={styles.startIcon}>💪</Text>
            <View style={styles.startText}>
              <Text style={styles.startTitle}>Start Workout</Text>
              <Text style={styles.startSub}>Pick exercises, log sets, get smarter recommendations</Text>
            </View>
          </View>
          <View style={styles.startArrow}>
            <Text style={styles.startArrowText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Adaptive Works</Text>
          <View style={styles.steps}>
            {[
              { icon: '🏋️', label: 'Log each set', detail: 'Weight + reps as you go' },
              { icon: '❓', label: 'Answer 4 quick questions', detail: 'RPE, difficulty, reps, discomfort' },
              { icon: '📈', label: 'Get your next recommendation', detail: 'Weight & reps auto-adjusted for you' },
            ].map((step, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
                {i < 2 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
        </View>

        {/* Recent workouts */}
        {recentWorkouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.workoutRow}
                onPress={() => navigation.navigate('History')}
              >
                <View>
                  <Text style={styles.workoutDate}>
                    {new Date(w.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.workoutMeta}>
                    {w.exercise_count} exercise{w.exercise_count !== 1 ? 's' : ''} · {w.set_count} set{w.set_count !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.completedBadge, !w.completed && styles.incompleteBadge]}>
                  <Text style={[styles.completedText, !w.completed && styles.incompleteText]}>
                    {w.completed ? 'Done' : 'In progress'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md },
  header: { marginBottom: spacing.lg, marginTop: spacing.sm },
  greeting: {
    color: colors.textPrimary,
    fontSize: font.xxxl,
    fontWeight: '800',
    marginBottom: 4,
  },
  date: { color: colors.textSecondary, fontSize: font.md },
  startCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  startContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  startIcon: { fontSize: 36 },
  startText: { flex: 1 },
  startTitle: { color: '#fff', fontSize: font.xl, fontWeight: '800', marginBottom: 4 },
  startSub: { color: 'rgba(255,255,255,0.8)', fontSize: font.sm },
  startArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startArrowText: { color: '#fff', fontSize: font.xl, fontWeight: '700', marginTop: -2 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  steps: { gap: spacing.md },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepIcon: { fontSize: 22, width: 30 },
  stepContent: { flex: 1 },
  stepLabel: { color: colors.textPrimary, fontSize: font.md, fontWeight: '600' },
  stepDetail: { color: colors.textSecondary, fontSize: font.sm, marginTop: 2 },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 30,
    width: 1,
    height: spacing.md,
    backgroundColor: colors.border,
  },
  section: { marginTop: spacing.sm },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: font.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutDate: { color: colors.textPrimary, fontSize: font.md, fontWeight: '600' },
  workoutMeta: { color: colors.textSecondary, fontSize: font.sm, marginTop: 2 },
  completedBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  incompleteBadge: { backgroundColor: colors.warningDim },
  completedText: { color: colors.primary, fontSize: font.xs, fontWeight: '600' },
  incompleteText: { color: colors.warning },
});
