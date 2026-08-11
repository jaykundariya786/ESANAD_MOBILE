import { verticalScale } from '@constants/metrics';
import { Dimensions, StyleSheet } from 'react-native';

const ITEM_WIDTH = (Dimensions.get('screen').width - verticalScale(62)) / 3;

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(100),
    },
    header: {
      marginHorizontal: verticalScale(20),
      marginBottom: verticalScale(15),
    },
    mainTitle: {
      fontSize: verticalScale(32),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    mainSubtitle: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    heroCard: {
      marginHorizontal: verticalScale(20),
      borderRadius: verticalScale(15),
      paddingHorizontal: verticalScale(15),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: ITEM_WIDTH,
    },
    heroTextContainer: {
      flex: 1,
      paddingVertical: verticalScale(15),
      justifyContent: 'space-between',
      paddingBottom: verticalScale(20),
    },
    heroBadge: {
      backgroundColor: theme.colors.text,
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(10),
      alignSelf: 'flex-start',
      marginBottom: verticalScale(12),
    },
    heroBadgeText: {
      fontSize: verticalScale(9),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
    heroName: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    heroSubtitle: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    heroIconWrapper: {
      width: verticalScale(140),
      height: verticalScale(100),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    sectionHeader: {
      marginHorizontal: verticalScale(20),
      marginBottom: verticalScale(16),
    },
    sectionTitle: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    primaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: verticalScale(20),
      gap: verticalScale(10),
      marginBottom: verticalScale(10),
    },
    primaryCard: {
      width: ITEM_WIDTH,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    primaryIconWrapper: {
      width: verticalScale(100),
      height: verticalScale(100),
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryImage: {
      width: '100%',
      height: '100%',
    },
    primaryName: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    primarySubtitle: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    primaryBadge: {
      alignSelf: 'flex-start',
    },
    primaryBadgeText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textDecorationLine: 'underline',
    },
    othersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: verticalScale(20),
      gap: verticalScale(10),
      marginBottom: verticalScale(30),
    },
    otherCard: {
      width: (Dimensions.get('window').width - verticalScale(60)) / 3,
      height: (Dimensions.get('window').width - verticalScale(60)) / 3,
      borderRadius: verticalScale(15),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    otherIconWrapper: {
      width: verticalScale(85),
      height: verticalScale(85),
    },
    otherImage: {
      width: '100%',
      height: '100%',
    },
    otherName: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },

    allServicesLink: {
      alignItems: 'center',
      marginBottom: verticalScale(40),
    },
    allServicesText: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    soonBadge: {
      position: 'absolute',
      top: verticalScale(6),
      right: verticalScale(6),
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(8),
      zIndex: 2,
    },
    soonText: {
      fontSize: verticalScale(9),
      fontFamily: 'Lato-Bold',
      textTransform: 'uppercase',
    },
  });
