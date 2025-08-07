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
      <Stack.Screen name="splash-1/index" />
      <Stack.Screen name="splash-2/index" />
      <Stack.Screen name="splash-3/index" />
    </Stack>
  );
} 