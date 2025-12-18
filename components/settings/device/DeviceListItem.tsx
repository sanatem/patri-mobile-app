import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Smartphone, Globe, AlertCircle, CheckCircle, MapPin, Clock } from 'lucide-react-native';
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
  const StatusIcon = device.active ? CheckCircle : AlertCircle;
  const statusColor = device.active ? Colors.success[500] : Colors.gray[400];

  return (
    <View>
      <View style={styles.deviceItem}>
        <View style={styles.deviceContent}>
          <View style={styles.deviceInfo}>
            {/* Session Status Icon */}
            <View style={styles.trustIconContainer}>
              <StatusIcon size={20} color={statusColor} />
            </View>
            
            {/* Device Icon */}
            <View style={[
              styles.deviceIconContainer,
              device.is_current_device && styles.currentDeviceIconContainer
            ]}>
              <DeviceIcon 
                size={20} 
                color={device.is_current_device ? Colors.secondary[500] : Colors.primary[500]} 
              />
            </View>
            
            <View style={styles.deviceDetails}>
              <View style={styles.deviceNameRow}>
                <Text style={styles.deviceName} numberOfLines={1}>{deviceName}</Text>
                {device.is_current_device && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>
                      {t('preferences.devices.currentlyInUse')}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Location */}
              {device.last_location && (
                <View style={styles.deviceMeta}>
                  <MapPin size={12} color={Colors.primary[400]} />
                  <Text style={styles.metaText}>{device.last_location}</Text>
                </View>
              )}
              
              {/* Last Active */}
              <View style={styles.deviceMeta}>
                <Clock size={12} color={Colors.primary[400]} />
                <Text style={styles.metaText}>
                  {t('preferences.devices.lastActive')}: {formatLastActive(device.last_active_at, t)}
                </Text>
              </View>
            </View>
          </View>

          {!device.is_current_device && device.active && (
            <View style={styles.signOutContainer}>
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
            </View>
          )}
        </View>
      </View>
      
      {!isLastItem && <View style={styles.divider} />}
    </View>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    paddingVertical: 16,
  },
  deviceContent: {
    flexDirection: 'column',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  trustIconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  deviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentDeviceIconContainer: {
    backgroundColor: Colors.secondary[50],
  },
  deviceDetails: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'nowrap',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary[700],
    marginRight: 8,
    flexShrink: 0,
  },
  currentBadge: {
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexShrink: 0,
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
    color: Colors.gray[400],
  },
  signOutContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
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
