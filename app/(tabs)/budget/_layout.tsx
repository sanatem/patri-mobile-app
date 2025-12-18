import { Stack } from 'expo-router';
import { BudgetDateProvider } from '@/providers/BudgetDateProvider';

export default function BudgetLayout() {
  return (
    <BudgetDateProvider>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      />
    </BudgetDateProvider>
  );
}