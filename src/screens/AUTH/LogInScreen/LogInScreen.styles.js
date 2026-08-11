import { moderateScale, verticalScale } from '@constants/metrics';
import { StyleSheet } from 'react-native';

export const style = theme =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    wrapper: {
      flex: 1,
      padding: moderateScale(24),
      justifyContent: 'center',
    },
    headerImage: {
      width: '90%',
      height: verticalScale(280),
      alignSelf: 'center',
      marginBottom: verticalScale(20),
    },
    textContainer: {
      gap: verticalScale(5),
      marginBottom: verticalScale(30),
      alignItems: 'center',
    },
    title: {
      fontSize: moderateScale(32),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: moderateScale(15),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: moderateScale(22),
      paddingHorizontal: moderateScale(20),
    },
    circleBg: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: -verticalScale(350),
    },
    socialRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: moderateScale(20),
      marginTop: verticalScale(20),
    },
  });
