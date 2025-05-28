import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const questions = [
  {
    text: 'Si inviertes $1 millón, ¿preferirías...',
    options: [
      'Ganar lo mínimo sin riesgo de perder',
      'Ganar $100k, con riesgo de perder $20k',
      'Ganar $300k, con riesgo de perder $150k',
      'Ganar $400k, con riesgo de perder $250k'
    ]
  },
  {
    text: '¿Cuánto has ahorrado en tu vida?',
    options: [
      'Menos de 1 millón',
      'Entre 1 y 10 millones',
      'Entre 10 y 100 millones',
      'Más de 100 millones'
    ]
  },
  {
    text: 'Cara: ganas $200k. Sello: pierdes $100k. ¿Jugarías una vez?',
    options: ['Sí', 'No']
  },
  {
    text: '¿Qué harías si tu inversión pierde un 5% en un mes por una crisis?',
    options: ['Esperar', 'Vender una parte', 'Vender todo', 'Invertir más']
  }
];

export default function ProfileQuestion() {
  const [step, setStep] = useState(0);

  const handleSelect = (index: number) => {
    // Acá podrías guardar la respuesta si lo necesitas
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/(tabs)/investment/loading-profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[step].text}</Text>

      {questions[step].options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => handleSelect(index)}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}

      {step > 0 && (
        <TouchableOpacity style={styles.back} onPress={() => setStep(step - 1)}>
          <Text style={{ color: '#6b7280' }}>Volver</Text>
        </TouchableOpacity>
      )}
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
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20
  },
  option: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  back: {
    marginTop: 16,
    alignItems: 'center'
  }
});
