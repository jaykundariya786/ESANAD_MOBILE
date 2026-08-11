import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import { fontScale, scale, verticalScale } from '@constants/metrics';
import { SCREEN_NAMES } from '@constants/screenNames';
import { useThemeContext } from '@theme/ThemeProvider';
import { env } from '@config/index';
import { Images } from '@assets/index';
import { formatNumber } from '@utils/formateNumber';

// --- Premium Reusable Mini-Components ---

const MicroBadge = ({ label, icon, bgColor, textColor, styles }) => (
  <View style={[styles.microBadge, { backgroundColor: bgColor }]}>
    {icon && <Image source={icon} style={styles.microBadgeIcon} />}
    <Text style={[styles.microBadgeText, { color: textColor }]}>{label}</Text>
  </View>
);

const DataMetric = ({ label, value, styles }) => (
  <View style={styles.metricNode}>
    <Text style={styles.metricLabel} numberOfLines={1}>
      {label}
    </Text>
    <Text style={styles.metricValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export const Card = ({
  id,
  companyName,
  insuranceType,
  logoUrl,
  item,
  isCompare,
  onUpdate,
}) => {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const { quoteInfo, QuatationType, Offers = [] } = item || {};

  const isRealTimePolicy = !quoteInfo?.isMatrix;
  const coverAmount =
    typeof quoteInfo?.response?.IncludedFeatures?.[0]?.value === 'number'
      ? `AED ${formatNumber(quoteInfo.response.IncludedFeatures[0].value)}`
      : quoteInfo?.response?.IncludedFeatures?.[0]?.value || '-';

  const navigateToPolicyDetails = () => {
    navigation.navigate(SCREEN_NAMES.BUY_POLICY_SCREEN, { policy_id: id });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() =>
        navigation.navigate(SCREEN_NAMES.POLICY_DETAIL_SCREEN, {
          policy_id: id,
        })
      }
      style={[styles.cardSurface, isCompare && styles.cardSurfaceCompare]}
    >
      {/* 0. Absolute Top-Right Corner Badge */}
      {!quoteInfo?.companyId?.eSanadRecommendation && (
        <View style={styles.cornerRibbon}>
          <Image source={Images.companyLogo} style={styles.cornerRibbonIcon} />
          <Text style={styles.cornerRibbonText}>RECOMMENDED</Text>
        </View>
      )}

      {/* 1. Header Area: Logo, Title, and Tags */}
      <View style={styles.headerLayout}>
        <View style={styles.logoFrame}>
          <Image
            source={{ uri: `${env.API_URL}${logoUrl}` }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.companyNameText} numberOfLines={1}>
              {companyName}
            </Text>
            {isRealTimePolicy && (
              <MicroBadge
                label="Real Time"
                bgColor={theme.colors.lightPrimary}
                textColor={theme.colors.primary}
                styles={styles}
              />
            )}
          </View>

          <View style={styles.tagRail}>
            <Text style={styles.insuranceTypeTag}>{insuranceType}</Text>
            {QuatationType === 'comprehensive' && quoteInfo?.isMatrix && (
              <MicroBadge
                label="Indicative"
                bgColor={theme.colors.highlight}
                textColor={theme.colors.text}
                styles={styles}
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.checkoutPill}
          onPress={navigateToPolicyDetails}
        >
          <View style={styles.checkoutPillInternal}>
            <Text style={styles.checkoutPrice}>
              AED {formatNumber(quoteInfo?.totalPrice)}
            </Text>
          </View>
          <View style={styles.actionArrowBox}>
            <Feather
              name="arrow-right"
              size={14}
              color={theme.colors.backgroundColor}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Embedded Data Panel: Minimal spacing, soft inner background */}
      <View style={styles.dataPanel}>
        <DataMetric
          label="Car Value"
          value={`AED ${formatNumber(quoteInfo?.carValue)}`}
          styles={styles}
        />
        <View style={styles.verticalDivider} />
        <DataMetric label="Cover" value={coverAmount} styles={styles} />
        <View style={styles.verticalDivider} />
        <DataMetric
          label="Excess"
          value={`AED ${formatNumber(Offers?.[0]?.ExcessAmount)}`}
          styles={styles}
        />
      </View>

      {/* 3. Footer Action Area */}
      <View style={styles.footerLayout}>
        {/* Compare Toggle */}
        <TouchableOpacity
          onPress={() => onUpdate(item)}
          activeOpacity={0.7}
          style={styles.compareToggle}
        >
          <View
            style={[
              styles.compareCheckbox,
              isCompare && styles.compareCheckboxActive,
            ]}
          >
            {isCompare && (
              <Feather
                name="check"
                size={10}
                color={theme.colors.backgroundColor}
              />
            )}
          </View>
          <Text
            style={[
              styles.compareLabel,
              isCompare && styles.compareLabelActive,
            ]}
          >
            Compare
          </Text>
        </TouchableOpacity>
        <View style={styles.discountMarker}>
          <Image source={Images.off} style={styles.discountIconSmall} />
          <Text style={styles.discountTextSmall}>5% OFF</Text>
        </View>
        {/* Pricing Action Pillar */}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    cardSurface: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: scale(14),
      padding: scale(12),
      width: Dimensions.get('screen').width - scale(32),
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(12),
    },
    cardSurfaceCompare: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.lightPrimary,
    },

    // --- Header ---
    headerLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },
    logoFrame: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(10),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: `${theme.colors.border}80`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: '80%',
      height: '80%',
    },
    headerInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: verticalScale(4),
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    companyNameText: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      flex: 1,
      marginRight: scale(6),
    },
    tagRail: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: scale(6),
    },
    insuranceTypeTag: {
      fontSize: fontScale(10),
      color: theme.colors.textTertiary,
      fontFamily: 'Lato-Bold',
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: scale(6),
      paddingVertical: verticalScale(2),
      borderRadius: scale(4),
      textTransform: 'uppercase',
    },

    // --- Badges ---
    microBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(6),
      paddingVertical: verticalScale(2),
      borderRadius: scale(4),
      gap: scale(3),
    },
    microBadgeText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
    },
    microBadgeIcon: {
      width: scale(10),
      height: scale(10),
      resizeMode: 'contain',
    },

    // --- Absolute Corner Ribbon ---
    cornerRibbon: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.colors.lableBg,
      borderBottomLeftRadius: scale(12),
      borderTopRightRadius: scale(14), // Match card curves
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
      zIndex: 10,
    },
    cornerRibbonText: {
      color: theme.colors.success,
      fontSize: fontScale(9),
      fontFamily: 'Lato-Black',
      letterSpacing: 0.5,
    },
    cornerRibbonIcon: {
      width: scale(11),
      height: scale(11),
      resizeMode: 'contain',
    },

    // --- Data Panel ---
    dataPanel: {
      flexDirection: 'row',
      backgroundColor: theme.colors.floorBgColor,
      borderRadius: scale(8),
      paddingVertical: verticalScale(8),
      paddingHorizontal: scale(10),
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metricNode: {
      flex: 1,
      alignItems: 'flex-start',
      gap: verticalScale(2),
    },
    verticalDivider: {
      width: 1,
      height: '80%',
      backgroundColor: theme.colors.border,
      marginHorizontal: scale(8),
    },
    metricLabel: {
      fontSize: fontScale(10),
      color: theme.colors.textTertiary,
      fontFamily: 'Lato-Regular',
    },
    metricValue: {
      fontSize: fontScale(12),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },

    // --- Footer ---
    footerLayout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: verticalScale(2),
    },
    compareToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    compareCheckbox: {
      width: scale(16),
      height: scale(16),
      borderRadius: scale(4),
      borderWidth: 1.5,
      borderColor: theme.colors.description,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compareCheckboxActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    compareLabel: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    compareLabelActive: {
      color: theme.colors.primary,
    },

    // --- Modern Pill Button ---
    checkoutPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: scale(40),
      paddingLeft: scale(12),
      paddingRight: scale(4),
      paddingVertical: verticalScale(4),
      gap: scale(10),
      alignSelf: 'flex-end',
    },
    checkoutPillInternal: {
      alignItems: 'flex-end',
      marginVertical: verticalScale(2),
    },
    discountMarker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5),
    },
    discountIconSmall: {
      width: scale(15),
      height: scale(15),
      tintColor: theme.colors.primary,
    },
    discountTextSmall: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    checkoutPrice: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Black',
      color: theme.colors.textSecondary,
    },
    actionArrowBox: {
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
