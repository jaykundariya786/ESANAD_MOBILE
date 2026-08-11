import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HealthFetchMore = ({ applyFilters }) => {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={applyFilters}
      style={styles.container}
    >
      <View style={styles.content}>
        <Icon
          name="refresh-cw"
          size={verticalScale(18)}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.text}>More Plans</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      backgroundColor: theme.colors.primary,
      bottom: insets.bottom + verticalScale(Platform.OS === 'ios' ? 70 : 85),
      right: verticalScale(20),
      alignSelf: 'center',
      borderRadius: verticalScale(100),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(10),
      paddingHorizontal: verticalScale(20),
      gap: verticalScale(8),
    },
    text: {
      color: theme.colors.textSecondary,
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(14),
      letterSpacing: 0.5,
    },
  });

export default HealthFetchMore;
