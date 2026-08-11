import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Carousel from 'react-native-snap-carousel';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { SCREEN_NAMES } from '@constants/screenNames';

import { verticalScale, fontScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import Header from '@components/ui/Header';
import { env } from '@config/index';
import { formatNumber } from '@utils/formateNumber';
import { getCountryCode } from '@utils/countryUtils';
import { Icons } from '@assets';
import FloatingButton from '@components/ui/FloatingButton';
import {
  useGetTravelQuoteDetails,
  useGetTravelUserDetails,
  useInitiateTravelPayment,
  useApplyVoucher,
  useRemoveVoucher,
  usePayByTamara,
  useCheckoutPayment,
} from '@hooks/travelflow/useTravelFlow';

const BuyTravelPolicy = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const { travelId, referenceId } = route.params || {};

  const { width: screenWidth } = Dimensions.get('screen');
  const [activeTravellerIndex, setActiveTravellerIndex] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showAllCoverage, setShowAllCoverage] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const {
    data: quote,
    isLoading: isQuoteLoading,
    refetch: refetchQuote,
  } = useGetTravelQuoteDetails(travelId);
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useGetTravelUserDetails(travelId);

  const { mutate: initiateQICPayment, isPending: isPayingQIC } =
    useInitiateTravelPayment();
  const { mutate: applyVoucher, isPending: isApplyingVoucher } =
    useApplyVoucher();
  const { mutate: removeVoucher, isPending: isRemovingVoucher } =
    useRemoveVoucher();
  const { mutate: payByTamara, isPending: isPayingTamara } = usePayByTamara();
  const { mutate: checkoutPayment, isPending: isCheckingOut } =
    useCheckoutPayment();

  const travelData = quote?.data || quote;
  const travellers =
    userData?.travellersId || userData?.quoteDetail?.travellersId || [];
  const primaryTraveller = travellers?.[0] || {};

  // Auto-set voucher code when already applied (web parity)
  useEffect(() => {
    if (travelData?.voucher?.promoCode) {
      setVoucherCode(travelData.voucher.promoCode);
    }
  }, [travelData?.voucher]);

  const isVoucherApplied = !!travelData?.voucher;
  const isPaying = isPayingQIC || isPayingTamara || isCheckingOut;

  // Logic for Price (Mirroring Web - GetTravelPolicyCart)
  const basePrice = travelData?.price || 0;
  const vatAmount = (basePrice * 5) / 100;
  const discountAmount =
    travelData?.voucher && travelData?.discountPrice
      ? +basePrice - +travelData.discountPrice + +basePrice * 0.05
      : 0;
  const totalPrice = travelData?.voucher
    ? travelData?.discountPrice
    : basePrice + vatAmount;

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;
    applyVoucher(
      { quoteId: travelId, voucherCode: voucherCode.trim() },
      {
        onSuccess: () => {
          refetchQuote();
          setVoucherCode('');
        },
      },
    );
  };

  const handleRemoveVoucher = () => {
    removeVoucher(
      { quoteId: travelId },
      {
        onSuccess: () => refetchQuote(),
      },
    );
  };

  const handlePolicyWordingClick = () => {
    const companyName = travelData?.companyId?.companyName?.toLowerCase() || '';
    const planName = (
      travelData?.planName ||
      travelData?.planId?.name ||
      ''
    ).toLowerCase();

    if (companyName.includes('watania')) {
      Linking.openURL(
        'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776160887130-TPTravel-Assurance_Inbound_AE_WT.pdf',
      );
    } else if (companyName.includes('qic')) {
      if (planName.includes('outbound')) {
        Linking.openURL(
          'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776174302303-Outbound_qic_axa_policy_wording_en_ar_2025-12-01.pdf',
        );
      } else if (planName.includes('inbound')) {
        Linking.openURL(
          'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776174304373-Inbound_qic_policy_wording_en_ar_2025-12-01-%281%29.pdf',
        );
      }
    } else {
      Alert.alert(
        'Info',
        'Policy wording for this insurer will be provided shortly.',
      );
    }
  };

  const handlePayNow = () => {
    if (!isAccepted) {
      Alert.alert(
        'Terms and Conditions',
        'Please accept the declarations to proceed.',
      );
      return;
    }

    const redirectUri = `${env.API_URL}/travel-insurance/callback`;

    // Payment routing logic (web parity - buy-policy/index.js)
    if (travelData?.companyId?.companyName === 'QIC') {
      initiateQICPayment(
        { quoteId: travelId },
        {
          onSuccess: res => {
            const paymentUrl = res.data?.data || res.data;
            if (paymentUrl && typeof paymentUrl === 'string') {
              Linking.openURL(paymentUrl);
            }
          },
          onError: err => {
            Alert.alert(
              'Payment Error',
              err?.message || 'Payment initiation failed.',
            );
          },
        },
      );
    } else {
      // Non-QIC: Navigate to new Tap payment screen
      navigation.navigate(SCREEN_NAMES.TAP_PAYMENT_SCREEN, {
        quoteId: travelId,
        productType: 'travel',
      });
    }
  };

  // Combine coverages for display (web parity - GetTravelPolicyCart)
  const allBenefits = (travelData?.issueInfo?.benefits || []).map(item => ({
    name: item?.benefit?.name || item?.name,
    amount: item?.value == 0 ? 'Included' : `${item?.value}`,
  }));

  // Include response.covers (add-ons / optional covers) from QIC response
  const allCovers = (travelData?.response?.covers || [])
    .filter(
      item =>
        item?.enabled !== 'N' &&
        item?.code !== '500001' &&
        item?.code !== '500002' &&
        item?.baseCover !== 'Yes',
    )
    .map(item => ({
      name: item?.description?.[0]?.eng || item?.name,
      amount: `AED ${item?.premium}`,
    }));

  const combinedCoverages = [...allBenefits, ...allCovers];

  const displayingCoverages = showAllCoverage
    ? combinedCoverages
    : combinedCoverages.slice(0, 6);

  return (
    <View style={styles.container}>
      <Header title="Final Review" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator (Simplified) */}
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>Review Your Details</Text>
          <Text style={styles.reviewSubtitle}>
            Please verify your information before proceeding
          </Text>
        </View>

        {/* Plan Summary Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketLogoBox}>
              <Image
                source={{
                  uri: `${env.API_URL}${
                    travelData?.companyId?.logoImg?.path ||
                    travelData?.company?.logoImg?.path
                  }`,
                }}
                style={styles.ticketLogo}
              />
            </View>
            <View style={styles.ticketMainInfo}>
              <Text style={styles.ticketPlanName}>
                {travelData?.planName || 'Standard Plan'}
              </Text>
              <Text style={styles.ticketInsurerName}>
                by{' '}
                {travelData?.companyId?.companyName ||
                  travelData?.company?.companyName}
              </Text>
            </View>
            <View style={styles.ticketBadge}>
              <Text style={styles.ticketBadgeText}>BEST VALUE</Text>
            </View>
          </View>

          <View style={styles.ticketRouteRow}>
            <View style={styles.routeStation}>
              <Text style={styles.routeCode}>
                {getCountryCode(travelData?.travelId?.country)}
              </Text>
              <Text style={styles.routeCity}>
                {travelData?.travelId?.country}
              </Text>
            </View>
            <View style={styles.routeVisual}>
              <View style={styles.routeLine} />
              <Image
                source={Icons.Plane}
                style={{
                  width: verticalScale(25),
                  height: verticalScale(25),
                  transform: [{ rotate: '-45deg' }],
                }}
                resizeMode="contain"
              />
              <View style={styles.routeLine} />
            </View>
            <View style={[styles.routeStation, { alignItems: 'flex-end' }]}>
              <Text style={styles.routeCode}>
                {getCountryCode(travelData?.travelId?.destinationCountry)}
              </Text>
              <Text style={styles.routeCity} numberOfLines={1}>
                {travelData?.travelId?.destinationCountry || 'Worldwide'}
              </Text>
            </View>
          </View>

          <View style={styles.ticketSummaryBar}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>PREMIUM</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.colors.lableSecondaryText },
                ]}
              >
                AED {formatNumber(basePrice)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>VAT (5%)</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: theme.colors.red,
                  },
                ]}
              >
                AED {formatNumber(vatAmount)}
              </Text>
            </View>
            <View
              style={{
                flex: 1.5,
                justifyContent: 'flex-end',
                flexDirection: 'row',
                alignItems: 'flex-end',
                columnGap: 5,
              }}
            >
              <Text style={styles.summaryLabelTotal}>PAYABLE AMOUNT:</Text>
              <Text style={styles.summaryValueTotal}>
                AED{' '}
                <Text
                  style={{
                    fontSize: fontScale(20),
                  }}
                >
                  {formatNumber(totalPrice)}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.ticketDividerWrap}>
            <View style={styles.ticketCutoutLeft} />
            <View style={styles.ticketDashedLine} />
            <View style={styles.ticketCutoutRight} />
          </View>

          <View style={styles.ticketDetails}>
            <View style={styles.ticketInfoCol}>
              <Text style={styles.ticketInfoLabel}>DATE & TIME</Text>
              <Text style={styles.ticketInfoValue}>
                {`${dayjs(
                  travelData?.travelId?.startDate ||
                    travelData?.travelId?.inceptionDate,
                ).format('DD MMM')} - ${dayjs(
                  travelData?.travelId?.endDate ||
                    travelData?.travelId?.expiryDate,
                ).format('DD MMM, YYYY')}`}
              </Text>
            </View>
            <View style={styles.ticketInfoCol}>
              <Text style={styles.ticketInfoLabel}>DURATION</Text>
              <Text style={styles.ticketInfoValue}>
                {travelData?.travelId?.period ||
                  dayjs(
                    travelData?.travelId?.endDate ||
                      travelData?.travelId?.expiryDate,
                  ).diff(
                    dayjs(
                      travelData?.travelId?.startDate ||
                        travelData?.travelId?.inceptionDate,
                    ),
                    'day',
                  ) + 1}{' '}
                Days
              </Text>
            </View>
            <View style={styles.ticketInfoCol}>
              <Text style={styles.ticketInfoLabel}>TRAVELLERS</Text>
              <Text style={styles.ticketInfoValue}>
                {travelData?.travelId?.travellersInfo?.length ||
                  travellers.length ||
                  1}{' '}
                {travelData?.travelId?.travellersInfo?.length > 1 ||
                travellers.length > 1
                  ? 'Persons'
                  : 'Person'}
              </Text>
            </View>
          </View>
        </View>

        {/* Traveller Section */}
        <View style={styles.travellerSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.sectionTitle}>Traveller Information</Text>
            </View>
            {travellers.length > 1 && (
              <View style={styles.travellerCountBadge}>
                <Text style={styles.travellerCountText}>
                  {activeTravellerIndex + 1} OF {travellers.length}
                </Text>
              </View>
            )}
          </View>

          <Carousel
            data={travellers}
            renderItem={({ item: person, index: idx }) => (
              <View key={person._id || idx} style={styles.travellerCard}>
                <View style={styles.cardHeaderSmall}>
                  <View style={styles.userIconBox}>
                    <Image
                      source={Icons.Account}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </View>
                  <View style={styles.userNameBox}>
                    <Text style={styles.travellerName}>
                      {`${person.firstName || ''} ${
                        person.lastName || person.name || ''
                      }`
                        .trim()
                        .toLowerCase()
                        .replace(/\b\w/g, c => c.toUpperCase()) || '-'}
                    </Text>
                    <Text style={styles.travellerRelation}>
                      {idx === 0
                        ? 'Primary Traveller'
                        : `Additional Traveller ${idx}`}
                    </Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>PASSPORT</Text>
                    <Text style={styles.detailValue}>
                      {person.passportNumber || '-'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDividerSmall} />

                <View style={styles.travellerDetailsGrid}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>DOB</Text>
                    <Text style={styles.detailValue}>
                      {dayjs(person.dateOfBirth).format('DD MMM YYYY')}
                    </Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>GENDER</Text>
                    <Text style={styles.detailValue}>
                      {person.gender || 'M'}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>NATIONALITY</Text>
                    <Text style={styles.detailValue}>
                      {person.nationality || '-'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            sliderWidth={screenWidth}
            itemWidth={screenWidth}
            onSnapToItem={index => setActiveTravellerIndex(index)}
            inactiveSlideScale={1}
            inactiveSlideOpacity={1}
          />

          {travellers.length > 1 && (
            <View style={styles.carouselIndicators}>
              {travellers.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.indicatorDot,
                    activeTravellerIndex === i && styles.activeIndicatorDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Feather
                name="check-circle"
                size={12}
                color={theme.colors.lableText}
              />
              <Text style={styles.verifiedTagText}>Verified</Text>
            </View>
          </View>

          <View style={styles.contactDetailsCard}>
            <View style={styles.contactDetailRow}>
              <View style={styles.contactIconCircle}>
                <Image source={Icons.Email} style={styles.contactMiniIcon} />
              </View>
              <View style={styles.contactInfoBox}>
                <Text style={styles.contactLabelSmall}>EMAIL ADDRESS</Text>
                <Text style={styles.contactValueMain}>
                  {primaryTraveller.contact?.email || userData?.email || '-'}
                </Text>
              </View>
            </View>

            <View style={styles.contactDetailRow}>
              <View style={styles.contactIconCircle}>
                <Image source={Icons.Support} style={styles.contactMiniIcon} />
              </View>
              <View style={styles.contactInfoBox}>
                <Text style={styles.contactLabelSmall}>PHONE NUMBER</Text>
                <Text style={styles.contactValueMain}>
                  +971{' '}
                  {primaryTraveller.contact?.mobileNumber ||
                    userData?.phone ||
                    '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insurance Details Section */}
        <View style={styles.coverageSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.sectionTitle}>Coverage Details</Text>
            </View>
          </View>

          <View style={styles.modernCoverageGrid}>
            {displayingCoverages.map((cov, idx) => (
              <View key={idx} style={styles.modernCoverageItem}>
                <Text style={styles.coverageLabelMini}>{cov.name}</Text>
                <Text style={styles.coverageValueBold}>{cov.amount}</Text>
              </View>
            ))}
          </View>

          {combinedCoverages.length > 4 && (
            <TouchableOpacity
              style={styles.modernExpandBtn}
              onPress={() => setShowAllCoverage(!showAllCoverage)}
              activeOpacity={0.7}
            >
              <Text style={styles.modernExpandText}>
                {showAllCoverage
                  ? 'View Less Benefits'
                  : `+ ${combinedCoverages.length - 4} More Benefits`}
              </Text>
              <Feather
                name={showAllCoverage ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Declaration and Checkout */}
        <View style={styles.declarationSection}>
          <TouchableOpacity
            style={styles.checkboxWrapper}
            onPress={() => setIsAccepted(!isAccepted)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isAccepted && styles.checkboxChecked]}
            >
              {isAccepted && (
                <Feather
                  name="check"
                  size={14}
                  color={theme.colors.backgroundColor}
                />
              )}
            </View>
            <Text style={styles.declarationDescription}>
              I confirm that the information provided is accurate. I have read
              and agree to the{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL(`${env.API_URL}/terms-of-use`)}
              >
                Terms & Conditions
              </Text>
              ,{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL(`${env.API_URL}/privacy-policy`)}
              >
                Privacy Policy
              </Text>
              , and the{' '}
              <Text style={styles.legalLink} onPress={handlePolicyWordingClick}>
                Insurance Policy Wording
              </Text>{' '}
              provided by {travelData?.companyId?.companyName || 'the insurer'}.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingButton
        title="Pay Now"
        onPress={handlePayNow}
        disabled={!isAccepted}
        isLoading={isPaying}
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
    },
    loadingText: {
      marginTop: verticalScale(20),
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(16),
      color: theme.colors.primary,
    },
    content: {
      flexGrow: 1,
      paddingBottom: verticalScale(120),
    },
    reviewHeader: {
      marginBottom: verticalScale(20),
      paddingHorizontal: verticalScale(20),
      paddingTop: verticalScale(20),
    },
    reviewTitle: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(20),
      color: theme.colors.text,
    },
    reviewSubtitle: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(13),
      color: theme.colors.description,
      marginTop: verticalScale(4),
    },
    // ── Ticket Styles ──
    ticketCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      marginBottom: verticalScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(20),
    },
    ticketHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: verticalScale(15),
    },
    ticketLogoBox: {
      width: verticalScale(50),
      height: verticalScale(50),
      borderRadius: verticalScale(10),
      backgroundColor: theme.colors.bgSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ticketLogo: {
      width: '80%',
      height: '80%',
      resizeMode: 'contain',
    },
    ticketMainInfo: {
      flex: 1,
      marginLeft: verticalScale(14),
    },
    ticketPlanName: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.text,
    },
    ticketInsurerName: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(12),
      color: theme.colors.description,
      marginTop: 2,
    },
    ticketBadge: {
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(8),
      alignSelf: 'flex-start',
    },
    ticketBadgeText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.lableText,
      letterSpacing: 0.5,
    },
    ticketRouteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: verticalScale(15),
      paddingBottom: verticalScale(10),
    },
    routeStation: {
      flex: 1,
    },
    routeCode: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(24),
      color: theme.colors.text,
    },
    routeCity: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(12),
      color: theme.colors.description,
      marginTop: 2,
    },
    routeVisual: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(5),
      paddingHorizontal: verticalScale(12),
    },
    routeLine: {
      height: 1,
      width: verticalScale(30),
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.lableSecondaryText,
    },
    ticketDividerWrap: {
      height: verticalScale(30),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1,
    },
    ticketCutoutLeft: {
      width: verticalScale(30),
      height: verticalScale(30),
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      marginLeft: -verticalScale(15),
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    ticketCutoutRight: {
      width: verticalScale(30),
      height: verticalScale(30),
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      marginRight: -verticalScale(15),
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
    },
    ticketDashedLine: {
      flex: 1,
      height: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      marginHorizontal: verticalScale(5),
    },
    ticketDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.text,
      padding: verticalScale(15),
      borderRadius: verticalScale(15),
      marginTop: -verticalScale(15),
    },
    ticketInfoCol: {},
    ticketInfoLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    ticketInfoValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(14),
      color: theme.colors.textSecondary,
    },
    ticketFooter: {
      marginTop: verticalScale(25),
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: verticalScale(15),
      borderStyle: 'dashed',
    },
    barcodeBox: {
      alignItems: 'center',
    },
    barcodeLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(9),
      color: theme.colors.text,
      marginTop: 5,
      letterSpacing: 2,
    },
    ticketPricingBox: {},
    ticketPricingRow: {
      justifyContent: 'space-between',
    },
    ticketPricingLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.description,
    },
    ticketPricingValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(11),
      color: theme.colors.text,
    },
    ticketPriceDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: verticalScale(8),
      borderStyle: 'dashed',
      opacity: 0.5,
    },
    ticketTotalLabel: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    ticketTotalValueBox: {
      alignItems: 'flex-end',
    },
    ticketTotalValue: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(15),
      color: theme.colors.primary,
    },
    ticketOldPrice: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      textDecorationLine: 'line-through',
      marginBottom: -2,
    },

    // ── Contact Section ──
    contactSection: {
      marginBottom: verticalScale(20),
    },
    verifiedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(6),
    },
    verifiedTagText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.lableText,
    },
    contactDetailsCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    contactDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ticketSummaryBar: {
      flexDirection: 'row',
      paddingHorizontal: verticalScale(15),
      paddingVertical: verticalScale(10),
      gap: verticalScale(20),
    },
    summaryItem: {},
    summaryLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    summaryValue: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(12),
      color: theme.colors.text,
    },
    summaryDivider: {
      width: 1,
      height: verticalScale(20),
      backgroundColor: theme.colors.border,
      marginHorizontal: verticalScale(10),
      opacity: 0.5,
    },
    summaryLabelTotal: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.text,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    summaryValueTotal: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(12),
      color: theme.colors.primary,
    },
    contactMiniIcon: {
      width: verticalScale(18),
      height: verticalScale(18),
      resizeMode: 'contain',
    },
    contactInfoBox: {
      marginLeft: verticalScale(12),
    },
    contactLabelSmall: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(9),
      color: theme.colors.description,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    contactValueMain: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(14),
      color: theme.colors.text,
    },
    hintBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
      backgroundColor: theme.colors.primary + '10',
      padding: verticalScale(12),
      borderRadius: verticalScale(10),
      marginTop: verticalScale(4),
    },
    hintBoxText: {
      flex: 1,
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.primary,
    },

    // ── Sections ──
    section: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(14),
      padding: verticalScale(16),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(14),
      marginHorizontal: verticalScale(20),
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(10),
    },
    travellerCountBadge: {
      backgroundColor: theme.colors.floorBgColor,
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(6),
    },
    travellerCountText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.primary,
    },
    travellerSection: {
      marginBottom: verticalScale(20),
    },
    travellerCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(20),
    },
    cardHeaderSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    userIconBox: {
      width: verticalScale(40),
      height: verticalScale(40),
      borderRadius: verticalScale(20),
      justifyContent: 'center',
      alignItems: 'center',
    },
    userNameBox: {
      marginLeft: verticalScale(12),
      flex: 1,
    },
    travellerName: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.text,
    },
    travellerRelation: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.description,
      marginTop: 2,
    },
    cardDividerSmall: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: verticalScale(12),
      opacity: 0.5,
    },
    travellerDetailsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailCol: {},
    detailLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(9),
      color: theme.colors.description,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    detailValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    carouselIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: verticalScale(6),
      marginTop: verticalScale(16),
    },
    indicatorDot: {
      width: verticalScale(6),
      height: verticalScale(6),
      borderRadius: verticalScale(3),
      backgroundColor: theme.colors.border,
    },
    activeIndicatorDot: {
      width: verticalScale(16),
      backgroundColor: theme.colors.primary,
    },
    sectionIconBox: {
      width: verticalScale(30),
      height: verticalScale(30),
      borderRadius: verticalScale(8),
      backgroundColor: theme.colors.floorBgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(18),
      color: theme.colors.text,
    },
    // ── Traveller ──
    travellerEntry: {
      marginBottom: verticalScale(10),
    },
    travellerLabelRow: {
      marginBottom: verticalScale(8),
    },
    entryTag: {
      backgroundColor: theme.colors.floorBgColor,
      alignSelf: 'flex-start',
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(4),
    },
    entryTagText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    dataGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: verticalScale(10),
    },
    dataField: {
      width: '50%',
    },
    dataLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginBottom: 2,
      letterSpacing: 0.3,
    },
    dataValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    entryDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginTop: verticalScale(12),
    },
    // ── Coverage ──
    coverageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(8),
    },
    coverageItem: {
      width: '48%',
      backgroundColor: theme.colors.floorBgColor,
      padding: verticalScale(10),
      borderRadius: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    // ── Coverage Section ──
    coverageSection: {
      marginBottom: verticalScale(20),
    },
    modernCoverageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(10),
      marginHorizontal: verticalScale(20),
    },
    modernCoverageItem: {
      width: (Dimensions.get('screen').width - verticalScale(60)) / 3,
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(12),
      padding: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(8),
    },
    coverageCheckCircle: {
      width: verticalScale(20),
      height: verticalScale(20),
      borderRadius: verticalScale(10),
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    coverageInfo: {
      flex: 1,
    },
    coverageLabelMini: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginBottom: 2,
    },
    coverageValueBold: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(12),
      color: theme.colors.text,
    },
    modernExpandBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: verticalScale(6),
      marginTop: verticalScale(16),
      backgroundColor: theme.colors.bgSecondary,
      paddingVertical: verticalScale(10),
      borderRadius: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      marginHorizontal: verticalScale(20),
    },
    modernExpandText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(12),
      color: theme.colors.primary,
    },
    // ── Voucher ──
    voucherCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(8),
      backgroundColor: theme.colors.floorBgColor,
      borderRadius: verticalScale(10),
      padding: verticalScale(4),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    voucherInput: {
      flex: 1,
      height: verticalScale(40),
      paddingHorizontal: verticalScale(12),
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    voucherInputDisabled: {
      color: theme.colors.description,
    },
    applyVoucherBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: verticalScale(16),
      paddingVertical: verticalScale(8),
      borderRadius: verticalScale(8),
      minWidth: verticalScale(65),
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyVoucherBtnDisabled: {
      backgroundColor: theme.colors.border,
    },
    removeVoucherBtn: {
      paddingHorizontal: verticalScale(12),
      height: verticalScale(40),
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactItem: {
      marginBottom: verticalScale(12),
    },
    contactLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginBottom: verticalScale(6),
      letterSpacing: 0.3,
    },
    contactValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: verticalScale(12),
      borderRadius: verticalScale(10),
      backgroundColor: theme.colors.floorBgColor,
    },
    contactValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    contactHint: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.description,
      lineHeight: fontScale(17),
    },
    // ── Declaration ──
    declarationSection: {
      marginHorizontal: verticalScale(20),
    },
    checkboxWrapper: {
      flexDirection: 'row',
      gap: verticalScale(10),
    },
    checkbox: {
      width: verticalScale(20),
      height: verticalScale(20),
      borderRadius: verticalScale(5),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    declarationDescription: {
      flex: 1,
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(12),
      lineHeight: fontScale(19),
      color: theme.colors.description,
    },
    legalLink: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    // ── Footer ──
    stickyFooter: {},
    priceBreakdown: {
      marginBottom: verticalScale(12),
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(3),
    },
    breakdownLabel: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(13),
      color: theme.colors.description,
    },
    breakdownValue: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    oldPrice: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(11),
      color: theme.colors.description,
      textDecorationLine: 'line-through',
      marginBottom: -2,
    },
    totalLabel: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.text,
    },
    totalValue: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(20),
      color: theme.colors.primary,
    },
    buyBtn: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(14),
      borderRadius: verticalScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      gap: verticalScale(10),
    },
    buyBtnDisabled: {
      backgroundColor: theme.colors.border,
    },
  });

export default BuyTravelPolicy;
