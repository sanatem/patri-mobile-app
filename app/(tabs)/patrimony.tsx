import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Search,
  ChevronRight,
  Users,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Settings,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import AreaChart from '@/components/patrimony/AreaChart';
import AssetCard from '@/components/patrimony/AssetCard';
import LiabilityCard from '@/components/patrimony/LiabilityCard';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { Asset, Liability } from '@/types';
import { useRouter } from 'expo-router';

const myAssets: Asset[] = [
  { id: '1', name: 'Cuenta Corriente', type: 'Banco de Chile', value: 7204483, change: 2.8, color: '#4285F4' },
  { id: '2', name: 'Cuenta de Ahorro', type: 'Banco de Chile', value: 5382610, change: 1.4, color: '#EA4335' },
  { id: '3', name: 'Inversión', type: 'Fondo Mutuo Santander', value: 892147, change: -0.5, color: '#FBBC05' },
  { id: '4', name: 'Inversión', type: 'Inversiones Vector', value: 280000000, change: 3.2, color: '#6366F1' },
];

const partnerAssets: Asset[] = [
  { id: '5', name: 'Cuenta Corriente', type: 'Banco Falabella', value: 280000, change: 3.2, color: '#6366F1' },
  { id: '6', name: 'Cuenta de Ahorro', type: 'Banco Itaú', value: 150000, change: 0.8, color: '#10B981' },
  { id: '7', name: 'Inversión', type: 'Inversión Nevasa', value: 500000, change: 1.2, color: '#F59E0B' },
];

const myLiabilities: Liability[] = [
  { id: '8', name: 'Crédito Hipotecario', type: 'Banco Santander', value: 85000000, change: -2.5, color: '#DC2626' },
  { id: '9', name: 'Tarjeta de Crédito', type: 'Banco de Chile', value: 1250000, change: 15.2, color: '#7C2D12' },
  { id: '10', name: 'Crédito Vehicular', type: 'Forus', value: 12500000, change: -5.8, color: '#B91C1C' },
];

const partnerLiabilities: Liability[] = [
  { id: '11', name: 'Crédito Educativo', type: 'Banco Scotiabank', value: 8500000, change: -3.2, color: '#991B1B' },
  { id: '12', name: 'Tarjeta de Crédito', type: 'Banco de Chile', value: 890000, change: 8.4, color: '#7F1D1D' },
  { id: '13', name: 'Línea de Crédito', type: 'Banco de Chile', value: 2500000, change: 0.0, color: '#6B1D1D' },
];

const combinedAssets = [...myAssets, ...partnerAssets];
const combinedLiabilities = [...myLiabilities, ...partnerLiabilities];

const timeRangeMapping = {
  '1 Mes': '1m',
  '6 Meses': '6m',
  '1 Año': '1y',
  Todo: 'all',
} as const;

const timeRanges = Object.keys(timeRangeMapping) as Array<keyof typeof timeRangeMapping>;

