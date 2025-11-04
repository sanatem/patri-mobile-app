import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, Modal, Pressable, Text } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export interface FloatingAction {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(scaleAnim, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const handleActionPress = (action: FloatingAction) => {
    if (action.disabled) return;
    toggleMenu();
    setTimeout(() => action.onPress(), 200);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          onPress={toggleMenu}
        >
          <View
            style={{
              position: 'absolute',
              right: 24,
              bottom: 100,
            }}
          >
            {actions.map((action, index) => (
              <Animated.View
                key={index}
                style={{
                  marginBottom: 12,
                  opacity: scaleAnim,
                  transform: [
                    {
                      scale: scaleAnim,
                    },
                    {
                      translateY: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: action.disabled ? Colors.gray[200] : 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: action.disabled ? 0.1 : 0.25,
                    shadowRadius: 3.84,
                    elevation: action.disabled ? 2 : 5,
                  }}
                  onPress={() => handleActionPress(action)}
                  activeOpacity={action.disabled ? 1 : 0.8}
                  disabled={action.disabled}
                >
                  <View style={{ marginRight: 12, opacity: action.disabled ? 0.4 : 1 }}>
                    {action.icon}
                  </View>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: action.disabled ? Colors.gray[400] : Colors.primary[600] }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Pressable>
      </Modal>

      <View
        style={{
          position: 'absolute',
          right: 24,
          bottom: 24,
        }}
      >
        <TouchableOpacity
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.secondary[500],
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{ rotate: rotation }],
            }}
          >
            {isOpen ? (
              <X size={24} color="white" />
            ) : (
              <Plus size={24} color="white" />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}
