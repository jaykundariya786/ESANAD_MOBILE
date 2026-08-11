import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeContext } from '@theme/ThemeProvider';
import {
  fontScale,
  scale,
  verticalScale,
  moderateScale,
} from '@constants/metrics';
import { Icons, Insurance } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';
import Header from '@components/ui/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = verticalScale(300);

const CarInsurance = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const DATA = [
    {
      icon: Icons.File,
      name: 'Add Car Manually',
      description: 'Enter basic car info — like brand, model, Year, and more',
      onClick: () => navigation.navigate(SCREEN_NAMES.MOTOR_FLOW_SCREEN),
    },
    {
      icon: Icons.Pass,
      name: 'UAE PASS',
      description: 'Renew your car insurance or get a new one using UAE PASS',
      onClick: () => {},
      soon: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.CarInsurance}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <Header
          title="Car Insurance"
          onBack={() => navigation.goBack()}
          textSecondarytyle={styles.headerBar}
          transparent
          noShadow
          text2
        />

        <View style={styles.heroContent}>
          <View style={styles.promoBadge}>
            <Icon name="zap" size={scale(14)} color={theme.colors.highlight} />
            <Text style={styles.promoText}>Up to 30% Off</Text>
          </View>
          <Text style={styles.heroTitle}>Protect Your{'\n'}Drive Today</Text>
          <Text style={styles.heroSubtitle}>
            Compare & save on car insurance in minutes
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.scrollView}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            How would you like to proceed?
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose how you'd like to provide your car details
          </Text>
        </View>

        {/* Method Cards */}
        {/* Method Choices - Static Horizontal Grid */}
        <View style={styles.methodsWrapper}>
          {DATA.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={item.onClick}
              disabled={item.soon}
              style={[
                styles.methodCard,
                item.soon && styles.methodCardDisabled,
              ]}
            >
              <View
                style={[
                  styles.methodIconBox,
                  item.soon && styles.methodIconBoxDisabled,
                ]}
              >
                <Image
                  source={item.icon}
                  style={styles.methodIcon}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.methodDescription} numberOfLines={3}>
                  {item.description}
                </Text>
              </View>

              {item.soon ? (
                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>Coming Soon</Text>
                </View>
              ) : (
                <View style={styles.actionIndicator}>
                  <Text style={styles.actionText}>Select</Text>
                  <Icon
                    name="chevron-right"
                    size={scale(12)}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CarInsurance;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgLinear2,
    },

    // ── Hero Section ──
    heroContainer: {
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
    },
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(18),
      zIndex: 10,
    },

    backBtnPlaceholder: {
      width: verticalScale(40),
    },

    heroContent: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: scale(24),
      right: scale(24),
    },
    promoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '70',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(20),
      marginBottom: verticalScale(5),
      gap: scale(6),
    },
    promoText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(30),
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(36),
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary + '99',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },

    scrollView: {
      flex: 1,
      padding: verticalScale(20),
    },

    sectionHeader: {
      marginBottom: verticalScale(15),
      gap: verticalScale(4),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
    },
    sectionSubtitle: {
      color: theme.colors.description,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
    },

    methodsWrapper: {
      flexDirection: 'row',
      gap: scale(12),
      width: '100%',
      justifyContent: 'space-between',
    },
    methodCard: {
      flex: 1,
      borderRadius: verticalScale(15),
      backgroundColor: theme.colors.backgroundColor,
      padding: scale(15),
      borderWidth: 1,
      borderColor: theme.colors.primary + '50',
      alignItems: 'center',
    },
    methodCardDisabled: {
      opacity: 0.65,
      borderColor: theme.colors.border,
      elevation: 0,
    },
    methodCardInner: {
      flex: 1,
    },
    methodIconBox: {
      width: scale(40),
      height: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    methodIconBoxDisabled: {
      backgroundColor: theme.colors.bgSecondary,
    },
    methodIcon: {
      width: '100%',
      height: '100%',
    },
    methodInfo: {
      alignItems: 'center',
      width: '100%',
    },
    methodTitle: {
      color: theme.colors.text,
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      textAlign: 'center',
      marginBottom: verticalScale(6),
    },
    methodDescription: {
      color: theme.colors.description,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(16),
      textAlign: 'center',
      marginBottom: verticalScale(14),
    },
    soonBadge: {
      backgroundColor: theme.colors.highlight + '20',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: scale(20),
    },
    soonText: {
      color: theme.colors.text,
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: scale(20),
    },
    actionText: {
      color: theme.colors.primary,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
    },
  });
