import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 10,
    marginHorizontal: 2,
    marginTop: 0,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  fixedTooltip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.gray[100],
    width: '50%',
  },

  progressContainer: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  currentAmountContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currentAmountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#22C55E',
  },
  currencyLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  progressDetailsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'left',
  },
}); 