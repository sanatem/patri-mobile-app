import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';

export default function PlanningScreen() {
  const advisorImage = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planificación</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.advisorCard}>
          <View style={styles.advisorHeader}>
            <Image 
              source={{ uri: advisorImage }} 
              style={styles.advisorImage} 
            />
            <View style={styles.advisorInfo}>
              <Text style={styles.advisorName}>Fernando Slebe</Text>
              <Text style={styles.advisorSubtitle}>Sobre tu asesor</Text>
            </View>
          </View>
          
          <Text style={styles.advisorBio}>
            Fernando Slebe es un Asesor de Inversiones acreditado con más de 10 años de experiencia.
          </Text>
          
          <View style={styles.advisorActions}>
            <View style={styles.advisorAction}>
              <Calendar size={20} color={Colors.gray[600]} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Próxima reunión</Text>
                <Text style={styles.actionSubtitle}>Ninguna programada</Text>
              </View>
            </View>
            <Button 
              label="Programar" 
              onPress={() => {}} 
              size="small"
              style={styles.actionButton}
            />
          </View>
          
          <View style={styles.advisorActions}>
            <View style={styles.advisorAction}>
              <MessageSquare size={20} color={Colors.gray[600]} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Bandeja de entrada</Text>
                <Text style={styles.actionSubtitle}>No hay mensajes nuevos</Text>
              </View>
            </View>
            <Button 
              label="Chat" 
              onPress={() => {}} 
              size="small"
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.expertCard}>
          <Text style={styles.expertTitle}>Obtén asesoramiento de un experto</Text>
          <Text style={styles.expertDescription}>
            Orientación personalizada en diversos temas de nuestro equipo de Asesores Financieros Certificados.
          </Text>
          
          <View style={styles.expertsContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
              style={styles.expertImage} 
            />
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
              style={[styles.expertImage, styles.expertImageMiddle]} 
            />
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
              style={styles.expertImage} 
            />
          </View>
          
          <View style={styles.expertTopics}>
            <TouchableOpacity style={styles.topicButton}>
              <Calendar size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Presupuesto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <Calendar size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Inversión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <Calendar size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Gestión de deuda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <Calendar size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Plan de Jubilación</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            label="Explorar más" 
            onPress={() => {}} 
            variant="secondary"
            style={styles.exploreButton}
          />
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
  },
  scrollView: {
    flex: 1,
  },
  advisorCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  advisorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  advisorImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  advisorInfo: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  advisorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
    marginBottom: 4,
  },
  advisorSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[500],
  },
  advisorBio: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
    marginBottom: 16,
  },
  advisorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  advisorAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTextContainer: {
    marginLeft: 12,
  },
  actionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[800],
  },
  actionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
  actionButton: {
    minWidth: 100,
  },
  expertCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expertTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.gray[800],
    marginBottom: 8,
  },
  expertDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  expertsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  expertImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  expertImageMiddle: {
    marginHorizontal: -8,
    zIndex: 1,
  },
  expertTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  topicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  topicText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[700],
    marginLeft: 8,
  },
  exploreButton: {
    marginTop: 8,
  },
  bottomSpace: {
    height: 100,
  },
});