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
        <View style={[
          styles.changeBadge,
          asset.change >= 0 ? styles.positiveBadge : styles.negativeBadge
        ]}>
          <Text style={[
            styles.changeText,
            asset.change >= 0 ? styles.positiveText : styles.negativeText
          ]}>
            {asset.change >= 0 ? '+' : ''}{asset.change}%
          </Text>
        </View>
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
  changeBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    alignItems: 'center',
    marginTop: 4,
  },
  positiveBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  positiveText: {
    color: '#16A34A',
  },
  negativeText: {
    color: '#DC2626',
  },
});

export default AssetCard;