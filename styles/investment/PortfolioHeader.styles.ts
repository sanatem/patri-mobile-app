import Colors from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const portfolioHeaderStyles = StyleSheet.create({
  buttonsContainer: {
    gap: 30,
  },
  actionButton: {
    backgroundColor: Colors.primary[500],
    width: 35,
    height: 35,
  },
  gradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24, 
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 