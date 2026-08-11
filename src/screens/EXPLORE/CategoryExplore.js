import { StyleSheet, View } from 'react-native';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import LinearGradient from 'react-native-linear-gradient';
import CustomSegment from '@components/ui/CustomSegment';

import ExploreScreen from './ExploreScreen/ExploreScreen';
import BusinessScreen from './BusinessScreen/BusinessScreen';
import HomeHeader from '@screens/HOME/components/HomeHeader';

const Tab = createMaterialTopTabNavigator();

const CategoryExplore = () => {
  const { theme } = useThemeContext();
  const styles = style(theme);

  return (
    <View style={styles.container}>
      <HomeHeader title="Explore" />

      <View style={styles.tabWrapper}>
        <Tab.Navigator
          tabBar={({ state, descriptors, navigation }) => {
            const options = state.routes.map((route, index) => {
              const { options: routeOptions } = descriptors[route.key];
              const label =
                routeOptions.tabBarLabel || routeOptions.title || route.name;
              return {
                label,
                icon: index === 0 ? 'person-outline' : 'business-outline',
              };
            });

            return (
              <View style={styles.segmentContainer}>
                <CustomSegment
                  options={options}
                  selectedIndex={state.index}
                  onChange={index => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: state.routes[index].key,
                      canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                      navigation.navigate(state.routes[index].name);
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
            name="Individual"
            component={ExploreScreen}
            options={{ tabBarLabel: 'Individual' }}
          />
          <Tab.Screen
            name="Business"
            component={BusinessScreen}
            options={{ tabBarLabel: 'Business' }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

export default CategoryExplore;

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
