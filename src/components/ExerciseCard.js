import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, font } from '../theme';

const CATEGORY_COLORS = {
  Chest: '#FF6B35',
  Back: '#4ECDC4',
  Shoulders: '#45B7D1',
  Legs: '#96CEB4',
  Arms: '#FFEAA7',
  Core: '#DDA0DD',
};

export default function ExerciseCard({ exercise, onPress, compact = false, right = null }) {
  const muscles = exercise.muscle_groups ? exercise.muscle_groups.split(',').map(m => m.trim()) : [];
  const equipment = exercise.equipment ? exercise.equipment.split(',').map(e => e.trim()) : [];
  const accentColor = CATEGORY_COLORS[exercise.category] || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Category stripe */}
      <View style={[styles.stripe, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.titleArea}>
            <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
            <Text style={styles.category}>{exercise.category}</Text>
          </View>
          {right && <View style={styles.rightSlot}>{right}</View>}
        </View>

        {!compact && (
          <View style={styles.pills}>
            {muscles.slice(0, 3).map((m) => (
              <View key={m} style={styles.pill}>
                <Text style={styles.pillText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {!compact && equipment.length > 0 && (
          <Text style={styles.equipment}>
            {equipment.join(' · ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    marginBottom: 0,
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  category: {
    color: colors.textMuted,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  pill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: font.xs,
    fontWeight: '500',
  },
  equipment: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginTop: 2,
  },
});
