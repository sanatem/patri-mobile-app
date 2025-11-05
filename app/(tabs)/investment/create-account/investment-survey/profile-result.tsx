import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { getRiskProfile, type RiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { useAuth } from '@/providers/AuthProvider';

const RISK_PROFILE_LABELS: Record<string, { title: string; description: string }> = {
  conservative: {
    title: 'Perfil Conservador',
    description: 'Valoras principalmente la estabilidad, aunque aceptas un poco de riesgo en tus inversiones.',
  },
  moderate: {
    title: 'Perfil Moderado',
    description: 'Buscas un equilibrio entre estabilidad y crecimiento, aceptando cierto nivel de riesgo.',
  },
  aggressive: {
    title: 'Perfil Agresivo',
    description: 'Priorizas el crecimiento y estás dispuesto a asumir mayores riesgos por mejores rentabilidades.',
  },
};

export default function ProfileResult() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<string>('conservative');

  useEffect(() => {
    fetchRiskProfile();
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
        determineProfileType(response.risk_profile);
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
    // Lógica simple para determinar el tipo de perfil
    // Puedes ajustar esta lógica según los criterios del negocio
    if (profile.investment_choice === 'risky' || profile.investment_drop === 'invest_more') {
      setProfileType('aggressive');
    } else if (profile.investment_choice === 'conservative' || profile.investment_drop === 'sell_everything') {
      setProfileType('conservative');
    } else {
      setProfileType('moderate');
    }
  };

  const handleContinue = () => {
    router.push('/investment/create-account/complete-profile' as any);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText} className="font-regular">
          Cargando tu perfil...
        </Text>
      </View>
    );
  }

  const profileInfo = RISK_PROFILE_LABELS[profileType] || RISK_PROFILE_LABELS.conservative;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.detectiveEmoji}>🕵️‍♀️</Text>
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

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleContinue}
          title={t('common.understoodAndContinue')}
          className="w-full"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    backgroundColor: Colors.light.background,
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
    color: Colors.primary[400],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary[500],
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
