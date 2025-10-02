import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import AssetCard from './AssetCard';
import { useFormatValue } from '@/hooks/common/useFormatValue';

interface AssetOption {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  value: number;
  additionalInfo?: string;
}

interface AssetSelectionListProps {
  selectedAsset: string | undefined;
  onAssetSelect: (assetId: string) => void;
  totalAvailable: number;
  portfolioOptions: AssetOption[];
  individualFunds: AssetOption[];
  brokerPortfoliosCount?: number;
  loading?: boolean;
}

export default function AssetSelectionList({
  selectedAsset,
  onAssetSelect,
  totalAvailable,
  portfolioOptions,
  individualFunds,
  brokerPortfoliosCount = 0,
  loading = false
}: AssetSelectionListProps) {
  const { t } = useTranslation();
  const { formatValue } = useFormatValue();
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  const handleToggleExpanded = (assetId: string) => {
    setExpandedAssetId(expandedAssetId === assetId ? null : assetId);
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32
      }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >

      <View style={{ marginBottom: 24 }}>
        <Text className='font-medium text-base'
          style={{
            color: Colors.primary[500],
            marginBottom: 16,
          }}
        >
          {t('salesFlow.quickOptions')}
        </Text>
        
        {portfolioOptions.map((option) => (
          <AssetCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            description={option.description}
            value={formatValue(option.value.toString())}
            isSelected={selectedAsset === option.id}
            onSelect={() => onAssetSelect(option.id)}
            showRadioButton={true}
            isExpandable={false}
            showDate={option.id === 'portfolio-completo'}
            showValue={option.id !== 'proportional-withdrawal'}
          />
        ))}
      </View>
      <View>
        <Text className='font-medium text-base'
          style={{
            color: Colors.primary[500],
            marginBottom: 16,
          }}
        >
          {t('salesFlow.individualFunds')}
        </Text>
        
        {individualFunds.length === 0 ? (
          <View style={{ 
            padding: 20, 
            backgroundColor: Colors.gray[50], 
            borderRadius: 12,
            alignItems: 'center'
          }}>
            <Text style={{ 
              color: Colors.gray[500], 
              textAlign: 'center',
              fontSize: 14
            }}>
              {t('salesFlow.noIndividualFunds')}
            </Text>
          </View>
        ) : (
          individualFunds.map((fund) => (
            <AssetCard
              key={fund.id}
              title={fund.title}
              subtitle={fund.subtitle}
              description={fund.description}
              value={formatValue(fund.value.toString())}
              isSelected={selectedAsset === fund.id}
              onSelect={() => onAssetSelect(fund.id)}
              showRadioButton={true}
              additionalInfo={fund.additionalInfo}
              isExpandable={true}
              isExpanded={expandedAssetId === fund.id}
              onToggleExpanded={() => handleToggleExpanded(fund.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

