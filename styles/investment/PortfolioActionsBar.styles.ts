import { StyleSheet, Platform } from 'react-native';

export const portfolioActionsBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'web' ? 32 : 0,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 16,
    boxShadow: Platform.OS === 'web' ? '0 8px 32px rgba(0,0,0,0.10)' : undefined,
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    maxWidth: '48%',
  },
}); 