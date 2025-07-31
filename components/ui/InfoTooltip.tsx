import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Button } from './Button';

interface InfoTooltipProps {
  info: string;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export default function InfoTooltip({ 
  info, 
  size = 15, 
  color = Colors.primary[500],
  disabled = false,
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handlePress = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
             <TouchableOpacity
         onPress={handlePress}
         style={{
           width: size + 6,
           height: size + 6,
           borderRadius: (size + 6) / 2,
           justifyContent: 'center',
           alignItems: 'center',
           marginLeft: 3,
           marginBottom: 0,
         }}
         activeOpacity={0.7}
       >
         <HelpCircle size={size} color={disabled ? Colors.gray[400] : color} />
       </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
          onPress={handleClose}
        >
          <Pressable
            style={{
              backgroundColor: Colors.light.background,
              borderRadius: 12,
              padding: 20,
              maxWidth: 300,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.secondary[100],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <HelpCircle size={24} color={Colors.secondary[600]} />
              </View>
            </View>

            <Text
              className="text-base font-regular text-center mb-4"
              style={{
                color: Colors.primary[700],
                lineHeight: 22,
              }}
            >
              {info}
            </Text>

                         <Button
               title="Entendido"
               onPress={handleClose}
               variant="primary"
               fullWidth
             />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
} 