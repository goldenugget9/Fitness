import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, font } from '../theme';

/**
 * A single set row with inline weight + reps editing and a Log button.
 * Props:
 *   setNumber   {number}
 *   weight      {number|null}  — pre-filled from recommendation or previous set
 *   reps        {number|null}
 *   completed   {boolean}
 *   answered    {boolean}      — has post-set answers?
 *   onLog       {(weight, reps) => void}
 */
export default function SetRow({ setNumber, weight: initWeight, reps: initReps, completed, answered, onLog }) {
  const [weight, setWeight] = useState(initWeight != null ? String(initWeight) : '');
  const [reps, setReps] = useState(initReps != null ? String(initReps) : '');

  function handleLog() {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    onLog(w, r);
  }

  return (
    <View style={[styles.container, completed && styles.containerCompleted]}>
      {/* Set number badge */}
      <View style={[styles.badge, completed && styles.badgeCompleted]}>
        <Text style={[styles.badgeText, completed && styles.badgeTextCompleted]}>
          {setNumber}
        </Text>
      </View>

      {/* Weight field */}
      <View style={styles.field}>
        <Text style={styles.label}>Weight</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, completed && styles.inputCompleted]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            editable={!completed}
            selectTextOnFocus
          />
          <Text style={styles.unit}>lbs</Text>
        </View>
      </View>

      {/* Reps field */}
      <View style={styles.field}>
        <Text style={styles.label}>Reps</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, completed && styles.inputCompleted]}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            editable={!completed}
            selectTextOnFocus
          />
        </View>
      </View>

      {/* Log / Done button */}
      {completed ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
          {answered && <Text style={styles.answeredDot} />}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.logBtn, (!weight || !reps) && styles.logBtnDisabled]}
          onPress={handleLog}
          disabled={!weight || !reps}
        >
          <Text style={styles.logText}>Log</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerCompleted: {
    opacity: 0.75,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCompleted: {
    backgroundColor: colors.primaryDim,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: font.sm,
    fontWeight: '700',
  },
  badgeTextCompleted: {
    color: colors.primary,
  },
  field: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '600',
    paddingVertical: 8,
    minWidth: 36,
  },
  inputCompleted: {
    color: colors.textSecondary,
  },
  unit: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginLeft: 2,
  },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    minWidth: 52,
    alignItems: 'center',
  },
  logBtnDisabled: {
    opacity: 0.3,
  },
  logText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: font.sm,
  },
  doneWrap: {
    alignItems: 'center',
    width: 52,
  },
  doneIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: font.md,
  },
  answeredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 3,
  },
});
