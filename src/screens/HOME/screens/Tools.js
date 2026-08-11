import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Icons } from '@assets/index';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Tools = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const OPEN_LINK = url => Linking.openURL(url);

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Utility Center"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO WEATHER WIDGET */}
        <LinearGradient
          colors={theme.colors.tempLinear}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroGradient}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroWidget}
            onPress={() =>
              OPEN_LINK('https://www.google.com/search?q=weather+in+uae')
            }
          >
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>UAE WEATHER</Text>
              <Text style={styles.heroValue}>Temperature</Text>
              <Text style={styles.heroSub}>Check live local conditions</Text>
            </View>
            <View style={styles.heroIconWrapper}>
              <Image
                source={Icons.Temperature}
                style={styles.heroIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.labelRow}>
          <Text style={styles.sectionLabel}>FINANCE & INFO</Text>
        </View>

        {/* EXCHANGE WIDE CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.wideCard}
          onPress={() => OPEN_LINK('https://www.xe.com/currencyconverter/')}
        >
          <View style={styles.wideIconCircle}>
            <Image
              source={Icons.Exchange}
              style={styles.wideIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.wideInfo}>
            <Text style={styles.wideTitle}>Currency Exchange</Text>
            <Text style={styles.wideSubtitle}>
              Real-time global conversion rates
            </Text>
          </View>
        </TouchableOpacity>

        {/* GRID UTILITIES */}
        <View style={styles.gridContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.squareTile}
            onPress={() => OPEN_LINK('https://publicholidays.ae')}
          >
            <View style={styles.tileCircle}>
              <Image
                source={Icons.Holiday}
                style={styles.tileIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tileTitle}>Holidays</Text>
            <Text style={styles.tileDesc}>UAE Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.squareTile}
            onPress={() => navigation.navigate(SCREEN_NAMES.FAQ_SCREEN)}
          >
            <View style={[styles.tileCircle]}>
              <Image
                source={Icons.Faq}
                style={styles.tileIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tileTitle}>FAQ's</Text>
            <Text style={styles.tileDesc}>Get Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.squareTile}
            onPress={() => navigation.navigate(SCREEN_NAMES.USEFUL_LINKS)}
          >
            <View style={[styles.tileCircle]}>
              <Image
                source={Icons.Link}
                style={styles.tileIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tileTitle}>Links</Text>
            <Text style={styles.tileDesc}>Official Sites</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    heroWidget: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: verticalScale(24),
      flex: 1,
    },
    heroGradient: {
      borderRadius: verticalScale(28),
      marginBottom: verticalScale(20),
      elevation: 5,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    heroLeft: {
      flex: 1,
    },
    heroLabel: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      letterSpacing: 2,
      marginBottom: verticalScale(8),
    },
    heroValue: {
      fontSize: verticalScale(28),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      marginBottom: verticalScale(4),
    },
    heroSub: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textSecondary,
    },
    heroIconWrapper: {
      width: verticalScale(80),
      height: verticalScale(80),
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroIcon: {
      width: '100%',
      height: '100%',
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(16),
      paddingHorizontal: verticalScale(4),
    },
    sectionLabel: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      letterSpacing: 1.5,
    },
    wideCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: verticalScale(15),
      overflow: 'hidden',
    },
    wideIconCircle: {
      width: verticalScale(54),
      height: verticalScale(54),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(18),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: verticalScale(20),
    },
    wideIcon: {
      width: '55%',
      height: '55%',
    },
    wideInfo: {
      flex: 1,
    },
    wideTitle: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    wideSubtitle: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.primary,
    },
    wideGlow: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: verticalScale(100),
    },
    gridContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: verticalScale(15),
    },
    squareTile: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(16),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tileCircle: {
      width: verticalScale(44),
      height: verticalScale(44),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(14),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    tileIcon: {
      width: '55%',
      height: '55%',
    },
    tileTitle: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: verticalScale(2),
    },
    tileDesc: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
    },
    supportBanner: {
      marginTop: verticalScale(40),
      paddingHorizontal: verticalScale(12),
    },
    supportText: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: verticalScale(16),
    },
  });

export default Tools;
