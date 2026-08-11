import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { formatNumber } from '@utils/formateNumber';
import { env } from '@config/index';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, scale, fontScale } from '@constants/metrics';
import CustomButton from '@components/ui/CustomButton';
import { SCREEN_NAMES } from '@constants/screenNames';
import RenderHTML, { TRenderEngineProvider } from 'react-native-render-html';
import { Images } from '@assets/index';
import Crown from '@assets/svg/Crown';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const extractNumber = str => {
  if (!str) return null;
  const cleanedStr = str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  // Priority 1: Percentage (e.g., 20% or 100%)
  const pcMatch = cleanedStr.match(/(\d+)\s*%/);
  if (pcMatch) return pcMatch[0];

  // Priority 2: AED Amount (e.g., AED 5,000 or 50/- or 50)
  const aedMatch =
    cleanedStr.match(/(AED|aed)\s*([\d,]+)/i) ||
    cleanedStr.match(/([\d,]+)\s*(AED|aed)/i);
  if (aedMatch) {
    const amount = aedMatch[1].match(/[\d,]+/) ? aedMatch[1] : aedMatch[2];
    return `AED ${amount}`;
  }

  // Special case for formats like 50/-
  const dashMatch = cleanedStr.match(/(\d+)\s*\/-/);
  if (dashMatch) return `AED ${dashMatch[1]}`;

  // Priority 3: Sessions
  const sessionMatch = cleanedStr.match(/(\d+)\s*(sessions?|days?|visits?)/i);
  if (sessionMatch) return sessionMatch[0];

  // Priority 4: Just a number if it's short (like "50")
  const justNum = cleanedStr.match(/^\d+$/);
  if (justNum) return justNum[0];

  return null;
};

