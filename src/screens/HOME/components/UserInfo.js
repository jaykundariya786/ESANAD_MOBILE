import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useAuthStore } from '@store/authStore';
import { useThemeContext } from '@theme/ThemeProvider';
import { Images } from '@assets/index';
import { formatNumber } from '@utils/formateNumber';
import { useLoyaltyPoints } from '@hooks/profile/useProfile';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '@constants/screenNames';

const UserInfo = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { data: loyaltyPointsData = {} } = useLoyaltyPoints();

  const { totalRemainingPoints = 0 } = loyaltyPointsData || {};

  return (
    <View style={styles.container}>
      <View style={styles.welcomeStack}>
        <Text style={styles.greeting}>Welcome back 👋,</Text>
        <Text style={styles.userName} numberOfLines={1}>
          {user?.fullName}!
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate(SCREEN_NAMES.LOYALTY_POINTS)}
        style={styles.loyaltyPill}
      >
        <View style={styles.coinWrapper}>
          <Image source={Images.Coins} style={styles.coin} />
        </View>
        <View style={styles.pointsStack}>
          <Text style={styles.pointsValue}>
            {formatNumber(totalRemainingPoints)}
          </Text>
          <Text style={styles.pointsLabel}>Coins</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      paddingHorizontal: moderateScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: verticalScale(20),
      width: '100%',
    },
    welcomeStack: {
      flex: 1,
      marginRight: moderateScale(12),
    },
    greeting: {
      fontFamily: 'Lato-Regular',
      fontSize: moderateScale(14),
      color: theme.colors.textTertiary,
      marginBottom: verticalScale(2),
    },
    userName: {
      fontFamily: 'Lato-Bold',
      fontSize: moderateScale(22),
      color: theme.colors.text,
      textTransform: 'capitalize',
      letterSpacing: -0.5,
    },
    loyaltyPill: {
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: moderateScale(14),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(40),
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    coinWrapper: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    coin: {
      width: moderateScale(22),
      height: moderateScale(22),
      resizeMode: 'contain',
    },
    pointsStack: {
      justifyContent: 'center',
      gap: 2,
    },
    pointsValue: {
      fontFamily: 'Lato-Black',
      fontSize: moderateScale(16),
      color: theme.colors.text,
      lineHeight: moderateScale(18),
    },
    pointsLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: moderateScale(10),
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: verticalScale(1),
    },
  });

export default UserInfo;
