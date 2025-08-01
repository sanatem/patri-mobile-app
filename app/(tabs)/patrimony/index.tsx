import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Settings, Plus, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { 

  TAB_CONFIG 
} from '@/constants/AppConstants';
import { useAuth } from '@/providers/AuthProvider';
import AreaChart from '@/components/patrimony/AreaChart';
import { PatrimonySummary } from '@/components/patrimony/PatrimonySummary';
import LiabilityCard from '@/components/patrimony/LiabilityCard';
import { useChartRangeStore, RangeSize } from '@/store/chartRangeStore';
import { Asset, Liability } from '@/types';
import { patrimonyService } from '@/services/patrimony/get-patrimony';
import { useAssets, useDebts } from '@/hooks/patrimony';
import { 
  SearchBar, 
  Tabs,
  ListItem,
  Header,
  Container,
  UserSelector,
  SegmentedControl,
  KeyboardAwareContainer,
  LockedTabOverlay,
  Button,
} from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useUserData } from '@/hooks/user/useUserData';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

import assetsHistory from '@/data/static/assets-history.json';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { useTranslation } from 'react-i18next';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PatrimonyScreen() {
  const { user } = useAuth();
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { userData, loading: userLoading } = useUserData();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const router = useRouter();
  const { t } = useTranslation();
  
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemsPerPage] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;  
  const skeletonFadeAnim = useRef(new Animated.Value(1)).current;

  const { assets: apiAssets, loading: assetsLoading, error: assetsError, refetch: refetchAssets } = useAssets({
    page: 1,
    per_page: 50
  }, true);

  const { debts: apiDebts, loading: debtsLoading, error: debtsError, refetch: refetchDebts } = useDebts({
    page: 1,
    per_page: 50
  }, true);

  useEffect(() => {
    console.log('🔍 Patrimony Debug Info:', {
      apiAssets: apiAssets ? 'Loaded' : 'Not loaded',
      apiDebts: apiDebts ? 'Loaded' : 'Not loaded',
      assetsLoading,
      debtsLoading,
      assetsError,
      debtsError,
      totalAssets: apiAssets?.totals?.total_assets || 0,
      totalDebts: apiDebts?.totals?.total_debts || 0,
      assetsCount: apiAssets?.assets ? 
        (apiAssets.assets.fixed_assets.length + 
         apiAssets.assets.saving_instruments.length + 
         apiAssets.assets.investment_properties.length + 
         apiAssets.assets.main_homes.length) : 0,
      debtsCount: apiDebts?.debts?.length || 0
    });

  }, [apiAssets, apiDebts, assetsLoading, debtsLoading, assetsError, debtsError]);

  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        if (!user?.backendUserId) {
          console.warn('RevenueCat: No backend user ID available');
          return;
        }

        const isConfigured = await Purchases.isConfigured();
        if (isConfigured) {
          await Purchases.logIn(user.backendUserId.toString());
          if (user.email) {
            await Purchases.setEmail(user.email);
          }
          return;

        }
        const apiKey = Platform.OS === 'android' 
          ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
          : Platform.OS === 'ios' 
          ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
          : null;
        if (!apiKey) {
          throw new Error(`RevenueCat API key not found for platform: ${Platform.OS}`);
        }
        await Purchases.configure({
          apiKey,
          appUserID: user.backendUserId.toString(),
        });
        if (user.email) {
          await Purchases.setEmail(user.email);
        }

        console.log('RevenueCat configured successfully');
      } catch (error) {
        console.error('Error inicializando RevenueCat:', error);
      }
    };

    if (user) {
      setupRevenueCat();
    }
  }, [user?.backendUserId, user?.email]);

  useEffect(() => {
    loadPatrimonyData();
  }, []);



  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(skeletonFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSkeletons(false);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showAddModal) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [showAddModal]);

  const mapSavingInstrumentType = (type: string): string => {
    const typeMapping: Record<string, string> = {
      'SavingInstruments::CashAccount': 'Caja',
      'SavingInstruments::FixedTermDeposit': 'Depósito a Plazo',
      'SavingInstruments::SavingsAccount': 'Cuenta de Ahorro',
      'SavingInstruments::CheckingAccount': 'Cuenta Corriente',
      'SavingInstruments::MutualFund': 'Fondo Mutuo',
      'SavingInstruments::Stock': 'Acciones',
      'SavingInstruments::Bond': 'Bonos',
      'SavingInstruments::TimeDeposit': 'Depósito a Tiempo',
      'SavingInstruments::InvestmentFund': 'Fondo de Inversión',
      'SavingInstruments::Pension': 'AFP/Pensión',
    };

    return typeMapping[type] || type.replace('SavingInstruments::', '');
  };

  const getSavingInstrumentIcon = (type: string, name: string) => {
    const iconMapping: Record<string, { backgroundColor: string; text: string }> = {
      'SavingInstruments::CashAccount': { backgroundColor: '#10B981', text: '$' },
      'SavingInstruments::FixedTermDeposit': { backgroundColor: '#3B82F6', text: 'D' },
      'SavingInstruments::SavingsAccount': { backgroundColor: '#8B5CF6', text: 'A' },
      'SavingInstruments::CheckingAccount': { backgroundColor: '#F59E0B', text: 'C' },
      'SavingInstruments::MutualFund': { backgroundColor: '#EF4444', text: 'F' },
      'SavingInstruments::Stock': { backgroundColor: '#06B6D4', text: 'S' },
    };

    return iconMapping[type] || { 
      backgroundColor: '#EA4335', 
      text: name.charAt(0) 
    };
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPatrimonyData(); 
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const extractInitialsFromAuth0User = (user: any): string => {
    try {
      const userMetadata = user['https://app.patrimore.com/user_metadata'];

      if (userMetadata?.first_name && userMetadata?.last_name) {
        const firstInitial = userMetadata.first_name.charAt(0).toUpperCase();
        const lastInitial = userMetadata.last_name.charAt(0).toUpperCase();
        return firstInitial + lastInitial;
      }

      if (user.nickname) {
        const parts = user.nickname.split('.');
        if (parts.length >= 2) {
          return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
      }

      if (user.email) {
        const username = user.email.split('@')[0];
        const parts = username.split(/[._-]+/);
        if (parts.length >= 2) {
          return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return username.slice(0, 2).toUpperCase();
      }

      return 'U';
    } catch (error) {
      console.warn('Error extracting initials:', error);
      return 'U';
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
  };

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

  const transformApiAssets = () => {
    if (!apiAssets) return [];

    const allAssets = [
      ...apiAssets.assets.fixed_assets.map(asset => ({
        id: asset.id.toString(),
        title: asset.name,
        subtitle: asset.category,
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#4285F4',
          text: asset.name.charAt(0)
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        }
      })),

      ...apiAssets.assets.saving_instruments.map(asset => {
        const icon = getSavingInstrumentIcon(asset.type, asset.name);

        return {
          id: asset.id.toString(),
          title: asset.name,
          subtitle: mapSavingInstrumentType(asset.type),
          value: Math.round(asset.total_amount),
          icon,
          badge: {
            text: '0.00%',
            variant: 'positive' as const
          }
        };
      }),

      ...apiAssets.assets.investment_properties.map(asset => ({
        id: asset.id.toString(),
        title: `Propiedad ${asset.location}`,
        subtitle: asset.square_mts 
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : 'Propiedad de inversión',
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#FBBC05',
          text: 'P'
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        }
      })),

      ...apiAssets.assets.main_homes.map(asset => ({
        id: asset.id.toString(),
        title: `Casa ${asset.location}`,
        subtitle: asset.square_mts 
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : asset.kind === 'leased' ? 'Casa arrendada' : 'Casa propia',
        value: Math.round(asset.commercial_value),
        icon: {
          backgroundColor: '#6366F1',
          text: 'C'
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        }
      }))
    ];

    return allAssets.filter(asset => 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      asset.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const transformApiDebts = () => {
    if (!apiDebts) return [];

    return apiDebts.debts.map(debt => ({
      id: debt.id.toString(),
      title: debt.name,
      subtitle: debt.debt_category,
      value: -Math.round(debt.amount),
      icon: {
        backgroundColor: '#DC2626',
        text: debt.name.charAt(0)
      },
      badge: {
        text: `${debt.cae_percentage}% CAE`,
        variant: 'negative' as const
      }
    })).filter(debt => 
      debt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      debt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const apiAssetsData = transformApiAssets();
  const apiDebtsData = transformApiDebts();

  const getPaginatedData = (data: any[]) => {
    const startIndex = 0;
    const endIndex = isExpanded ? data.length : Math.min(itemsPerPage, data.length);
    return data.slice(startIndex, endIndex);
  };

  const hasMoreData = (data: any[]) => {
    return data.length > itemsPerPage;
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'assets' | 'liabilities');
    setIsExpanded(false);
  };

  const hasApiAssets = apiAssets !== null && apiAssets !== undefined;
  const hasApiDebts = apiDebts !== null && apiDebts !== undefined;

  const assetsData = hasApiAssets ? apiAssetsData : filteredAssets.map(asset => {
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

  const liabilitiesData = hasApiDebts ? apiDebtsData : filteredLiabilities.map(liability => ({
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

  const totalAssets = apiAssets ? Math.round(apiAssets.totals.total_assets) : 0;
  const totalLiabilities = apiDebts ? Math.round(apiDebts.totals.total_debts) : 0;
  const netWorth = totalAssets - totalLiabilities;

  const currentTimeRangeLabel = t(`timeRanges.options.${rangeSize}`);


  const handleUserViewChange = (view: 'mine' | 'partner' | 'both') => {
    setOwnerView(view);
    setShowSelector(false);
  };


  const tabs = TAB_CONFIG.PATRIMONY.map(tab => ({
    key: tab.key,
    label: t(`tabConfig.patrimony.${tab.key}`),
    badge: (tab.key === 'assets'
      ? (apiAssets ? apiAssetsData.length : 0)
      : (apiDebts ? apiDebtsData.length : 0)
    ).toString()
  }));
  

  const currentData = activeTab === 'assets' ? assetsData : liabilitiesData;
  const paginatedData = getPaginatedData(currentData);
  const canShowMore = hasMoreData(currentData);
  const isLoadingData = (activeTab === 'assets' && assetsLoading) || (activeTab === 'liabilities' && debtsLoading);
  const currentError = activeTab === 'assets' ? assetsError : debtsError;

  const hasNoAssets = !hasApiAssets || (hasApiAssets && apiAssetsData.length === 0);
  const hasNoDebts = !hasApiDebts || (hasApiDebts && apiDebtsData.length === 0);
  const hasNoCurrentData = activeTab === 'assets' ? hasNoAssets : hasNoDebts;

  const currentTabTotal = activeTab === 'assets' ? totalAssets : totalLiabilities;

  const handleIntegrarDatos = () => {
    router.push('/patrimony/floid-screen' as any);
  };

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (shouldBlockTab(t('tabs.patrimony'))) {
    return <LockedTabOverlay tabName="{t('tabs.patrimony')}" />;
  } 

  if (isLoading) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <Header
          title={t('labels.patrimony.title')}
          className="border-b border-gray-100"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">{t('patrimony.loading')}</Text>
        </View>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="secondaryPage" style={{ padding: 20 }}>
        <Header
          title={t('labels.patrimony.title')}
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
            <Text className="text-white">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const TIME_RANGE_KEYS = ['1m', '6m', '1y', 'all'];

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('labels.patrimony.title')}
        leftAction={
          <UserSelector
            selectedView={ownerView}
            onViewChange={handleUserViewChange}
            showSelector={showSelector}
            onToggle={() => setShowSelector(!showSelector)}
            myLabel={user ? extractInitialsFromAuth0User(user) : 'U'}
            partnerLabel="P"
            enabled={false}
          />
        }
        rightAction={
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setShowAddModal(true)}
              className="mr-3"
            >
              <Plus size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAwareContainer>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary[500]]}
              tintColor={Colors.primary[500]}
            />
          }
        >
          <PatrimonySummary
            totalNetWorth={netWorth}
            totalAssets={totalAssets} 
            totalLiabilities={totalLiabilities}
            variation={netWorth}
            variationPercentage={0}
            currentView={ownerView}
          />
          <Container variant="content" className="mb-4 mt-4">
            {showSkeletons ? (
              <Animated.View style={{ opacity: skeletonFadeAnim }}>
                <SkeletonBase
                  width={375}
                  height={56}
                  x={0}
                  y={0}
                  rows={1}
                  rowHeight={56}
                  rowWidth={375}
                  borderRadius={16}
                />
              </Animated.View>
            ) : (
              <SegmentedControl
                options={TIME_RANGE_KEYS.map(key => ({
                  label: t(`timeRanges.options.${key}`),
                  value: key,
                }))}
                value={rangeSize}
                onChange={(val) => setRangeSize(val as RangeSize)}
              />

            )}
          </Container>
          <AreaChart />
            <Container variant="content" className="mb-4">
              {showSkeletons ? (
                <Animated.View style={{ opacity: skeletonFadeAnim }}>
                  <SkeletonBase
                    width={380}
                    height={56}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={56}
                    rowWidth={380}
                    borderRadius={16}
                  />
                </Animated.View>
              ) : (
                <SearchBar
                  placeholder={t('labels.patrimony.search_placeholder')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              )}
            </Container>
          <Container variant="content">
            <View style={listItemStyles.cardContainer}>
                             <Tabs
                 tabs={tabs}
                 activeTab={activeTab}
                 onTabChange={handleTabChange}
               />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] }}>
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'assets' ? t('labels.patrimony.total_assets') : t('labels.patrimony.total_liabilities')}
                </Text>
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'assets' ? '+' : '-'}${currentTabTotal.toLocaleString('es-CL')}
                </Text>
              </View>

              {isLoadingData ? (
                <Animated.View style={{ padding: 20, opacity: skeletonFadeAnim }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingVertical: 16, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#f3f4f6' 
                    }}>
                      <SkeletonBase
                        width={48}
                        height={48}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={48}
                        rowWidth={48}
                        borderRadius={12}
                        style={{ marginRight: 16 }}
                      />
                      <View style={{ flex: 1, marginRight: 16 }}>
                        <SkeletonBase
                          width={200}
                          height={40}
                          x={0}
                          y={0}
                          rows={2}
                          rowHeight={20}
                          rowWidth={200}
                          rowSpacing={4}
                          borderRadius={4}
                        />
                      </View>
                      <SkeletonBase
                        width={100}
                        height={20}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={20}
                        rowWidth={100}
                        borderRadius={4}
                      />
                    </View>
                  ))}
                </Animated.View>
              ) : currentError ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ 
                    color: Colors.error[500], 
                    fontSize: 16, 
                    fontFamily: 'Poppins-regular',
                    textAlign: 'center',
                    marginBottom: 12
                  }}>
                    {currentError}
                  </Text>
                  <TouchableOpacity 
                    className="bg-primary px-4 py-2 rounded-lg"
                    onPress={() => {
                      if (activeTab === 'assets') {
                      } else {
                      }
                    }}
                  >
                    <Text className="text-white">Reintentar</Text>
                  </TouchableOpacity>
                </View>
                             ) : hasNoCurrentData ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ 
                    color: Colors.gray[500], 
                    fontSize: 16, 
                    fontFamily: 'Poppins-regular',
                    textAlign: 'center',
                    marginBottom: 8
                  }}>
                    {t(`patrimony.empty.${activeTab}.title`)}
                  </Text>
                  <Text style={{ 
                    color: Colors.gray[400], 
                    fontSize: 14, 
                    fontFamily: 'Poppins-regular',
                    textAlign: 'center',
                    marginBottom: 16
                  }}>
                    {t(`patrimony.empty.${activeTab}.subtitle`)}
                  </Text>
                  <Button
                    variant="primary"
                    onPress={() => {
                      if (activeTab === 'assets') {
                        router.push('/patrimony/add-asset' as any);
                      } else {
                        router.push('/patrimony/add-liability' as any);
                      }
                    }}
                    title={t(`patrimony.empty.${activeTab}.cta`)}
                    icon={<Plus size={20} color="white" />}
                  />
                </View>
              ) : showSkeletons ? (
                <Animated.View style={{ padding: 20, opacity: skeletonFadeAnim }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingVertical: 16, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#f3f4f6' 
                    }}>
                      <SkeletonBase
                        width={48}
                        height={48}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={48}
                        rowWidth={48}
                        borderRadius={12}
                        style={{ marginRight: 16 }}
                      />
                      <View style={{ flex: 1, marginRight: 16 }}>
                        <SkeletonBase
                          width={200}
                          height={40}
                          x={0}
                          y={0}
                          rows={2}
                          rowHeight={20}
                          rowWidth={200}
                          rowSpacing={4}
                          borderRadius={4}
                        />
                      </View>
                      <SkeletonBase
                        width={100}
                        height={20}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={20}
                        rowWidth={100}
                        borderRadius={4}
                      />
                    </View>
                  ))}
                </Animated.View>
              ) : (
                                 <>
                   <ListItem
                     data={paginatedData}
                     showLoadMore={false}
                     showContainer={false}
                   />
                   
                    {canShowMore && (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Button
                          variant="ghost"
                          onPress={handleToggleExpand}
                          title={isExpanded ? 'Ver menos' : 'Ver más'}
                        />
                      </View>
                    )}
                 </>
              )}
            </View>
          </Container>
        </ScrollView>
      </KeyboardAwareContainer>
      {modalVisible && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
            zIndex: 1000
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'],
              }),
            }}
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={closeModal}
              activeOpacity={1}
            />
          </Animated.View>
          <Animated.View 
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 32,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            }}
          >
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2 }} />
            </View>
            {[
              { label: 'Integrar datos bancarios', value: 'integrar', icon: <RefreshCw size={20} color={Colors.gray[700]} /> },
              { label: 'Añadir activo', value: 'activo' },
              { label: 'Añadir pasivo', value: 'pasivo' }
            ].map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 0, 
                  borderColor: '#F3F4F6',
                }}
                onPress={() => {
                  closeModal();
                  switch(option.value) {
                    case 'integrar': handleIntegrarDatos(); break;
                    case 'activo': router.push('/patrimony/add-asset'); break;
                    case 'pasivo': router.push('/patrimony/add-liability'); break;
                  }
                }}
                activeOpacity={0.7}
              >
                {option.icon && (
                  <View style={{ marginRight: 12 }}>{option.icon}</View>
                )}
                <Text className="text-base font-regular" style={{ color: Colors.gray[700] }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}
    </Container>
  );
}