const HealthPlans = ({
  setMorePlansHandler,
  openMemberHintMatch,
  idx,
  match,
  company,
  plan,
  navigation,
  onUpdate,
  isCompare,
}) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  const allCovers = useMemo(
    () => [...(plan?.extraCovers || []), ...(plan?.includedCovers || [])],
    [plan],
  );

  // Medical Cover / Annual Limit
  const finalMedicalCover = useMemo(() => {
    const matchAnnual = allCovers.find(
      i =>
        i?.benefit?.name?.toLowerCase()?.includes('annual limit') ||
        i?.benefit?.name?.toLowerCase() === 'annual limit',
    );
    const medicalCoverVal =
      matchAnnual?.limitAmount ||
      matchAnnual?.detail?.limitAmount ||
      matchAnnual?.extraDetail?.limitAmount;

    if (medicalCoverVal) {
      return `AED ${formatNumber(medicalCoverVal)}`;
    }

    let extValue = extractNumber(matchAnnual?.detail?.description);
    if (extValue) {
      // Automatically map generic extracted numbers back to currency exactly like the web UI wrapper
      if (
        !String(extValue).toLowerCase().includes('aed') &&
        !String(extValue).includes('%')
      ) {
        return `AED ${extValue}`;
      }
      return String(extValue);
    }

    return 'AED 1,00,000';
  }, [allCovers]);

  // Pharmacy
  const finalPharmacy = useMemo(() => {
    const matchPharm = allCovers.find(i =>
      i?.benefit?.name?.toLowerCase()?.includes('prescribed drugs'),
    );
    const pharmLimit = matchPharm?.coPay?.coPayLimit || matchPharm?.limitAmount;

    if (pharmLimit) {
      return `AED ${formatNumber(pharmLimit)}`;
    }

    let extValue = extractNumber(
      matchPharm?.detail?.description || matchPharm?.coPay?.description,
    );

    if (extValue) {
      if (
        !String(extValue).toLowerCase().includes('aed') &&
        !String(extValue).includes('%')
      ) {
        return `AED ${extValue}`;
      }
      return String(extValue);
    }

    return 'Covered';
  }, [allCovers]);

  // Diagnostics
  const finalDiagnosis = useMemo(() => {
    const matchDiag = allCovers.find(i =>
      i?.benefit?.name?.toLowerCase()?.includes('diagnostic'),
    );
    const diagCoPay =
      matchDiag?.coPay?.coPayValue !== undefined &&
      matchDiag?.coPay?.coPayValue !== null
        ? matchDiag?.coPay?.coPayValue
        : matchDiag?.detail?.limit;

    if (diagCoPay !== undefined && diagCoPay !== null) {
      return matchDiag?.coPay?.coPayType === 'fixedPrice'
        ? `AED ${diagCoPay}`
        : `${diagCoPay}%`;
    }

    const extValue = extractNumber(
      matchDiag?.detail?.description || matchDiag?.coPay?.description,
    );

    if (extValue) {
      return String(extValue);
    }

    return '0%';
  }, [allCovers]);

  const handleBuyPolicy = async () => {
    console.log('healthSummuryID', plan?._id);

    navigation.navigate(SCREEN_NAMES.HEALTH_POLICY_BUY_SCREEN, {
      policy_id: plan?._id,
    });
  };

  const handleInfoPolicy = async () => {
    navigation.navigate(SCREEN_NAMES.HEALTH_INSURANCE_DETAILS, {
      policy_id: plan?._id,
    });
  };

  const logoSource = company?.company?.logoImg && {
    uri: `${env.API_URL}/${company?.company?.logoImg?.path}`,
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleInfoPolicy}
        style={[
          {
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: verticalScale(16),
            padding: verticalScale(14),
            gap: verticalScale(14),
            borderWidth: 1,
            borderColor: isCompare ? theme.colors.primary : theme.colors.border,
            width: Dimensions.get('screen').width - 32,
            alignSelf: 'center',
            marginBottom: verticalScale(10),
            zIndex: 1,
          },
        ]}
      >
        {/* eSanad Recommends Corner Ribbon */}
        {plan?.companyData?.healthInsurance?.eSanadRecommendation && (
          <View style={styles.cornerRibbon}>
            <Image
              source={Images.companyLogo}
              style={styles.cornerRibbonIcon}
            />
            <Text style={styles.cornerRibbonText}>eSanad Recommends</Text>
          </View>
        )}
        {/* Header Row: Logo & Title Rails */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: verticalScale(12),
          }}
        >
          <View
            style={{
              width: verticalScale(54),
              height: verticalScale(54),
              borderRadius: verticalScale(12),
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundColor,
              padding: verticalScale(4),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={logoSource}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
            />
          </View>

          <View style={{ flex: 1, gap: verticalScale(6) }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: verticalScale(6),
                  flex: 1,
                  paddingRight: verticalScale(8),
                }}
              >
                <Text
                  style={{
                    fontSize: verticalScale(15),
                    fontFamily: 'Lato-Bold',
                    color: theme.colors.text,
                  }}
                  numberOfLines={2}
                >
                  {company?.company?.companyName}
                </Text>
                {plan?.plan?.isBasic ? (
                  <Image
                    source={Images.shield}
                    resizeMode="contain"
                    style={{
                      width: verticalScale(16),
                      height: verticalScale(16),
                    }}
                  />
                ) : (
                  <Crown width={16} height={16} />
                )}
              </View>
            </View>

            {/* Micro Tags Rail */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: verticalScale(6),
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.highlight,
                  paddingHorizontal: verticalScale(8),
                  paddingVertical: verticalScale(4),
                  borderRadius: verticalScale(100),
                }}
              >
                <Text
                  style={{
                    fontSize: verticalScale(10),
                    fontFamily: 'Lato-Bold',
                    color: theme.colors.text,
                  }}
                >
                  {plan?.plan?.planName}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: verticalScale(3),
                  backgroundColor: theme.colors.backgroundColor,
                  paddingHorizontal: verticalScale(6),
                  paddingVertical: verticalScale(4),
                  borderRadius: verticalScale(100),
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Image
                  source={Images.shield}
                  style={{
                    width: verticalScale(10),
                    height: verticalScale(10),
                  }}
                />
                <Text
                  style={{
                    fontSize: verticalScale(10),
                    fontFamily: 'Lato-Regular',
                    color: theme.colors.text,
                  }}
                >
                  Covers Maternity
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: verticalScale(10),
              paddingHorizontal: verticalScale(20),
              borderRadius: verticalScale(100),
              alignSelf: 'flex-end',
            }}
            onPress={handleBuyPolicy}
          >
            <Text
              style={{
                fontSize: verticalScale(13),
                fontFamily: 'Lato-Bold',
                color: theme.colors.textSecondary,
              }}
            >
              {plan?.isReferral
                ? 'Contact Us'
                : plan?.isPremiumRequestUpon
                ? 'Request Price'
                : `AED ${formatNumber(plan?.price)}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Specs Pill Matrix */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.colors.floorBgColor,
            borderRadius: verticalScale(12),
            padding: verticalScale(12),
          }}
        >
          <View
            style={{
              flex: 1,
              borderRightWidth: 1,
              borderRightColor: theme.colors.border,
              gap: verticalScale(4),
            }}
          >
            <Text
              style={{
                fontSize: verticalScale(11),
                color: theme.colors.description,
                fontFamily: 'Lato-Regular',
              }}
            >
              Pharmacy Limit
            </Text>
            <Text
              style={{
                fontSize: verticalScale(13),
                color: theme.colors.text,
                fontFamily: 'Lato-Bold',
              }}
            >
              {finalPharmacy}
            </Text>
          </View>

          <View
            style={{
              flex: 1.2,
              paddingLeft: verticalScale(12),
              borderRightWidth: 1,
              borderRightColor: theme.colors.border,
              gap: verticalScale(4),
            }}
          >
            <Text
              style={{
                fontSize: verticalScale(11),
                color: theme.colors.description,
                fontFamily: 'Lato-Regular',
              }}
            >
              Cover Amount
            </Text>
            <Text
              style={{
                fontSize: verticalScale(13),
                color: theme.colors.text,
                fontFamily: 'Lato-Bold',
              }}
            >
              {finalMedicalCover}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              paddingLeft: verticalScale(12),
              gap: verticalScale(4),
            }}
          >
            <Text
              style={{
                fontSize: verticalScale(11),
                color: theme.colors.description,
                fontFamily: 'Lato-Regular',
              }}
            >
              Co-pay: Diagnosis
            </Text>
            <Text
              style={{
                fontSize: verticalScale(13),
                color: theme.colors.text,
                fontFamily: 'Lato-Bold',
              }}
              numberOfLines={1}
            >
              {finalDiagnosis}
            </Text>
          </View>
        </View>

        {/* Action Footer */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: verticalScale(2),
          }}
        >
          <TouchableOpacity
            onPress={() => onUpdate(plan)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: verticalScale(8),
            }}
          >
            <View
              style={{
                width: verticalScale(18),
                height: verticalScale(18),
                borderRadius: verticalScale(9),
                borderWidth: isCompare ? 0 : 1.5,
                borderColor: theme.colors.description,
                backgroundColor: isCompare
                  ? theme.colors.primary
                  : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCompare && (
                <Icon
                  name="check"
                  size={verticalScale(12)}
                  color={theme.colors.backgroundColor}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: verticalScale(12),
                fontFamily: isCompare ? 'Lato-Bold' : 'Lato-Regular',
                color: isCompare
                  ? theme.colors.primary
                  : theme.colors.description,
              }}
            >
              Compare
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: verticalScale(4),
            }}
          >
            <Image
              source={Images.off}
              style={{
                width: verticalScale(14),
                height: verticalScale(14),
                tintColor: theme.colors.lableText,
              }}
            />
            <Text
              style={{
                fontSize: verticalScale(11),
                fontFamily: 'Lato-Bold',
                color: theme.colors.lableText,
              }}
            >
              5% OFF
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Show More Under-tab */}
      <View
        style={{
          alignItems: 'center',
        }}
      >
        {idx === 0 && !match && company?.plans?.length > 1 && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.bgSecondary,
              paddingVertical: verticalScale(6),
              paddingHorizontal: verticalScale(20),
              borderBottomLeftRadius: verticalScale(12),
              borderBottomRightRadius: verticalScale(12),
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: theme.colors.border,
              marginTop: verticalScale(-10),
            }}
            onPress={() => setMorePlansHandler(company?.company?._id)}
          >
            <Text
              style={{
                fontSize: verticalScale(11),
                color: theme.colors.description,
                fontFamily: 'Lato-Bold',
              }}
            >
              View {company?.plans?.length - 1} More Plans ▼
            </Text>
          </TouchableOpacity>
        )}
        {company?.plans?.length - 1 === idx && company?.plans?.length > 1 && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.bgSecondary,
              paddingVertical: verticalScale(6),
              paddingHorizontal: verticalScale(20),
              borderBottomLeftRadius: verticalScale(12),
              borderBottomRightRadius: verticalScale(12),
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: theme.colors.border,
              marginTop: verticalScale(-10),
            }}
            onPress={() => setMorePlansHandler(company?.company?._id)}
          >
            <Text
              style={{
                fontSize: verticalScale(11),
                color: theme.colors.description,
                fontFamily: 'Lato-Bold',
              }}
            >
              Hide Plans ▲
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    cornerRibbon: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: theme.colors.lableBg,
      borderBottomLeftRadius: scale(12),
      borderTopRightRadius: verticalScale(16),
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
  });

export default HealthPlans;
