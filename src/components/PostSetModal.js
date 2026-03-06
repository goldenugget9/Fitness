import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius, font } from '../theme';

/**
 * PostSetModal — shown after a set is logged.
 * Asks the user 4 adaptive questions:
 *   1. How did that feel? (difficulty)
 *   2. Rate your effort / RPE (1–10)
 *   3. Did you complete all reps?
 *   4. Any pain or discomfort?
 */
export default function PostSetModal({ visible, setNumber, targetReps, onSubmit, onSkip }) {
  const [difficulty, setDifficulty] = useState(null);
  const [rpe, setRpe] = useState(null);
  const [completedAllReps, setCompletedAllReps] = useState(null);
  const [actualReps, setActualReps] = useState('');
  const [discomfort, setDiscomfort] = useState(null);
  const [discomfortNote, setDiscomfortNote] = useState('');

  const canSubmit = difficulty !== null || rpe !== null;

  function handleSubmit() {
    onSubmit({
      difficulty,
      rpe,
      completedAllReps: completedAllReps,
      actualReps: completedAllReps === false ? parseInt(actualReps) || null : targetReps,
      discomfort: discomfort === true,
      discomfortNote,
    });
    resetState();
  }

  function handleSkip() {
    onSkip();
    resetState();
  }

  function resetState() {
    setDifficulty(null);
    setRpe(null);
    setCompletedAllReps(null);
    setActualReps('');
    setDiscomfort(null);
    setDiscomfortNote('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.heading}>Set {setNumber} Complete</Text>
          <Text style={styles.sub}>Answer quickly — this shapes your next session.</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

            {/* Q1: Difficulty */}
            <Text style={styles.question}>How did that feel?</Text>
            <View style={styles.row}>
              {['Too Easy', 'Just Right', 'Too Hard'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chip,
                    difficulty === opt && styles.chipActive,
                    opt === 'Too Easy' && difficulty === opt && { backgroundColor: colors.successDim, borderColor: colors.success },
                    opt === 'Just Right' && difficulty === opt && { backgroundColor: colors.primaryDim, borderColor: colors.primary },
                    opt === 'Too Hard' && difficulty === opt && { backgroundColor: colors.dangerDim, borderColor: colors.danger },
                  ]}
                  onPress={() => setDifficulty(opt)}
                >
                  <Text style={[
                    styles.chipText,
                    difficulty === opt && styles.chipTextActive,
                    opt === 'Too Easy' && difficulty === opt && { color: colors.success },
                    opt === 'Just Right' && difficulty === opt && { color: colors.primary },
                    opt === 'Too Hard' && difficulty === opt && { color: colors.danger },
                  ]}>
                    {opt === 'Too Easy' ? '😊 Too Easy' : opt === 'Just Right' ? '💪 Just Right' : '🥵 Too Hard'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Q2: RPE */}
            <Text style={styles.question}>Effort level (RPE 1–10)</Text>
            <Text style={styles.rpeHint}>1 = barely tried · 10 = maximum effort</Text>
            <View style={styles.rpeRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.rpeButton, rpe === n && styles.rpeButtonActive]}
                  onPress={() => setRpe(n)}
                >
                  <Text style={[styles.rpeText, rpe === n && styles.rpeTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Q3: Rep completion */}
            <Text style={styles.question}>Did you complete all {targetReps} reps?</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.chip, completedAllReps === true && { backgroundColor: colors.successDim, borderColor: colors.success }]}
                onPress={() => { setCompletedAllReps(true); setActualReps(''); }}
              >
                <Text style={[styles.chipText, completedAllReps === true && { color: colors.success }]}>
                  ✓ Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, completedAllReps === false && { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}
                onPress={() => setCompletedAllReps(false)}
              >
                <Text style={[styles.chipText, completedAllReps === false && { color: colors.danger }]}>
                  ✗ No
                </Text>
              </TouchableOpacity>
            </View>
            {completedAllReps === false && (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>How many reps did you get?</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={actualReps}
                  onChangeText={setActualReps}
                  placeholder="e.g. 6"
                  placeholderTextColor={colors.textMuted}
                  maxLength={2}
                />
              </View>
            )}

            {/* Q4: Discomfort */}
            <Text style={styles.question}>Any pain or discomfort?</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.chip, discomfort === false && { backgroundColor: colors.successDim, borderColor: colors.success }]}
                onPress={() => { setDiscomfort(false); setDiscomfortNote(''); }}
              >
                <Text style={[styles.chipText, discomfort === false && { color: colors.success }]}>None</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, discomfort === true && { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}
                onPress={() => setDiscomfort(true)}
              >
                <Text style={[styles.chipText, discomfort === true && { color: colors.danger }]}>Yes ⚠️</Text>
              </TouchableOpacity>
            </View>
            {discomfort === true && (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={discomfortNote}
                onChangeText={setDiscomfortNote}
                placeholder="Where / what kind of pain? (optional)"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
              />
            )}

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.submitText}>Save Answers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: font.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: font.sm,
    marginBottom: spacing.lg,
  },
  scroll: { flex: 1 },
  question: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  rpeHint: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: font.sm,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  rpeButton: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rpeText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: font.sm,
  },
  rpeTextActive: {
    color: '#fff',
  },
  inputRow: {
    marginTop: spacing.sm,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: font.sm,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: font.md,
  },
  textArea: {
    marginTop: spacing.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  spacer: { height: spacing.xl },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  skipBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: font.md,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: font.md,
  },
});
