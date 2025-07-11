import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Settings, Plus, RefreshCw } from 'lucide-react-native';
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
} from '@/components/ui';
import { Dropdown } from '@/components/ui';
// ✅ IMPORTAR HOOK ACTUALIZADO EN LUGAR DEL SERVICIO
import { useUserData } from '@/hooks/user/useUserData';
import type { UserProfile } from '@/types/api';
import assetsHistory from '@/data/static/assets-history.json';
import { listItemStyles } from '@/styles/ui/ListItem.styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ USAR HOOK ACTUALIZADO
  const { userData, loading: userLoading } = useUserData();

  const { assets: apiAssets, loading: assetsLoading, error: assetsError } = useAssets({
    page: 1,
    per_page: 50
  }, true);

  const { debts: apiDebts, loading: debtsLoading, error: debtsError } = useDebts({
    page: 1,
    per_page: 50
  }, true);

  // Función para mapear tipos de saving instruments
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

  // Función para obtener iconos específicos por tipo
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

  // Función para extraer iniciales del usuario Auth0
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
  
  useEffect(() => {
    loadPatrimonyData();
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
      // Fixed assets
      ...apiAssets.assets.fixed_assets.map(asset => ({
        id: asset.id.toString(),
        title: asset.name,
        subtitle: asset.category,
        value: asset.commercial_value,
        icon: {
          backgroundColor: '#4285F4',
          text: asset.name.charAt(0)
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        }
      })),
      
      // Saving instruments - CON MAPEO MEJORADO
      ...apiAssets.assets.saving_instruments.map(asset => {
        const icon = getSavingInstrumentIcon(asset.type, asset.name);
        
        return {
          id: asset.id.toString(),
          title: asset.name,
          subtitle: mapSavingInstrumentType(asset.type), // Mapeo aplicado
          value: asset.total_amount,
          icon,
          badge: {
            text: '0.00%',
            variant: 'positive' as const
          }
        };
      }),
      
      // Investment properties
      ...apiAssets.assets.investment_properties.map(asset => ({
        id: asset.id.toString(),
        title: `Propiedad ${asset.location}`,
        subtitle: asset.square_mts 
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : 'Propiedad de inversión',
        value: asset.commercial_value,
        icon: {
          backgroundColor: '#FBBC05',
          text: 'P'
        },
        badge: {
          text: '0.00%',
          variant: 'positive' as const
        }
      })),
      
      // Main homes
      ...apiAssets.assets.main_homes.map(asset => ({
        id: asset.id.toString(),
        title: `Casa ${asset.location}`,
        subtitle: asset.square_mts 
          ? `${asset.square_mts}m² - ${asset.number_of_bedrooms || 0} hab`
          : asset.kind === 'leased' ? 'Casa arrendada' : 'Casa propia',
        value: asset.commercial_value,
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
      value: -debt.amount,
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

  const assetsData = apiAssets ? apiAssetsData : filteredAssets.map(asset => {
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

  const liabilitiesData = apiDebts ? apiDebtsData : filteredLiabilities.map(liability => ({
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

  // Totales SIEMPRE calculados
  const totalAssets = apiAssets ? apiAssets.totals.total_assets : 0;
  const totalLiabilities = apiDebts ? apiDebts.totals.total_debts : 0;
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

  const handleIntegrarDatos = () => {
    router.push('/patrimony/floid-screen' as any);
  };

  const handleAddActivo = () => {
    console.log('Agregar activo');
  };

  const handleAddPasivo = () => {
    console.log('Agregar pasivo');
  };

  const tabs = TAB_CONFIG.PATRIMONY.map(tab => ({
    ...tab,
    badge: (tab.key === 'assets' ? (apiAssets ? apiAssetsData.length : 0) : (apiDebts ? apiDebtsData.length : 0)).toString()
  }));

  const currentData = activeTab === 'assets' ? assetsData : liabilitiesData;
  const isLoadingData = (activeTab === 'assets' && assetsLoading) || (activeTab === 'liabilities' && debtsLoading);
  const currentError = activeTab === 'assets' ? assetsError : debtsError;

  const hasNoAssets = apiAssets === null || (apiAssets && apiAssetsData.length === 0);
  const hasNoDebts = apiDebts === null || (apiDebts && apiDebtsData.length === 0);
  const hasNoCurrentData = activeTab === 'assets' ? hasNoAssets : hasNoDebts;

  const currentTabTotal = activeTab === 'assets' ? totalAssets : totalLiabilities;

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
            myLabel={user ? extractInitialsFromAuth0User(user) : 'U'} // Iniciales reales
            partnerLabel="P" // Placeholder para partner
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <PatrimonySummary
            totalNetWorth={netWorth}
            totalAssets={totalAssets}     // Siempre con valor real
            totalLiabilities={totalLiabilities} // Siempre con valor real
            variation={netWorth}
            variationPercentage={0}
            currentView={ownerView}
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
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'assets' ? LABELS.PATRIMONY.TOTAL_ASSETS : LABELS.PATRIMONY.TOTAL_LIABILITIES}
                </Text>
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'assets' ? '+' : '-'}${currentTabTotal.toLocaleString('es-CL')}
                </Text>
              </View>
              
              {isLoadingData ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={{ 
                    color: Colors.gray[600], 
                    fontSize: 16, 
                    fontFamily: 'Poppins-regular',
                    marginTop: 12
                  }}>
                    Cargando {activeTab === 'assets' ? 'activos' : 'pasivos'}...
                  </Text>
                </View>
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
                    {activeTab === 'assets' ? 'No hay activos registrados' : 'No hay pasivos registrados'}
                  </Text>
                  <Text style={{ 
                    color: Colors.gray[400], 
                    fontSize: 14, 
                    fontFamily: 'Poppins-regular',
                    textAlign: 'center'
                  }}>
                    {activeTab === 'assets' 
                      ? 'Agrega tus activos para comenzar a gestionar tu patrimonio' 
                      : 'Agrega tus pasivos para tener una visión completa de tu patrimonio'
                    }
                  </Text>
                </View>
              ) : (
                <ListItem
                  data={currentData}
                  showLoadMore={false}
                  showContainer={false}
                />
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
                  borderBottomWidth: index !== 2 ? 1 : 0,
                  borderColor: '#F3F4F6',
                }}
                onPress={() => {
                  closeModal();
                  switch(option.value) {
                    case 'integrar': handleIntegrarDatos(); break;
                    case 'activo': handleAddActivo(); break;
                    case 'pasivo': handleAddPasivo(); break;
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