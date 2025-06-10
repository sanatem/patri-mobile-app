import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function IdentityUploadBack() {
  const [backImage, setBackImage] = useState<string | null>(null);

  const pickImageWeb = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            setBackImage(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const pickImageMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para subir la foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBackImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const takePhotoMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu cámara para tomar la foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBackImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImageWeb();
    } else {
      Alert.alert(
        'Seleccionar imagen',
        'Elige cómo quieres subir la foto de tu carnet',
        [
          { text: 'Galería', onPress: pickImageMobile },
          { text: 'Cámara', onPress: takePhotoMobile },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const removeImage = () => {
    setBackImage(null);
  };

  const handleContinue = () => {
    router.push('/investment/create-account/identity-step/identity-confirm' as any);
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Verificación de identidad" showBackButton />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold mb-2">Sube tu carnet (Reverso)</Text>
        <Text className="text-base text-gray-500 mb-6">
          Ahora necesitamos la parte trasera de tu carnet de identidad
        </Text>

        <TouchableOpacity
          className={`border border-dashed rounded-xl items-center mb-5 ${
            backImage ? 'border-green-500' : 'border-primary-500'
          }`}
          style={{ padding: backImage ? 10 : 100 }}
          onPress={backImage ? undefined : showImageOptions}
        >
          {backImage ? (
            <View className="relative">
              <Image 
                source={{ uri: backImage }} 
                className="w-full rounded-lg"
                style={{ height: 200 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                onPress={removeImage}
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-primary-500 text-base font-medium">+ Subir foto del carnet (Reverso)</Text>
          )}
        </TouchableOpacity>

        {backImage && (
          <TouchableOpacity
            className="mb-4 items-center"
            onPress={showImageOptions}
          >
            <Text className="text-primary-500 text-base font-medium">Cambiar imagen</Text>
          </TouchableOpacity>
        )}

        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <Text className="text-sm text-blue-800 font-medium mb-2">💡 Consejos para una buena foto:</Text>
          <Text className="text-sm text-blue-700">• Asegúrate de que esté bien iluminada</Text>
          <Text className="text-sm text-blue-700">• Todos los datos deben ser legibles</Text>
          <Text className="text-sm text-blue-700">• Evita reflejos o sombras</Text>
        </View>

        <View className="mb-6">
          <Button
            title="Continuar"
            onPress={handleContinue}
            variant="primary"
            fullWidth
            disabled={!backImage}
          />
        </View>
      </ScrollView>
    </Container>
  );
}