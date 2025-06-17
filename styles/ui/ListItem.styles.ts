import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const listItemStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6503',
  },
  iconText: {
    color: Colors.primary[500],
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  info: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#18181B',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  valueContainer: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  value: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#18181B',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  badgeArrowPositive: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#22C55E',
    marginRight: 4,
  },
  badgeArrowNegative: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#EF4444',
    marginRight: 4,
  },
  badgeArrowNeutral: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
    marginRight: 4,
  },
  badgeTextPositive: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#22C55E',
  },
  badgeTextNegative: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#EF4444',
  },
  badgeTextNeutral: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
  },
  badgeBgPositive: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  badgeBgNegative: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  badgeBgNeutral: {
    backgroundColor: '#f3f4f6',
  },
}); 