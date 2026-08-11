import React from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';

import Renewals from '@assets/images/policy/Renewals';
import Home from '@assets/images/policy/Home';
import Health from '@assets/images/policy/Health';
import GroupHealth from '@assets/images/policy/GroupHealth';
import RentCar from '@assets/images/policy/RentCar';
import Construction from '@assets/images/policy/Construction';
import Liability from '@assets/images/policy/Liability';
import Professional from '@assets/images/policy/Professional';
import Workers from '@assets/images/policy/Workers';
import Machinery from '@assets/images/policy/Machinery';
import Office from '@assets/images/policy/Office';
import Energy from '@assets/images/policy/Energy';
import MarineCargo from '@assets/images/policy/MarineCargo';
import Musataha from '@assets/images/policy/Musataha';
import MarineHull from '@assets/images/policy/MarineHull';
import Retail from '@assets/images/policy/Retail';
import Restaurant from '@assets/images/policy/Restaurant';
import Education from '@assets/images/policy/Education';
import Beauty from '@assets/images/policy/Beauty';
import Medical from '@assets/images/policy/Medical';
import { createStyles } from './ExploreScreen.styles';
import { SCREEN_NAMES } from '@constants/screenNames';
import OfferCarousel from '@components/ui/OfferCarousel';
import { Images, Insurance } from '@assets/index';

const ExploreScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const CATEGORIES = {
    HERO: {
      id: 'motor',
      name: 'Motor Insurance',
      subtitle: 'Comprehensive & Third Party coverage',
      image: Insurance.carMain,
      onPress: () => navigation.navigate(SCREEN_NAMES.CAR_INSURANCE_SCREEN),
      offer: 'UPTO 30% OFF',
    },
    PRIMARY: [
      {
        id: 'health',
        name: 'Health',
        subtitle: 'Medical security',
        image: Insurance.healthMain,
        onPress: () => navigation.navigate(SCREEN_NAMES.INSURACE_FOR),
        offer: 'Instant',
      },
      {
        id: 'travel',
        name: 'Travel',
        subtitle: 'Global protection',
        image: Insurance.travelMain,
        onPress: () =>
          navigation.navigate(SCREEN_NAMES.TRAVEL_INSURANCE_SCREEN),
        offer: 'Secure',
      },
      {
        id: 'pet',
        name: 'Pet',
        subtitle: 'Medical security',
        image: Insurance.petMain,
        soon: true,
        onPress: () => {},
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Explore</Text>
          <Text style={styles.mainSubtitle}>
            Find the perfect protection for your lifestyle
          </Text>
        </View>

        {/* Hero Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={CATEGORIES.HERO.onPress}
          style={[styles.heroCard, { backgroundColor: CATEGORIES.HERO.color }]}
        >
          <View style={styles.heroTextContainer}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{CATEGORIES.HERO.offer}</Text>
            </View>
            <View>
              <Text style={styles.heroName}>{CATEGORIES.HERO.name}</Text>
              <Text style={styles.heroSubtitle}>
                {CATEGORIES.HERO.subtitle}
              </Text>
            </View>
          </View>
          <View style={styles.heroIconWrapper}>
            <Image
              source={CATEGORIES.HERO.image}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.primaryGrid}>
          {CATEGORIES.PRIMARY.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              disabled={item.soon}
              onPress={item.onPress}
              style={[
                styles.primaryCard,
                {
                  backgroundColor: item.soon
                    ? theme.colors.bgSecondary
                    : theme.colors.backgroundColor,
                },
              ]}
            >
              {item.soon && (
                <View
                  style={[
                    styles.soonBadge,
                    { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <Text
                    style={[styles.soonText, { color: theme.colors.primary }]}
                  >
                    Soon
                  </Text>
                </View>
              )}
              <View style={styles.primaryIconWrapper}>
                <Image
                  source={item.image}
                  style={styles.primaryImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.primaryName}>{item.name}</Text>
              <Text style={styles.primarySubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExploreScreen;
