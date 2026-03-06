import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { getAllExercises, searchExercises } from '../database/db';
import ExerciseCard from '../components/ExerciseCard';

const CATEGORIES = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

export default function LibraryScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (query.trim()) {
      searchExercises(query).then(setExercises);
    } else {
      getAllExercises().then((all) => {
        if (activeCategory) {
          setExercises(all.filter((e) => e.category === activeCategory));
        } else {
          setExercises(all);
        }
      });
    }
  }, [query, activeCategory]);

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
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      {!query.trim() && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...CATEGORIES]}
          keyExtractor={(item) => item || 'all'}
          contentContainerStyle={styles.catList}
          style={styles.catScroll}
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
      )}

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
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
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
              onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
            />
          )}
        />
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
  catScroll: { marginBottom: spacing.xs },
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
});
