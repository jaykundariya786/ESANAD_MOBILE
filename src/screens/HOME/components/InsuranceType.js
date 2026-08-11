import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { moderateScale, verticalScale } from '@constants/metrics';
import { SCREEN_NAMES } from '@constants/screenNames';
import { useThemeContext } from '@theme/ThemeProvider';
import OfferText from '@components/ui/OfferText';

import Health from '@assets/NEWICONS/Health';
import Travel from '@assets/NEWICONS/Travel';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Banner } from '@assets/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = moderateScale(20);
const GRID_GAP = moderateScale(12);
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 2 - GRID_GAP * 2) / 3;

const InsuranceTypeList = ({ navigation }) => {
  const { theme } = useThemeContext();
  const styles = useStyles(theme);

  const INSURANCE_TYPES = [
    {
      id: 'motor',
      title: 'Motor',
      image: Banner.Car,
      bg: theme.colors.motorLinear,
      offer: 'Upto 30% Off',
      onPress: () => navigation.navigate(SCREEN_NAMES.CAR_INSURANCE_SCREEN),
    },
    {
      id: 'health',
      title: 'Health',
      image: Banner.Health,
      bg: theme.colors.healthLinear,
      onPress: () => navigation.navigate(SCREEN_NAMES.INSURACE_FOR),
    },
    {
      id: 'travel',
      title: 'Travel',
      image: Banner.Travel,
      bg: theme.colors.travelLinear,
      onPress: () => navigation.navigate(SCREEN_NAMES.TRAVEL_INSURANCE_SCREEN),
    },
  ];

  const renderCard = (item, index) => (
    <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={item.onPress}>
      <ImageBackground
        source={item.image}
        style={[
          styles.card,
          {
            justifyContent: 'flex-end',
            borderRadius: moderateScale(15),
            overflow: 'hidden',
          },
        ]}
      >
        {item?.offer && <OfferText text={item.offer} />}

        <LinearGradient
          colors={theme.colors.transparentLinear}
          style={{
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(15),
              fontFamily: 'Lato-Bold',
              color: theme.colors.textSecondary,
              padding: verticalScale(10),
              textAlign: 'center',
            }}
          >
            {item.title}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Buy Insurance</Text>
        <Text style={styles.subheader}>Choose a plan that fits your needs</Text>
      </View>

      <View style={styles.grid}>{INSURANCE_TYPES.map(renderCard)}</View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.viewMoreAction}
        onPress={() => navigation.navigate(SCREEN_NAMES.EXPLORE_SCREEN)}
      >
        <Text style={styles.viewMoreLabel}>Explore ALL Categories</Text>
        <View style={styles.viewMoreIcon}>
          <Icon
            name="chevron-forward"
            size={moderateScale(14)}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const useStyles = theme =>
  StyleSheet.create({
    container: {
      paddingHorizontal: CARD_MARGIN,
      marginTop: verticalScale(20),
    },
    headerContainer: {
      marginBottom: verticalScale(15),
    },
    header: {
      fontSize: moderateScale(22),
      color: theme.colors.text,
      fontFamily: 'Lato-Black',
    },
    subheader: {
      fontSize: moderateScale(13),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      marginTop: verticalScale(2),
    },
    grid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    cardWrapper: {},
    card: {
      width: CARD_WIDTH,
      height: verticalScale(135),
      borderRadius: moderateScale(15),
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapper: {
      height: moderateScale(56),
      width: moderateScale(56),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(8),
    },
    label: {
      fontSize: moderateScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    viewMoreAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(10),
      backgroundColor: theme.colors.bgSecondary, // Light primary background
      paddingVertical: verticalScale(14),
      borderRadius: moderateScale(12),
      gap: moderateScale(10),
    },
    viewMoreLabel: {
      fontSize: moderateScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    viewMoreIcon: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(20),
      backgroundColor: theme.colors.backgroundColor, // White pill for the icon
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default InsuranceTypeList;
