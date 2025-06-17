import { StyleSheet } from 'react-native';

export const tabsStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
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
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
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