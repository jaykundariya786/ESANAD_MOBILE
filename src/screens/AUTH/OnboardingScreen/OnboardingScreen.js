import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Dimensions, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeContext } from '@theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from '@constants/metrics';
import OnboardingButton from './OnboardingButton';
import { Images, Insurance } from '@assets/index';
import { useAuthStore } from '@store/authStore';
import { SCREEN_NAMES } from '@constants/screenNames';
import { getStyles } from './OnboardingScreen.styles';
import { getBottomMargin } from '@utils/paddingBottom';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('screen');

const onboardingData = [
  {
    id: 1,
    title: "UAE's 35+ Best Insurers Are Waiting for You",
    description:
      'Compare Motor, Health, Home, and Life insurance side-by-side and lock in your perfect policy in under 60 seconds. Zero paperwork, 100% digital, and instantly.',
    image: Insurance.Company,
  },
  {
    id: 2,
    title: 'Policy You Buy Unlocks Exclusive Rewards',
    description:
      'Join the eSanad Club and enjoy member discounts and more — because protecting yourself should come with perks.',
    image: Insurance.Point,
  },
  {
    id: 3,
    title: 'We Are Always Here For You To Guide You',
    description:
      'CBUAE-licensed, DOH & DHA approved, and UAE PASS accessible. No hidden fees, complete transparency, and a 4.9 ★ Google rating from over 1.5M satisfied users.',
    image: Insurance.Support,
  },
];

const FADE_DURATION = 500;

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const [activeSlide, setActiveSlide] = useState(0);
  const { setOnBoarded } = useAuthStore();
  const insets = useSafeAreaInsets();

  // One animated value per slide for true cross-fade
  const fadeAnims = useRef(
    onboardingData.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;

  const isAnimating = useRef(false);

  const goToLogin = () => {
    setOnBoarded(true);
    navigation.replace(SCREEN_NAMES.LOGIN_SCREEN);
  };

  const animateToSlide = useCallback(
    newIndex => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // Cross-fade: fade out current, fade in new simultaneously
      Animated.parallel([
        Animated.timing(fadeAnims[activeSlide], {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[newIndex], {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
        setActiveSlide(newIndex);
      });
    },
    [activeSlide, fadeAnims],
  );

  const handleNext = () => {
    if (activeSlide < onboardingData.length - 1) {
      animateToSlide(activeSlide + 1);
    } else {
      goToLogin();
    }
  };

  const handlePrevious = () => {
    if (activeSlide > 0) {
      animateToSlide(activeSlide - 1);
    }
  };

  const isLastSlide = activeSlide >= onboardingData.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        <View style={styles.slide}>
          <View style={styles.heroImageContainer}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.0)',
                'rgba(255, 255, 255, 0.10)',
                'rgba(255, 255, 255, 0.30)',
                'rgba(255, 255, 255, 0.50)',
                'rgba(255, 255, 255, 0.70)',
                'rgba(255, 255, 255, 0.85)',
                'rgba(255, 255, 255, 0.95)',
                'rgba(255, 255, 255, 1)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradient}
            />
            {onboardingData.map((item, index) => (
              <Animated.Image
                key={item.id}
                source={item.image}
                resizeMode="cover"
                style={[
                  styles.heroImage,
                  StyleSheet.absoluteFillObject,
                  { opacity: fadeAnims[index] },
                ]}
              />
            ))}
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>
              {onboardingData[activeSlide].title}
            </Text>
            <Text style={styles.description}>
              {onboardingData[activeSlide].description}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: getBottomMargin(),
          },
        ]}
      >
        <View style={styles.paginationRow}>
          {onboardingData.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <OnboardingButton
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          index={activeSlide}
          length={onboardingData.length}
          onPressBack={handlePrevious}
        />
      </View>
    </View>
  );
};

export default OnboardingScreen;
