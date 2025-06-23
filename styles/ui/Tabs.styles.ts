import Colors from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const tabsStyles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 0,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 0,
    paddingVertical: 20,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 4,
    borderBottomColor: Colors.secondary[500],
  },
  tabInactive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[300],
  },
  tabText: {
    fontSize: 18,
    fontFamily: 'Poppins-medium',
    color: Colors.gray[700],
  },
  tabTextInactive: {
    color: Colors.gray[300],
    fontFamily: 'Poppins-medium',
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'hidden',
    paddingHorizontal: 6,
    backgroundColor: Colors.gray[100],
  },
  badgeActive: {
    backgroundColor: Colors.gray[100],
  },
  badgeInactive: {
    backgroundColor: Colors.gray[100],
  },
}); 