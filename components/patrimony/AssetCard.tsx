import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { Asset } from '@/types';

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={[styles.iconContainer, { backgroundColor: asset.color }]}>
          <Text style={styles.icon}>{asset.name.charAt(0)}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{asset.name}</Text>
          <Text style={styles.type}>{asset.type}</Text>
        </View>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>${asset.value.toLocaleString('es-CL')}</Text>
        <Text style={[
          styles.change,
          asset.change >= 0 ? styles.positive : styles.negative
        ]}>
          {asset.change >= 0 ? '+' : ''}{asset.change}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: 'white',
  },
  nameContainer: {
    marginLeft: 12,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: 2,
  },
  type: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[500],
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: 2,
  },
  change: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  positive: {
    color: Colors.success[500],
  },
  negative: {
    color: Colors.error[500],
  },
});

export default AssetCard;