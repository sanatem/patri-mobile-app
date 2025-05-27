import { Stack } from 'expo-router';

export default function BudgetLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}
    />
  );
}