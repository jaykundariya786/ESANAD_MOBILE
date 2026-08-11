import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import style from './ProductsScreen.styles';
import LinearGradient from 'react-native-linear-gradient';

import { SCREEN_NAMES } from '@constants/screenNames';
import HomeHeader from '@screens/HOME/components/HomeHeader';
import { Icons } from '@assets';

const ProductsScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = style(theme);

  const SUMMARY_DATA = [
    { label: 'Active', count: '03', color: theme.colors.lableText },
    { label: 'Quotes', count: '01', color: theme.colors.lableSecondaryText },
    { label: 'Claims', count: '00', color: theme.colors.red },
  ];

  const MAIN_ACTIONS = [
    {
      id: 'policies',
      icon: Icons.Policies,
      label: 'My Policies',
      description: 'Track status, coverage details, and documents easily.',
      navigate: () => navigation.navigate(SCREEN_NAMES.ACTIVE_POLICY),
      color: theme.colors.policyBg,
    },
    {
      id: 'quote',
      icon: Icons.Quote,
      label: 'Get Quotes',
      description: 'Compare premium plans and proceed to purchase.',
      navigate: () => navigation.navigate(SCREEN_NAMES.QUOTATION_SCREEN),
      color: theme.colors.quoteBg,
    },
  ];

  const OTHER_SERVICES = [
    {
      id: 'renew',
      icon: Icons.Renew,
      label: 'Renewals',
      description: 'Manage upcoming & pending renewals.',
      navigate: () => navigation.navigate(SCREEN_NAMES.EXPIRED_POLICY),
    },
    {
      id: 'claim',
      icon: Icons.Claim,
      label: 'My Claims',
      description: 'Check status & upload documents.',
      navigate: () => navigation.navigate(SCREEN_NAMES.CLAIM_POLICY),
    },
    {
      id: 'cancel',
      icon: Icons.Cancel,
      label: 'Cancelled',
      description: 'Review past records & details.',
      navigate: () => navigation.navigate(SCREEN_NAMES.CANCELLED_POLICY),
    },
  ];

  return (
    <View style={styles.container}>
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContainer}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Main Services</Text>
        </View>

        <View style={styles.mainGrid}>
          {MAIN_ACTIONS.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={item.navigate}
              style={[styles.mainCard, { backgroundColor: item.color }]}
            >
              <View style={styles.mainIconWrapper}>
                <Image
                  source={item.icon}
                  style={styles.mainIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.mainTextContainer}>
                <Text style={styles.mainCardLabel}>{item.label}</Text>
                <Text style={styles.mainCardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>

        <View style={styles.grid3Container}>
          {OTHER_SERVICES.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={item.navigate}
              style={styles.grid3Item}
            >
              <View style={styles.grid3IconWrapper}>
                <Image
                  source={item.icon}
                  style={styles.grid3Icon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.grid3TextContainer}>
                <Text style={styles.grid3Label}>{item.label}</Text>
                <Text style={styles.grid3Desc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductsScreen;
