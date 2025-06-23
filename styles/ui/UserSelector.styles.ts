import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const userSelectorStyles = StyleSheet.create({
  closedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  closedCircleText: {
    color: Colors.primary[500],
    fontWeight: 'bold',
    fontSize: 16,
  },
  openedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 50,
  },
  optionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginHorizontal: 1,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}); 