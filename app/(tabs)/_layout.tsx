import { Tabs } from 'expo-router';
import TabBarIcon from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';
import {useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
  <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary[500],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="patrimony"
        options={() => ({
          title: t('tabs.patrimony'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="bar-chart" color={color} size={size} />
          ),
        })}
      />

      <Tabs.Screen
        name="budget"
        options={() => ({
          title: t('tabs.budget'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="pie-chart" color={color} size={size} />
          ),
        })}
      />
      <Tabs.Screen
        name="investment"
        options={() => ({
          title: t('tabs.investment'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="dollar" color={color} size={size} />
          ),
        })}
      />
      <Tabs.Screen
        name="planning"
        options={() => ({
          title: t('tabs.planning'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="users" color={color} size={size} />
          ),
        })}
      />

    </Tabs>
  </SafeAreaView>
  );
}
