import { StyleSheet } from 'react-native';

export const listItemStyles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemContainerNoSeparator: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    backgroundColor: '#6B7280',
    width: 40,
    height: 40,
  },
  badgePositive: {
    backgroundColor: '#dcfce7',
  },
  badgeNegative: {
    backgroundColor: '#fecaca',
  },
  badgeNeutral: {
    backgroundColor: '#f3f4f6',
  },
  badgeTextPositive: {
    color: '#16a34a',
  },
  badgeTextNegative: {
    color: '#dc2626',
  },
  badgeTextNeutral: {
    color: '#4b5563',
  },
}); 