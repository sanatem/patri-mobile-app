import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import TabBarIcon from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
            }}
    >
      <Tabs.Screen
        name="patrimony"
        options={{
          title: 'Patrimonio',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="pie-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planificación',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="users" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="copilot"
        options={{
          title: 'Copiloto',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="sparkles" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
} 