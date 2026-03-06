import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { colors, font } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ExercisePickerScreen from '../screens/ExercisePickerScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const NAV_THEME = {
  dark: true,
  colors: {
    background: colors.bg,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
    primary: colors.primary,
  },
};

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontWeight: '700', fontSize: font.lg },
  cardStyle: { backgroundColor: colors.bg },
};

// ── Home Stack ────────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Adaptive Workout', headerLargeTitle: false }}
      />
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: "Today's Workout" }}
      />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ title: 'Add Exercises', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

// ── Library Stack ─────────────────────────────────────────────────────────────
function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'Exercise Library' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
    </Stack.Navigator>
  );
}

// ── History Stack ─────────────────────────────────────────────────────────────
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Workout History' }} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
    </Stack.Navigator>
  );
}

// ── Tab Icon helper ───────────────────────────────────────────────────────────
function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingTop: 6,
            height: 80,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: font.xs, fontWeight: '600', paddingBottom: 8 },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryStack}
          options={{
            title: 'Exercises',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{
            title: 'History',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
