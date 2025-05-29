import React from 'react';
import { View } from 'react-native';

// Esta pantalla no se mostrará ya que prevenimos la navegación en el listener
// del tab, pero es requerida por Expo Router
export default function MoreScreen() {
  return <View />;
}
