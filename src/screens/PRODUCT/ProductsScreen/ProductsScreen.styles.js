import { verticalScale } from '@constants/metrics';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    homeContainer: {
      flexGrow: 1,
      paddingHorizontal: verticalScale(20),
      paddingTop: verticalScale(20),
      paddingBottom: verticalScale(100),
    },
    headerSection: {
      marginBottom: verticalScale(32),
    },
    headerTitle: {
      fontSize: verticalScale(34),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(16),
    },
    summaryContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(20),
      justifyContent: 'space-between',
    },
    summaryItem: {
      alignItems: 'center',
      flex: 1,
    },
    summaryCount: {
      fontSize: verticalScale(24),
      fontFamily: 'Lato-Bold',
    },
    summaryLabel: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginTop: verticalScale(4),
    },
    sectionHeader: {
      marginBottom: verticalScale(15),
    },
    sectionTitle: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    mainGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(12),
      marginBottom: verticalScale(20),
    },
    mainCard: {
      width: (width - verticalScale(52)) / 2,
      borderRadius: verticalScale(28),
      padding: verticalScale(20),
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      minHeight: verticalScale(180),
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(10),
    },
    mainIconWrapper: {
      width: verticalScale(52),
      height: verticalScale(52),
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainIcon: {
      width: '100%',
      height: '100%',
    },
    mainTextContainer: {
      width: '100%',
    },
    mainCardLabel: {
      fontSize: verticalScale(17),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    mainCardDesc: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
      marginTop: verticalScale(4),
      lineHeight: verticalScale(16),
    },
    grid3Container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(10),
    },
    grid3Item: {
      width: (width - verticalScale(60)) / 3,
      height: (width - verticalScale(60)) / 3,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(22),
      padding: verticalScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(10),
    },
    grid3IconWrapper: {
      width: verticalScale(40),
      height: verticalScale(40),
      justifyContent: 'center',
      alignItems: 'center',
    },
    grid3Icon: {
      width: '100%',
      height: '100%',
    },
    grid3TextContainer: {
      alignItems: 'center',
      width: '100%',
    },
    grid3Label: {
      fontSize: verticalScale(10.5),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    grid3Desc: {
      fontSize: verticalScale(8.5),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      marginTop: verticalScale(1),
    },
  });

export default style;
