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
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginHorizontal: -1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
}); 