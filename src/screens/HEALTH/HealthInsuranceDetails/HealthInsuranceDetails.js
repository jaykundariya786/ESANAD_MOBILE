import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Modal,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { formatNumber } from '@utils/formateNumber';
import { env } from '@config/index';
import { useThemeContext } from '@theme/ThemeProvider';
import { Images } from '@assets/index';
import { SCREEN_NAMES } from '@constants/screenNames';
import LinearGradient from 'react-native-linear-gradient';
import Header from '@components/ui/Header';
import { verticalScale } from '@constants/metrics';
import Products from '@assets/icons/Products';
import CustomStarRating from '@components/ui/CustomStarRating';
import CustomButton from '@components/ui/CustomButton';
import {
  useDownloadQuote,
  useGetHealthQuote,
  useGetProviderList,
} from '@hooks/HEALTH/healthFlow/useHealthFlow';
import Crown from '@assets/svg/Crown';
import { CustomAccordion } from '@components/ui/CustomAccordion';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Pdf from 'react-native-pdf';
import { getBottomMargin } from '@utils/paddingBottom';

const hasHTMLTags = str => {
  return /<[a-z][\s\S]*>/i.test(str);
};

const extractNumber = str => {
  if (!str) return null;
  const cleanedStr = str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const pcMatch = cleanedStr.match(/(\d+)\s*%/);
  if (pcMatch) return pcMatch[0];

  const aedMatch =
    cleanedStr.match(/(AED|aed)\s*([\d,]+)/i) ||
    cleanedStr.match(/([\d,]+)\s*(AED|aed)/i);
  if (aedMatch) {
    const amount = aedMatch[1].match(/[\d,]+/) ? aedMatch[1] : aedMatch[2];
    return `AED ${amount}`;
  }

  const dashMatch = cleanedStr.match(/(\d+)\s*\/-/);
  if (dashMatch) return `AED ${dashMatch[1]}`;

  const sessionMatch = cleanedStr.match(/(\d+)\s*(sessions?|days?|visits?)/i);
  if (sessionMatch) return sessionMatch[0];

  const justNum = cleanedStr.match(/^\d+$/);
  if (justNum) return justNum[0];

  return null;
};

const buildTabsConfig = quoteData => {
  const allCovers = [
    ...(quoteData?.extraCovers || []),
    ...(quoteData?.includedCovers || []),
  ];

  if (!allCovers.length) {
    return [];
  }

  const enabledCovers = allCovers.filter(cover => cover.isEnabled !== false);

  const policyDetails = [];
  const coPaymentDetails = [];

  enabledCovers.forEach(cover => {
    const title = cover?.benefit?.name;
    if (!title) return;

    let description = '';
    let isHTML = false;
    const limitStr =
      cover.limitAmount > 0 ? `AED ${formatNumber(cover.limitAmount)}` : '';

    // Co-Payment covers
    if (cover.coPay?.coPayValue !== undefined || cover.coPay?.description) {
      description = cover.coPay?.description || '';
      isHTML = hasHTMLTags(description);

      if (cover.coPay.coPayValue !== undefined) {
        const amount =
          cover.coPay.coPayType === 'percentage'
            ? `${cover.coPay.coPayValue}%`
            : `AED ${cover.coPay.coPayValue}`;

        const coPayInfo = cover.coPay.coPayLimit
          ? `Co-pay: ${amount}, Limit: AED ${formatNumber(
              cover.coPay.coPayLimit,
            )}`
          : `Co-pay: ${amount}`;

        description = description ? `${description} (${coPayInfo})` : coPayInfo;
      }

      if (limitStr && !description.includes(limitStr)) {
        description += ` | Coverage Limit: ${limitStr}`;
      }

      coPaymentDetails.push({ title, description, isHTML });
    }
    // Policy detail covers
    else if (cover.detail?.description) {
      description = cover.detail.description;
      isHTML = hasHTMLTags(description);

      if (limitStr) {
        description += ` (Limit: ${limitStr})`;
      }

      policyDetails.push({ title, description, isHTML });
    }
    // Value-based covers
    else if (cover.value) {
      description = cover.value;
      isHTML = hasHTMLTags(description);

      if (limitStr) {
        description += ` (Limit: ${limitStr})`;
      }

      policyDetails.push({ title, description, isHTML });
    }
    // Limit-only covers
    else if (limitStr) {
      description = `Limit: ${limitStr}`;
      policyDetails.push({ title, description, isHTML: false });
    }
  });

  const tabs = [];

  if (policyDetails.length > 0) {
    tabs.push({
      label: 'Policy Details',
      chips: policyDetails.map(item => item.title),
      sections: policyDetails,
    });
  }

  if (coPaymentDetails.length > 0) {
    tabs.push({
      label: 'Co-Payment',
      chips: coPaymentDetails.map(item => item.title),
      sections: coPaymentDetails,
    });
  }

  if (quoteData.network?._id) {
    const cityNames = Array.isArray(quoteData.city?.cityName)
      ? quoteData.city.cityName
      : [];

    tabs.push({
      label: 'Network List',
      chips: cityNames,
      sections: [],
    });
  }

  return tabs;
};

