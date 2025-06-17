import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  gradient: {
    width: '100%',
    alignSelf: 'stretch',
    paddingTop: 50,
    paddingBottom: 16,
  },
  container: {
    paddingTop: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  content: {
    paddingHorizontal: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}); 