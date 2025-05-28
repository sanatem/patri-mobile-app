import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, MessageSquare, Star, Award } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';

interface AdvisorCardProps {
  onSchedule?: () => void;
  onChat?: () => void;
}

export default function AdvisorCard({ onSchedule, onChat }: AdvisorCardProps) {
  const advisorImage = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
  
  return (
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
          onPress={onSchedule || (() => {})} 
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
          onPress={onChat || (() => {})} 
          size="small"
          style={[styles.actionButton, styles.chatButton]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 