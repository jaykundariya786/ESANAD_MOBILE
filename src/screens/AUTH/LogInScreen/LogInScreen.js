import React, { useCallback } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { useLogin } from '@hooks/auth/useLogIn';
import { Images, Insurance } from '@assets/index';
import { useUserStore } from '@store/userStore';

import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import FloatingButton from '@components/ui/FloatingButton';
import Header from '@components/ui/Header';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import CustomButton from '@components/ui/CustomButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LogInScreen = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { updateContactNumber } = useUserStore();
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      phone: '',
      country: null,
    },
    mode: 'onChange',
  });

  const onSubmit = useCallback(
    data => {
      const payload = {
        countryCode: data.country?.dial_code.replace('+', ''),
        mobileNumber: data.phone?.phone,
      };
      updateContactNumber(data.phone?.phone);
      login(payload);
    },
    [login, updateContactNumber],
  );

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.Login}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.secureBadge}>
            <Icon name="lock" size={scale(14)} color={theme.colors.highlight} />
            <Text style={styles.secureText}>Secure Access</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome Back!</Text>
          <Text style={styles.heroSubtitle}>
            Log in to manage your policies and{'\n'}explore new coverage
            options.
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Login with Mobile</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your registered mobile number to receive a verification code.
          </Text>
        </View>

        <Controller
          control={control}
          name="phone"
          rules={{
            required: 'Mobile number is required',
            maxLength: { value: 9, message: 'Max 9 digits allowed' },
            minLength: { value: 9, message: 'At least 9 digits' },
            validate: value =>
              value?.isValid || 'Please enter a valid mobile number',
          }}
          render={({ field: { value } }) => (
            <CountryPhoneInput
              value={value?.phone || ''}
              maxLength={9}
              onChange={({ country, phone, isValid }) => {
                setValue('phone', { phone, isValid }, { shouldValidate: true });
                setValue('country', country);
              }}
              errors={errors.phone?.message}
            />
          )}
        />

        <CustomButton
          title="Log In"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          isShowIcon
          disabled={!isValid}
        />

        <View style={styles.infoBox}>
          <Icon name="info" size={scale(14)} color={theme.colors.description} />
          <Text style={styles.infoText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LogInScreen;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
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
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(18),
      zIndex: 10,
    },
    heroContent: {
      position: 'absolute',
      bottom: verticalScale(35),
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
      marginBottom: verticalScale(10),
      gap: scale(6),
    },
    secureText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(36),
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(42),
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(16),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(22),
    },
    contentView: {
      flex: 1,
      marginTop: -verticalScale(25),
      backgroundColor: theme.colors.backgroundColor,
      borderTopLeftRadius: scale(30),
      borderTopRightRadius: scale(30),
    },
    scrollContent: {
      padding: verticalScale(20),
      gap: verticalScale(15),
    },
    sectionHeader: {},
    sectionTitle: {
      fontSize: fontScale(22),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      marginBottom: verticalScale(8),
    },
    sectionSubtitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(20),
    },
    inputWrapper: {},
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      backgroundColor: theme.colors.bgSecondary || theme.colors.border + '10',
      padding: scale(15),
      borderRadius: scale(15),
    },
    infoText: {
      flex: 1,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(18),
    },
  });
