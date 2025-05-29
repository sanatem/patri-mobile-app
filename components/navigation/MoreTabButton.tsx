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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
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
  const menuBottom = tabBarHeight + 10; // 10px spacing from tab bar

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
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View
            style={[
              styles.menu,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                bottom: menuBottom,
                right: 20,
              },
            ]}
          >
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  index === menuOptions.length - 1 && styles.lastMenuItem,
                ]}
                onPress={option.onPress}
              >
                <View style={styles.menuItemIcon}>{option.icon}</View>
                <Text style={styles.menuItemText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
