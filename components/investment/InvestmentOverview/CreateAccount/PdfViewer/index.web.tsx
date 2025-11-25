import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/Colors';

export default function PdfViewerComponent() {
  return (
    <View style={styles.container}>
      <View style={styles.webFallback}>
        <Text style={styles.webText}>
          La visualización de PDF no está disponible en web.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webText: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});
