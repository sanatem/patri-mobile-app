import { Tabs } from 'expo-router';
import TabBarIcon from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useCallback } from 'react';
import { i18nInitPromise } from '../../lib/i18n';
import { useMFA } from '@/hooks/mfa';
import { FirstTimeRecoveryCodesPrompt, RecoveryCodesModal } from '@/components/mfa';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [i18nReady, setI18nReady] = useState(false);
  const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);

  const {
    needsRecoveryCodesSetup,
    isProcessing,
    newRecoveryCodes,
    regenerateRecoveryCodes,
    dismissRecoveryCodesPrompt,
    clearNewRecoveryCodes,
  } = useMFA();

  useEffect(() => {
    i18nInitPromise.then(() => setI18nReady(true));
  }, []);

  const handleGenerateRecoveryCodes = useCallback(async () => {
    const codes = await regenerateRecoveryCodes();
    if (codes && codes.length > 0) {
      await dismissRecoveryCodesPrompt();
      setShowRecoveryCodesModal(true);
    }
  }, [regenerateRecoveryCodes, dismissRecoveryCodesPrompt]);

  const handleSkipRecoveryCodes = useCallback(async () => {
    await dismissRecoveryCodesPrompt();
  }, [dismissRecoveryCodesPrompt]);

  const handleCloseRecoveryCodesModal = useCallback(() => {
    setShowRecoveryCodesModal(false);
    clearNewRecoveryCodes();
  }, [clearNewRecoveryCodes]);

  if (!i18nReady) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      {/* First-time MFA enrollment - prompt to generate recovery codes */}
      <FirstTimeRecoveryCodesPrompt
        visible={needsRecoveryCodesSetup}
        onGenerate={handleGenerateRecoveryCodes}
        onSkip={handleSkipRecoveryCodes}
        isGenerating={isProcessing}
      />

      {/* Recovery codes modal - shows after generation */}
      {newRecoveryCodes && (
        <RecoveryCodesModal
          visible={showRecoveryCodesModal}
          onClose={handleCloseRecoveryCodesModal}
          codes={newRecoveryCodes}
          isNewCodes
        />
      )}

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
            title: t('tabs.networth'),
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
