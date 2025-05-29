import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { useCopilotReadable, useCopilotAction } from '@/hooks/useCopilotHooks';
import AreaChart from '@/components/patrimony/AreaChart';
import AssetCard from '@/components/patrimony/AssetCard';
import LiabilityCard from '@/components/patrimony/LiabilityCard';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { Asset, Liability } from '@/types';
import { useRouter } from 'expo-router';

const myAssets: Asset[] = [
  {
    id: '1',
    name: 'Cuenta Corriente',
    type: 'Banco de Chile',
    value: 7204483,
    change: 2.8,
    color: '#4285F4',
  },
  {
    id: '2',
    name: 'Cuenta de Ahorro',
    type: 'Banco de Chile',
    value: 5382610,
    change: 1.4,
    color: '#EA4335',
  },
  {
    id: '3',
    name: 'Inversión',
    type: 'Fondo Mutuo Santander',
    value: 892147,
    change: -0.5,
    color: '#FBBC05',
  },
  {
    id: '4',
    name: 'Inversión',
    type: 'Inversiones Vector',
    value: 280000000,
    change: 3.2,
    color: '#6366F1',
  },
];

const partnerAssets: Asset[] = [
  {
    id: '5',
    name: 'Cuenta Corriente',
    type: 'Banco Falabella',
    value: 280000,
    change: 3.2,
    color: '#6366F1',
  },
  {
    id: '6',
    name: 'Cuenta de Ahorro',
    type: 'Banco Itaú',
    value: 150000,
    change: 0.8,
    color: '#10B981',
  },
  {
    id: '7',
    name: 'Inversión',
    type: 'Inversión Nevasa',
    value: 500000,
    change: 1.2,
    color: '#F59E0B',
  },
];

const myLiabilities: Liability[] = [
  {
    id: '8',
    name: 'Crédito Hipotecario',
    type: 'Banco Santander',
    value: 85000000,
    change: -2.5,
    color: '#DC2626',
  },
  {
    id: '9',
    name: 'Tarjeta de Crédito',
    type: 'Banco de Chile',
    value: 1250000,
    change: 15.2,
    color: '#7C2D12',
  },
  {
    id: '10',
    name: 'Crédito Vehicular',
    type: 'Forus',
    value: 12500000,
    change: -5.8,
    color: '#B91C1C',
  },
];

const partnerLiabilities: Liability[] = [
  {
    id: '11',
    name: 'Crédito Educativo',
    type: 'Banco Scotiabank',
    value: 8500000,
    change: -3.2,
    color: '#991B1B',
  },
  {
    id: '12',
    name: 'Tarjeta de Crédito',
    type: 'Banco de Chile',
    value: 890000,
    change: 8.4,
    color: '#7F1D1D',
  },
  {
    id: '13',
    name: 'Línea de Crédito',
    type: 'Banco de Chile',
    value: 2500000,
    change: 0.0,
    color: '#6B1D1D',
  },
];

const combinedAssets = [...myAssets, ...partnerAssets];
const combinedLiabilities = [...myLiabilities, ...partnerLiabilities];

const timeRangeMapping = {
  '1 Mes': '1m',
  '6 Meses': '6m',
  '1 Año': '1y',
  Todo: 'all',
} as const;

const timeRanges = Object.keys(timeRangeMapping) as Array<
  keyof typeof timeRangeMapping
>;

