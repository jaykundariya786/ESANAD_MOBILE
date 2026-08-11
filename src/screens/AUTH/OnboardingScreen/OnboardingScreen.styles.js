import { Dimensions, StyleSheet } from 'react-native';
import { fontScale, scale, verticalScale } from '@constants/metrics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

export const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },

    /* ─── Top Bar ─── */
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(20),
    },
    backButton: {
      position: 'absolute',
      left: scale(20),
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: theme.colors.backgroundColor + '90',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: scale(110),
      height: verticalScale(36),
    },
    carouselWrapper: {
      flex: 1,
    },
    slide: {
      flex: 1,
      width: screenWidth,
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      height: '30%',
    },
    heroImageContainer: {
      height: screenHeight * 0.65,
      overflow: 'hidden',
      backgroundColor: theme.colors.textTertiary,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    textContent: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(10),
      justifyContent: 'flex-start',
    },
    title: {
      fontSize: fontScale(32),
      color: theme.colors.text,
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(40),
      marginBottom: verticalScale(10),
    },
    description: {
      fontSize: fontScale(14),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(22),
    },

    /* ─── Footer ─── */
    footer: {
      paddingHorizontal: scale(20),
    },

    /* ─── Pagination (left-aligned) ─── */
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
      gap: scale(5),
    },
    dot: {
      height: scale(5),
      borderRadius: scale(3),
    },
    dotActive: {
      width: scale(24),
      backgroundColor: theme.colors.text,
    },
    dotInactive: {
      width: scale(5),
      backgroundColor: theme.colors.border,
    },
  });
