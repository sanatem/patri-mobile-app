import { StyleSheet } from 'react-native';

export const segmentedControlStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginHorizontal: 2,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
}); 