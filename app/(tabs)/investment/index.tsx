import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, Settings } from 'lucide-react-native';
import { Header } from '@/components/ui';

export default function InvestmentIndex() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <Header
        title="Inversiones"
        rightAction={
          <TouchableOpacity className="p-2" onPress={() => router.push('/settings')}>
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 justify-center items-center px-6 pb-6">
        <View style={{ width: 64, height: 64, backgroundColor: 'rgba(250, 86, 4, 0.17)', borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <DollarSign size={32} color="#ff5603" />
        </View>

        <Text className="text-xl font-bold text-center text-gray-900 mb-2">
          Un solo lugar para hacer crecer tu patrimonio.
        </Text>

        <Text className="text-base font-regular text-gray-600 text-center mb-6 px-2">
          Opciones de ahorro e inversión personalizadas, para todo tipo de inversionista.
        </Text>

        <TouchableOpacity
          className="bg-primary-500 py-3 px-8 rounded-full"
          onPress={() =>
            router.push('/investment/create-account/investment-survey/start-profile' as any)
          }
        >
          <Text className="text-white font-semibold text-base">Comenzar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/investment/investment-guest' as any)}>
          <Text className="text-primary-500 text-center mt-4 font-regular">Continuar sin cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
