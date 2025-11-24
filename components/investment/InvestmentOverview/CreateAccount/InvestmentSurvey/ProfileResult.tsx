import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, LoadingSpinner } from '@/components/ui';
import Colors from '@/constants/Colors';
import { getRiskProfile, type RiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { useAuth } from '@/providers/AuthProvider';

const RISK_PROFILE_LABELS: Record<string, { title: string; description: string; emoji: string }> = {
  conservative: {
    title: 'Perfil Conservador',
    description: 'Buscas siempre la protección del capital que inviertes y, excepcionalmente, aceptas un riesgo mínimo de pérdida de la inversión.',
    emoji: '🛡️',
  },
  balanced: {
    title: 'Perfil Moderado',
    description: 'Aceptas un riesgo medio de pérdida, a cambio de una expectativa de mayor rentabilidad.',
    emoji: '⚖️',
  },
  risky: {
    title: 'Perfil Agresivo',
    description: 'Aceptas un muy alto riesgo de pérdida de la inversión, a cambio de una expectativa de muy alta rentabilidad.',
    emoji: '🚀',
  },
};

export default function ProfileResult() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<string>('conservative');

  useEffect(() => {
    // Agregar un delay mínimo para mostrar el loading
    const timer = setTimeout(() => {
      fetchRiskProfile();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const fetchRiskProfile = async () => {
    if (!accessToken) {
      Alert.alert(t('common.error'), 'No hay token de autenticación disponible');
      setLoading(false);
      return;
    }

    try {
      const response = await getRiskProfile(accessToken);

      if (response.success && response.risk_profile) {
        setRiskProfile(response.risk_profile);
        
        // Usar investor_category de investor_questionnaire si está disponible
        if (response.investor_questionnaire?.investor_category) {
          setProfileType(response.investor_questionnaire.investor_category);
        } else {
          determineProfileType(response.risk_profile);
        }
      } else {
        Alert.alert(
          t('common.error'),
          response.message || 'Error al obtener el perfil de riesgo'
        );
      }
    } catch (error) {
      console.error('Error fetching risk profile:', error);
      Alert.alert(t('common.error'), 'Error al obtener el perfil de riesgo');
    } finally {
      setLoading(false);
    }
  };

  const determineProfileType = (profile: RiskProfile) => {
    // investor_category viene en la respuesta pero no en el objeto profile
    // Lo manejaremos desde fetchRiskProfile
    if (profile.investment_choice === 'risky' || profile.investment_drop === 'invest_more') {
      setProfileType('risky');
    } else if (profile.investment_choice === 'conservative' || profile.investment_drop === 'sell_everything') {
      setProfileType('conservative');
    } else {
      setProfileType('balanced');
    }
  };

  const handleContinue = () => {
    router.push('/(tabs)/investment/create-account/complete-profile');
  };

  const handleRetakeQuestionnaire = () => {
    router.push('/(tabs)/investment/create-account/investment-survey/start-profile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const profileInfo = RISK_PROFILE_LABELS[profileType] || RISK_PROFILE_LABELS.conservative;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.detectiveEmoji}>{profileInfo.emoji}</Text>
        </View>

        <Text style={styles.title} className="font-medium">
          {profileInfo.title}
        </Text>

        <Text style={styles.subtitle} className="font-regular text-center">
          {profileInfo.description}
        </Text>

        <Text style={styles.changeText} className="font-regular text-center">
          {t('profileResult.description2')}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleContinue}
          title={t('common.understood')}
          className="w-full"
        />
        <Button
          onPress={handleRetakeQuestionnaire}
          title="Realizar el cuestionario nuevamente"
          variant="ghost"
          className="w-full mt-3"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 100,
  },
  detectiveEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    color: Colors.primary[700],
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  changeText: {
    fontSize: 14,
    color: Colors.primary[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
