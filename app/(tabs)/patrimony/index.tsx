import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { 
  LABELS, 
  TIME_RANGES, 
  TAB_CONFIG 
} from '@/constants/AppConstants';
import { useAuth } from '@/providers/AuthProvider';
import AreaChart from '@/components/patrimony/AreaChart';
import { PatrimonySummary } from '@/components/patrimony/PatrimonySummary';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { Asset, Liability } from '@/types';
import { patrimonyService } from '@/services/patrimony/get-patrimony';
import { 
  SearchBar, 
  Tabs,
  ListItem,
  Header,
  Container,
  UserSelector,
  SegmentedControl,
  KeyboardAwareContainer,
} from '@/components/ui';
import { userService } from '@/services/user/get-user-profile';
import type { UserProfile } from '@/services/types';
import assetsHistory from '@/assets/data/assets-history.json';
import { LinearGradient } from 'expo-linear-gradient';
import { listItemStyles } from '@/styles/ui/ListItem.styles';

export default function PatrimonyScreen() {
  const { user } = useAuth();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [ownerView, setOwnerView] = useState<'mine' | 'partner' | 'both'>('mine');
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patrimonyData, setPatrimonyData] = useState<{
    MY_ASSETS: Asset[];
    PARTNER_ASSETS: Asset[];
    MY_LIABILITIES: Liability[];
    PARTNER_LIABILITIES: Liability[];
  }>({
    MY_ASSETS: [],
    PARTNER_ASSETS: [],
    MY_LIABILITIES: [],
    PARTNER_LIABILITIES: []
  });
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadPatrimonyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = patrimonyService.getPatrimonyDataForComponents();
      setPatrimonyData(data);
    } catch (err) {
      setError('Error al cargar los datos del patrimonio');
      console.error('Error loading patrimony data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatrimonyData();
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoadingProfile(true);
        const profile = userService.getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserData();
  }, []);

  const myAssets = patrimonyData.MY_ASSETS;
  const partnerAssets = patrimonyData.PARTNER_ASSETS;
  const myLiabilities = patrimonyData.MY_LIABILITIES;
  const partnerLiabilities = patrimonyData.PARTNER_LIABILITIES;

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

  function getLastTwoValues(history: { date: string, value: number }[]) {
    if (history.length < 2) return { current: null, previous: null };
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      previous: sorted[sorted.length - 2].value,
      current: sorted[sorted.length - 1].value
    };
  }

  function calculateChange(current: number, previous: number) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  const assetsData = filteredAssets.map(asset => {
    const history = assetsHistory[asset.id as keyof typeof assetsHistory] || [];
    const { current, previous } = getLastTwoValues(history);
    const change = (current !== null && previous !== null)
      ? calculateChange(current, previous)
      : asset.change;

    return {
      id: asset.id,
      title: asset.name,
      subtitle: asset.type,
      value: asset.value,
      icon: {
        backgroundColor: asset.color,
        text: asset.name.charAt(0)
      },
      badge: {
        text: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        variant: change >= 0 ? 'positive' as const : 'negative' as const
      }
    };
  });

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

  if (isLoading) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <Header
          title={LABELS.PATRIMONY.TITLE}
          className="border-b border-gray-100"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Cargando datos del patrimonio...</Text>
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <Header
          title={LABELS.PATRIMONY.TITLE}
          className="border-b border-gray-100"
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-600 mb-2">{error}</Text>
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => {
              setError(null);
              setIsLoading(true);
              loadPatrimonyData();
            }}
          >
            <Text className="text-white">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header
        title={LABELS.PATRIMONY.TITLE}
        leftAction={
          <UserSelector
            selectedView={ownerView}
            onViewChange={handleUserViewChange}
            showSelector={showSelector}
            onToggle={() => setShowSelector(!showSelector)}
            myLabel={userProfile?.initials || ''}
            partnerLabel={userProfile?.partner?.initials || ''}
          />
        }
        rightAction={
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />
      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <PatrimonySummary
            netWorth={netWorth}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            showTooltip={showTooltip}
            onToggleTooltip={() => setShowTooltip(!showTooltip)}
          />
          <Container variant="content" className="mb-4 mt-4">
            <SegmentedControl
              options={TIME_RANGES.LABELS.map(label => ({ label, value: label }))}
              value={currentTimeRangeLabel}
              onChange={val => handleTimeRangeChange(val as keyof typeof TIME_RANGES.MAPPING)}
            />
          </Container>
          <AreaChart />
            <Container variant="content" className="mb-4">
              <SearchBar
                placeholder={LABELS.PATRIMONY.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              </Container>
          <Container variant="content">
            <View style={listItemStyles.cardContainer}>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(key) => setActiveTab(key as 'assets' | 'liabilities')}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] }}>
                <Text style={{ color: Colors.gray[700], fontSize: 16, fontFamily: 'Poppins-Regular' }}>
                  {activeTab === 'assets' ? LABELS.PATRIMONY.TOTAL_ASSETS : LABELS.PATRIMONY.TOTAL_LIABILITIES}
                </Text>
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'assets' ? '+' : '-'}${(activeTab === 'assets' ? totalAssets : totalLiabilities).toLocaleString('es-CL')}
                </Text>
              </View>
              <ListItem
                data={currentData}
                showLoadMore={false}
                showContainer={false}
              />
            </View>
          </Container>
        </ScrollView>
      </KeyboardAwareContainer>
    </Container>
  );
}
