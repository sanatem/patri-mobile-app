// app/(tabs)/investment/_layout.tsx
import { Stack } from 'expo-router';

export default function InvestmentStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="without-account" />
    </Stack>
  );
}
