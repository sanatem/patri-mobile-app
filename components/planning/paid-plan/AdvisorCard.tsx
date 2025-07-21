import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { Card } from '@/components/ui';
import { useUserData } from '@/hooks/user/useUserData';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

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
        <View style={{ padding: 20 }}>
          <View className="flex-row mb-4">
            <SkeletonBase
              width={64}
              height={64}
              x={0}
              y={0}
              rows={1}
              rowHeight={64}
              rowWidth={64}
              borderRadius={32}
              style={{ marginRight: 16 }}
            />
            <View className="flex-1 justify-center">
              <SkeletonBase
                width={120}
                height={20}
                x={0}
                y={0}
                rows={1}
                rowHeight={20}
                rowWidth={120}
                borderRadius={4}
                style={{ marginBottom: 8 }}
              />
              <SkeletonBase
                width={180}
                height={16}
                x={0}
                y={0}
                rows={1}
                rowHeight={16}
                rowWidth={180}
                borderRadius={4}
                style={{ marginBottom: 4 }}
              />
              <SkeletonBase
                width={140}
                height={14}
                x={0}
                y={0}
                rows={1}
                rowHeight={14}
                rowWidth={140}
                borderRadius={4}
              />
            </View>
          </View>
          
          <SkeletonBase
            width={280}
            height={16}
            x={0}
            y={0}
            rows={3}
            rowHeight={16}
            rowWidth={i => (i === 0 ? 280 : i === 1 ? 250 : 200)}
            borderRadius={4}
          />
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