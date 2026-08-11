import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/Feather';

const CustomButton = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  isLoading,
  disabled,
  type,
  isShowIcon = false,
  iconLeft,
  iconRight,
  UniqueCode,
}) => {
  const { theme } = useThemeContext();

  const styles = createStyles(theme);

  const isSecondary = type === 'secondary';
  const buttonDisabled = disabled || isLoading;

  const textColor = UniqueCode
    ? theme.colors.text
    : isSecondary
    ? theme.colors.primary
    : theme.colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={buttonDisabled}
      style={[
        isSecondary ? styles.buttonSecondary : styles.button,
        buttonStyle,
        buttonDisabled && { opacity: 0.5 },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.textSecondary} />
      ) : (
        <View style={styles.contentContainer}>
          {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
          <Text
            style={[
              isSecondary ? styles.buttonTextSecondary : styles.buttonText,
              textStyle,
            ]}
          >
            {title}
          </Text>

          {iconRight ? (
            <View style={styles.iconRight}>{iconRight}</View>
          ) : (
            isShowIcon && (
              <Icon
                name={'arrow-up-right'}
                size={moderateScale(22)}
                color={textColor}
              />
            )
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const createStyles = theme =>
  StyleSheet.create({
    button: {
      borderRadius: verticalScale(12),
      backgroundColor: theme.colors.primary,
      width: '100%',
      height: verticalScale(56),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    buttonSecondary: {
      borderRadius: verticalScale(12),
      backgroundColor: theme.colors.backgroundColor,
      width: '100%',
      height: verticalScale(56),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      color: theme.colors.textSecondary,
      fontSize: moderateScale(18),
      fontFamily: 'Lato-Bold',
      textAlign: 'center',
    },
    buttonTextSecondary: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
      fontSize: moderateScale(18),
      textAlign: 'center',
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(15),
      justifyContent: 'center',
    },
    iconLeft: {
      marginRight: moderateScale(8),
    },
    iconRight: {
      marginLeft: moderateScale(8),
    },
  });
