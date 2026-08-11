import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { env } from '@config/index';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, verticalScale, scale } from '@constants/metrics';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Helper: extract benefit points from quote ──
const getBenefitPoints = quote => {
  const benefits = quote?.issueInfo?.benefits || [];
  const findBenefit = keyword =>
    benefits.find(b => b.name?.toLowerCase().includes(keyword.toLowerCase()));

  const points = [];
  const usedNames = new Set();

  const preferred = [
    { keyword: 'Emergency Medical and Other Expenses', label: 'Medical' },
    { keyword: 'Trip Cancellation', label: 'Trip Cancellation' },
    { keyword: 'Baggage Delay', label: 'Baggage Loss' },
    { keyword: 'Loss of Passport', label: 'Loss of Passport' },
  ];

  for (const { keyword, label } of preferred) {
    const found =
      keyword === 'Emergency Medical and Other Expenses'
        ? quote?.issueInfo?.medicalBenefits?.[0] || findBenefit(keyword)
        : keyword === 'Baggage Delay'
        ? quote?.issueInfo?.luggageBenefits?.[0] || findBenefit(keyword)
        : keyword === 'Loss of Passport'
        ? quote?.issueInfo?.passportBenefits?.[0] || findBenefit(keyword)
        : findBenefit(keyword);

    if (found?.value) {
      points.push(`${label} up to ${found.value}`);
      usedNames.add(found.name);
    }
  }

  if (points.length < 4) {
    for (const b of benefits) {
      if (points.length >= 4) break;
      if (usedNames.has(b.name)) continue;
      if (!b.value || b.value === b.name) continue;
      points.push(`${b.name} up to ${b.value}`);
      usedNames.add(b.name);
    }
  }

  return points.length > 0
    ? points.slice(0, 4)
    : ['Comprehensive coverage included'];
};

