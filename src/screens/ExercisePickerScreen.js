import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SectionList,
} from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { getAllExercises, searchExercises, addExerciseToWorkout, getWorkoutExercises } from '../database/db';
import ExerciseCard from '../components/ExerciseCard';

const CATEGORIES = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

export default function ExercisePickerScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    loadExercises();
    loadAdded();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      searchExercises(query).then(setExercises);
    } else {
      loadExercises();
    }
  }, [query, activeCategory]);

  async function loadExercises() {
    const all = await getAllExercises();
    if (activeCategory) {
      setExercises(all.filter((e) => e.category === activeCategory));
    } else {
      setExercises(all);
    }
  }

  async function loadAdded() {
    const wes = await getWorkoutExercises(workoutId);
    setAddedIds(new Set(wes.map((w) => w.exercise_id)));
  }

  async function handleAdd(exercise) {
    const order = addedIds.size;
    await addExerciseToWorkout(workoutId, exercise.id, order);
    setAddedIds((prev) => new Set([...prev, exercise.id]));
  }

  // Build sections for SectionList (only when no search query)
  const sections = CATEGORIES.map((cat) => ({
    title: cat,
    data: exercises.filter((e) => e.category === cat),
  })).filter((s) => s.data.length > 0);

  const showSections = !query.trim() && !activeCategory;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises, muscles..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter pills */}
      {!query.trim() && (
        <View style={styles.cats}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...CATEGORIES]}
            keyExtractor={(item) => item || 'all'}
            contentContainerStyle={styles.catList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.catPill, activeCategory === item && styles.catPillActive]}
                onPress={() => setActiveCategory(item)}
              >
                <Text style={[styles.catText, activeCategory === item && styles.catTextActive]}>
                  {item || 'All'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Exercise list */}
      {showSections ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => handleAdd(item)}
              right={
                addedIds.has(item.id) ? (
                  <View style={styles.addedBadge}>
                    <Text style={styles.addedText}>✓ Added</Text>
                  </View>
                ) : (
                  <View style={styles.addBadge}>
                    <Text style={styles.addText}>+ Add</Text>
                  </View>
                )
              }
            />
          )}
        />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => handleAdd(item)}
              right={
                addedIds.has(item.id) ? (
                  <View style={styles.addedBadge}>
                    <Text style={styles.addedText}>✓ Added</Text>
                  </View>
                ) : (
                  <View style={styles.addBadge}>
                    <Text style={styles.addText}>+ Add</Text>
                  </View>
                )
              }
            />
          )}
        />
      )}

      {/* Done button */}
      {addedIds.size > 0 && (
        <View style={styles.doneBar}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Done — View Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: font.md,
    paddingVertical: 12,
  },
  clearText: { color: colors.textMuted, fontSize: font.md, padding: 4 },
  cats: { marginBottom: spacing.xs },
  catList: { paddingHorizontal: spacing.md, gap: spacing.xs },
  catPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  catPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { color: colors.textSecondary, fontSize: font.sm, fontWeight: '500' },
  catTextActive: { color: '#fff' },
  list: { padding: spacing.md, paddingTop: spacing.sm },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: font.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.textSecondary, fontSize: font.md },
  addedBadge: {
    backgroundColor: colors.successDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.success,
  },
  addedText: { color: colors.success, fontSize: font.xs, fontWeight: '600' },
  addBadge: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addText: { color: colors.primary, fontSize: font.xs, fontWeight: '600' },
  doneBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
});
