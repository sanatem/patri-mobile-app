/**
 * MFASetupCard Component
 *
 * A card component displayed in settings that shows MFA status
 * and allows users to navigate to MFA settings.
 * Similar pattern to BiometricSetup but navigates to full screen.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Smartphone, ChevronRight, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useMFA } from '@/hooks/mfa';

export const MFASetupCard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { status, isLoading } = useMFA();

  const handlePress = () => {
    router.push('/settings/mfa');
  };

  const isEnabled = status?.mfa_enabled && status?.enrolled;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isEnabled ? styles.iconContainerEnabled : styles.iconContainerDisabled
      ]}>
        {isEnabled ? (
          <ShieldCheck size={22} color={Colors.success[500]} />
        ) : (
          <Smartphone size={22} color={Colors.primary[500]} />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('mfa.settings.menuTitle')}</Text>
        <Text style={styles.subtitle}>
          {isLoading ? (
            t('mfa.status.checking')
          ) : isEnabled ? (
            t('mfa.enabled')
          ) : (
            t('mfa.settings.menuSubtitle')
          )}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.gray[400]} />
      ) : (
        <View style={styles.rightContainer}>
          {isEnabled && (
            <View style={styles.enabledBadge}>
              <Text style={styles.enabledBadgeText}>{t('mfa.enabled')}</Text>
            </View>
          )}
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerEnabled: {
    backgroundColor: Colors.success[50],
  },
  iconContainerDisabled: {
    backgroundColor: '#f0f9ff',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enabledBadge: {
    backgroundColor: Colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enabledBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success[600],
  },
});