const QuoteCard = ({
  item,
  onViewDetails,
  onCompare,
  onBuyNow,
  isSelectedForCompare,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const toggleDropdown = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const onLayout = useCallback(
    event => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && Math.abs(contentHeight - height) > 1) {
        setContentHeight(height);
      }
    },
    [contentHeight],
  );

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(expanded ? contentHeight : 0, { duration: 350 }),
      opacity: withTiming(expanded ? 1 : 0, { duration: 350 }),
      overflow: 'hidden',
    };
  }, [expanded, contentHeight]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(expanded ? '180deg' : '0deg') }],
    };
  }, [expanded]);

  const companyName =
    item?.companyName || item?.companyId?.companyName || 'Insurance Provider';
  const logoPath = item?.companyId?.logoImg?.path || item?.logoImg?.path;
  const logoUrl = logoPath ? `${env.API_URL}${logoPath}` : null;
  const price = item?.price || 0;
  const roundedAmount = Math.round(price);
  const planName = item?.planName || item?.planId?.name || 'Travel Plan';
  const benefitPoints = getBenefitPoints(item);

  const seed = item?._id
    ? item._id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    : 0;
  const randomPercent = 15 + (seed % 11);
  const strikethroughPrice = Math.round(
    roundedAmount * (1 + randomPercent / 100),
  );
  const savingsPercent = Math.round(
    ((strikethroughPrice - roundedAmount) / strikethroughPrice) * 100,
  );

  return (
    <View style={styles.quoteCardContainer}>
      {item.isMostPopular && (
        <View style={styles.mostPopularBadge}>
          <Icon name="star" size={10} color={theme.colors.backgroundColor} />
          <Text style={styles.mostPopularText}>MOST POPULAR</Text>
        </View>
      )}
      <View
        style={[
          styles.quoteCard,
          item.isMostPopular && styles.quoteCardPopular,
        ]}
      >
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.92}
          onPress={() => onViewDetails(item)}
        >
          <View style={styles.companyInfo}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.typeBadge,
                    item.isMostPopular
                      ? styles.bestSellerBadge
                      : item.safetyScore >= 88
                      ? styles.strongCoverBadge
                      : styles.balancedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      item.isMostPopular
                        ? styles.bestSellerText
                        : item.safetyScore >= 88
                        ? styles.strongCoverText
                        : styles.balancedText,
                    ]}
                  >
                    {item.isMostPopular
                      ? 'BEST SELLER'
                      : item.safetyScore >= 88
                      ? 'STRONG COVER'
                      : 'BALANCED'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.safetyBox,
                    {
                      backgroundColor:
                        item.safetyScore >= 90
                          ? theme.colors.lableBg
                          : item.safetyScore >= 80
                          ? theme.colors.lableSecondaryBg
                          : item.safetyScore >= 70
                          ? theme.colors.lableThirdBg
                          : theme.colors.redLight,
                    },
                  ]}
                >
                  <Icon
                    name="shield"
                    size={12}
                    color={
                      item.safetyScore >= 90
                        ? theme.colors.lableText
                        : item.safetyScore >= 80
                        ? theme.colors.lableSecondaryText
                        : item.safetyScore >= 70
                        ? theme.colors.lableThirdText
                        : theme.colors.red
                    }
                  />
                  <Text
                    style={[
                      styles.safetyText,
                      {
                        color:
                          item.safetyScore >= 90
                            ? theme.colors.lableText
                            : item.safetyScore >= 80
                            ? theme.colors.lableSecondaryText
                            : item.safetyScore >= 70
                            ? theme.colors.lableThirdText
                            : theme.colors.red,
                      },
                    ]}
                  >
                    {item.safetyScore}%
                  </Text>
                </View>
              </View>
              <Text style={styles.planName} numberOfLines={1}>
                {planName}
              </Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {companyName}
              </Text>
            </View>
          </View>
          <View style={styles.priceBox}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <View style={styles.savingsBadge}>
                <Icon
                  name="trending-down"
                  size={10}
                  color={theme.colors.lableText}
                />
                <Text style={styles.savingsText}>Save {savingsPercent}%</Text>
              </View>
              <Text style={styles.strikePrice}>AED {strikethroughPrice}</Text>
            </View>
            <Text style={styles.priceValue}>AED {roundedAmount}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {benefitPoints.length > 0 && (
          <View style={styles.benefitsSection}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={[
                  styles.compareCheckRow,
                  isSelectedForCompare && styles.compareCheckRowActive,
                ]}
                activeOpacity={0.9}
                onPress={() => onCompare(item)}
              >
                <View
                  style={[
                    styles.checkBox,
                    isSelectedForCompare && styles.checkBoxActive,
                  ]}
                >
                  {isSelectedForCompare && (
                    <Icon
                      name="check"
                      size={12}
                      color={theme.colors.backgroundColor}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.compareLabel,
                    isSelectedForCompare && styles.compareLabelActive,
                  ]}
                >
                  Add to Compare
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleDropdown}
                style={styles.dropdownHeader}
              >
                <Text style={styles.dropdownTitle}>Plan Benefits</Text>
                <Animated.View style={animatedIconStyle}>
                  <Icon
                    name="chevron-down"
                    size={16}
                    color={theme.colors.description}
                  />
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewBtn}
                activeOpacity={0.9}
                onPress={() => onBuyNow(item)}
              >
                <Text style={styles.viewBtnText}>Buy</Text>
                <View style={styles.actionArrowBox}>
                  <Icon
                    name="arrow-right"
                    size={15}
                    color={theme.colors.backgroundColor}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: 0,
                zIndex: -1,
              }}
              onLayout={onLayout}
              pointerEvents="none"
            >
              <View style={styles.benefitsContainer}>
                {benefitPoints.map((benefit, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <Icon
                      name="check-circle"
                      size={12}
                      color={theme.colors.lableText}
                    />
                    <Text style={styles.benefitText} numberOfLines={1}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Animated.View style={animatedContentStyle}>
              <View style={styles.benefitsContainer}>
                {benefitPoints.map((benefit, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <Icon
                      name="check-circle"
                      size={12}
                      color={theme.colors.lableText}
                    />
                    <Text style={styles.benefitText} numberOfLines={1}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuoteCard;

const createStyles = theme =>
  StyleSheet.create({
    quoteCardContainer: {},
    quoteCard: {
      backgroundColor: theme.colors.backgroundColor, // White
      borderRadius: verticalScale(20),
      padding: verticalScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quoteCardPopular: {
      borderColor: theme.colors.lableThirdText,
      borderWidth: 1.5,
    },
    mostPopularBadge: {
      position: 'absolute',
      top: verticalScale(-8),
      right: verticalScale(20),
      backgroundColor: theme.colors.lableThirdText,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(20),
      gap: verticalScale(4),
      zIndex: 10,
    },
    mostPopularText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(9),
      color: theme.colors.textSecondary,
      letterSpacing: 0.5,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    companyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(14),
      flex: 1,
    },
    logoBox: {
      width: verticalScale(48),
      height: verticalScale(48),
      borderRadius: verticalScale(12),
      backgroundColor: theme.colors.bgSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    logo: { width: '82%', height: '82%' },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
      marginBottom: verticalScale(4),
    },
    typeBadge: {
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(6),
    },
    bestSellerBadge: { backgroundColor: theme.colors.lableBg },
    strongCoverBadge: { backgroundColor: theme.colors.lableSecondaryBg },
    balancedBadge: { backgroundColor: theme.colors.lableThirdBg },
    typeBadgeText: { fontFamily: 'Lato-Bold', fontSize: fontScale(9) },
    bestSellerText: { color: theme.colors.lableText },
    strongCoverText: { color: theme.colors.lableSecondaryText },
    balancedText: { color: theme.colors.textTertiary },
    safetyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(3),
      backgroundColor: 'rgba(17, 17, 17, 0.04)',
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(6),
    },
    safetyText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
    },
    planName: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(16),
      color: theme.colors.text,
    },
    companyName: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(12),
      color: theme.colors.description,
      marginTop: verticalScale(1),
    },
    priceBox: { alignItems: 'flex-end' },
    strikePrice: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.description,
      textDecorationLine: 'line-through',
    },
    priceValue: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(22),
      color: theme.colors.primary,
      lineHeight: fontScale(26),
    },
    savingsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(3),
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(6),
      marginTop: verticalScale(2),
    },
    savingsText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.lableText,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: verticalScale(14),
      opacity: 0.6,
    },
    benefitsSection: {},
    dropdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownTitle: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(12),
      color: theme.colors.description,
    },
    benefitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(8),
      marginTop: verticalScale(10),
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(6),
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(6),
    },
    benefitText: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.text,
    },
    cardActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: verticalScale(12),
    },
    compareCheckRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
    },
    compareCheckRowActive: {},
    checkBox: {
      width: verticalScale(20),
      height: verticalScale(20),
      borderRadius: verticalScale(6),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBoxActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    compareLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.description,
    },
    compareLabelActive: { color: theme.colors.primary },
    viewBtn: {
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
    actionArrowBox: {
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewBtnText: {
      fontSize: verticalScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
    },
  });
