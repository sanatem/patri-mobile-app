import React from 'react';
import { View, Text } from 'react-native';
import { Select, Input } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface FixedAssetFieldsProps {
  asset_category_id: string;
  commercial_value: string;
  unit: string;
  onSelectChange: (field: string, value: string) => void;
  onNumericInputChange: (field: string, value: string) => void;
  formatValue: (value: string) => string;
}

export default function FixedAssetFields({ 
  asset_category_id, 
  commercial_value, 
  unit, 
  onSelectChange, 
  onNumericInputChange, 
  formatValue 
}: FixedAssetFieldsProps) {
  const { t } = useTranslation();
  const ASSET_CATEGORY_OPTIONS = [
    { label: t('fixedAssetFields.assetCategoryOptions.1'), value: '1' },
    { label: t('fixedAssetFields.assetCategoryOptions.2'), value: '2' },
    { label: t('fixedAssetFields.assetCategoryOptions.3'), value: '3' },
  ];

  const UNIT_OPTIONS = [
    { label: t('fixedAssetFields.unitOptions.clp'), value: 'clp' },
    { label: t('fixedAssetFields.unitOptions.usd'), value: 'usd' },
    { label: t('fixedAssetFields.unitOptions.uf'), value: 'uf' },
  ];
  return (
    <>
      <View>
        <Select
          label={t('fixedAssetFields.assetCategoryLabel')}
          options={ASSET_CATEGORY_OPTIONS}
          value={asset_category_id}
          onSelect={(value) => onSelectChange('asset_category_id', value)}
          placeholder={t('fixedAssetFields.assetCategoryPlaceholder')}
        />
      </View>

      <View>
        <Text className='text-base font-medium'
          style={{
            color: Colors.primary[500],
            marginBottom: 8,
          }}
        >
          {t('fixedAssetFields.valueLabel')}
        </Text>
        <View className="flex-row">
          <View style={{ width: 100, marginRight: 8 }}>
            <Select
              options={UNIT_OPTIONS}
              value={unit}
              onSelect={(value) => onSelectChange('unit', value)}
              placeholder={t('fixedAssetFields.unitPlaceholder')}
            />
          </View>
          <View style={{ flex: 1 }}>
             <Input
               placeholder={t('fixedAssetFields.valuePlaceholder')}
               value={commercial_value ? formatValue(commercial_value) : ''}
               onChangeText={(value) => onNumericInputChange('commercial_value', value)}
               keyboardType="numeric"
             />
           </View>
        </View>
      </View>
    </>
  );
} 