import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, MessageSquare, Star, Award, Clock, TrendingUp, PieChart, Shield, Target } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';

export default function PlanningScreen() {
  const advisorImage = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <Text style={styles.headerTitle}>Planificación Financiera</Text>
          <Text style={styles.headerSubtitle}>Tu camino hacia el éxito financiero</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.advisorCard}>
          <View style={styles.advisorHeader}>
            <View style={styles.advisorImageContainer}>
              <Image 
                source={{ uri: advisorImage }} 
                style={styles.advisorImage} 
              />
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.verifiedBadge}>
                <Award size={12} color="#ffffff" />
              </View>
            </View>
            <View style={styles.advisorInfo}>
              <View style={styles.advisorNameContainer}>
                <Text style={styles.advisorName}>Fernando Slebe</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <Text style={styles.advisorSubtitle}>Asesor de Inversiones Certificado</Text>
              <Text style={styles.advisorExperience}>+10 años de experiencia</Text>
            </View>
          </View>
          
          <Text style={styles.advisorBio}>
            Fernando Slebe es un Asesor de Inversiones acreditado especializado en planificación financiera integral y estrategias de inversión a largo plazo.
          </Text>
          
          <View style={styles.advisorStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>$2.5M</Text>
              <Text style={styles.statLabel}>Administrado</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Satisfacción</Text>
            </View>
          </View>
          
          <View style={styles.advisorActions}>
            <View style={styles.advisorAction}>
              <View style={styles.actionIcon}>
                <Calendar size={18} color={Colors.primary[500]} />
              </View>
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
              <View style={styles.actionIcon}>
                <MessageSquare size={18} color={Colors.secondary[500]} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Bandeja de entrada</Text>
                <Text style={styles.actionSubtitle}>No hay mensajes nuevos</Text>
              </View>
            </View>
            <Button 
              label="Chat" 
              onPress={() => {}} 
              size="small"
              style={[styles.actionButton, styles.chatButton]}
            />
          </View>
        </View>

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
          
          <Text style={styles.expertFeature}>🏆 Todos nuestros asesores están certificados y tienen experiencia promedio de 8+ años</Text>
          
          <View style={styles.expertTopics}>
            <TouchableOpacity style={[styles.topicButton, styles.topicPrimary]}>
              <PieChart size={16} color={Colors.primary[600]} />
              <Text style={[styles.topicText, styles.topicPrimaryText]}>Presupuesto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <TrendingUp size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Inversión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <Shield size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Gestión de deuda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topicButton}>
              <Target size={16} color={Colors.gray[600]} />
              <Text style={styles.topicText}>Plan de Jubilación</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            label="Explorar todos los servicios" 
            onPress={() => {}} 
            variant="secondary"
            style={styles.exploreButton}
          />
        </View>
        
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
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  advisorCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  advisorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  advisorImageContainer: {
    position: 'relative',
  },
  advisorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.primary[100],
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success[500],
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  advisorInfo: {
    marginLeft: 16,
    justifyContent: 'center',
    flex: 1,
  },
  advisorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  advisorName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.gray[800],
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 2,
  },
  advisorSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary[600],
    marginBottom: 2,
  },
  advisorExperience: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
  advisorBio: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 22,
    marginBottom: 20,
  },
  advisorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.primary[600],
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: 2,
  },
  advisorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  advisorAction: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    marginLeft: 12,
  },
  actionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.gray[800],
  },
  actionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  actionButton: {
    minWidth: 100,
  },
  chatButton: {
    backgroundColor: Colors.secondary[500],
  },
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
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.gray[800],
    marginBottom: 8,
  },
  expertDescription: {
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.gray[800],
    marginBottom: 2,
  },
  benefitDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  bottomSpace: {
    height: 100,
  },
});