export default function PatrimonyScreen() {
  const { user } = useAuth();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [mineSelected, setMineSelected] = useState(true);
  const [partnerSelected, setPartnerSelected] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const ownerView: 'mine' | 'partner' | 'both' =
    mineSelected && partnerSelected ? 'both' : mineSelected ? 'mine' : 'partner';

  const currentAssets = ownerView === 'mine' ? myAssets : ownerView === 'partner' ? partnerAssets : combinedAssets;
  const currentLiabilities = ownerView === 'mine' ? myLiabilities : ownerView === 'partner' ? partnerLiabilities : combinedLiabilities;

  const filteredAssets = currentAssets.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLiabilities = currentLiabilities.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.type.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalAssets = currentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = currentLiabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentTimeRangeLabel = Object.keys(timeRangeMapping).find((key) => timeRangeMapping[key as keyof typeof timeRangeMapping] === rangeSize) || '6 Meses';
  const handleTimeRangeChange = (range: keyof typeof timeRangeMapping) => setRangeSize(timeRangeMapping[range]);

  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 px-4 pb-4 border-b border-gray-100 flex-row justify-between items-center" style={{ paddingTop: 64 }}>
        <View className="flex-row items-center space-x-3">
        <Pressable
  onPress={() => setShowSelector(!showSelector)}
  className="flex-row items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200"
>
  <View className="w-8 h-8 rounded-full border-2 border-primary-500 px-1 items-center justify-center bg-white">
    <Text className="text-xs font-bold text-gray-500">GD</Text>
  </View>
  <ChevronRight size={14} color="#9CA3AF" className="ml-2" />
</Pressable>
{showSelector && (
  <View style={{ position: 'absolute', left: 90, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 8, zIndex: 50 }}>
    {[
      { id: 'mine', label: 'GD', isActive: ownerView === 'mine' },
      { id: 'partner', label: 'JM', isActive: ownerView === 'partner' },
      { id: 'both', label: 'both', isActive: ownerView === 'both' },
    ].map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          setShowSelector(false);
          setMineSelected(item.id !== 'partner');
          setPartnerSelected(item.id !== 'mine');
        }}
        className={`w-8 h-8 rounded-full items-center justify-center border ${
          item.isActive
            ? 'border-primary-500 bg-white'
            : 'border-gray-100 bg-white'
        }`}
        style={{ width: 30, height: 30 }}
      >
        {item.id === 'both' ? (
          <Users size={14} color="#4B5563" />
        ) : (
          <Text className="text-[11px] font-bold text-gray-500">{item.label}</Text>
        )}
      </TouchableOpacity>
    ))}
  </View>
)}   
        </View>
        <TouchableOpacity className="p-1.5" onPress={() => router.push('/settings')}>
          <Settings size={24} color={Colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          <Text className="text-center text-gray-600 text-lg font-medium mb-2">Patrimonio Neto</Text>
          <View className="flex-row items-center justify-center mb-1">
            <Text className="text-3xl font-bold text-green-600">${netWorth.toLocaleString('es-CL')}</Text>
            <TouchableOpacity className="ml-2 pb-1" onPress={() => setShowTooltip(!showTooltip)}>
              <ChevronDown
                size={20}
                color={Colors.gray[500]}
                style={showTooltip ? { transform: [{ rotate: '180deg' }] } : {}}
              />
            </TouchableOpacity>
          </View>

          {showTooltip && (
            <View className="mt-3 mb-4 self-center">
              <View className="flex-row justify-between items-center px-3 mb-1">
                <View className="flex-row items-center space-x-1">
                  <ArrowUp size={16} color={Colors.success[500]} />
                  <Text className="text-sm font-medium text-gray-600">Activos</Text>
                </View>
                <Text className="text-sm font-semibold text-green-600">+${totalAssets.toLocaleString('es-CL')}</Text>
              </View>
              <View className="flex-row justify-between items-center px-3">
                <View className="flex-row items-center space-x-1">
                  <ArrowDown size={16} color={Colors.error[500]} />
                  <Text className="text-sm font-medium text-gray-600">Pasivos</Text>
                </View>
                <Text className="text-sm font-semibold text-red-600">-${totalLiabilities.toLocaleString('es-CL')}</Text>
              </View>
            </View>
          )}

          <Text className="text-center text-sm text-gray-500 mb-6 font-regular">
            <Text className="text--10 font-medium">$7,151,936 (71.52%)</Text> · vs último mes
          </Text>

          <View className="flex-row justify-center mb-6">
            {timeRanges.map((range) => {
              const isSelected = currentTimeRangeLabel === range;
              return (
                <TouchableOpacity
                  key={range}
                  className={`px-4 py-2 rounded-full mx-1 ${isSelected ? 'bg-gray-100' : ''}`}
                  onPress={() => handleTimeRangeChange(range)}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{range}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AreaChart />

          <View className="flex-row items-center bg-gray-50 rounded-lg px-3 mt-6">
            <Search size={20} color={Colors.gray[400]} className="mr-2" />
            <TextInput
              className="flex-1 h-12 text-base font-regular text-gray-800"
              placeholder="Buscar activo o pasivo"
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row border-b border-gray-200 mt-6">
            <TouchableOpacity className={`flex-1 items-center py-4 ${activeTab === 'assets' ? 'border-b-2 border-primary-500' : ''}`} onPress={() => setActiveTab('assets')}>
              <Text className={`text-base font-medium ${activeTab === 'assets' ? 'text-primary-500' : 'text-gray-500'}`}>Activos <Text className="text-sm bg-gray-200 rounded-full px-3 py-1.5">{currentAssets.length}</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity className={`flex-1 items-center py-4 ${activeTab === 'liabilities' ? 'border-b-2 border-primary-500' : ''}`} onPress={() => setActiveTab('liabilities')}>
              <Text className={`text-base font-medium ${activeTab === 'liabilities' ? 'text-primary-500' : 'text-gray-500'}`}>Pasivos <Text className="text-sm bg-gray-200 rounded-full px-3 py-1.5">{currentLiabilities.length}</Text></Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-base font-regular text-gray-700">Total en {activeTab === 'assets' ? 'activos' : 'pasivos'}</Text>
            <Text className={`text-base font-semibold ${activeTab === 'liabilities' ? 'text-red-600' : 'text-gray-900'}`}>
              {activeTab === 'assets' ? '+' : '-'}${(activeTab === 'assets' ? totalAssets : totalLiabilities).toLocaleString('es-CL')}
            </Text>
          </View>

          {(activeTab === 'assets' ? filteredAssets : filteredLiabilities).map((item) => (
            activeTab === 'assets' ? <AssetCard key={item.id} asset={item} /> : <LiabilityCard key={item.id} liability={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
