import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { useAuthStore } from '@store/authStore';
import { Insurance } from '@assets/index';
import { fontScale, scale, verticalScale } from '@constants/metrics';

import Header from '@components/ui/Header';
import FloatingButton from '@components/ui/FloatingButton';
import { SCREEN_NAMES } from '@constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Refer = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const onShare = async () => {
    try {
      const referralCode = (user?.referralCode || 'ESANAD2360').toUpperCase();
      const shareOptions = {
        title: 'Share Referral Code',
        message: `Hey! Use my referral code ${referralCode} to get a voucher for AED 50 when you sign up for eSanad! Download the app now: https://esanad.com`,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Share error/cancelled:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={Insurance.Refer}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <Header
            title="Refer & Earn"
            onBack={() => navigation.goBack()}
            textSecondarytyle={styles.headerBar}
            transparent
            noShadow
            text2
          />

          <View style={styles.heroContent}>
            <View style={styles.secureBadge}>
              <Icon
                name="gift"
                size={scale(14)}
                color={theme.colors.highlight}
              />
              <Text style={styles.secureText}>eSanad Club</Text>
            </View>
            <Text style={styles.heroTitle}>Invite Friends</Text>
            <Text style={styles.heroSubtitle}>
              Share your code and earn AED 50 vouchers
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.bodyContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Rewards</Text>
            <Text style={styles.sectionSubtitle}>
              Track the points you've accumulated from successful referrals.
            </Text>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>0</Text>
                <Text style={styles.balanceLabel}>Total Points</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>AED 0</Text>
                <Text style={styles.balanceLabel}>Value</Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoBox}>
            <View style={styles.infoIconWrapper}>
              <Icon name="info" size={scale(18)} color={theme.colors.primary} />
            </View>
            <Text style={styles.infoText}>
              Get your family and friends a voucher for AED 50 by sharing your
              unique code with them. When they sign up, you both get rewarded!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.termsLinkBox}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREEN_NAMES.TERMS_AND_CONDITIONS)
            }
          >
            <Text style={styles.termsLinkText}>View Terms & Conditions</Text>
            <Icon
              name="chevron-right"
              size={scale(16)}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <FloatingButton title="Send Invitation" onPress={onShare} isShowIcon />
    </View>
  );
};

export default Refer;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(100), // Account for floating button
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
      backgroundColor: theme.colors.modalOverlay || 'rgba(0,0,0,0.4)',
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
      marginBottom: verticalScale(8),
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
      color: 'rgba(255,255,255,0.8)',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },
    bodyContent: {
      padding: verticalScale(24),
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
    balanceCard: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: scale(16),
      padding: scale(24),
      borderWidth: 1,
      borderColor: theme.colors.border + '40',
      marginBottom: verticalScale(24),
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceColumn: {
      flex: 1,
      alignItems: 'center',
    },
    balanceDivider: {
      width: 1,
      height: '100%',
      backgroundColor: theme.colors.border + '50',
      marginHorizontal: scale(10),
    },
    balanceValue: {
      fontSize: fontScale(26),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
      marginBottom: verticalScale(4),
    },
    balanceLabel: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.colors.description,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '10',
      padding: scale(16),
      borderRadius: scale(12),
      marginBottom: verticalScale(24),
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    infoIconWrapper: {
      marginRight: scale(12),
      marginTop: verticalScale(2),
    },
    infoText: {
      flex: 1,
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(20),
    },
    termsLinkBox: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
    },
    termsLinkText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      marginRight: scale(4),
    },
  });
