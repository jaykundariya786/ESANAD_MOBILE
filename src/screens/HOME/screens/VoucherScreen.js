import { StyleSheet, View } from 'react-native';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import Header from '@components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import CustomSegment from '@components/ui/CustomSegment';

import PurchaseVoucher from './LoyaltyPoints/components/PurchaseVoucher';
import MyVoucher from './LoyaltyPoints/components/MyVoucher';

const Tab = createMaterialTopTabNavigator();

const VoucherScreen = () => {
  const { theme } = useThemeContext();
  const styles = style(theme);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header title="Vouchers" onBack={navigation.goBack} />
      <View style={styles.tabWrapper}>
        <Tab.Navigator
          tabBar={({ state, descriptors, navigation: tabNavigation }) => {
            const options = state.routes.map((route, index) => {
              const { options: routeOptions } = descriptors[route.key];
              const label =
                routeOptions.tabBarLabel || routeOptions.title || route.name;
              return {
                label,
                icon: index === 0 ? 'wallet-outline' : 'card-outline',
              };
            });

            return (
              <View style={styles.segmentContainer}>
                <CustomSegment
                  options={options}
                  selectedIndex={state.index}
                  onChange={index => {
                    const event = tabNavigation.emit({
                      type: 'tabPress',
                      target: state.routes[index].key,
                      canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                      tabNavigation.navigate(state.routes[index].name);
                    }
                  }}
                  backgroundColor={theme.colors.border + '30'}
                  underlineColor={theme.colors.backgroundColor}
                  activeColor={theme.colors.primary}
                  inactiveColor={theme.colors.text + '80'}
                />
              </View>
            );
          }}
          screenOptions={{
            swipeEnabled: true,
            sceneStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Tab.Screen
            name="My Voucher"
            component={MyVoucher}
            options={{ tabBarLabel: 'My Voucher' }}
          />
          <Tab.Screen
            name="Purchase Voucher"
            component={PurchaseVoucher}
            options={{ tabBarLabel: 'Purchase Voucher' }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

export default VoucherScreen;

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    tabWrapper: {
      flex: 1,
      marginTop: verticalScale(10),
    },
    segmentContainer: {
      paddingHorizontal: verticalScale(20),
      marginBottom: verticalScale(10),
    },
  });
