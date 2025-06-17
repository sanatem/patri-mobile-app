import { StyleSheet } from 'react-native';

export const tabsStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#FF6503',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'hidden',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#fff',
  },
  badgeInactive: {
    backgroundColor: 'rgba(255,101,3,0.15)',
    color: '#FF6503',
  },
}); 