import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useUserStore } from '@store/userStore';
import { useThemeContext } from '@theme/ThemeProvider';
import { Insurance } from '@assets/index';
import { useResendOTP } from '@hooks/auth/useResendOTP';
import { useOTPVerify } from '@hooks/auth/useOTPVerify';
import { scale } from '@constants/metrics';

import Header from '@components/ui/Header';
import CustomButton from '@components/ui/CustomButton';
import CustomOTPInput from '@components/ui/CustomOTPInput';
import WrapKeyboardAwareScrollView from '@components/ui/WrapKeyboardAwareScrollView';
import style from './OTPVerificationScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OTPVerificationScreen = ({ navigation, route }) => {
  const { mutate: verifyOtp, isPending } = useOTPVerify();
  const { mutate: resendOtp } = useResendOTP();
  const { contactNumber } = useUserStore();
  const { theme } = useThemeContext();
  const styles = style(theme);
  const [otp, setOtp] = React.useState('');

  const onSubmit = async () => {
    const payload = {
      ref: route.params?.ref,
      countryCode: route.params?.countryCode,
      mobileNumber: contactNumber,
      otp: otp,
      product: 'Motor',
    };
    verifyOtp(payload);
  };

  const handleResendOtp = async () => {
    const payload = {
      mobileNumber: contactNumber,
      countryCode: route.params?.countryCode,
    };
    resendOtp(payload);
  };

  return (
    <WrapKeyboardAwareScrollView>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={Insurance.OtpScreen}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <Header
            title="Verification"
            onBack={() => navigation.goBack()}
            textSecondarytyle={styles.headerBar}
            transparent
            noShadow
            text2
          />

          <View style={styles.heroContent}>
            <View style={styles.secureBadge}>
              <Icon
                name="shield"
                size={scale(14)}
                color={theme.colors.highlight}
              />
              <Text style={styles.secureText}>Encrypted Channel</Text>
            </View>
            <Text style={styles.heroTitle}>OTP Verification</Text>
            <Text style={styles.heroSubtitle}>
              Confirm your identity to proceed securely
            </Text>
          </View>
        </View>

        {/* Body Section */}
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Enter Verification Code</Text>
            <Text style={styles.sectionSubtitle}>
              We've sent a 6-digit code to{' '}
              <Text style={styles.infoHighlight}>
                +{route.params?.countryCode}{' '}
                {contactNumber || route.params?.mobileNumber}
              </Text>
            </Text>
          </View>

          <View style={styles.otpWrapper}>
            <CustomOTPInput length={6} value={otp} onChange={setOtp} />
          </View>

          <CustomButton
            title="Verify & Proceed"
            onPress={onSubmit}
            isLoading={isPending}
            disabled={otp.length < 6 || isPending}
            isShowIcon
            buttonStyle={styles.submitButton}
          />

          <View style={styles.securityNote}>
            <Icon
              name="lock"
              size={scale(14)}
              color={theme.colors.description}
            />
            <Text style={styles.securityText}>
              Your code is encrypted and verified through a secure channel.
              Never share your OTP with anyone.
            </Text>
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.8}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </WrapKeyboardAwareScrollView>
  );
};

export default OTPVerificationScreen;
