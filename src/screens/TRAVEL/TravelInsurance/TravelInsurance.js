import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Icons, Insurance } from '@assets/index';
import Icon from 'react-native-vector-icons/Feather';
import Header from '@components/ui/Header';
import { SCREEN_NAMES } from '@constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TravelInsurance = () => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <Image
          source={Insurance.TravelInsurance}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <View style={styles.headerBar}>
          <Header
            title="Travel Insurance"
            onBack={() => navigation.goBack()}
            transparent
            noShadow
            text2
          />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.badgeRow}>
            <View style={styles.promoBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.promoText}>13 purchased today</Text>
            </View>
            <View
              style={[
                styles.promoBadge,
                { backgroundColor: theme.colors.highlight + '30' },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={verticalScale(12)}
                color={theme.colors.highlight}
              />
              <Text
                style={[styles.promoText, { color: theme.colors.highlight }]}
              >
                CBUAE License #273
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Safe Travels{'\n'}Everywhere</Text>
          <Text style={styles.heroSubtitle}>
            Secure worldwide coverage in 60 seconds
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.scrollContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Where are you headed?</Text>
          <Text style={styles.sectionSubtitle}>
            Select your journey type to view tailored insurance plans.
          </Text>
        </View>

        {/* Direction Options - Modern Grid Layout */}
        <View style={styles.optionsGrid}>
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREEN_NAMES.TRAVEL_OUTBOUND_SCREEN)
            }
          >
            <View style={[styles.iconCircle]}>
              <Image
                source={Icons.Takeoff}
                style={{ width: scale(40), height: scale(40) }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>Leaving UAE</Text>
            <Text style={styles.cardDesc}>Global & Schengen cover</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREEN_NAMES.TRAVEL_INBOUND_SCREEN)
            }
          >
            <View style={[styles.iconCircle]}>
              <Image
                source={Icons.Landing}
                style={{ width: scale(40), height: scale(40) }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>Visiting UAE</Text>
            <Text style={styles.cardDesc}>Inbound health cover</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: verticalScale(10) }}>
          <Text style={styles.sectionSubtitle}>
            Compare travel insurance plans from trusted insurers for Schengen,
            worldwide, and UAE trips.
          </Text>

          <View style={styles.benefitsWrapper}>
            {[
              'Instant comparison',
              'Trusted insurers',
              'Schengen-ready',
              '24/7 Assistance',
            ].map((benefit, idx) => (
              <View key={idx} style={styles.benefitPill}>
                <Icon
                  name="check"
                  size={scale(12)}
                  color={theme.colors.primary}
                />
                <Text style={styles.benefitPillText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },

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
      zIndex: 10,
    },
    heroContent: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: verticalScale(24),
      right: verticalScale(24),
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
      marginBottom: verticalScale(10),
    },
    promoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(5),
      borderRadius: verticalScale(20),
      gap: verticalScale(6),
    },
    pulseDot: {
      width: verticalScale(8),
      height: verticalScale(8),
      borderRadius: verticalScale(4),
      backgroundColor: theme.colors.lableText,
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
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },

    // Content Styles
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    scrollContent: {},
    sectionHeader: {
      marginBottom: verticalScale(15),
      gap: verticalScale(4),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: fontScale(22),
      fontFamily: 'Lato-Black',
    },
    sectionSubtitle: {
      color: theme.colors.description,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(20),
    },

    // Grid Styles (Matching InsuranceFor pattern)
    optionsGrid: {
      flexDirection: 'row',
      gap: verticalScale(16),
      marginBottom: verticalScale(30),
    },
    gridCard: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(20),
      padding: verticalScale(15),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconCircle: {
      width: verticalScale(64),
      height: verticalScale(64),
      borderRadius: verticalScale(32),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(12),
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Black',
      textAlign: 'center',
      marginBottom: verticalScale(4),
    },
    cardDesc: {
      color: theme.colors.description,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
    },

    // Wrapped Benefits
    benefitsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      marginBottom: verticalScale(20),
    },
    benefitPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(8),
      borderRadius: scale(100),
      gap: scale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    benefitPillText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },

    footerNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(12),
      marginTop: verticalScale(32),
      backgroundColor: theme.colors.bgSecondary,
      padding: verticalScale(16),
      borderRadius: verticalScale(16),
    },
    footerNoteText: {
      flex: 1,
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(18),
    },
  });

export default TravelInsurance;
