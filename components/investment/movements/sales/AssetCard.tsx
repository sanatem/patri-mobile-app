import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import RadioButton from '@/components/ui/RadioButton';

interface AssetCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  value: number;
  additionalInfo?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export default function AssetCard({
  id,
  title,
  subtitle,
  description,
  value,
  additionalInfo,
  isSelected,
  onSelect,
  disabled = false
}: AssetCardProps) {
  const formatValue = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-CL')}`;
  };

  return (
    <TouchableOpacity
      onPress={() => !disabled && onSelect(id)}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isSelected ? Colors.secondary[500] : Colors.gray[100],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ marginRight: 12, marginTop: 2 }}>
            <RadioButton
              options={[{ label: '', value: id }]}
              selectedValue={isSelected ? id : ''}
              onSelect={() => !disabled && onSelect(id)}
              disabled={disabled}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text className='font-regular text-base'
              style={{
                color: Colors.primary[700],
                marginBottom: 4,
              }}
            >
              {title}
            </Text>

            {subtitle && (
              <Text className='font-regular text-xs'
                style={{
                  color: Colors.secondary[500],
                  marginBottom: 4,
                }}
              >
                {subtitle}
              </Text>
            )}

            {description && (
              <Text className='font-regular text-xs'
                style={{
                  color: Colors.gray[600],
                  marginBottom: 4,
                }}
              >
                {description}
              </Text>
            )}

            {additionalInfo && (
              <Text className='font-regular text-xs'
                style={{
                  color: Colors.gray[500],
                }}
              >
                {additionalInfo}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text className='font-regular text-base'
              style={{
                color: Colors.primary[700],
              }}
            >
              {formatValue(value)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

