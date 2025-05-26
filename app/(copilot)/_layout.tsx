import { Stack } from 'expo-router';

export default function CopilotLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}
    />
  );
}