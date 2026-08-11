import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Header from '@components/ui/Header';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import LinearGradient from 'react-native-linear-gradient';
import WrapKeyboardAwareScrollView from '@components/ui/WrapKeyboardAwareScrollView';

import { Icons } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';

const EmergencyScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const EMERGENCY_DATA = [
    {
      id: '1',
      title: 'Police',
      subtitle: '999',
      icon: Icons.Police,
      onPress: () => Linking.openURL('tel:999'),
      primary: true,
    },
    {
      id: '3',
      title: 'Saaed',
      subtitle: '80072233',
      icon: Icons.Saaed,
      onPress: () => Linking.openURL('tel:80072233'),
      primary: true,
    },
    {
      id: '2',
      title: 'RSA',
      subtitle: 'Roadside Help',
      icon: Icons.RSA,
      onPress: () => navigation.navigate(SCREEN_NAMES.RSA_SCREEN),
    },
    {
      id: '4',
      title: 'Ambulance',
      subtitle: '998',
      icon: Icons.Ambulance,
      onPress: () => Linking.openURL('tel:998'),
    },
    {
      id: '5',
      title: 'eSanad Call',
      subtitle: '600 500 888',
      icon: Icons.Support,
      onPress: () => Linking.openURL('tel:+971600500888'),
    },
    {
      id: '6',
      title: 'eSanad Email',
      subtitle: 'hello@esanad.com',
      icon: Icons.Email,
      onPress: () => Linking.openURL('mailto:hello@esanad.com'),
    },
  ];

  const renderServiceCard = item => (
    <TouchableOpacity
      key={item.id}
      style={[styles.card]}
      activeOpacity={0.8}
      onPress={item.onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Image
            source={item.icon}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.serviceName}>{item.title}</Text>
        <Text style={styles.serviceNumber}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Emergency Help"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bentoGrid}>
          <View style={styles.bentoRow}>
            {EMERGENCY_DATA.filter(i => i.primary).map(renderServiceCard)}
          </View>
          <View style={styles.divider} />
          <View style={styles.secondaryGrid}>
            {EMERGENCY_DATA.filter(i => !i.primary).map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.smallCard}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <View style={styles.smallIconCircle}>
                  <Image
                    source={item.icon}
                    style={styles.smallIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.smallInfo}>
                  <Text style={styles.smallName}>{item.title}</Text>
                  <Text style={styles.smallNumber}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.officeWrapper}>
          <Text style={styles.sectionLabel}>OUR CORPORATE OFFICE</Text>
          <TouchableOpacity
            style={styles.officeCard}
            activeOpacity={0.9}
            onPress={() => {
              Linking.openURL(`https://maps.app.goo.gl/r1ouvfgUs6BbsV8D8`);
            }}
          >
            <View style={styles.officeTop}>
              <View style={styles.locationCircle}>
                <Image
                  source={Icons.Location}
                  style={styles.locationImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.officeNames}>
                <Text style={styles.officeTitle}>eSanad Insurance</Text>
                <Text style={styles.officeSub}>Headquarters • Abu Dhabi</Text>
              </View>
            </View>
            <View style={styles.officeAddress}>
              <Text style={styles.addressLine}>
                Al Saqer Al Baraka Building
              </Text>
              <Text style={styles.addressLine}>
                26 Bait Al Shaer Street, Al Danah
              </Text>
            </View>
            <View style={styles.mapBadge}>
              <Text style={styles.mapText}>View on Maps</Text>
              <Entypo
                name="chevron-right"
                size={verticalScale(14)}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    topGradient: {
      height: verticalScale(260),
      paddingTop: verticalScale(10),
    },
    introBlock: {
      paddingHorizontal: verticalScale(24),
      paddingTop: verticalScale(20),
    },
    overlapScroll: {
      flex: 1,
      marginTop: -verticalScale(40),
    },
    scrollContent: {
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    bentoGrid: {
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(32),
      padding: verticalScale(20),
    },
    bentoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: verticalScale(10),
    },
    card: {
      width: (Dimensions.get('window').width - verticalScale(90)) / 2,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(20),
    },
    primaryCard: {
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    iconCircle: {
      width: verticalScale(44),
      height: verticalScale(44),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(14),
      justifyContent: 'center',
      alignItems: 'center',
    },
    serviceIcon: {
      width: '60%',
      height: '60%',
    },
    cardInfo: {
      gap: verticalScale(4),
    },
    serviceName: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    serviceNumber: {
      fontSize: verticalScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    divider: {
      height: verticalScale(10),
    },
    secondaryGrid: {
      gap: verticalScale(10),
    },
    smallCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(20),
      padding: verticalScale(12),
      gap: verticalScale(16),
    },
    smallIconCircle: {
      width: verticalScale(44),
      height: verticalScale(44),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    smallIcon: {
      width: '55%',
      height: '55%',
    },
    smallInfo: {
      flex: 1,
      gap: verticalScale(2),
    },
    smallName: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    smallNumber: {
      fontSize: verticalScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    officeWrapper: {
      marginTop: verticalScale(20),
    },
    sectionLabel: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      letterSpacing: 1.5,
      marginBottom: verticalScale(10),
      paddingLeft: verticalScale(4),
    },
    officeCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(28),
      padding: verticalScale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    officeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(16),
      marginBottom: verticalScale(20),
    },
    locationCircle: {
      width: verticalScale(50),
      height: verticalScale(50),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(25),
      justifyContent: 'center',
      alignItems: 'center',
    },
    locationImg: {
      width: '50%',
      height: '50%',
    },
    officeNames: {
      gap: verticalScale(2),
    },
    officeTitle: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    officeSub: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.primary,
    },
    officeAddress: {
      marginBottom: verticalScale(20),
      gap: verticalScale(4),
    },
    addressLine: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    mapBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(12),
      paddingVertical: verticalScale(12),
      gap: verticalScale(8),
    },
    mapText: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
  });

export default EmergencyScreen;
