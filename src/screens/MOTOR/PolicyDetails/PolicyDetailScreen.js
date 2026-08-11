import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { formatNumber } from '@utils/formateNumber';
import {
  useDownloadQuote,
  useGetExtraFeatures,
  useGetPolicyDetails,
  useGetProduct,
} from '@hooks/policy/useMotorPolicy';
import { env } from '@config/index';
import { usePolicyStore } from '@store/MOTOR/policyStore';
import { useThemeContext } from '@theme/ThemeProvider';
import { Images } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';
import { fontScale, verticalScale } from '@constants/metrics';
import Header from '@components/ui/Header';
import CustomStarRating from '@components/ui/CustomStarRating';
import { getBottomMargin } from '@utils/paddingBottom';

const TAX_RATE = 0.05;

const safeNumber = value => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safeFormatNumber = value => {
  if (isNaN(value) || value == null) return '0';
  return formatNumber(value);
};

const calculateFinalAmount = amount => {
  const safeAmount = safeNumber(amount);
  if (safeAmount <= 0) return 0;
  const tax = safeAmount * TAX_RATE;
  return safeAmount + tax;
};

// Subcomponent for Metric Columns
const MetricItem = ({ label, value, styles }) => (
  <View style={styles.metricColumn}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const PolicyDetailScreen = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { policy_id } = route?.params || {};

  const { data: getQuoteDetails = {} } = useGetPolicyDetails({ id: policy_id });
  const { data: productsData = [] } = useGetProduct();
  const { mutate: getExtraFeature } = useGetExtraFeatures();
  const { mutate: downloadQuote } = useDownloadQuote();
  const { extraFeatureInfo, updateExtraFeature } = usePolicyStore();

  const [totalAEDAmount, setTotalAEDAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [tab, setTab] = useState('Coverage');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState(null);

  const featureArray = useMemo(() => {
    const extraFeatures = getQuoteDetails?.ExtraFeatures || [];
    const free = extraFeatures.filter(f => safeNumber(f.Amount) === 0);
    const paid = extraFeatures.filter(f => safeNumber(f.Amount) !== 0);
    return [...free, ...paid];
  }, [getQuoteDetails?.ExtraFeatures]);

  useEffect(() => {
    const quoteTotalPrice = safeNumber(getQuoteDetails?.quoteInfo?.totalPrice);
    const quoteDiscountPrice = safeNumber(
      getQuoteDetails?.quoteInfo?.discountPrice,
    );

    setDiscountAmount(quoteDiscountPrice);

    if (!totalAEDAmount || totalAEDAmount === 0) {
      setTotalAEDAmount(quoteTotalPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getQuoteDetails]);

  useEffect(() => {
    let amount = safeNumber(extraFeatureInfo?.price);

    if (!extraFeatureInfo?.price && getQuoteDetails?.quoteInfo?.totalPrice) {
      amount = safeNumber(getQuoteDetails.quoteInfo.totalPrice);
    }

    extraFeatureInfo?.addOns?.forEach(item => {
      amount += safeNumber(item.price);
    });

    extraFeatureInfo?.extraFeatures?.forEach(item => {
      amount += safeNumber(item.Amount);
    });

    setTotalAEDAmount(amount);
    setDiscountAmount(
      safeNumber(
        extraFeatureInfo?.discountPrice ||
          getQuoteDetails?.quoteInfo?.discountPrice,
      ),
    );
  }, [extraFeatureInfo, getQuoteDetails]);

  useEffect(() => {
    return () => updateExtraFeature(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callPolicyInfoAPI = useCallback(
    (id, addOns, extraFeatures) => {
      getExtraFeature({ summaryId: id, data: { addOns, extraFeatures } });
    },
    [getExtraFeature],
  );

  const handleFeatureToggle = useCallback(
    (feature, isChecked) => {
      const currentFeatures =
        extraFeatureInfo?.extraFeatures ||
        getQuoteDetails?.quoteInfo?.extraFeatures ||
        [];

      const updatedFeatures = isChecked
        ? [...currentFeatures, feature]
        : currentFeatures.filter(
            f => f?.benifitDetail?._id !== feature.benifitDetail?._id,
          );

      callPolicyInfoAPI(
        getQuoteDetails._id,
        extraFeatureInfo?.addOns || getQuoteDetails?.quoteInfo?.addOns || [],
        updatedFeatures,
      );
    },
    [extraFeatureInfo, getQuoteDetails, callPolicyInfoAPI],
  );

  const handleAddOnToggle = useCallback(
    (addOn, isChecked) => {
      const currentAddOns =
        extraFeatureInfo?.addOns || getQuoteDetails?.quoteInfo?.addOns || [];

      const updatedAddOns = isChecked
        ? [...currentAddOns, addOn]
        : currentAddOns.filter(a => a._id !== addOn._id);

      callPolicyInfoAPI(
        getQuoteDetails._id,
        updatedAddOns,
        extraFeatureInfo?.extraFeatures ||
          getQuoteDetails?.quoteInfo?.extraFeatures ||
          [],
      );
    },
    [extraFeatureInfo, getQuoteDetails, callPolicyInfoAPI],
  );

  const isFeatureSelected = useCallback(
    feature => {
      if (safeNumber(feature?.Amount) === 0 || feature?.isMandatory) {
        return true;
      }

      const selectedFeatures =
        extraFeatureInfo?.extraFeatures ||
        getQuoteDetails?.quoteInfo?.extraFeatures ||
        [];

      return selectedFeatures.some(
        f => f.benifitDetail?._id === feature.benifitDetail?._id,
      );
    },
    [extraFeatureInfo, getQuoteDetails],
  );

  const isAddOnSelected = useCallback(
    addOn => {
      if (safeNumber(addOn?.price) === 0) return true;

      const selectedAddOns =
        extraFeatureInfo?.addOns || getQuoteDetails?.quoteInfo?.addOns || [];

      return selectedAddOns.some(a => a._id === addOn._id);
    },
    [extraFeatureInfo, getQuoteDetails],
  );

  const handleViewQuotation = useCallback(() => {
    if (quoteUrl) {
      setIsModalVisible(true);
      return;
    }

    downloadQuote(
      { refId: policy_id },
      {
        onSuccess: res => {
          setQuoteUrl(env.API_BASE_URL + res?.data?.data?.link);
          setIsModalVisible(true);
        },
        onError: error => {
          console.error('Quote download error:', error);
        },
      },
    );
  }, [quoteUrl, policy_id, downloadQuote]);

  const handleBuyPolicy = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.BUY_POLICY_SCREEN, { policy_id });
  }, [navigation, policy_id]);

  const finalAmount = calculateFinalAmount(totalAEDAmount);
  const finalDiscountAmount = calculateFinalAmount(discountAmount);

  const insuranceTypeDisplay =
    getQuoteDetails?.insuranceType === 'thirdparty'
      ? 'Third Party'
      : getQuoteDetails?.insuranceType || 'Comprehensive';

  const carValueDisplay = getQuoteDetails?.quoteInfo?.carValue
    ? `AED ${formatNumber(getQuoteDetails.quoteInfo.carValue)}`
    : 'N/A';

  const coverAmountRaw =
    getQuoteDetails?.quoteInfo?.response?.IncludedFeatures?.[0]?.value;
  const coverAmountDisplay =
    typeof coverAmountRaw === 'number'
      ? `AED ${coverAmountRaw}`
      : coverAmountRaw || 'N/A';

  const excessChargeDisplay =
    getQuoteDetails?.quoteInfo?.excessPrice !== undefined
      ? String(getQuoteDetails.quoteInfo.excessPrice)
      : 'N/A';

  const getButtonTitle = () => {
    if (getQuoteDetails?.quoteInfo?.isWithoutMatrixOrApi) {
      return 'Request Custom Pricing';
    }
    if (discountAmount !== 0) {
      return `Invest AED ${safeFormatNumber(finalDiscountAmount)} / yr`;
    }
    return `Invest AED ${safeFormatNumber(Math.ceil(finalAmount))} / yr`;
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[theme.colors.bgLinear1, theme.colors.bgLinear2]}
      style={styles.container}
    >
      <Header title="Policy Terminal" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO GLASS ARCHITECTURE */}
        <View style={styles.heroGlass}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLogoRing}>
              <Image
                source={{
                  uri: `${env.API_URL}${getQuoteDetails?.company?.logoImg?.path}`,
                }}
                style={styles.heroLogo}
              />
            </View>

            <View style={styles.heroTitleRegion}>
              <Text style={styles.heroBrandText} numberOfLines={1}>
                {getQuoteDetails?.QuatationCompanyName || 'Evaluating...'}
              </Text>

              <View style={styles.microTagRail}>
                <View style={styles.microTag}>
                  <Text style={styles.microTagText}>
                    {insuranceTypeDisplay}
                  </Text>
                </View>

                {getQuoteDetails?.QuatationType === 'comprehensive' &&
                  getQuoteDetails?.quoteInfo?.isMatrix && (
                    <View style={[styles.microTag, styles.microTagHighlight]}>
                      <Text
                        style={[
                          styles.microTagText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        Indicative Rate
                      </Text>
                    </View>
                  )}

                {!getQuoteDetails?.quoteInfo?.companyId
                  ?.eSanadRecommendation && (
                  <View style={[styles.microTag, styles.microTagOutline]}>
                    <Image
                      source={Images.companyLogo}
                      style={styles.miniIcon}
                    />
                    <Text style={styles.microTagText}>Recommended</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.heroMetricsGrid}>
            <MetricItem
              label="Vehicle Asset Value"
              value={carValueDisplay}
              styles={styles}
            />
            <View style={styles.verticalDivider} />
            <MetricItem
              label="Total Cover Limit"
              value={coverAmountDisplay}
              styles={styles}
            />
            <View style={styles.verticalDivider} />
            <MetricItem
              label="Excess Trigger"
              value={excessChargeDisplay}
              styles={styles}
            />
          </View>

          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.documentAction}
              onPress={handleViewQuotation}
            >
              <Feather
                name="file-text"
                size={16}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.documentActionText}>Review Policy PDF</Text>
            </TouchableOpacity>
            <View style={styles.trustBlock}>
              <Text style={styles.trustLabel}>Provider Confidence</Text>
              <View style={styles.ratingBox}>
                <CustomStarRating
                  rating={getQuoteDetails?.company?.googleRating}
                  size={14}
                  color={theme.colors.star}
                />
                <Text style={styles.trustScore}>
                  ({getQuoteDetails?.company?.googleRating || 'N/A'})
                </Text>
              </View>
            </View>
            {discountAmount > 0 && (
              <View style={styles.discountBlock}>
                <Image source={Images.off} style={styles.discountIcon} />
                <Text style={styles.discountText}>5% Matrix Reduced</Text>
              </View>
            )}
          </View>

          {/* <View style={styles.trustRow}>
            <View style={styles.trustBlock}>
              <Text style={styles.trustLabel}>Provider Confidence</Text>
              <View style={styles.ratingBox}>
                <CustomStarRating
                  rating={getQuoteDetails?.company?.googleRating}
                  size={14}
                  color={theme.colors.star}
                />
                <Text style={styles.trustScore}>
                  ({getQuoteDetails?.company?.googleRating || 'N/A'})
                </Text>
              </View>
            </View>
            {discountAmount > 0 && (
              <View style={styles.discountBlock}>
                <Image source={Images.off} style={styles.discountIcon} />
                <Text style={styles.discountText}>5% Matrix Reduced</Text>
              </View>
            )}
          </View> */}
        </View>

        {/* 2. DYNAMIC SEGMENTED TABS */}
        <View style={styles.tabRail}>
          {['Coverage', 'Benefits', 'Add-Ons'].map(item => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setTab(item)}
              style={[styles.tabPill, tab === item && styles.tabPillActive]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  tab === item && styles.tabPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. CONTINUOUS PANEL BLOCKS */}
        {tab === 'Coverage' && (
          <View style={styles.panelBlock}>
            {getQuoteDetails?.IncludedFeatures?.length > 0 ? (
              getQuoteDetails.IncludedFeatures.map((val, idx) =>
                val.Title ? (
                  <View
                    key={idx}
                    style={[
                      styles.cellRow,
                      idx !== getQuoteDetails.IncludedFeatures.length - 1 &&
                        styles.cellDivider,
                    ]}
                  >
                    <View style={styles.cellContent}>
                      <Text numberOfLines={1} style={styles.cellTitle}>
                        {val?.Title || ''}
                      </Text>
                    </View>
                    <Text style={styles.cellPrice}>AED {val.Amount}</Text>
                  </View>
                ) : null,
              )
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="folder-minus"
                  size={24}
                  color={theme.colors.border}
                />
                <Text style={styles.emptyStateText}>
                  No coverages detailed.
                </Text>
              </View>
            )}
          </View>
        )}

        {tab === 'Benefits' && (
          <View style={styles.panelBlock}>
            {featureArray?.length > 0 ? (
              featureArray.map((val, idx) => {
                const amount = safeNumber(val?.Amount);
                const isFree = amount === 0;
                const isDisabled = isFree || val?.isMandatory;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.cellRow,
                      idx !== featureArray.length - 1 && styles.cellDivider,
                    ]}
                  >
                    <View style={styles.cellContent}>
                      <Text style={styles.cellTitle}>
                        {val?.Title || val?.Name || '-'}
                      </Text>
                      {isFree ? (
                        <Text style={styles.cellPriceInclude}>Included</Text>
                      ) : (
                        <Text style={styles.cellPriceActivate}>
                          + AED {safeFormatNumber(amount)}
                        </Text>
                      )}
                    </View>

                    {!isFree && (
                      <Switch
                        value={isFeatureSelected(val)}
                        onValueChange={value => handleFeatureToggle(val, value)}
                        disabled={isDisabled}
                        trackColor={{
                          false: theme.colors.border,
                          true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.backgroundColor}
                        style={
                          isDisabled
                            ? styles.switchDisabled
                            : styles.switchEnabled
                        }
                      />
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Feather name="grid" size={24} color={theme.colors.border} />
                <Text style={styles.emptyStateText}>
                  No active benefits available.
                </Text>
              </View>
            )}
          </View>
        )}

        {tab === 'Add-Ons' && (
          <View style={styles.panelBlock}>
            {productsData?.length > 0 ? (
              productsData.map((item, idx) => {
                const isDisabled =
                  safeNumber(item?.price) === 0 || item?.isMandatory;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.cellRow,
                      idx !== productsData.length - 1 && styles.cellDivider,
                    ]}
                  >
                    <View style={styles.cellContentExt}>
                      <Text style={styles.cellTitle}>
                        {item?.productName || ''}
                      </Text>
                      <Text style={styles.cellDescription}>
                        {item?.description || ''}
                      </Text>
                      <Text style={styles.cellPriceActivate}>
                        {`${item?.currency || 'AED'} ${safeFormatNumber(
                          item?.price,
                        )}`}
                      </Text>
                    </View>

                    <Switch
                      value={isAddOnSelected(item)}
                      onValueChange={value => handleAddOnToggle(item, value)}
                      disabled={isDisabled}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.primary,
                      }}
                      thumbColor={theme.colors.backgroundColor}
                      style={
                        isDisabled
                          ? styles.switchDisabled
                          : styles.switchEnabled
                      }
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Feather name="layers" size={24} color={theme.colors.border} />
                <Text style={styles.emptyStateText}>
                  No systemic Add-Ons fetched.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 4. PURCHASE DOCK */}
      <View style={styles.bottomDock}>
        <TouchableOpacity
          style={styles.primaryCheckout}
          onPress={handleBuyPolicy}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryCheckoutText}>{getButtonTitle()}</Text>
          <Feather
            name="arrow-right"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        visible={isModalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Policy Quote</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Feather name="x" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Pdf
            source={{ uri: quoteUrl, cache: true }}
            trustAllCerts={false}
            style={styles.pdf}
          />
        </View>
      </Modal>
    </LinearGradient>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(120), // Prevent collision with bottom dock
    },

    // -- Hero Glass Architecture --
    heroGlass: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      marginHorizontal: verticalScale(20),
      marginTop: verticalScale(20),
      padding: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    heroLogoRing: {
      width: verticalScale(56),
      height: verticalScale(56),
      borderRadius: verticalScale(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      padding: verticalScale(4),
      marginRight: verticalScale(14),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.floorBgColor,
    },
    heroLogo: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    heroTitleRegion: {
      flex: 1,
      gap: verticalScale(6),
    },
    heroBrandText: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    microTagRail: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(6),
    },
    microTag: {
      backgroundColor: theme.colors.floorBgColor,
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(6),
    },
    microTagHighlight: {
      backgroundColor: theme.colors.primary,
    },
    microTagOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(4),
    },
    microTagText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textTertiary,
    },
    miniIcon: {
      width: verticalScale(10),
      height: verticalScale(10),
      tintColor: theme.colors.textTertiary,
    },

    // -- Hero Metrics --
    heroMetricsGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(16),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    metricColumn: {
      flex: 1,
      gap: verticalScale(4),
      alignItems: 'center',
    },
    verticalDivider: {
      width: StyleSheet.hairlineWidth,
      height: '100%',
      backgroundColor: theme.colors.border,
    },
    metricLabel: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
    },
    metricValue: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
      textAlign: 'center',
    },

    heroActionsRow: {
      alignItems: 'center',
      paddingTop: verticalScale(15),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    documentAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
      backgroundColor: theme.colors.floorBgColor,
      paddingHorizontal: verticalScale(16),
      paddingVertical: verticalScale(10),
      borderRadius: verticalScale(20),
    },
    documentActionText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textTertiary,
    },

    trustRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: verticalScale(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    trustBlock: {
      gap: verticalScale(4),
    },
    trustLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    ratingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(4),
    },
    trustScore: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Black',
      color: theme.colors.textTertiary,
    },
    discountBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(4),
      backgroundColor: theme.colors.highlight,
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(6),
    },
    discountIcon: {
      width: verticalScale(12),
      height: verticalScale(12),
    },
    discountText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },

    // -- Segmented Tabs --
    tabRail: {
      flexDirection: 'row',
      marginHorizontal: verticalScale(20),
      backgroundColor: theme.colors.floorBgColor,
      borderRadius: verticalScale(30),
      padding: verticalScale(4),
      marginVertical: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabPill: {
      flex: 1,
      paddingVertical: verticalScale(10),
      borderRadius: verticalScale(26),
      alignItems: 'center',
    },
    tabPillActive: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    tabPillText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    tabPillTextActive: {
      color: theme.colors.textSecondary,
    },

    // -- Continuous Panel Logic --
    panelBlock: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(20),
      overflow: 'hidden',
    },
    cellRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(16),
      paddingHorizontal: verticalScale(16),
    },
    cellDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    cellContent: {
      flex: 1,
      gap: verticalScale(4),
      marginRight: verticalScale(12),
    },
    cellContentExt: {
      flex: 1,
      gap: verticalScale(6),
      marginRight: verticalScale(12),
    },
    cellTitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    cellDescription: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    cellPrice: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
    },
    cellPriceInclude: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    cellPriceActivate: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    switchDisabled: {
      opacity: 0.4,
      transform: [{ scale: 0.9 }],
    },
    switchEnabled: {
      opacity: 1,
      transform: [{ scale: 0.9 }],
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(40),
      gap: verticalScale(10),
    },
    emptyStateText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },

    // -- Sticky Checkout --
    bottomDock: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: verticalScale(20),
      paddingTop: verticalScale(12),
      paddingBottom: getBottomMargin(),
      backgroundColor: theme.colors.backgroundColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    primaryCheckout: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: verticalScale(30),
      paddingVertical: verticalScale(16),
      gap: verticalScale(10),
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    primaryCheckoutText: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Black',
      color: theme.colors.textSecondary,
    },

    // -- Modal Overlay --
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: verticalScale(20),
      paddingVertical: verticalScale(14),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
    },
    modalTitle: {
      fontSize: fontScale(18),
      color: theme.colors.text,
      fontFamily: 'Lato-Black',
    },
    modalCloseButton: {
      width: verticalScale(32),
      height: verticalScale(32),
      borderRadius: verticalScale(16),
      backgroundColor: theme.colors.floorBgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pdf: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.backgroundColor,
    },
  });

export default PolicyDetailScreen;
