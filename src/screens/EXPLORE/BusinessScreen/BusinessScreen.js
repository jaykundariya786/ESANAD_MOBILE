import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale } from '@constants/metrics';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Insurance } from '@assets/index';

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

const BusinessScreen = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const ALL_PRODUCTS = [
    {
      id: 'groupHealth',
      name: 'Group Health',
      image: Insurance.groupHealthMain,
      soon: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      image: Insurance.professionalIndemnityMain,
      soon: true,
    },
    {
      id: 'cpm',
      name: 'CPM Insurance',
      image: Insurance.cpmMain,
      soon: true,
    },
    {
      id: 'contractor',
      name: "Contractor's All Risk",
      image: Insurance.contractorAllRiskMain,
      soon: true,
    },
    {
      id: 'office',
      name: 'Office Insurance',
      image: Insurance.officeMain,
      soon: true,
    },
    {
      id: 'home',
      name: 'Home',
      image: Insurance.homeMain,
      soon: true,
    },
    {
      id: 'yacht',
      name: 'Yacht',
      image: Insurance.yatchMain,
      soon: true,
    },
    {
      id: 'cyber',
      name: 'Cyber',
      image: Insurance.cyberMain,
      soon: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Business</Text>
          <Text style={styles.mainSubtitle}>Select a corporate service</Text>
        </View>

        <View style={styles.singleGrid}>
          {ALL_PRODUCTS.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={item.onPress}
              style={[
                styles.gridCard,
                {
                  backgroundColor: item.soon
                    ? theme.colors.bgSecondary
                    : theme.colors.backgroundColor,
                },
              ]}
            >
              <View
                style={[
                  styles.soonBadge,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                {item.soon && (
                  <Text
                    style={[styles.soonText, { color: theme.colors.primary }]}
                  >
                    Soon
                  </Text>
                )}
              </View>
              <View style={styles.cardIconWrapper}>
                {item.image ? (
                  <Image
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  item.icon
                )}
              </View>
              <Text numberOfLines={2} style={styles.cardName}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default BusinessScreen;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(110),
    },
    header: {
      marginHorizontal: verticalScale(20),
      marginBottom: verticalScale(15),
    },
    mainTitle: {
      fontSize: verticalScale(32),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    mainSubtitle: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    singleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: verticalScale(20),
      gap: verticalScale(10),
    },
    gridCard: {
      width: (Dimensions.get('screen').width - verticalScale(60)) / 3,
      height: (Dimensions.get('screen').width - verticalScale(60) + 30) / 3,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardIconWrapper: {
      width: verticalScale(85),
      height: verticalScale(85),
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    cardName: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    soonBadge: {
      position: 'absolute',
      top: verticalScale(6),
      right: verticalScale(6),
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(8),
      zIndex: 2,
    },
    soonText: {
      fontSize: verticalScale(9),
      fontFamily: 'Lato-Bold',
      textTransform: 'uppercase',
    },
  });
