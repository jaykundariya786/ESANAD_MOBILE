import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Back, Banner } from '@assets/index';
import LogoClub from '@assets/NEWICONS/LogoClub';
import { useAuthStore } from '@store/authStore';
import Crown from '@assets/NEWICONS/Crown';
import PolicyClaim from '@assets/NEWICONS/PolicyClaim';
import Voucher from '@assets/NEWICONS/Voucher';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 55) / 2;

const RewardOption = () => {
  const { theme } = useThemeContext();
  const styles = useStyles(theme);
  const { user } = useAuthStore();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Rewards & Service</Text>
        <Text style={styles.subheader}>
          Exclusive perks and account management
        </Text>
      </View>

      <View style={styles.masonry}>
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN_NAMES.ESANASD_CLUB)}
          style={[
            styles.card,
            {
              width: COLUMN_WIDTH * 0.85,
            },
          ]}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={Back.Club}
            style={StyleSheet.absoluteFill}
            resizeMode="stretch"
          />
          <View style={styles.cardContent}>
            <View style={styles.topRow}>
              <LogoClub />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.clubName} numberOfLines={2}>
                {user?.fullName || 'Loyal Member'}
              </Text>
              <Text style={styles.clubTag}>Privilege Club</Text>
              <Text style={styles.clubDescription}>Insure. Indulge. Save!</Text>
            </View>
            <View style={styles.heroIconWrapper}>{<Crown />}</View>
          </View>
        </TouchableOpacity>

        <View style={styles.column}>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAMES.PRODUCTS_SCREEN)}
            style={styles.shortCard}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={Banner.Policy}
              style={StyleSheet.absoluteFill}
              resizeMode="stretch"
            />
            <LinearGradient colors={theme.colors.transparentLinear}>
              <View style={styles.cardContentSmall}>
                <Text style={styles.smallTitle}>My Policies & Claims</Text>
                <Text style={styles.smallDesc}>View coverage & claims</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAMES.VOUCHER_SCREEN)}
            style={styles.shortCard}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={Banner.Voucher}
              style={StyleSheet.absoluteFill}
              resizeMode="stretch"
            />
            <LinearGradient colors={theme.colors.transparentLinear}>
              <View style={styles.cardContentSmall}>
                <Text style={styles.smallTitle}>Exclusive Offers Vouchers</Text>
                <Text style={styles.smallDesc}>Redeem points now</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const useStyles = theme =>
  StyleSheet.create({
    container: {
      paddingHorizontal: moderateScale(20),
      marginTop: verticalScale(20),
    },
    headerContainer: {
      marginBottom: verticalScale(16),
    },
    header: {
      fontSize: moderateScale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheader: {
      fontSize: moderateScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      marginTop: verticalScale(2),
    },
    masonry: {
      flexDirection: 'row',
      gap: moderateScale(15),
    },
    column: {
      gap: moderateScale(15),
      flex: 1,
    },
    card: {
      width: COLUMN_WIDTH,
      borderRadius: moderateScale(20),
      backgroundColor: theme.colors.bgSecondary,
      overflow: 'hidden',
    },
    tallCard: {
      height: verticalScale(240),
    },
    mediumCard: {
      flex: 1,
      width: COLUMN_WIDTH * 1.15,
    },
    shortCard: {
      flex: 1,
      borderRadius: moderateScale(20),
      backgroundColor: theme.colors.bgSecondary,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    cardContent: {
      flex: 1,
      padding: moderateScale(16),
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    heroIconWrapper: {
      width: moderateScale(70),
      height: moderateScale(70),
      opacity: 0.8,
      alignSelf: 'flex-end',
      marginTop: verticalScale(10),
    },
    textGroup: {
      marginVertical: verticalScale(30),
      gap: verticalScale(2),
    },
    clubName: {
      fontSize: moderateScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.highlight,
      lineHeight: moderateScale(22),
    },
    clubTag: {
      fontSize: moderateScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    clubDescription: {
      fontSize: moderateScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textSecondary,
      marginTop: verticalScale(4),
      opacity: 0.8,
    },
    cardContentSmall: {
      flex: 1,
      padding: moderateScale(15),
      justifyContent: 'space-between',
    },
    smallIconWrapper: {
      width: moderateScale(70),
      height: moderateScale(70),
    },
    textGroupSmall: {
      gap: verticalScale(1),
      flex: 1,
    },
    smallTitle: {
      fontSize: moderateScale(14),
      fontFamily: 'Lato-Black',
      color: theme.colors.textSecondary,
    },

    smallDesc: {
      fontSize: moderateScale(9),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textSecondary,
      marginTop: verticalScale(2),
    },
  });

export default RewardOption;
