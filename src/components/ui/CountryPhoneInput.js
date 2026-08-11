import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';

const validateUAEPhone = phone => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const mobile = /^5[0-9]{8}$/;
  const landline = /^[234679][0-9]{6,7}$/;

  return {
    isValid: mobile.test(cleanPhone) || landline.test(cleanPhone),
    isMobile: mobile.test(cleanPhone),
    isLandline: landline.test(cleanPhone),
    cleanPhone,
  };
};

const COUNTRY_INFO = {
  dial_code: '+971',
  code: 'AE',
  name: 'United Arab Emirates',
};

const CountryPhoneInput = ({
  value = '',
  onChange,
  maxLength = 9,
  errors: externalErrors,
  label = 'Phone Number',
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const [phone, setPhone] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => setPhone(value), [value]);

  const emitChange = numeric => {
    const validation = validateUAEPhone(numeric);
    onChange?.({
      phone: numeric,
      country: COUNTRY_INFO,
      ...validation,
      fullNumber: numeric ? `${COUNTRY_INFO.dial_code}${numeric}` : '',
    });
  };

  const handlePhoneChange = text => {
    const numeric = text.replace(/[^0-9]/g, '');
    setPhone(numeric);
    setInternalError('');
    emitChange(numeric);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (!phone) return;

    const { isValid } = validateUAEPhone(phone);

    if (isValid) return;

    if (phone.length < 7) return setInternalError('Phone number too short');
    if (phone.length > 9) return setInternalError('Phone number too long');
    if (phone.length === 9 && !phone.startsWith('5'))
      return setInternalError('Mobile starts with 5');

    setInternalError('Invalid UAE number');
  };

  const displayError = externalErrors || internalError;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            {
              color: isFocused
                ? theme.colors.primary
                : displayError
                ? theme.colors.red
                : theme.colors.textTertiary,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused
              ? theme.colors.primary
              : displayError
              ? theme.colors.red
              : theme.colors.border,
            borderWidth: isFocused ? 1.5 : 1,
            backgroundColor: theme.colors.backgroundColor,
          },
        ]}
      >
        <View style={styles.countryPicker}>
          <Image
            source={require('@assets/images/UAE.png')}
            resizeMode="contain"
            style={styles.flag}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.prefix}>+971</Text>

        <TextInput
          style={styles.textInput}
          keyboardType="phone-pad"
          placeholder="5XXXXXXXX"
          placeholderTextColor={theme.colors.description}
          value={phone}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChangeText={handlePhoneChange}
          selectionColor={theme.colors.primary}
        />
      </View>

      {displayError && (
        <View style={styles.errorRow}>
          <Icon
            name="alert-circle"
            size={moderateScale(14)}
            color={theme.colors.red}
          />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    labelContainer: {
      position: 'absolute',
      top: -verticalScale(8),
      left: moderateScale(15),
      zIndex: 10,
      backgroundColor: theme.colors.backgroundColor,
      paddingHorizontal: moderateScale(6),
    },
    label: {
      fontSize: moderateScale(12),
      fontFamily: 'Lato-Bold',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: verticalScale(56),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      paddingHorizontal: moderateScale(15),
      gap: moderateScale(10),
    },
    countryPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(5),
    },
    flag: {
      width: moderateScale(24),
      height: moderateScale(18),
      borderRadius: moderateScale(2),
    },
    divider: {
      width: 1,
      height: verticalScale(24),
      backgroundColor: theme.colors.border,
      marginHorizontal: moderateScale(2),
    },
    prefix: {
      fontSize: moderateScale(16),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    textInput: {
      flex: 1,
      fontSize: moderateScale(16),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
      height: '100%',
      paddingVertical: 0,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(6),
      marginLeft: moderateScale(5),
      gap: moderateScale(5),
    },
    errorText: {
      fontSize: moderateScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.red,
    },
  });

export default CountryPhoneInput;
