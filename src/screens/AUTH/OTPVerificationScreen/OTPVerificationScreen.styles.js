import { Dimensions, StyleSheet } from 'react-native';
import { fontScale, scale, verticalScale } from '@constants/metrics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const style = theme =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    heroContainer: {
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
    },
    heroContent: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: scale(24),
      right: scale(24),
    },
    secureBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '70',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(20),
      marginBottom: verticalScale(5),
      gap: scale(6),
    },
    secureText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
    },
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(30),
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(36),
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary + '99',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },
    body: {
      flex: 1,
      padding: verticalScale(20),
    },
    sectionHeader: {
      marginBottom: verticalScale(20),
      gap: verticalScale(4),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
    },
    sectionSubtitle: {
      color: theme.colors.description,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(20),
    },
    infoHighlight: {
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    otpWrapper: {
      marginBottom: verticalScale(20),
    },
    submitButton: {
      width: '100%',
      height: verticalScale(56),
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(14),
      borderRadius: scale(12),
      marginTop: verticalScale(15),
    },
    securityText: {
      flex: 1,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(16),
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(24),
      gap: scale(6),
    },
    resendText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    resendLink: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
  });

export default style;
