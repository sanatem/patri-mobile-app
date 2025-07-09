import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function CreateGoalsScreen() {
  const router = useRouter();
  const [goalName, setGoalName] = useState('');
  const [accountType, setAccountType] = useState('inversion');

  const handleCreate = () => {
    router.push('/investment/portfolio/portfolio' as any);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.secondary[500]} />
        </TouchableOpacity>
        <Text style={styles.title}>Crear meta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre de la meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Comprar casa"
          placeholderTextColor="#9CA3AF"
          value={goalName}
          onChangeText={setGoalName}
        />

        <Text style={styles.label}>Tipo de cuenta</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={accountType}
            onValueChange={(itemValue) => setAccountType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Cuenta de inversión" value="inversion" />
            <Picker.Item label="Cuenta de ahorro" value="ahorro" />
          </Picker>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.createBtn, goalName ? styles.btnEnabled : styles.btnDisabled]}
          disabled={!goalName}
          onPress={handleCreate}
        >
          <Text
            style={[
              styles.createText,
              goalName ? styles.textEnabled : styles.textDisabled,
            ]}
          >
            Crear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 64 },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  pickerBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  
  picker: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  
  bottom: {
    padding: 20,
    marginTop: 'auto',
  },
  createBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnEnabled: {
    backgroundColor: Colors.secondary[500],
  },
  btnDisabled: {
    backgroundColor: Colors.gray[100],
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textEnabled: {
    color: '#fff',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});
