import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useThemeContext } from '@theme/ThemeProvider';
import { SCREEN_NAMES } from '@constants/screenNames';
import { verticalScale, moderateScale } from '@constants/metrics';

import { BOTTOMTABICONS } from '@assets/NEWICONS/BOTTOMICONS';

import HomeScreen from '@screens/HOME/HomeScreen';
import ProductsScreen from '@screens/PRODUCT/ProductsScreen/ProductsScreen';
import CategoryExplore from '@screens/EXPLORE/CategoryExplore';
import { getBottomMargin } from '@utils/paddingBottom';
import EsanadClub from '@screens/CLUB/EsanasdClub';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  {
    key: 'HOME',
    label: 'Home',
    routeIndex: 0,
  },
  {
    key: 'MYPOLICIES',
    label: 'My Policies',
    routeIndex: 1,
  },
  {
    key: 'EXPLORE',
    label: 'Insurance',
    routeIndex: 2,
  },
  {
    key: 'CLUB',
    label: 'Club',
    routeIndex: 3,
  },
  {
    key: 'MORE',
    label: 'More',
    routeIndex: 4,
  },
];

const TabButton = ({ label, Icon, isFocused, onPress, styles, theme }) => (
  <TouchableOpacity
    style={[styles.tabItem, isFocused && styles.tabItemActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon
      isFocused={isFocused}
      color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
    />
    <Text
      style={[
        styles.labelText,
        isFocused && styles.labelTextActive,
        !isFocused && {
          color: theme.colors.textTertiary,
          fontFamily: 'Lato-Regular',
        },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const BottomTabs = () => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const CustomBottomTabBar = ({ state, navigation, theme, styles }) => {
    const activeRoute = state.routes[state.index];
    useEffect(() => {
      console.log('Active Tab:', activeRoute.name);
    }, [state.index]);

    const handleTabPress = index => {
      const route = state.routes[index];
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
      });

      if (state.index !== index && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <View style={[styles.outerContainer, { bottom: getBottomMargin() }]}>
        <View style={styles.dock}>
          <TabButton
            {...TAB_CONFIG[0]}
            Icon={
              state.index === 0
                ? BOTTOMTABICONS.HomeActive
                : BOTTOMTABICONS.Home
            }
            isFocused={state.index === 0}
            onPress={() => handleTabPress(0)}
            styles={styles}
            theme={theme}
          />
          <TabButton
            {...TAB_CONFIG[1]}
            Icon={
              state.index === 1
                ? BOTTOMTABICONS.PolicyActive
                : BOTTOMTABICONS.Policy
            }
            isFocused={state.index === 1}
            onPress={() => handleTabPress(1)}
            styles={styles}
            theme={theme}
          />

          {/* Center - Buy Insurance */}
          <TabButton
            {...TAB_CONFIG[2]}
            Icon={
              state.index === 2
                ? BOTTOMTABICONS.FilterActive
                : BOTTOMTABICONS.Filter
            }
            isFocused={state.index === 2}
            onPress={() => handleTabPress(2)}
            styles={styles}
            theme={theme}
          />

          <TabButton
            {...TAB_CONFIG[3]}
            Icon={
              state.index === 3
                ? BOTTOMTABICONS.CrownActive
                : BOTTOMTABICONS.Crown
            }
            isFocused={state.index === 3}
            onPress={() => handleTabPress(3)}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Floating More Circle */}
        <TouchableOpacity
          style={[
            styles.moreCircle,
            state.index === 4 && styles.moreCircleActive,
          ]}
          activeOpacity={0.8}
          onPress={() => navigation.openDrawer()}
        >
          {state.index === 4 ? (
            <BOTTOMTABICONS.MoreActive
              isFocused={true}
              color={theme.colors.primary}
            />
          ) : (
            <BOTTOMTABICONS.More
              isFocused={false}
              color={theme.colors.textTertiary}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={props => (
        <CustomBottomTabBar {...props} theme={theme} styles={styles} />
      )}
    >
      <Tab.Screen name={SCREEN_NAMES.HOME_SCREEN} component={HomeScreen} />
      <Tab.Screen
        name={SCREEN_NAMES.PRODUCTS_SCREEN}
        component={ProductsScreen}
      />
      <Tab.Screen
        name={SCREEN_NAMES.EXPLORE_SCREEN}
        component={CategoryExplore}
      />
      <Tab.Screen name={SCREEN_NAMES.ESANASD_CLUB} component={EsanadClub} />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const createStyles = theme =>
  StyleSheet.create({
    outerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: verticalScale(50),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(10),
    },
    dock: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bottomTab,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: verticalScale(70),
      borderRadius: verticalScale(35),
      paddingHorizontal: moderateScale(4),
      marginRight: moderateScale(10),
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 8,
    },
    tabItem: {
      flex: 1,
      height: verticalScale(56),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: verticalScale(28),
      marginHorizontal: moderateScale(2),
    },
    tabItemActive: {
      backgroundColor: theme.colors.backgroundColor,
    },
    labelText: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Regular',
      marginTop: verticalScale(3),
    },
    labelTextActive: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    filterButton: {
      height: verticalScale(42),
      width: verticalScale(42),
      borderRadius: verticalScale(21),
      marginTop: -verticalScale(15),
    },
    filterGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: verticalScale(21),
    },
    moreCircle: {
      width: verticalScale(70),
      height: verticalScale(70),
      borderRadius: verticalScale(40),
      backgroundColor: theme.colors.bottomTab,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
