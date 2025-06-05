import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Shield, Target } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function BenefitsCard() {
  return (
    <View style={styles.benefitsCard}>
      <Text style={styles.benefitsTitle}>¿Por qué elegir nuestro asesoramiento?</Text>
      
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <View style={styles.benefitIcon}>
            <Clock size={20} color={Colors.primary[500]} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Disponibilidad 24/7</Text>
            <Text style={styles.benefitDescription}>Chat y consultas cuando lo necesites</Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitIcon}>
            <Shield size={20} color={Colors.secondary[500]} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Certificación Garantizada</Text>
            <Text style={styles.benefitDescription}>Todos nuestros asesores están certificados</Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={styles.benefitIcon}>
            <Target size={20} color={Colors.success[500]} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Planes Personalizados</Text>
            <Text style={styles.benefitDescription}>Estrategias adaptadas a tus objetivos</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  benefitsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitsTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: Colors.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: Colors.gray[800],
    marginBottom: 2,
  },
  benefitDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },
}); 