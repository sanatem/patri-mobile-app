import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { PieChart, TrendingUp, Shield, Target, Award } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';

interface ExpertCardProps {
  onExploreServices?: () => void;
  onTopicPress?: (topic: string) => void;
}

export default function ExpertCard({ onExploreServices, onTopicPress }: ExpertCardProps) {
  const handleTopicPress = (topic: string) => {
    if (onTopicPress) {
      onTopicPress(topic);
    }
  };

  return (
    <View style={styles.expertCard}>
      <View style={styles.expertHeader}>
        <Text style={styles.expertTitle}>Asesoramiento Especializado</Text>
        <Text style={styles.expertDescription}>
          Conecta con nuestro equipo de Asesores Financieros Certificados para recibir orientación personalizada en tus objetivos financieros.
        </Text>
      </View>
      
      <View style={styles.expertsContainer}>
        <View style={styles.expertImageContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
            style={styles.expertImage} 
          />
          <View style={styles.expertBadge}>
            <Shield size={10} color="#ffffff" />
          </View>
        </View>
        <View style={[styles.expertImageContainer, styles.expertImageMiddle]}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
            style={styles.expertImage} 
          />
          <View style={styles.expertBadge}>
            <TrendingUp size={10} color="#ffffff" />
          </View>
        </View>
        <View style={styles.expertImageContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
            style={styles.expertImage} 
          />
          <View style={styles.expertBadge}>
            <Award size={10} color="#ffffff" />
          </View>
        </View>
      </View>
      
      <Text style={styles.expertFeature}>
        🏆 Todos nuestros asesores están certificados y tienen experiencia promedio de 8+ años
      </Text>
      
      <View style={styles.expertTopics}>
        <TouchableOpacity 
          style={[styles.topicButton, styles.topicPrimary]}
          onPress={() => handleTopicPress('Presupuesto')}
        >
          <PieChart size={16} color={Colors.primary[600]} />
          <Text style={[styles.topicText, styles.topicPrimaryText]}>Presupuesto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.topicButton}
          onPress={() => handleTopicPress('Inversión')}
        >
          <TrendingUp size={16} color={Colors.gray[600]} />
          <Text style={styles.topicText}>Inversión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.topicButton}
          onPress={() => handleTopicPress('Gestión de deuda')}
        >
          <Shield size={16} color={Colors.gray[600]} />
          <Text style={styles.topicText}>Gestión de deuda</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.topicButton}
          onPress={() => handleTopicPress('Plan de Jubilación')}
        >
          <Target size={16} color={Colors.gray[600]} />
          <Text style={styles.topicText}>Plan de Jubilación</Text>
        </TouchableOpacity>
      </View>
      
      <Button 
        label="Explorar todos los servicios" 
        onPress={onExploreServices || (() => {})} 
        variant="secondary"
        style={styles.exploreButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  expertCard: {
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
  expertHeader: {
    marginBottom: 20,
  },
  expertTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.gray[800],
    marginBottom: 8,
  },
  expertDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 22,
  },
  expertsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  expertImageContainer: {
    position: 'relative',
  },
  expertImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  expertImageMiddle: {
    marginHorizontal: -8,
    zIndex: 1,
  },
  expertBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertFeature: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: 'center',
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  expertTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  topicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  topicPrimary: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  topicText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: Colors.gray[700],
    marginLeft: 8,
  },
  topicPrimaryText: {
    color: Colors.primary[700],
  },
  exploreButton: {
    marginTop: 8,
  },
}); 