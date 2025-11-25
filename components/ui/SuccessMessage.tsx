import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { CheckCircle, CircleCheck } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface SuccessMessageProps {
  visible: boolean;
  message: string;
}

export function SuccessMessage({ visible, message }: SuccessMessageProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, translateY, opacity, shouldRender]);

  if (!shouldRender) return null;

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: Colors.primary[500],
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1000,
      transform: [{ translateY }],
      opacity,
    }}>
      <CircleCheck size={24} color={Colors.success[400]} style={{ flexShrink: 0 }} />
      <Text className="text-base font-medium" style={{
        color: 'white',
        marginLeft: 12,
        flex: 1,
        flexWrap: 'wrap'
      }}>
        {message}
      </Text>
    </Animated.View>
  );
}
