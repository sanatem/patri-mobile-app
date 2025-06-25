import { StyleSheet, Platform } from 'react-native';

export const portfolioActionsBarStyles = StyleSheet.create({
  container: {
    position: 'relative',
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 0,
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