export default function PatrimonyScreen() {
  const { user } = useAuth();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  const [mineSelected, setMineSelected] = useState(true);
  const [partnerSelected, setPartnerSelected] = useState(false);
  const router = useRouter();

  const ownerView: 'mine' | 'partner' | 'both' =
    mineSelected && partnerSelected
      ? 'both'
      : mineSelected
      ? 'mine'
      : 'partner';
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getAssetsForView = () => {
    switch (ownerView) {
      case 'mine':
        return myAssets;
      case 'partner':
        return partnerAssets;
      case 'both':
        return combinedAssets;
      default:
        return myAssets;
    }
  };

  const getLiabilitiesForView = () => {
    switch (ownerView) {
      case 'mine':
        return myLiabilities;
      case 'partner':
        return partnerLiabilities;
      case 'both':
        return combinedLiabilities;
      default:
        return myLiabilities;
    }
  };

  const currentAssets = getAssetsForView();
  const currentLiabilities = getLiabilitiesForView();

  const filteredAssets = currentAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLiabilities = currentLiabilities.filter(
    (liability) =>
      liability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      liability.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = currentAssets.reduce(
    (sum, asset) => sum + asset.value,
    0
  );
  const totalLiabilities = currentLiabilities.reduce(
    (sum, liability) => sum + liability.value,
    0
  );
  const netWorth = totalAssets - totalLiabilities;

  const currentTimeRangeLabel =
    Object.keys(timeRangeMapping).find(
      (key) =>
        timeRangeMapping[key as keyof typeof timeRangeMapping] === rangeSize
    ) || '6 Meses';

  const handleTimeRangeChange = (range: keyof typeof timeRangeMapping) => {
    const storeValue = timeRangeMapping[range];
    setRangeSize(storeValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.selectorContainer}>
        <Pressable
  style={styles.selectorToggle}
  onPress={() => setShowSelector(!showSelector)}
>
  <View style={[styles.selectorCircle, styles.selectorCircleMain]}>
    {ownerView === 'mine' && <Text style={styles.selectorText}>DT</Text>}
    {ownerView === 'partner' && <Text style={styles.selectorText}>JM</Text>}
    {ownerView === 'both' && <Users size={16} color={Colors.gray[700]} />}
  </View>
  <ChevronRight size={16} color={Colors.gray[500]} style={{ marginLeft: 4 }} />
</Pressable>

{showSelector && (
  <View style={styles.inlineSelectorOptions}>
    <TouchableOpacity
      onPress={() => {
        setMineSelected((prev) => !prev);
        setShowSelector(false);
      }}
    >
      <View
        style={[
          styles.selectorCircle,
          mineSelected && styles.selectedCircle,
        ]}
      >
        <Text style={styles.selectorText}>DT</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => {
        setPartnerSelected((prev) => !prev);
        setShowSelector(false);
      }}
    >
      <View
        style={[
          styles.selectorCircle,
          partnerSelected && styles.selectedCircle,
        ]}
      >
        <Text style={styles.selectorText}>JM</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      disabled={mineSelected && partnerSelected}
      onPress={() => {
        setMineSelected(true);
        setPartnerSelected(true);
        setShowSelector(false);
      }}
    >
      <View
        style={[
          styles.selectorCircle,
          mineSelected && partnerSelected && styles.selectedCircle,
          mineSelected && partnerSelected && { opacity: 0.4 },
        ]}
      >
        <Users
          size={16}
          color={
            mineSelected && partnerSelected
              ? Colors.gray[400]
              : Colors.gray[600]
          }
        />
      </View>
    </TouchableOpacity>
  </View>
)}

        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color={Colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Patrimonio Neto</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.totalAmount}>
              ${netWorth.toLocaleString('es-CL')}
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowTooltip(!showTooltip)}
            >
              <ChevronDown
                size={20}
                color={Colors.gray[500]}
                style={[
                  styles.chevronIcon,
                  showTooltip && styles.chevronRotated,
                ]}
              />
            </TouchableOpacity>
          </View>

          {showTooltip && (
            <View style={styles.tooltip}>
              <View style={styles.tooltipItem}>
                <View style={styles.tooltipItemLeft}>
                  <ArrowUp
                    size={16}
                    color={Colors.success[500]}
                    style={styles.tooltipIcon}
                  />
                  <Text style={styles.tooltipLabel}>Activos</Text>
                </View>
                <Text style={[styles.tooltipValue, styles.tooltipPositive]}>
                  +${totalAssets.toLocaleString('es-CL')}
                </Text>
              </View>
              <View style={styles.tooltipItem}>
                <View style={styles.tooltipItemLeft}>
                  <ArrowDown
                    size={16}
                    color={Colors.error[500]}
                    style={styles.tooltipIcon}
                  />
                  <Text style={styles.tooltipLabel}>Pasivos</Text>
                </View>
                <Text style={[styles.tooltipValue, styles.tooltipNegative]}>
                  -${totalLiabilities.toLocaleString('es-CL')}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.changeAmount}>
            <Text style={styles.positiveChange}>$7,151,936 (71.52%)</Text> · vs
            último mes
          </Text>

          <View style={styles.timeRangeSelector}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  currentTimeRangeLabel === range && styles.selectedTimeRange,
                ]}
                onPress={() => handleTimeRangeChange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    currentTimeRangeLabel === range &&
                      styles.selectedTimeRangeText,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AreaChart />

          <View style={styles.searchContainer}>
            <Search
              size={20}
              color={Colors.gray[400]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar activo o pasivo"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'assets' && styles.activeTab]}
            onPress={() => setActiveTab('assets')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'assets' && styles.activeTabText,
              ]}
            >
              Activos{' '}
              <Text style={styles.tabCount}>{currentAssets.length}</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'liabilities' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('liabilities')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'liabilities' && styles.activeTabText,
              ]}
            >
              Pasivos{' '}
              <Text style={styles.tabCount}>{currentLiabilities.length}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total en {activeTab === 'assets' ? 'activos' : 'pasivos'}
          </Text>
          <Text
            style={[
              styles.totalValue,
              activeTab === 'liabilities' && styles.negativeValue,
            ]}
          >
            {activeTab === 'assets' ? '+' : '-'}$
            {(activeTab === 'assets'
              ? totalAssets
              : totalLiabilities
            ).toLocaleString('es-CL')}
          </Text>
        </View>

        {activeTab === 'assets' &&
          filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}

        {activeTab === 'liabilities' &&
          filteredLiabilities.map((liability) => (
            <LiabilityCard key={liability.id} liability={liability} />
          ))}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: 6,
    borderRadius: 24,
  },
  inlineSelectorOptions: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    padding: 6,
    borderRadius: 24,
    marginLeft: 8,
  },
  selectorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectorCircleMain: {
    backgroundColor: Colors.gray[200],
    borderColor: '#FF6503',
    borderWidth: 2,
  },
  selectedCircle: {
    borderColor: '#FF6503',
    borderWidth: 2,
  },
  selectorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[800],
  },
  scrollView: { flex: 1 },
  overviewCard: {
    padding: 16,
  },
  overviewTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  negativeAmount: {
    color: Colors.error[500],
  },
  changeAmount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  positiveChange: {
    color: Colors.success[500],
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  selectedTimeRange: {
    backgroundColor: Colors.gray[100],
  },
  timeRangeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[500],
  },
  selectedTimeRangeText: {
    color: Colors.gray[900],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  tabCount: {
    backgroundColor: Colors.gray[200],
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    color: Colors.gray[500],
    overflow: 'hidden',
    minWidth: 24,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  totalLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[700],
  },
  totalValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.gray[900],
  },
  negativeValue: {
    color: Colors.error[500],
  },
  bottomSpace: {
    height: 100,
  },
  infoButton: {
    padding: 6,
    marginBottom: 7,
  },
  tooltip: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
    alignSelf: 'center',
    maxWidth: 280,
  },
  tooltipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  tooltipItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tooltipIcon: {
    marginRight: 4,
  },
  tooltipLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[600],
    paddingRight: 12,
  },
  tooltipValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.gray[900],
  },
  tooltipNegative: {
    color: Colors.error[500],
  },
  tooltipPositive: {
    color: Colors.success[500],
  },
  chevronIcon: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  settingsButton: {
    padding: 6,
  },
});
