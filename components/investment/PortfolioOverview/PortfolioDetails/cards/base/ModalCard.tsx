import React, { useState, useRef, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, ScrollView, Pressable } from 'react-native';
import { ChevronRight, ChevronDown } from 'lucide-react-native';
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
  const [canScroll, setCanScroll] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const chevronOpacity = useRef(new Animated.Value(1)).current;

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

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentSize } = event.nativeEvent;
    setCanScroll(contentSize.height > layoutMeasurement.height);
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
            <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>{title}</Text>
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
            <ScrollView 
              style={{ maxHeight }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              onContentSizeChange={(w, h) => {
                setCanScroll(h > maxHeight);
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>
            {canScroll && (
              <Animated.View 
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  opacity: chevronOpacity,
                }}
              >
                <View 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: 2,
                    borderRadius: 12,
                    elevation: 3,
                  }}
                >
                  <ChevronDown size={20} color={Colors.gray[400]} />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
} 