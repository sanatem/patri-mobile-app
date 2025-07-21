import { useState } from 'react';
import { View, Text } from 'react-native';
import FreePlanIndex from './free-plan';
import PaidPlanIndex from './paid-plan';
import { useUserData } from '@/hooks/user/useUserData';
import { LoadingSpinner } from '@/components/ui';

export default function PlanningScreen() {
  const { userData, loading, error } = useUserData();
  const [userHasPlan, setUserHasPlan] = useState(false);

  const handlePurchase = () => {
    setUserHasPlan(true);
  };

  // Mostrar spinner mientras carga o mientras no tengamos datos del usuario
  if (loading || !userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20
      }}>
        <Text style={{ 
          fontSize: 16, 
          color: '#ef4444',
          textAlign: 'center',
          marginBottom: 12,
          fontFamily: 'Poppins-medium'
        }}>
          Error al cargar datos
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#6b7280',
          textAlign: 'center',
          fontFamily: 'Poppins-regular'
        }}>
          {error}
        </Text>
      </View>
    );
  }

  const userPlan = userData?.user?.plan;
  const isFreePlan = userPlan === 'Gratis' || userPlan === 'gratis' || userPlan === 'FREE' || userPlan === 'free';
  const isPaidPlan = !isFreePlan && userPlan && userPlan !== '';

  if (isPaidPlan) {
    return <PaidPlanIndex />;
  }

  return <FreePlanIndex onPurchase={handlePurchase} />;
}
