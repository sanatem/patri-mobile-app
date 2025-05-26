import { Stack } from 'expo-router';

export default function PatrimonyLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}
    />
  );
}