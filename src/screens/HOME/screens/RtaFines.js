import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Icons } from '@assets/index';
import { useTranslation } from 'react-i18next';
import { env } from '@config/index';

const RtaFines = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const CALCULATORS_DATA = [
    {
      id: '1',
      title: 'Car History',
      subtitle: 'Detailed UAE reports',
      icon: Icons.Calculator,
      path: `${env?.URL}/car-report`,
    },
    {
      id: '2',
      title: 'Accidents',
      subtitle: 'Reporting & History',
      icon: Icons.Saaed,
      path: 'https://evg.ae/_layouts/evg/trafficaccidents.aspx?language=en',
    },
  ];

  const EMIRATES = [
    {
      name: 'Abu Dhabi',
      path: 'https://u.ae/en/information-and-services/justice-safety-and-the-law/road-safety/fines',
    },
    {
      name: 'Dubai',
      path: 'https://ums.rta.ae/violations/public-fines/fines-search',
    },
    {
      name: 'Sharjah',
      path: 'https://portal.shjmun.gov.ae/en/eservices/pages/Services.aspx?sercatid=133',
    },
    {
      name: 'Ajman',
      path: 'https://www.ajman.ae/en/happiness-bundle/services/most-used-services/payment-traffic-fines',
    },
    {
      name: 'Umm Al Quwain',
      path: 'https://uaqpolice.gov.ae/',
    },
    {
      name: 'Ras Al Khaimah',
      path: 'https://www.rak.ae/wps/portal/rak/e-services/govt/rakpolice/pay-traffic-fines-guide',
    },
    {
      name: 'Fujairah',
      path: 'https://eservice.fujairahpolice.gov.ae/',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Vehicle & Traffic Hub"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroGrid}>
          {CALCULATORS_DATA.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.heroTile}
              onPress={() => Linking.openURL(item.path)}
            >
              <View
                style={[
                  styles.heroIconCircle,
                  item.specialBg && { backgroundColor: item.specialBg },
                ]}
              >
                <Image
                  source={item.icon}
                  style={styles.heroIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.heroTitle}>{item.title}</Text>
              <Text style={styles.heroSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FINES DASHBOARD */}
        <View style={styles.finesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.indicator} />
            <View>
              <Text style={styles.sectionTitle}>
                {t('tools.calculators.traffic_fines.title')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('tools.calculators.traffic_fines.desc')}
              </Text>
            </View>
          </View>

          <View style={styles.emirateGrid}>
            {EMIRATES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emirateCard}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(item.path)}
              >
                <Text style={styles.emirateName}>{item.name}</Text>
                <View style={styles.launchCircle}>
                  <Icon name="launch" size={14} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    heroGrid: {
      flexDirection: 'row',
      gap: verticalScale(12),
      marginBottom: verticalScale(15),
    },
    heroTile: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroIconCircle: {
      width: verticalScale(44),
      height: verticalScale(44),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(14),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    heroIcon: {
      width: '60%',
      height: '60%',
    },
    heroTitle: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    heroSub: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    finesSection: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(32),
      padding: verticalScale(20),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(12),
      marginBottom: verticalScale(24),
    },
    indicator: {
      width: 4,
      height: verticalScale(24),
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    sectionTitle: {
      fontSize: verticalScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    sectionSubtitle: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    emirateGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(10),
    },
    emirateCard: {
      width: '48.3%',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(20),
      padding: verticalScale(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emirateName: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      flex: 1,
    },
    launchCircle: {
      width: verticalScale(28),
      height: verticalScale(28),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(14),
      justifyContent: 'center',
      alignItems: 'center',
    },
    disclaimer: {
      marginTop: verticalScale(32),
      paddingHorizontal: verticalScale(12),
    },
    disclaimerText: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: verticalScale(16),
    },
  });

export default RtaFines;
