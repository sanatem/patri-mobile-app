import { Stack } from 'expo-router';
import { CopilotProvider } from '@/providers/CopilotProvider';

export default function CopilotLayout() {
  return (
    <CopilotProvider>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      />
    </CopilotProvider>
  );
}