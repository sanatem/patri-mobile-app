import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function PdfViewerComponent() {
  useEffect(() => {
    openPdf();
  }, []);

  const openPdf = async () => {
    try {
      const asset = Asset.fromModule(require('@/assets/images/documents/standards_of_conduct.pdf'));
      await asset.downloadAsync();

      if (asset.localUri) {
        const localPath = `${FileSystem.cacheDirectory}standards_of_conduct.pdf`;
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: localPath,
        });

        // Abrir con el visor nativo del dispositivo
        await Sharing.shareAsync(localPath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Normas de conducta',
          UTI: 'com.adobe.pdf',
        });

        // Volver atrás después de cerrar el visor
        router.back();
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      router.back();
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
      <Text style={styles.loadingText}>Abriendo documento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
  },
});
