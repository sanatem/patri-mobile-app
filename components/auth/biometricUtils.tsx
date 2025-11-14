import { Platform } from 'react-native';
import { Fingerprint, ScanFace } from 'lucide-react-native';
import type { BiometricType } from '@/types/biometric';

interface GetBiometricIconProps {
  biometricType: BiometricType;
  size: number;
  color: string;
}

export const getBiometricIcon = ({ biometricType, size, color }: GetBiometricIconProps) => {
  // Show face icon for facial recognition on iOS, fingerprint for everything else
  if (biometricType === 'facial' && Platform.OS === 'ios') {
    return <ScanFace size={size} color={color} />;
  }
  return <Fingerprint size={size} color={color} />;
};

