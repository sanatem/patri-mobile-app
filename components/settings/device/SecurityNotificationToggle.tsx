import React from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

interface SecurityNotificationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  loading: boolean;
  updating: boolean;
  activeDevicesCount: number;
  untrustedDevicesCount: number;
}

export const SecurityNotificationToggle: React.FC<SecurityNotificationToggleProps> = ({
  enabled,
  onToggle,
  loading,
  updating,
  activeDevicesCount,
  untrustedDevicesCount,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Toggle Section */}
      <View style={styles.toggleSection}>
        <View style={styles.toggleContent}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>
              {t('preferences.security.newDeviceAlerts.title')}
            </Text>
            <Text style={styles.toggleDescription}>
              {t('preferences.security.newDeviceAlerts.description')}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary[500]} />
          ) : (
            <Switch
              value={enabled}
              onValueChange={onToggle}
              disabled={updating}
              trackColor={{ false: Colors.gray[200], true: Colors.secondary[500] }}
              thumbColor={enabled ? '#ffffff' : Colors.gray[50]}
              ios_backgroundColor={Colors.gray[200]}
            />
          )}
        </View>
      </View>

      {/* Device Count Stats */}
      {!loading && (
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <CheckCircle size={14} color={Colors.success[500]} />
            <Text style={styles.statText}>
              {t('preferences.devices.activeDevices', { count: activeDevicesCount })}
            </Text>
          </View>
          {untrustedDevicesCount > 0 && (
            <>
              <Text style={styles.statDivider}>•</Text>
              <View style={styles.statItem}>
                <AlertCircle size={14} color={Colors.error[500]} />
                <Text style={[styles.statText, styles.statTextWarning]}>
                  {t('preferences.devices.untrustedDevices', { count: untrustedDevicesCount })}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.divider} />
    </>
  );
};

const styles = StyleSheet.create({
  toggleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: Colors.semantic.neutral,
    lineHeight: 18,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.semantic.neutral,
  },
  statTextWarning: {
    color: Colors.error[500],
    fontWeight: '500',
  },
  statDivider: {
    fontSize: 13,
    color: Colors.gray[300],
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginHorizontal: 20,
  },
});
