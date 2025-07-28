import { Stack } from 'expo-router';

export default function SplashScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="splash-1" />
      <Stack.Screen name="splash-2" />
      <Stack.Screen name="splash-3" />
    </Stack>
  );
} 