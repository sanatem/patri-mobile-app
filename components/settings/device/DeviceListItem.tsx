import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { Device } from '@/types/device';
import Colors from '@/constants/Colors';
import { getDeviceIcon, getDeviceName, formatLastActive } from './utils';

interface DeviceListItemProps {
  device: Device;
  isSigningOut: boolean;
  onSignOut: (device: Device) => void;
  isLastItem: boolean;
}

export const DeviceListItem: React.FC<DeviceListItemProps> = ({
  device,
  isSigningOut,
  onSignOut,
  isLastItem,
}) => {
  const { t } = useTranslation();
  const DeviceIcon = getDeviceIcon(device.platform);
  const deviceName = getDeviceName(device);
  const isActive = device.active;

  // Colors based on active state
  const iconColor = isActive ? Colors.secondary[500] : Colors.gray[400];
  const iconBgColor = isActive ? Colors.secondary[50] : Colors.gray[100];
  const textColor = isActive ? Colors.primary[700] : Colors.gray[400];
  const metaIconColor = isActive ? Colors.primary[400] : Colors.gray[300];
  const metaTextColor = isActive ? Colors.gray[400] : Colors.gray[300];

  return (
    <View style={!isActive && styles.inactiveContainer}>
      <View style={styles.deviceItem}>
        <View style={styles.deviceContent}>
          {/* Device Icon */}
          <View style={[styles.deviceIconContainer, { backgroundColor: iconBgColor }]}>
            <DeviceIcon size={20} color={iconColor} />
          </View>

          <View style={styles.deviceDetails}>
            <Text style={[styles.deviceName, { color: textColor }]} numberOfLines={1}>
              {deviceName}
            </Text>

            {/* Location */}
            {device.last_location && (
              <View style={styles.deviceMeta}>
                <MapPin size={12} color={metaIconColor} />
                <Text style={[styles.metaText, { color: metaTextColor }]}>
                  {device.last_location}
                </Text>
              </View>
            )}

            {/* Last Active */}
            <View style={styles.deviceMeta}>
              <Clock size={12} color={metaIconColor} />
              <Text style={[styles.metaText, { color: metaTextColor }]}>
                {t('preferences.devices.lastActive')}: {formatLastActive(device.last_active_at, t)}
              </Text>
            </View>
          </View>

          {device.is_current_device && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>
                {t('preferences.devices.currentlyInUse')}
              </Text>
            </View>
          )}

          {!device.is_current_device && device.active && (
            <TouchableOpacity
              style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
              onPress={() => onSignOut(device)}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color={Colors.error[500]} />
              ) : (
                <Text style={styles.signOutButtonText}>
                  {t('preferences.devices.signOut')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isLastItem && <View style={styles.divider} />}
    </View>
  );
};

const styles = StyleSheet.create({
  inactiveContainer: {
    opacity: 0.6,
  },
  deviceItem: {
    paddingVertical: 16,
  },
  deviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentBadge: {
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
    alignSelf: 'center',
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error[500],
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  signOutButtonDisabled: {
    opacity: 0.5,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error[500],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginHorizontal: 0,
  },
});
