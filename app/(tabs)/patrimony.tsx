import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import AreaChart from '@/components/patrimony/AreaChart';
import { PatrimonySummary } from '@/components/patrimony/PatrimonySummary';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { Asset, Liability } from '@/types';
import { 
  SearchBar, 
  Tabs,
  ListItem,
  Header,
  Container,
  UserSelector,
} from '@/components/ui';

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
  const [ownerView, setOwnerView] = useState<'mine' | 'partner' | 'both'>('mine');
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const combinedAssets = [...myAssets, ...partnerAssets];
  const combinedLiabilities = [...myLiabilities, ...partnerLiabilities];

  const currentAssets = ownerView === 'mine' ? myAssets : ownerView === 'partner' ? partnerAssets : combinedAssets;
  const currentLiabilities = ownerView === 'mine' ? myLiabilities : ownerView === 'partner' ? partnerLiabilities : combinedLiabilities;

  const filteredAssets = currentAssets.filter((a) => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredLiabilities = currentLiabilities.filter((l) => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = currentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = currentLiabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentTimeRangeLabel = Object.keys(timeRangeMapping).find((key) => timeRangeMapping[key as keyof typeof timeRangeMapping] === rangeSize) || '6 Meses';
  
  const handleUserViewChange = (view: 'mine' | 'partner' | 'both') => {
    setOwnerView(view);
    setShowSelector(false);
  };

  const handleTimeRangeChange = (range: keyof typeof timeRangeMapping) => {
    setRangeSize(timeRangeMapping[range]);
  };

  const assetsData = filteredAssets.map(asset => ({
    id: asset.id,
    title: asset.name,
    subtitle: asset.type,
    value: asset.value,
    icon: {
      backgroundColor: asset.color,
      text: asset.name.charAt(0)
    },
    badge: {
      text: `${asset.change >= 0 ? '+' : ''}${asset.change}%`,
      variant: asset.change >= 0 ? 'positive' as const : 'negative' as const
    }
  }));

  const liabilitiesData = filteredLiabilities.map(liability => ({
    id: liability.id,
    title: liability.name,
    subtitle: liability.type,
    value: -liability.value,
    icon: {
      backgroundColor: liability.color,
      text: liability.name.charAt(0)
    },
    badge: {
      text: `${liability.change >= 0 ? '+' : ''}${liability.change}%`,
      variant: liability.change < 0 ? 'positive' as const : 'negative' as const
    }
  }));

  const tabs = [
    {
      key: 'assets',
      label: 'Activos',
      badge: currentAssets.length.toString()
    },
    {
      key: 'liabilities', 
      label: 'Pasivos',
      badge: currentLiabilities.length.toString()
    }
  ];

  const currentData = activeTab === 'assets' ? assetsData : liabilitiesData;

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header
        title=""
        leftAction={
          <UserSelector
            selectedView={ownerView}
            onViewChange={handleUserViewChange}
            showSelector={showSelector}
            onToggle={() => setShowSelector(!showSelector)}
          />
        }
        rightAction={
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color={Colors.gray[600]} />
          </TouchableOpacity>
        }
        className="border-b border-gray-100"
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Container variant="content" className="py-4">
          <PatrimonySummary
            netWorth={netWorth}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            showTooltip={showTooltip}
            onToggleTooltip={() => setShowTooltip(!showTooltip)}
          />
          <View className="flex-row justify-center mb-6">
            {timeRanges.map((range) => {
              const isSelected = currentTimeRangeLabel === range;
              return (
                <TouchableOpacity
                  key={range}
                  className={`px-4 py-2 rounded-full mx-1 ${isSelected ? 'bg-gray-100' : ''}`}
                  onPress={() => handleTimeRangeChange(range)}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                    {range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <AreaChart />
          <SearchBar
            placeholder="Buscar activo o pasivo"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mt-6"
          />
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as 'assets' | 'liabilities')}
            className="mt-6"
          />
          <View className="flex-row justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-base font-regular text-gray-700">
              Total en {activeTab === 'assets' ? 'activos' : 'pasivos'}
            </Text>
            <Text 
              className={`text-base font-semibold ${
                activeTab === 'liabilities' ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {activeTab === 'assets' ? '+' : '-'}${(activeTab === 'assets' ? totalAssets : totalLiabilities).toLocaleString('es-CL')}
            </Text>
          </View>
          <ListItem
            data={currentData}
            showLoadMore={false}
          />
        </Container>
      </ScrollView>
    </Container>
  );
}
