import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

interface ImageDropboxProps {
  image: string | null;
  onImageChange: (imageUri: string | null, fileName?: string) => void;
  placeholder?: string;
  showRemoveButton?: boolean;
  showChangeButton?: boolean;
  aspectRatio?: [number, number];
  quality?: number;
  className?: string;
  showAsDocument?: boolean;
  documentName?: string;
}

export function ImageDropbox({
  image,
  onImageChange,
  placeholder,
  showRemoveButton = true,
  showChangeButton = true,
  aspectRatio = [16, 10],
  quality = 1,
  className = "",
  showAsDocument = false,
  documentName,
}: ImageDropboxProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);

  const pickImageWeb = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          setFileName(file.name); // Capturar el nombre real del archivo
          const reader = new FileReader();
          reader.onload = (event: any) => {
            onImageChange(event.target.result);
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
        aspect: aspectRatio,
        quality: quality,
        base64: true,
        exif: false,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.fileName) {
          setFileName(asset.fileName);
        } else {
          setFileName('documento_galeria.jpg');
        }

        // Si tenemos base64, usarlo directamente como data URI JPEG
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          onImageChange(imageUri);
        } else {
          onImageChange(asset.uri);
        }
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
        aspect: aspectRatio,
        quality: quality,
        base64: true,
        exif: false,
      });

      if (!result.canceled) {
        setFileName('foto_camara.jpg');
        const asset = result.assets[0];

        // Si tenemos base64, usarlo directamente como data URI JPEG
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          onImageChange(imageUri);
        } else {
          onImageChange(asset.uri);
        }
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
    setFileName(null);
    onImageChange(null);
  };

  const getDocumentName = () => {
    if (fileName) {
      return fileName.length > 30 ? `${fileName.substring(0, 27)}...` : fileName;
    }
    return 'documento_cargado.jpg';
  };

  return (
    <View className={className}>
      <TouchableOpacity
        style={{
          padding: showAsDocument && image ? 100 : (image ? 10 : 100),
          borderWidth: 1,
          borderColor: image ? Colors.success[500] : Colors.primary[400],
          borderStyle: 'dashed',
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={image ? undefined : showImageOptions}
      >
        {image ? (
          showAsDocument ? (
            <View className="w-1/2 flex-row items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: Colors.primary[50] }}>
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-lg items-center justify-center mr-3">
                  <Text className="text-lg">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-regular text-base" numberOfLines={1} style={{ color: Colors.primary[700] }}>
                    {getDocumentName()}
                  </Text>
                </View>
              </View>
              {showRemoveButton && (
                <TouchableOpacity
                  className="bg-red-500 rounded-full p-2 ml-2"
                  onPress={removeImage}
                  style={{ minWidth: 32, minHeight: 32 }}
                >
                  <Text className="text-xs font-bold text-center" style={{ color: Colors.primary[500] }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="relative">
              <Image 
                source={{ uri: image }} 
                className="w-full rounded-lg"
                style={{ height: 200 }}
                resizeMode="cover"
              />
              {showRemoveButton && (
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  onPress={removeImage}
                >
                  <Text className="text-xs font-bold" style={{ color: Colors.primary[500] }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        ) : (
          <Text className="text-base font-medium" style={{ color: Colors.primary[400] }}>
            {placeholder || t('identityUpload.uploadPrompt')}
          </Text>
        )}
      </TouchableOpacity>

      {image && showChangeButton && (
        <TouchableOpacity
          className="mb-4 items-center"
          onPress={showImageOptions}
        >
          <Text className="text-base font-medium" style={{ color: Colors.secondary[500] }}>
            {t('identityUpload.changeImage')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
