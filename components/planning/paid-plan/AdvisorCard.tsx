
import { View, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui';
import { useUserData } from '@/hooks/user/useUserData';

interface AdvisorCardProps {
  onSchedule?: () => void;
  onChat?: () => void;
}

export default function AdvisorCard({ onSchedule, onChat }: AdvisorCardProps) {
  const { userData, loading, error } = useUserData();
  const advisor = userData?.user?.advisor;
  
  if (loading) {
    return (
      <Card variant="elevated" className="m-4 mb-2">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={{
            marginTop: 10,
            fontSize: 14,
            color: Colors.gray[600]
          }}>
            Cargando asesor...
          </Text>
        </View>
      </Card>
    );
  }

  if (error || !advisor) {
    return (
      <Card variant="elevated" className="m-4 mb-2">
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{
            fontSize: 16,
            color: Colors.error[500],
            marginBottom: 8,
            textAlign: 'center'
          }}>
            Error al cargar asesor
          </Text>
          <Text style={{
            fontSize: 14,
            color: Colors.gray[500],
            textAlign: 'center'
          }}>
            {error || 'No se pudo obtener la información del asesor'}
          </Text>
        </View>
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" className="m-4 mb-2">
      <View className="flex-row mb-4">
        <View style={{ position: 'relative' }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 3,
            borderColor: Colors.primary[100],
            backgroundColor: Colors.primary[100],
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: Colors.primary[600]
            }}>
              {advisor.advisor_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View className="ml-4 flex-1 justify-center">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-medium" style={{ color: Colors.primary[500] }}>
              {advisor.advisor_name}
            </Text>
          </View>
          <Text className="text-sm font-medium mb-0.5" style={{ color: Colors.primary[500] }}>
            Asesor de Inversiones Certificado
          </Text>
          <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>
            {advisor.email}
          </Text>
        </View>
      </View>
      
      <Text className="text-sm font-regular" style={{ color: Colors.gray[700] }}>
        {advisor.description || `${advisor.advisor_name} es un Asesor de Inversiones acreditado especializado en planificación financiera integral y estrategias de inversión a largo plazo.`}
      </Text>

    </Card>
  );
}