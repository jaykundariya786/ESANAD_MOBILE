import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import { Images } from '@assets/index';

const OnboardingButton = ({
  title = 'Next',
  onPress,
  index,
  length,
  onPressBack,
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onPressBack}
        activeOpacity={0.9}
        disabled={index === 0}
      >
        {index === 0 ? (
          <Icon name="sparkles" size={scale(22)} color={theme.colors.primary} />
        ) : (
          <Icon
            name="arrow-back"
            size={scale(22)}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>{title}</Text>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.circleButton}
      >
        {index === 0 ? (
          <Icon
            name="arrow-forward"
            size={scale(22)}
            color={theme.colors.primary}
          />
        ) : index === length - 1 ? (
          <Image
            source={Images.companyLogo}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        ) : (
          <Icon
            name="arrow-forward"
            size={scale(22)}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.text,
      borderRadius: scale(40),
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(6),
      gap: scale(8),
    },
    circleButton: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      backgroundColor: theme.colors.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoIcon: {
      width: scale(30),
      height: scale(30),
    },
    label: {
      flex: 1,
      textAlign: 'center',
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.backgroundColor,
    },
  });

export default OnboardingButton;
