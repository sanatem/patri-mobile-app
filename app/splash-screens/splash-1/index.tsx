import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PatrimoreIcon, ShieldIcon } from '@/components/icons'; 
import Colors from '@/constants/Colors';

interface SplashScreen1Props {
  title: string;
  subtitle: string;
}

export default function SplashScreen1({ title, subtitle }: SplashScreen1Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <PatrimoreIcon width={120} height={60} color={Colors.secondary[500]} />
      </View>
      <View style={styles.iconContainer}>
        <ShieldIcon width={30} height={30} />
      </View>
      <Text style={styles.title} className="font-medium">
        {title}
      </Text>
      <Text style={styles.subtitle} className="font-regular text-center">
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  logoContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 100,

  },
  title: {
    fontSize: 28,
    color: Colors.primary[700],
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary[500],
    textAlign: 'center',
    lineHeight: 24,
  },
}); 