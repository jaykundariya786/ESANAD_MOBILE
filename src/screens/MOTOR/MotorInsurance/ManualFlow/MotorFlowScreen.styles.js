import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '@constants/metrics';
import { getBottomMargin } from '@utils/paddingBottom';

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: getBottomMargin() + verticalScale(30),
    },
    stepContentCard: {
      backgroundColor: theme.colors.backgroundColor,
      marginHorizontal: scale(20),
      marginTop: verticalScale(25),
      borderRadius: scale(30),
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.12,
      shadowRadius: 25,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)', // Glass effect edge
    },
    stepBubble: {
      position: 'absolute',
      top: -verticalScale(18),
      right: scale(24),
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    stepBubbleText: {
      color: theme.colors.textSecondary,
      fontSize: scale(18),
      fontFamily: 'Lato-Black',
    },
    cardHeader: {
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(32),
      paddingBottom: verticalScale(8),
    },
    cardHeaderInfo: {
      gap: verticalScale(4),
    },
    cardStepTitle: {
      fontSize: scale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    cardStepSubtitle: {
      fontSize: scale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    inner: {
      padding: scale(15),
    },
  });

export default style;
