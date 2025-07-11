import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import { Header } from '@/components/ui';
import Colors from '@/constants/Colors';

export default function WithoutAccountScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <Header
        title="Inversiones"
      />
      <View className="flex-1 justify-center items-center px-6 pb-6">
        <View style={{ width: 64, height: 64, backgroundColor: Colors.primary[100], borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <TrendingUp size={32} color={Colors.primary[500]} />
        </View>
        <Text className="text-base font-regular text-center mb-6 px-2" style={{ color: Colors.gray[600] }}>
          Para acceder a esta sección necesitas tener una cuenta de inversión activa.
        </Text>
      </View>
    </View>
  );
} 