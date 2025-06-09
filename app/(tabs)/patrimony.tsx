import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { 
  PATRIMONY_DATA, 
  LABELS, 
  TIME_RANGES, 
  USER_LABELS, 
  TAB_CONFIG 
} from '@/constants/AppConstants';
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

export default function PatrimonyScreen() {
  const { user } = useAuth();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [ownerView, setOwnerView] = useState<'mine' | 'partner' | 'both'>('mine');
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  const myAssets = PATRIMONY_DATA.MY_ASSETS;
  const partnerAssets = PATRIMONY_DATA.PARTNER_ASSETS;
  const myLiabilities = PATRIMONY_DATA.MY_LIABILITIES;
  const partnerLiabilities = PATRIMONY_DATA.PARTNER_LIABILITIES;

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

  const currentTimeRangeLabel = Object.keys(TIME_RANGES.MAPPING).find((key) => 
    TIME_RANGES.MAPPING[key as keyof typeof TIME_RANGES.MAPPING] === rangeSize
  ) || '6 Meses';
  
  const handleUserViewChange = (view: 'mine' | 'partner' | 'both') => {
    setOwnerView(view);
    setShowSelector(false);
  };

  const handleTimeRangeChange = (range: keyof typeof TIME_RANGES.MAPPING) => {
    setRangeSize(TIME_RANGES.MAPPING[range]);
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

  const tabs = TAB_CONFIG.PATRIMONY.map(tab => ({
    ...tab,
    badge: (tab.key === 'assets' ? currentAssets : currentLiabilities).length.toString()
  }));

  const currentData = activeTab === 'assets' ? assetsData : liabilitiesData;

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header
        title={LABELS.PATRIMONY.TITLE}
        leftAction={
          <UserSelector
            selectedView={ownerView}
            onViewChange={handleUserViewChange}
            showSelector={showSelector}
            onToggle={() => setShowSelector(!showSelector)}
            myLabel={USER_LABELS.MY_LABEL}
            partnerLabel={USER_LABELS.PARTNER_LABEL}
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
            {TIME_RANGES.LABELS.map((range) => {
              const isSelected = currentTimeRangeLabel === range;
              return (
                <TouchableOpacity
                  key={range}
                  className={`px-4 py-2 rounded-full mx-1 ${isSelected ? 'bg-gray-100' : ''}`}
                  onPress={() => handleTimeRangeChange(range as keyof typeof TIME_RANGES.MAPPING)}
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
            placeholder={LABELS.PATRIMONY.SEARCH_PLACEHOLDER}
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
              {activeTab === 'assets' ? LABELS.PATRIMONY.TOTAL_ASSETS : LABELS.PATRIMONY.TOTAL_LIABILITIES}
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
