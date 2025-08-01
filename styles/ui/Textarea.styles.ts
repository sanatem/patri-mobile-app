import { StyleSheet } from 'react-native';

export const textareaStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 120,
  },
  containerDisabled: {
    backgroundColor: '#F3F4F6',
  },
  containerError: {
    borderColor: '#DC2626',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 96, // 120 - 24 (padding vertical)
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
}); 