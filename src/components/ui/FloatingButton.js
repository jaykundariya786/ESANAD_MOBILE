import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const FloatingButton = ({ onPress, disabled, isLoading, title }) => {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.container,
        title ? styles.pillButton : styles.roundButton,
        (disabled || isLoading) && { opacity: 0.6 },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.backgroundColor} />
      ) : (
        <View style={styles.content}>
          {title && <Text style={styles.text}>{title}</Text>}
          <Icon
            name="arrow-right"
            size={scale(24)}
            color={theme.colors.backgroundColor}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default FloatingButton;

const createStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: Math.max(insets.bottom, verticalScale(30)),
      right: scale(25),
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 12,
    },
    roundButton: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
    },
    pillButton: {
      height: scale(56),
      paddingHorizontal: scale(24),
      borderRadius: scale(28),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },
    text: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.backgroundColor,
    },
  });
