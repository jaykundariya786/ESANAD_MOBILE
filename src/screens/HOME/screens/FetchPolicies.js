import React from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { useFetchPolicies } from '@hooks/auth/useLogIn';
import { Insurance } from '@assets/index';
import { fontScale, scale, verticalScale } from '@constants/metrics';

import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import Header from '@components/ui/Header';
import FloatingButton from '@components/ui/FloatingButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Emirates ID is required',
  EMIRATES_ID_INVALID: 'Please enter a valid Emirates ID',
  MUST_START_WITH_784: 'Emirates ID must start with 784',
};

const validateEmiratesId = value => {
  if (!value) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!value.startsWith('784')) return ERROR_MESSAGES.MUST_START_WITH_784;
  const regex = /^\d{3}-\d{4}-\d{7}-\d{1}$|^\d{15}$/;
  if (!regex.test(value)) return ERROR_MESSAGES.EMIRATES_ID_INVALID;
  return true;
};

const maskEmiratesId = value => {
  let digits = value.replace(/\D/g, '');
  let masked = '';
  if (digits.length > 0) masked += digits.substring(0, 3);
  if (digits.length > 3) masked += '-' + digits.substring(3, 7);
  if (digits.length > 7) masked += '-' + digits.substring(7, 14);
  if (digits.length > 14) masked += '-' + digits.substring(14, 15);
  return masked;
};

const FetchPolicies = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const { mutate: fetchPolicies, isLoading } = useFetchPolicies();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { emiratesId: '' },
    mode: 'onChange',
  });

  const onSubmit = data => {
    fetchPolicies({ eid: data.emiratesId });
  };

  return (
    <ScrollView bounces={false} contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.FetchPolicy}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <Header
          title="Fetch Policy"
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
            <Text style={styles.secureText}>Secure Link</Text>
          </View>
          <Text style={styles.heroTitle}>Retrieve Your Policy</Text>
          <Text style={styles.heroSubtitle}>
            Sync your existing coverage in seconds
          </Text>
        </View>
      </View>

      {/* Content Section */}

      <View
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emirates ID Verification</Text>
          <Text style={styles.sectionSubtitle}>
            Confirm your identity to locate all active insurance policies linked
            to your account.
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name="emiratesId"
            rules={{ validate: validateEmiratesId }}
            render={({ field: { value, onChange } }) => (
              <FloatingLabelInput
                label="Emirates ID"
                value={value}
                onChangeText={text => onChange(maskEmiratesId(text))}
                error={errors.emiratesId?.message}
                placeholder="784-XXXX-XXXXXXX-X"
                maxLength={18}
                keyboardType="numeric"
                showErrorMessage
              />
            )}
          />
        </View>

        <View style={styles.securityNote}>
          <Icon name="lock" size={scale(14)} color={theme.colors.description} />
          <Text style={styles.securityText}>
            Verified via UAE Federal Authority for Identity & Citizenship
          </Text>
        </View>
      </View>

      <FloatingButton
        title="Link Policy"
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        isLoading={isLoading}
        isShowIcon
      />
    </ScrollView>
  );
};

export default FetchPolicies;

const getStyles = theme =>
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
    scrollView: {
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
    inputWrapper: {
      marginBottom: verticalScale(15),
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(14),
      borderRadius: scale(12),
    },
    securityText: {
      flex: 1,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(16),
    },
  });
