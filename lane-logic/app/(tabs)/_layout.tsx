import { Tabs } from 'expo-router';

/**
 * Tab navigator for the app's main sections.
 *
 * Each tab maps 1:1 to a feature folder under `src/features/`. Keep this
 * file limited to route/tab-bar configuration — screen content belongs in
 * the corresponding feature, imported here only as the route's default
 * export.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1d6fe0', // brand-500, kept in sync with tailwind.config.js
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="scoring" options={{ title: 'Scoring' }} />
      <Tabs.Screen name="lane-play" options={{ title: 'Lane Play' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
