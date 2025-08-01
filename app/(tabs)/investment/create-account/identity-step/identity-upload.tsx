import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

export default function IdentityUpload() {
  const { t } = useTranslation();
  const [frontImage, setFrontImage] = useState<string | null>(null);

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
            setFrontImage(event.target.result);
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
      
      if (!permissionResult.granted) {
        Alert.alert(
          t('common.permissionsRequired'),
          t('identityUpload.galleryPermission')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFrontImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('identityUpload.errorGallery'));
    }
  };

  const takePhotoMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          t('common.permissionsRequired'),
          t('identityUpload.cameraPermission')
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFrontImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('common.error'), t('identityUpload.errorCamera'));
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImageWeb();
    } else {
      Alert.alert(
        t('identityUpload.selectImage'),
        t('identityUpload.selectMethod'),
        [
          { text: t('identityUpload.gallery'), onPress: pickImageMobile },
          { text: t('identityUpload.camera'), onPress: takePhotoMobile },
          { text: t('identityUpload.cancel'), style: 'cancel' }
        ]
      );
    }
  };

  const removeImage = () => {
    setFrontImage(null);
  };

  const handleContinue = () => {
    router.push('/investment/create-account/identity-step/identity-upload-back' as any);
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('identityUpload.title')} />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold mb-2">
          {t('identityUpload.uploadTitle')}
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          {Platform.OS === 'web'
            ? t('identityUpload.uploadHintWeb')
            : t('identityUpload.uploadHintMobile')}
        </Text>

        <TouchableOpacity
          className={`border border-dashed rounded-xl items-center mb-5 ${
            frontImage ? 'border-green-500' : 'border-primary-500'
          }`}
          style={{ padding: frontImage ? 10 : 100 }}
          onPress={frontImage ? undefined : showImageOptions}
        >
          {frontImage ? (
            <View className="relative">
              <Image 
                source={{ uri: frontImage }} 
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
            <Text className="text-primary-500 text-base font-medium">
              {t('identityUpload.uploadPrompt')}
            </Text>
          )}
        </TouchableOpacity>

        {frontImage && (
          <TouchableOpacity
            className="mb-4 items-center"
            onPress={showImageOptions}
          >
            <Text className="text-primary-500 text-base font-medium">
              {t('identityUpload.changeImage')}
            </Text>
          </TouchableOpacity>
        )}

        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <Text className="text-sm text-blue-800 font-medium mb-2">
            {t('identityUpload.tips.title')}
          </Text>
          <Text className="text-sm text-blue-700">• {t('identityUpload.tips.light')}</Text>
          <Text className="text-sm text-blue-700">• {t('identityUpload.tips.legible')}</Text>
          <Text className="text-sm text-blue-700">• {t('identityUpload.tips.noGlare')}</Text>
        </View>

        <Text className="text-sm text-gray-500 mb-6">
          {t('identityUpload.explanation')}
        </Text>

        <View className="mb-6">
          <Button
            title={t('common.continue')}
            onPress={handleContinue}
            variant="primary"
            fullWidth
            disabled={!frontImage}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
