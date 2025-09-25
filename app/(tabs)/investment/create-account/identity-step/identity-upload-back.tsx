import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

export default function IdentityUploadBack() {
  const { t } = useTranslation();
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
      
      if (!permissionResult.granted) {
        Alert.alert(
          t('common.permissionsRequired'),
          t('identityUploadBack.galleryPermission')
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
        setBackImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('identityUploadBack.errorGallery'));
    }
  };

  const takePhotoMobile = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t('common.permissionsRequired'),
          t('identityUploadBack.cameraPermission')
        );
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
      Alert.alert(t('common.error'), t('identityUploadBack.errorCamera'));
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImageWeb();
    } else {
      Alert.alert(
        t('identityUploadBack.selectImage'),
        t('identityUploadBack.selectMethod'),
        [
          { text: t('identityUploadBack.gallery'), onPress: pickImageMobile },
          { text: t('identityUploadBack.camera'), onPress: takePhotoMobile },
          { text: t('common.cancel'), style: 'cancel' }
        ]
      );
    }
  };

  const removeImage = () => {
    setBackImage(null);
  };

  const handleContinue = () => {
    router.push('/(tabs)/investment/create-account/identity-step/identity-confirm');
  };

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title={t('identityUploadBack.title')} showBackButton />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold mb-2">
          {t('identityUploadBack.uploadTitle')}
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          {t('identityUploadBack.uploadSubtitle')}
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
            <Text className="text-primary-500 text-base font-medium">
              {t('identityUploadBack.uploadPrompt')}
            </Text>
          )}
        </TouchableOpacity>

        {backImage && (
          <TouchableOpacity
            className="mb-4 items-center"
            onPress={showImageOptions}
          >
            <Text className="text-primary-500 text-base font-medium">
              {t('identityUploadBack.changeImage')}
            </Text>
          </TouchableOpacity>
        )}

        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <Text className="text-sm text-blue-800 font-medium mb-2">
            {t('identityUploadBack.tips.title')}
          </Text>
          <Text className="text-sm text-blue-700">• {t('identityUploadBack.tips.light')}</Text>
          <Text className="text-sm text-blue-700">• {t('identityUploadBack.tips.legible')}</Text>
          <Text className="text-sm text-blue-700">• {t('identityUploadBack.tips.noGlare')}</Text>
        </View>

        <View className="mb-6">
          <Button
            title={t('common.continue')}
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
