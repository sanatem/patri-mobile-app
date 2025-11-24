import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface AuthenticatedImageProps {
  uri: string;
  token: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  className?: string;
}

export function AuthenticatedImage({ 
  uri, 
  token, 
  style, 
  resizeMode = 'cover',
  className 
}: AuthenticatedImageProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [uri, token]);

  const loadImage = async () => {
    try {
      setLoading(true);
      setError(false);

      // Si la URI ya es base64, usarla directamente
      if (uri.startsWith('data:')) {
        setImageData(uri);
        setLoading(false);
        return;
      }

      // Intentar cargar la imagen con autenticación
      const response = await fetch(uri, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setError(true);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading authenticated image:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View 
        style={[{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: Colors.gray[100],
          height: 200 
        }, style]}
        className={className}
      >
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (error || !imageData) {
    return (
      <View 
        style={[{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: Colors.gray[100],
          height: 200 
        }, style]}
        className={className}
      >
        <Text style={{ color: Colors.gray[400] }}>Error al cargar imagen</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageData }}
      style={style}
      resizeMode={resizeMode}
      className={className}
    />
  );
}

