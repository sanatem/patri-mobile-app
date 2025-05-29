import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MoreHorizontal, Shield, Home, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

interface MoreTabButtonProps {
  color: string;
  size: number;
}

interface MenuOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const MoreTabButton: React.FC<MoreTabButtonProps> = ({ color, size }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(200)).current;

  const menuOptions: MenuOption[] = [
    {
      id: 'propiedades',
      title: 'Propiedades',
      icon: <Home size={20} color={Colors.gray[600]} />,
      onPress: () => {
        console.log('Navegando a Propiedades');
        closeMenu();
      },
    },
    {
      id: 'seguros',
      title: 'Seguros',
      icon: <Shield size={20} color={Colors.gray[600]} />,
      onPress: () => {
        console.log('Navegando a Seguros');
        closeMenu();
      },
    },
    {
      id: 'mi-plan',
      title: 'Mi Plan',
      icon: <FileText size={20} color={Colors.gray[600]} />,
      onPress: () => {
        console.log('Navegando a Mi Plan');
        closeMenu();
      },
    },
  ];

  const openMenu = () => {
    setIsMenuVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuVisible(false);
    });
  };

  const handleButtonPress = () => {
    openMenu();
  };

  const onLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setButtonLayout({ x, y, width, height });
  };

  const screenHeight = Dimensions.get('window').height;
  const menuHeight = menuOptions.length * 60 + 20; // 60px per item + padding
  const tabBarHeight = 60;

  return (
    <View>
      <TouchableOpacity
        onPress={handleButtonPress}
        onLayout={onLayout}
        style={styles.button}
      >
        <MoreHorizontal size={size} color={color} />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={closeMenu}
          />
          <Animated.View
            style={[
              styles.menu,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
            pointerEvents="box-none"
          >
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  index === menuOptions.length - 1 && styles.lastMenuItem,
                ]}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>{option.icon}</View>
                <Text style={styles.menuItemText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 0,
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray[100],
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.gray[700],
    fontFamily: 'Inter-Medium',
  },
});

export default MoreTabButton;
