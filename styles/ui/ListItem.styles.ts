import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const listItemStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  separator: {
    height: 0.9,
    backgroundColor: Colors.gray[100], 
    marginLeft: 0,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    backgroundColor: Colors.primary[50],
  },
  iconText: {
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.primary[500],
  },
  subtitle: {
    color: Colors.gray[400],
    marginTop: 2,
  },
  valueContainer: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  value: {
    color: Colors.primary[500],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    minWidth: 0,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  badgeArrowPositive: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: '#22C55E',
    marginRight: 2,
  },
  badgeArrowNegative: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: '#EF4444',
    marginRight: 2,
  },
  badgeArrowNeutral: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: Colors.gray[500],
    marginRight: 2,
  },
  badgeTextPositive: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: '#22C55E',
  },
  badgeTextNegative: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: '#EF4444',
  },
  badgeTextNeutral: {
    fontSize: 12,
    fontFamily: 'Poppins-regular',
    color: Colors.gray[500],
  },
  badgeBgPositive: {
    backgroundColor: 'rgba(34,197,94,0.10)',
  },
  badgeBgNegative: {
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
  badgeBgNeutral: {
    backgroundColor: Colors.gray[100],
  },
}); 