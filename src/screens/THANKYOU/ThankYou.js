import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import { Insurance } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';
import CustomButton from '@components/ui/CustomButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ThankYou = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.ThankYou}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Thank You!</Text>
          <Text style={styles.heroSubtitle}>
            We’ve received your request and it’s being processed.
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <View style={styles.messageBox}>
          <Text style={styles.messageTitle}>We're on it!</Text>
          <Text style={styles.messageText}>
            An eSanad advisor is currently reviewing your details. Expect a call
            shortly to finalize your coverage and get you on the road with peace
            of mind.
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: SCREEN_NAMES.BOTTOM_TABS }],
              })
            }
            title="Go to Home"
            isShowIcon
          />
        </View>
      </View>
    </View>
  );
};

export default ThankYou;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    heroContainer: {
      height: SCREEN_WIDTH * 1.4,
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
      bottom: verticalScale(32),
      left: scale(24),
      right: scale(24),
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(32),
      fontFamily: 'Lato-Black',
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary + '99',
      fontSize: fontScale(16),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(22),
    },
    contentSection: {
      flex: 1,
      padding: scale(24),
      justifyContent: 'space-between',
    },
    messageBox: {
      marginTop: verticalScale(10),
    },
    messageTitle: {
      color: theme.colors.text,
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
      marginBottom: verticalScale(12),
    },
    messageText: {
      color: theme.colors.description,
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(22),
    },
    buttonWrapper: {
      marginBottom: verticalScale(20),
    },
  });
