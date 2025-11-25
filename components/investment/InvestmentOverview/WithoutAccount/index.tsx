import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import { Header, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface WithoutAccountProps {
  hasAnyFormData?: boolean;
  onStartCreateAccount?: () => void;
}

export function WithoutAccount({ hasAnyFormData = false, onStartCreateAccount }: WithoutAccountProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleCreateAccount = () => {
    // Marcar que el usuario ya vio la pantalla de introducción
    onStartCreateAccount?.();

    if (hasAnyFormData) {
      router.push('/(tabs)/investment/create-account/complete-profile' as any);
    } else {
      router.push('/investment/create-account/investment-survey/start-profile' as any);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header
        title={t('investments.title')}
      />
      <View className="flex-1 justify-center items-center px-6 pb-6">
        <View style={{ width: 64, height: 64, backgroundColor: Colors.primary[100], borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <TrendingUp size={32} color={Colors.primary[500]} />
        </View>
        <Text className="text-base font-regular text-center mb-6 px-2" style={{ color: Colors.gray[600] }}>
          {t('investments.needAccount')}
        </Text>

        <View className="w-full px-4">
          <Button
            title={t('investments.createAccount')}
            onPress={handleCreateAccount}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}
