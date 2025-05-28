import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

const regionesYComunas = {
  "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Coronel", "San Pedro de la Paz"],
  "Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Angol", "Pucón"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas"],
  "Antofagasta": ["Antofagasta", "Calama", "Mejillones", "Tocopilla"],
};

export default function AddressStep() {
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState('');
  const [commune, setCommune] = useState('');

  const comunas = region ? regionesYComunas[region as keyof typeof regionesYComunas] || [] : [];

  const canContinue = address && region && commune;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuál es tu dirección?</Text>

      <TextInput
        placeholder="Dirección"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Región</Text>
      <View style={styles.pickerWrapper}>
      <Picker
  selectedValue={region}
  onValueChange={(value) => {
    setRegion(value);
    setCommune('');
  }}
  style={styles.picker}
>
  <Picker.Item label="Selecciona una región" value="" />
  {Object.keys(regionesYComunas).map((reg) => (
    <Picker.Item key={reg} label={reg} value={reg} />
  ))}
</Picker>
      </View>

      <Text style={styles.label}>Comuna</Text>
      <View style={styles.pickerWrapper}>
      <Picker
  selectedValue={commune}
  onValueChange={setCommune}
  enabled={comunas.length > 0}
  style={styles.picker}
>
  <Picker.Item label="Selecciona una comuna" value="" />
  {comunas.map((com) => (
    <Picker.Item key={com} label={com} value={com} />
  ))}
</Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={() => router.push('/(tabs)/investment/phone')}
        disabled={!canContinue}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  label: {
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8
  },
  button: {
    backgroundColor: '#ff5603',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  picker: {
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
    justifyContent: 'center',
    borderWidth: 0
  }
  
});
