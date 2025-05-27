import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Search, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import AreaChart from '@/components/patrimony/AreaChart';
import AssetCard from '@/components/patrimony/AssetCard';
import { useChartRangeStore } from '@/store/chartRangeStore';
import { Asset } from '@/types';

// Mock data
const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Chase',
    type: 'Cuenta Corriente',
    value: 724483,
    change: 2.8,
    color: '#4285F4',
  },
  {
    id: '2',
    name: 'Bank of America',
    type: 'Cuenta de Ahorro',
    value: 538261,
    change: 1.4,
    color: '#EA4335',
  },
  {
    id: '3',
    name: 'Fondo Mutuo Santander',
    type: 'Inversión',
    value: 892147,
    change: -0.5,
    color: '#FBBC05',
  },
];

// Mapeo de etiquetas de tiempo a valores del store
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

  // Obtener la etiqueta actual basada en el valor del store
  const currentTimeRangeLabel =
    Object.keys(timeRangeMapping).find(
      (key) =>
        timeRangeMapping[key as keyof typeof timeRangeMapping] === rangeSize
    ) || '6 Meses';

  const handleTimeRangeChange = (range: keyof typeof timeRangeMapping) => {
    const storeValue = timeRangeMapping[range];
    setRangeSize(storeValue);
  };

  const filteredAssets = mockAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = mockAssets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>
            {user?.isGuest ? 'Invitado' : user?.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Patrimonio</Text>
          <Text style={styles.totalAmount}>$17.151.937</Text>
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
              Activos <Text style={styles.tabCount}>3</Text>
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
              Pasivos <Text style={styles.tabCount}>0</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total en {activeTab === 'assets' ? 'activos' : 'pasivos'}
          </Text>
          <Text style={styles.totalValue}>
            ${totalAssets.toLocaleString('es-CL')}
          </Text>
        </View>

        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  userBadge: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[700],
  },
  scrollView: {
    flex: 1,
  },
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
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
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
  bottomSpace: {
    height: 100,
  },
});
