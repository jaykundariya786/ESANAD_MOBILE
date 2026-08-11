import React from 'react';
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeContext } from '@theme/ThemeProvider';
import { moderateScale, verticalScale } from '@constants/metrics';
import { useAuthStore } from '@store/authStore';
import { Images } from '@assets/index';
import Call from '@assets/icons/Call';
import { SCREEN_NAMES } from '@constants/screenNames';
import { useNavigation } from '@react-navigation/native';
import Profile from '@assets/NEWICONS/Profile';
import Notification from '@assets/NEWICONS/Notification';
import LinearGradient from 'react-native-linear-gradient';

const HomeHeader = () => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useThemeContext();
  const styles = createStyles(theme);

  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            Platform.OS === 'ios' ? insets.top : verticalScale(insets.top + 10),
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        {isDarkMode ? (
          <Image
            source={Images.Logo2}
            style={styles.avatar}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={Images.Logo}
            style={styles.avatar}
            resizeMode="contain"
          />
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: verticalScale(10),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate(SCREEN_NAMES.NOTIFICATION_SCREEN)}
          style={styles.notificationBtn}
        >
          <Notification />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate(SCREEN_NAMES.EDIT_PROFILE)}
          style={styles.notificationBtn}
        >
          <Profile />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(20),
      paddingBottom: verticalScale(20),
      gap: verticalScale(10),
      elevation: 5,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      backgroundColor: theme.colors.backgroundColor,
      zIndex: 1000,
    },
    content: {
      flex: 1,
      gap: verticalScale(4),
    },
    userName: {
      fontSize: moderateScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: moderateScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
    },
    avatarContainer: {
      height: moderateScale(40),
      width: moderateScale(112),
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    notificationBtn: {
      height: verticalScale(32),
      width: verticalScale(32),
      padding: verticalScale(4),
    },
    badge: {
      position: 'absolute',
      top: verticalScale(4),
      right: verticalScale(6),
      width: verticalScale(10),
      height: verticalScale(10),
      borderRadius: verticalScale(5),
      backgroundColor: theme.colors.red,
    },
  });
