import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { useThemeContext } from '@theme/ThemeProvider';
import { useAuthStore } from '@store/authStore';
import { useUserStore } from '@store/userStore';
import { SCREEN_NAMES } from '@constants/screenNames';
import { scale, fontScale, verticalScale } from '@constants/metrics';

import MainHeader from '@components/ui/MainHeader';

const DrawerContent = props => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { clearData } = useUserStore();

  const onLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: SCREEN_NAMES.LOGIN_SCREEN }],
    });
    logout();
    clearData();
  };

  const menuItems = [
    {
      id: 'support',
      title: 'Help & Support',
      icon: (
        <Icon
          name="phone-call"
          size={scale(20)}
          color={theme.colors.textTertiary}
        />
      ),
      action: () => {
        props.navigation.closeDrawer();
        Linking.openURL('tel:+971600500888');
      },
    },
    {
      id: 'about',
      title: 'About eSanad',
      icon: (
        <Icon name="info" size={scale(20)} color={theme.colors.textTertiary} />
      ),
      screen: SCREEN_NAMES.ABOUT_US,
    },
    {
      id: 'invite',
      title: 'Invite Friends',
      icon: (
        <Icon name="users" size={scale(20)} color={theme.colors.textTertiary} />
      ),
      screen: SCREEN_NAMES.REFER,
    },
    {
      id: 'rateUs',
      title: 'Rate Us',
      icon: (
        <Icon name="star" size={scale(20)} color={theme.colors.textTertiary} />
      ),
      screen: SCREEN_NAMES.RATE_US,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: (
        <Icon
          name="shield"
          size={scale(20)}
          color={theme.colors.textTertiary}
        />
      ),
      screen: SCREEN_NAMES.PRIVACY_POLICY,
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: (
        <Icon
          name="file-text"
          size={scale(20)}
          color={theme.colors.textTertiary}
        />
      ),
      screen: SCREEN_NAMES.TERMS_AND_CONDITIONS,
    },
    {
      id: 'setting',
      title: 'Settings',
      icon: (
        <Icon
          name="settings"
          size={scale(20)}
          color={theme.colors.textTertiary}
        />
      ),
      screen: SCREEN_NAMES.SETTINGS,
    },
  ];

  const handlePress = item => {
    if (item.action) {
      if (typeof item.action === 'function') {
        item.action();
      }
    } else if (item.screen) {
      if (
        item.screen === SCREEN_NAMES.HOME_SCREEN ||
        item.screen === SCREEN_NAMES.PRODUCTS_SCREEN ||
        item.screen === SCREEN_NAMES.EXPLORE_SCREEN ||
        item.screen === SCREEN_NAMES.REFER_SCREEN
      ) {
        navigation.navigate(SCREEN_NAMES.BOTTOM_TABS, {
          screen: item.screen,
        });
      } else {
        navigation.navigate(item.screen);
      }
      props.navigation.closeDrawer();
    }
  };

  return (
    <View style={styles.container}>
      <MainHeader
        title="Account"
        IconNew
        onIconPress={() => props.navigation.closeDrawer()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* User Info Card */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(SCREEN_NAMES.EDIT_PROFILE);
            props.navigation.closeDrawer();
          }}
          style={styles.userInfoCard}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            {user?.profilePic?.documentUrl ? (
              <Image
                source={{ uri: user?.profilePic?.documentUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.fullName ? user.fullName.charAt(0) : 'U'}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName || 'User Name'}
            </Text>
            <Text style={styles.userSubtitle}>View Profile</Text>
          </View>
          <Icon
            name="chevron-right"
            size={scale(20)}
            color={theme.colors.description}
          />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>{item.icon}</View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Icon
                    name="chevron-right"
                    size={scale(18)}
                    color={theme.colors.border}
                  />
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconContainer}>
              <Icon name="log-out" size={scale(20)} color={theme.colors.red} />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      paddingBottom: verticalScale(50),
      paddingTop: verticalScale(10),
    },
    userInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(20),
      marginBottom: verticalScale(10),
    },
    avatarContainer: {
      width: scale(52),
      height: scale(52),
      borderRadius: scale(26),
      backgroundColor: theme.colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: scale(26),
    },
    avatarText: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    userDetails: {
      flex: 1,
      marginLeft: scale(16),
      justifyContent: 'center',
    },
    userName: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    userSubtitle: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    menuSection: {
      marginTop: verticalScale(10),
    },
    sectionTitle: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: verticalScale(8),
      paddingHorizontal: scale(20),
    },
    menuCard: {
      // Minimal, no background or border
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(16),
      paddingHorizontal: scale(20),
    },
    menuIconContainer: {
      width: scale(32),
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    menuItemTitle: {
      flex: 1,
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginLeft: scale(52),
      marginRight: scale(20),
    },
    bottomSection: {
      marginTop: verticalScale(30),
      paddingHorizontal: scale(20),
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(14),
    },
    logoutIconContainer: {
      width: scale(32),
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    logoutText: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.red,
    },
  });

export default DrawerContent;
