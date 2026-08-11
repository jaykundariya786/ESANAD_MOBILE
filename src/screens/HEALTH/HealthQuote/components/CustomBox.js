import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, fontScale } from '@constants/metrics';
import { useHealthStore } from '@store/HEALTH/healthStore';
import { useAuthStore } from '@store/authStore';

function CustomBox({ onShare, proposalId }) {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const { user } = useAuthStore();

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[theme.colors.linear1, theme.colors.linear2]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName}
          </Text>
          <Text style={styles.id}>#{proposalId}</Text>
        </View>

        {/* <TouchableOpacity
          style={styles.actionBtn}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Icon name="refresh-cw" size={verticalScale(14)} color={theme.colors.backgroundColor} />
        </TouchableOpacity> */}
      </View>
    </LinearGradient>
  );
}

const getStyles = theme =>
  StyleSheet.create({
    container: {
      marginHorizontal: verticalScale(15),
      borderRadius: verticalScale(12),
      overflow: 'hidden',
      marginTop: verticalScale(20),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: verticalScale(16),
    },
    info: {
      flex: 1,
      gap: verticalScale(2),
    },
    name: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
    },
    id: {
      color: theme.colors.text,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
    },
    actionBtn: {
      width: verticalScale(32),
      height: verticalScale(32),
      borderRadius: verticalScale(8),
      backgroundColor: theme.colors.modalOverlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default CustomBox;
