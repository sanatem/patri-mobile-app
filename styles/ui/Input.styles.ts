import { StyleSheet } from 'react-native';

export const inputStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#fff',

  },
  containerDisabled: {
    backgroundColor: '#F3F4F6',
  },
  containerError: {
    borderColor: '#DC2626',
  },
  iconContainer: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  rightIconContainer: {
    marginLeft: 'auto',
    paddingLeft: 8,
    paddingRight: 4,
  },
}); 