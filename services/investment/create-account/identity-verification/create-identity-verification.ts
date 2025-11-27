import config from '@/config/constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export interface CreateIdentityCardPayload {
  frontImage: string;
  backImage: string;
}

export interface CreateIdentityCardResponse {
  success: boolean;
  message?: string;
  data?: any;
}

async function base64ToTempFile(base64: string, filename: string): Promise<string> {
  // En web, no necesitamos convertir a archivo temporal
  if (Platform.OS === 'web') {
    return base64;
  }
  
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

export async function createIdentityCard(
  token: string,
  payload: CreateIdentityCardPayload
): Promise<CreateIdentityCardResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/identity_card`;
    const formData = new FormData();

    const isBase64 = (uri: string) => uri.startsWith('data:');

    // Procesar imagen frontal
    let frontUri = payload.frontImage;
    if (isBase64(payload.frontImage)) {
      frontUri = await base64ToTempFile(payload.frontImage, 'front_temp.jpg');
    }

    // En web, FormData necesita un Blob; en mobile, necesita un objeto con uri
    if (Platform.OS === 'web') {
      // Convertir base64 a Blob para web
      const frontBlob = await fetch(frontUri).then(r => r.blob());
      formData.append('identity_card[front]', frontBlob, 'front.jpg');
    } else {
      // En mobile, usar el formato de React Native
      formData.append('identity_card[front]', {
        uri: frontUri,
        type: 'image/jpeg',
        name: 'front.jpg',
      } as any);
    }

    // Procesar imagen trasera
    let backUri = payload.backImage;
    if (isBase64(payload.backImage)) {
      backUri = await base64ToTempFile(payload.backImage, 'back_temp.jpg');
    }

    // En web, FormData necesita un Blob; en mobile, necesita un objeto con uri
    if (Platform.OS === 'web') {
      // Convertir base64 a Blob para web
      const backBlob = await fetch(backUri).then(r => r.blob());
      formData.append('identity_card[back]', backBlob, 'back.jpg');
    } else {
      // En mobile, usar el formato de React Native
      formData.append('identity_card[back]', {
        uri: backUri,
        type: 'image/jpeg',
        name: 'back.jpg',
      } as any);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Identity card created successfully',
        data: data.data,
      };
    }

    return {
      success: false,
      message: `HTTP ${response.status}: ${data.error || data.message || JSON.stringify(data) || 'Error creating identity card'}`,
    };

  } catch (error) {
    console.error('Error in createIdentityCard:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error creating identity card',
    };
  }
}
