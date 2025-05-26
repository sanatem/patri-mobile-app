import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '@/providers/AuthProvider';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import TabBarIcon from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium, 
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
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
          name="(patrimony)"
          options={{
            title: 'Patrimonio',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="bar-chart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="(budget)"
          options={{
            title: 'Presupuesto',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="pie-chart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="(planning)"
          options={{
            title: 'Planificación',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="users" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="(copilot)"
          options={{
            title: 'Copiloto',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="sparkles" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}