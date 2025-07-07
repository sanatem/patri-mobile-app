import { StyleSheet } from 'react-native';
import { CarouselColors } from '../../components/ui/InfiniteCarousel';

export const createStyles = (colors: CarouselColors, itemWidth: number) => StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: colors.background,
    borderColor: colors.border,
    padding: 4,
    height: 64,
  },
  
  scrollView: {
    flex: 1,
    borderRadius: 20,
  },
  
  option: {
    width: itemWidth,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  optionInactive: {
    backgroundColor: colors.inactiveBg,
  },
  
  optionActive: {
    backgroundColor: colors.activeBg,
    shadowColor: colors.activeBg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  textBase: {
    textAlign: 'center',
  },
  
  textInactive: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.inactiveText,
  },
  
  textActive: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.activeText,
  },
}); 