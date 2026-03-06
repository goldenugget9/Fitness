import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from '../theme';

/**
 * Displays a recommendation chip for an exercise:
 *   "Next: 45 lbs × 10 reps — Increase"
 */
export default function RecommendationBadge({ recommendation }) {
  if (!recommendation) return null;

  const { suggested_weight, suggested_reps, adjustment_reason } = recommendation;
  const action = getAction(adjustment_reason);

  return (
    <View style={[styles.container, { borderColor: action.color + '44' }]}>
      <View style={[styles.dot, { backgroundColor: action.color }]} />
      <View style={styles.content}>
        <Text style={styles.label}>Next session</Text>
        <Text style={styles.main}>
          {suggested_weight > 0 ? `${suggested_weight} lbs` : 'BW'} × {suggested_reps} reps
        </Text>
        <Text style={[styles.action, { color: action.color }]}>{action.text}</Text>
      </View>
    </View>
  );
}

function getAction(reason) {
  if (!reason) return { text: 'Maintain', color: colors.textSecondary };
  if (reason.startsWith('⚠️')) return { text: 'Reduce weight', color: colors.warning };
  if (reason.includes('Increasing')) return { text: '↑ Increase weight', color: colors.primary };
  if (reason.includes('Dropping')) return { text: '↓ Reduce weight', color: colors.warning };
  if (reason.includes('extra rep')) return { text: '+ Add a rep', color: colors.success };
  return { text: 'Maintain', color: colors.textSecondary };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {},
  label: {
    color: colors.textMuted,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  main: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '700',
    marginVertical: 1,
  },
  action: {
    fontSize: font.xs,
    fontWeight: '600',
  },
});
