import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import AssetCard from './AssetCard';
import Colors from '@/constants/Colors';

interface Asset {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  value: number;
  additionalInfo?: string;
}

interface AssetSection {
  title: string;
  assets: Asset[];
}

interface AssetSelectionListProps {
  sections: AssetSection[];
  selectedAssetId: string | undefined;
  onAssetSelect: (assetId: string) => void;
  disabled?: boolean;
}

export default function AssetSelectionList({
  sections,
  selectedAssetId,
  onAssetSelect,
  disabled = false
}: AssetSelectionListProps) {
  return (
    <ScrollView 
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={{ marginBottom: 24 }}>
          <Text
            className='font-regular text-base'
            style={{
              color: Colors.primary[500],
              marginBottom: 16,
            }}
          >
            {section.title}
          </Text>

          {section.assets.map((asset) => (
            <AssetCard
              key={asset.id}
              id={asset.id}
              title={asset.title}
              subtitle={asset.subtitle}
              description={asset.description}
              value={asset.value}
              additionalInfo={asset.additionalInfo}
              isSelected={selectedAssetId === asset.id}
              onSelect={onAssetSelect}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