const HealthInsuranceDetails = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const { policy_id } = route?.params || {};

  const { data: getQuoteDetails = {} } = useGetHealthQuote({
    reqId: policy_id,
  });

  const allCovers = useMemo(
    () => [
      ...(getQuoteDetails?.extraCovers || []),
      ...(getQuoteDetails?.includedCovers || []),
    ],
    [getQuoteDetails],
  );

  // Medical Cover / Annual Limit (matches HealthPlan logic)
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
      if (
        !String(extValue).toLowerCase().includes('aed') &&
        !String(extValue).includes('%')
      ) {
        return `AED ${extValue}`;
      }
      return String(extValue);
    }

    return 'As per plan';
  }, [allCovers]);

  // Pharmacy (matches HealthPlan logic - searches 'prescribed drugs')
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

  // Diagnostics Co-pay (matches HealthPlan logic)
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

  const { mutate: providerList } = useGetProviderList();

  const { mutate: downloadQuote } = useDownloadQuote();

  console.log(' providerList', providerList);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState(null);
  const [NetworkList, setNetworkList] = useState(null);
  const [tab, setTab] = useState('Policy Details');

  const tabsConfig = useMemo(() => {
    return buildTabsConfig(getQuoteDetails) || [];
  }, [getQuoteDetails]);

  const htmlBaseStyle = {
    color: theme.colors.textTertiary,
    fontSize: verticalScale(14),
    fontFamily: 'Lato-Regular',
    lineHeight: verticalScale(20),
  };

  useEffect(() => {
    if (tabsConfig.length === 0) return;

    const firstTab = tabsConfig[0];
    if (firstTab) {
      setTab(firstTab.label);
    }
  }, [tabsConfig]);

  const handleBuyPolicy = () => {
    navigation.navigate(SCREEN_NAMES.HEALTH_POLICY_BUY_SCREEN, {
      policy_id: getQuoteDetails?._id,
    });
  };

  const activeTabData = tabsConfig.find(t => t.label === tab);
  const sectionsToRender = activeTabData?.sections || [];

  const handleViewQuotation = useCallback(() => {
    if (quoteUrl !== null) {
      setIsModalVisible(true);
      return;
    }

    downloadQuote(
      { reqId: policy_id },
      {
        onSuccess: res => {
          setQuoteUrl(env.API_URL + res?.data?.data?.link);
          setIsModalVisible(true);
        },
        onError: error => {
          console.error('Quote download error:', error);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Insurance Detail" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.policyCard}>
          <View style={styles.companyHeader}>
            <Image
              source={{
                uri: `${env.API_URL}/${getQuoteDetails?.company?.logoImg?.path}`,
              }}
              style={styles.companyLogo}
            />

            <View style={styles.companyInfo}>
              <View style={styles.companyNameRow}>
                <Text style={styles.companyName}>
                  {getQuoteDetails?.company?.companyName}
                </Text>
                {getQuoteDetails?.plan?.isBasic ? (
                  <Image
                    source={Images.shield}
                    resizeMode="contain"
                    style={styles.shieldIcon}
                  />
                ) : (
                  <Crown />
                )}
                <Text
                  onPress={() => setTab('Network List')}
                  style={styles.hospitalListText}
                >
                  Hospitals List {'>'}
                </Text>
              </View>

              <View style={styles.badgeRow}>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>
                    {getQuoteDetails?.plan?.planName}
                  </Text>
                </View>

                <View style={styles.maternityBadge}>
                  <Image source={Images.shield} style={styles.maternityIcon} />
                  <Text style={styles.maternityText}>
                    Covers Maternity Benefits
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={[styles.detailColumn, styles.detailBorder]}>
              <Text style={styles.detailLabel}>Pharmacy Limit</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {finalPharmacy}
              </Text>
            </View>

            <View style={[styles.detailColumn, styles.detailBorder]}>
              <Text style={styles.detailLabel}>Cover Amount</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {finalMedicalCover}
              </Text>
            </View>

            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Co-pay: Diagnosis</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {finalDiagnosis}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={handleViewQuotation}
              activeOpacity={0.8}
              style={styles.actionButton}
            >
              <Products size={verticalScale(18)} />
              <Text style={styles.actionButtonText}>View Quotation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Client Rating:</Text>
              <CustomStarRating
                rating={getQuoteDetails?.company?.googleRating}
                size={verticalScale(16)}
                color={theme.colors.star}
              />
              <Text style={styles.ratingValue}>
                ({getQuoteDetails?.company?.googleRating})
              </Text>
            </View>
            <View style={styles.discountContainer}>
              <Image source={Images.off} style={styles.discountIcon} />
              <Text style={styles.discountText}>Inc. 5% off</Text>
            </View>
          </View>
        </View>

        {tabsConfig.length > 0 && (
          <View style={styles.tabsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsList}
              data={tabsConfig}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.label !== 'Network List') {
                      setTab(item.label);
                    } else {
                      if (NetworkList !== null) {
                        setTab(item.label);
                      } else {
                        providerList(
                          {
                            networkId: getQuoteDetails?.network?._id,
                          },
                          {
                            onSuccess: res => {
                              setNetworkList(res?.data?.data);
                              setTab(item.label);
                            },
                          },
                        );
                      }
                    }
                  }}
                  style={[styles.tab, tab === item.label && styles.activeTab]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab === item.label && styles.activeTabText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}

        {tab === 'Policy Details' && sectionsToRender.length > 0 && (
          <FlatList
            data={sectionsToRender}
            contentContainerStyle={styles.accordionContainer}
            renderItem={({ item, index }) => {
              return (
                <CustomAccordion
                  title={item?.title}
                  containerStyle={[
                    styles.accordionItem,
                    index === sectionsToRender.length - 1 &&
                      styles.accordionLastItem,
                  ]}
                >
                  <View style={styles.accordionContent}>
                    {item?.isHTML ? (
                      <RenderHTML
                        contentWidth={width - verticalScale(60)}
                        source={{
                          html:
                            item?.description ||
                            '<p>Details will be shared soon.</p>',
                        }}
                        baseStyle={htmlBaseStyle}
                      />
                    ) : (
                      <Text style={styles.accordionText}>
                        {item?.description || 'Details will be shared soon.'}
                      </Text>
                    )}
                  </View>
                </CustomAccordion>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        )}

        {tab === 'Co-Payment' && sectionsToRender.length > 0 && (
          <FlatList
            data={sectionsToRender}
            contentContainerStyle={styles.accordionContainer}
            renderItem={({ item, index }) => {
              return (
                <CustomAccordion
                  title={item?.title}
                  containerStyle={[
                    styles.accordionItem,
                    index === sectionsToRender.length - 1 &&
                      styles.accordionLastItem,
                  ]}
                >
                  <View style={styles.accordionContent}>
                    {item?.isHTML ? (
                      <RenderHTML
                        contentWidth={width - verticalScale(60)}
                        source={{
                          html:
                            item?.description ||
                            '<p>Details will be shared soon.</p>',
                        }}
                        baseStyle={htmlBaseStyle}
                      />
                    ) : (
                      <Text style={styles.accordionText}>
                        {item?.description || 'Details will be shared soon.'}
                      </Text>
                    )}
                  </View>
                </CustomAccordion>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        )}

        {tab === 'Network List' && (
          <FlatList
            data={NetworkList?.providers}
            contentContainerStyle={styles.accordionContainer}
            ListEmptyComponent={
              <Text style={styles.emptyStateText}>
                Network information will appear here once available.
              </Text>
            }
            renderItem={({ item, index }) => (
              <CustomAccordion
                title={item?.providerName}
                containerStyle={[
                  styles.accordionItem,
                  index === (NetworkList?.providers?.length || 0) - 1 &&
                    styles.accordionLastItem,
                ]}
              >
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionText}>
                    {item?.providerAddresss || 'Details will be shared soon.'}
                  </Text>
                </View>
              </CustomAccordion>
            )}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <CustomButton
        title={
          getQuoteDetails?.isReferral
            ? 'Contact us for price'
            : getQuoteDetails?.isPremiumRequestUpon
            ? 'Price upon request'
            : `AED ${formatNumber(getQuoteDetails?.price)} Yearly`
        }
        onPress={handleBuyPolicy}
        buttonStyle={styles.buyButton}
      />
      <Modal
        animationType="slide"
        visible={isModalVisible}
        presentationStyle="formSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderSpacer} />
            <Text style={styles.modalTitle}>Quote</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsModalVisible(false)}
            >
              <Icon name="close" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <Pdf
            trustAllCerts={false}
            source={{ uri: quoteUrl, cache: true }}
            onLoadComplete={numberOfPages => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onError={error => {
              console.log('error --->', error);
            }}
            style={styles.pdf}
          />
        </View>
      </Modal>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(10),
    },

    // ── Policy Card ──
    policyCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(12),
      padding: verticalScale(12),
      gap: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(16),
      marginTop: verticalScale(12),
    },
    companyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    companyLogo: {
      width: verticalScale(48),
      height: verticalScale(40),
      marginRight: verticalScale(10),
      resizeMode: 'contain',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: verticalScale(6),
    },
    companyInfo: {
      gap: verticalScale(4),
      flex: 1,
    },
    companyNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(6),
    },
    companyName: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    shieldIcon: {
      width: verticalScale(16),
      height: verticalScale(16),
    },
    hospitalListText: {
      fontSize: verticalScale(11),
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    badgeRow: {
      flexDirection: 'row',
      gap: verticalScale(4),
      alignItems: 'center',
    },
    planBadge: {
      backgroundColor: theme.colors.highlight + '30',
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(4),
    },
    planBadgeText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    maternityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(3),
      backgroundColor: theme.colors.floorBgColor,
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(4),
    },
    maternityIcon: {
      width: verticalScale(10),
      height: verticalScale(10),
    },
    maternityText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },

    // ── Details Row ──
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(8),
      paddingVertical: verticalScale(8),
    },
    detailColumn: {
      flex: 1,
      alignItems: 'center',
      gap: verticalScale(2),
    },
    detailBorder: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    detailLabel: {
      fontSize: verticalScale(10),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
    },
    detailValue: {
      fontSize: verticalScale(12),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },

    // ── Divider ──
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },

    // ── Action Button ──
    actionButtonsRow: {
      flexDirection: 'row',
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      gap: verticalScale(6),
      alignItems: 'center',
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: verticalScale(32),
      justifyContent: 'center',
      borderRadius: verticalScale(8),
    },
    actionButtonText: {
      color: theme.colors.text,
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Bold',
    },

    // ── Rating Row ──
    ratingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ratingContainer: {
      flexDirection: 'row',
      gap: verticalScale(4),
      alignItems: 'center',
    },
    ratingLabel: {
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    ratingValue: {
      fontFamily: 'Lato-Bold',
      fontSize: verticalScale(12),
      color: theme.colors.text,
    },
    discountContainer: {
      flexDirection: 'row',
      gap: verticalScale(3),
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: verticalScale(8),
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(12),
    },
    discountIcon: {
      width: verticalScale(12),
      height: verticalScale(12),
    },
    discountText: {
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },

    // ── Tabs ──
    tabsContainer: {
      height: verticalScale(40),
      marginTop: verticalScale(8),
      backgroundColor: theme.colors.backgroundColor,
    },
    tabsList: {
      flexGrow: 1,
      paddingHorizontal: verticalScale(16),
      gap: verticalScale(8),
      alignItems: 'center',
    },
    tab: {
      paddingHorizontal: verticalScale(16),
      paddingVertical: verticalScale(8),
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      fontSize: verticalScale(12),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    activeTabText: {
      color: theme.colors.textSecondary,
    },

    // ── Accordion ──
    accordionContainer: {
      backgroundColor: theme.colors.backgroundColor,
      marginHorizontal: verticalScale(16),
      marginTop: verticalScale(8),
      borderRadius: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    accordionItem: {
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    accordionLastItem: {
      borderBottomWidth: 0,
    },
    accordionContent: {
      marginLeft: verticalScale(16),
      marginBottom: verticalScale(12),
      paddingRight: verticalScale(10),
    },
    accordionText: {
      fontSize: verticalScale(12),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      lineHeight: verticalScale(18),
    },
    emptyStateText: {
      fontSize: verticalScale(12),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
      paddingVertical: verticalScale(16),
    },

    // ── Buy Button ──
    buyButton: {
      height: verticalScale(48),
      width: Dimensions.get('screen').width - verticalScale(32),
      alignSelf: 'center',
      marginTop: verticalScale(10),
      marginBottom: getBottomMargin(),
    },

    // ── Modal ──
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      paddingVertical: verticalScale(10),
      paddingHorizontal: verticalScale(16),
    },
    modalHeaderSpacer: {
      width: verticalScale(32),
    },
    modalTitle: {
      fontSize: verticalScale(16),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    modalCloseBtn: {
      padding: verticalScale(6),
    },
    pdf: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.backgroundColor,
    },
  });

export default HealthInsuranceDetails;
