import React, { useState, useRef, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, ScrollView, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { selectStyles } from '@/styles/ui/Select.styles';

interface ModalCardProps {
  title: string;
  children: ReactNode;
  maxHeight?: number;
}

export default function ModalCard({ title, children, maxHeight = 180 }: ModalCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  const setIsOpen = (open: boolean) => {
    if (open) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  };

  const overlayStyle = {
    ...selectStyles.overlay,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: overlayOpacity,
  };

  const sheetStyle = {
    ...selectStyles.modalSheet,
    transform: [{ translateY: sheetTranslateY }],
  };

  return (
    <>
      <TouchableOpacity onPress={() => setIsOpen(true)} activeOpacity={0.7}>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-medium text-gray-700">{title}</Text>
            <ChevronRight size={20} color={Colors.gray[500]} />
          </View>
        </Card>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={overlayStyle}>
            <Pressable style={{ flex: 1 }} onPress={() => setIsOpen(false)} />
          </Animated.View>
          <Animated.View style={sheetStyle}>
            <View style={selectStyles.dragIndicatorContainer}>
              <View style={selectStyles.dragIndicator} />
            </View>
            <Text className="text-base font-medium mb-4" style={{ color: Colors.primary[500] }}>
              {title}
            </Text>
            <ScrollView 
              style={{ maxHeight }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
} 