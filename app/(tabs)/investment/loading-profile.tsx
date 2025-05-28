import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function LoadingProfile() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/(tabs)/investment/profile-result');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff5603" />
      <Text style={styles.text}>Definiendo tu perfil de inversor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151'
  }
});