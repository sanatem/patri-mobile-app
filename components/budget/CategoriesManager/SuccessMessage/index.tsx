import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface SuccessMessageProps {
  visible: boolean;
  message: string;
}

export function SuccessMessage({ visible, message }: SuccessMessageProps) {
  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: Colors.success[500],
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <CheckCircle size={24} color="white" style={{ flexShrink: 0 }} />
      <Text style={{
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
        flexWrap: 'wrap'
      }}>
        {message}
      </Text>
    </View>
  );
}
