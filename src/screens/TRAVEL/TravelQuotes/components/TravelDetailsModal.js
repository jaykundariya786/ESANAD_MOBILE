import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { fontScale, verticalScale } from '@constants/metrics';
import { env } from '@config/index';
import { useThemeContext } from '@theme/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TravelDetailsModal = ({
  visible,
  onClose,
  quote,
  onBuyNow,
  onDownload,
  isDownloading,
}) => {
  if (!quote) return null;
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const planName = quote?.planName || quote?.planId?.name || 'Premier Plan';
  const companyName = quote?.companyId?.companyName || '-';
  const logoPath = quote?.companyId?.logoImg?.path || quote?.logoImg?.path;
  const logoUrl = logoPath ? `${env.API_URL}${logoPath}` : null;
  const price = quote?.price || 0;
  const roundedAmount = Math.round(price);

  const seed = quote?._id
    ? quote._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const randomPercent = 15 + (seed % 11);
  const strikethroughPrice = Math.round(
    roundedAmount * (1 + randomPercent / 100),
  );
  const savingsPercent = Math.round(
    ((strikethroughPrice - roundedAmount) / strikethroughPrice) * 100,
  );

  const benefitsArray = useMemo(() => {
    const rawBenefits =
      quote?.benefits ||
      quote?.planId?.benefits ||
      quote?.issueInfo?.benefits ||
      quote?.response?.planContent ||
      quote?.response?.covers ||
      [];
    return Array.isArray(rawBenefits) ? rawBenefits : [];
  }, [quote]);

  const coverageRows = useMemo(() => {
    return benefitsArray
      .map(row => ({
        label:
          row.cover ||
          row.name ||
          row.benefit?.name ||
          row.description ||
          'Coverage',
        value:
          row.amount || row.value || row.benefit?.limit || row.limit || '-',
      }))
      .slice(0, 8);
  }, [benefitsArray]);

  const isMostPopular = quote?.isMostPopular;
  const safetyScore = quote?.safetyScore || 85;

  const getScoreInfo = score => {
    if (score >= 90)
      return { color: theme.colors.lableText, label: 'Excellent' };
    if (score >= 80)
      return {
        color: theme.colors.lableSecondaryText,
        label: 'Great',
      };
    if (score >= 70)
      return { color: theme.colors.lableThirdText, label: 'Good' };
    return { color: theme.colors.red, label: 'Fair' };
  };
  const scoreInfo = getScoreInfo(safetyScore);

  const handlePolicyWording = () => {
    const name = companyName.toLowerCase();
    const pName = planName.toLowerCase();

    if (name.includes('watania')) {
      Linking.openURL(
        'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776160887130-TPTravel-Assurance_Inbound_AE_WT.pdf',
      );
    } else if (name.includes('qic')) {
      if (pName.includes('outbound')) {
        Linking.openURL(
          'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776174302303-Outbound_qic_axa_policy_wording_en_ar_2025-12-01.pdf',
        );
      } else if (pName.includes('inbound')) {
        Linking.openURL(
          'https://esanad-doc-mgt-prod-dr.s3.amazonaws.com/Policy_wordings/1776174304373-Inbound_qic_policy_wording_en_ar_2025-12-01-%281%29.pdf',
        );
      }
    }
  };

  const showPolicyWording =
    companyName.toLowerCase().includes('watania') ||
    companyName.toLowerCase().includes('qic');

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="chevron-down" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.mainCard}>
            <View style={styles.logoRow}>
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {companyName.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.planInfo}>
                <Text style={styles.planNameText}>{planName}</Text>
                <Text style={styles.companyNameText}>{companyName}</Text>
              </View>
            </View>

            <View style={styles.mainInfoBox}>
              <View style={styles.infoTopRow}>
                <View style={styles.infoBoxItem}>
                  <Text style={styles.infoBoxLabel}>Safety Score</Text>
                  <View style={styles.scoreValueWrapper}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: scoreInfo.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.scoreValueText,
                        { color: scoreInfo.color },
                      ]}
                    >
                      {safetyScore}%
                    </Text>
                    <Text style={styles.scoreLabelText}>{scoreInfo.label}</Text>
                  </View>
                </View>

                <View style={styles.verticalSeparator} />

                <View style={styles.infoBoxItem}>
                  <Text style={styles.infoBoxLabel}>Plan Type</Text>
                  <View style={styles.typeBadgeWrapper}>
                    <Icon
                      name={isMostPopular ? 'star' : 'shield'}
                      size={12}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.typeLabelText}>
                      {isMostPopular
                        ? 'Best Seller'
                        : safetyScore >= 88
                        ? 'Strong Cover'
                        : 'Balanced'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.priceBottomSection}>
                <View style={styles.priceLeftPart}>
                  <Text style={styles.priceSecondaryLabel}>Total Premium</Text>
                  <View style={styles.mainPriceWrapper}>
                    <Text style={styles.aedText}>AED</Text>
                    <Text style={styles.mainPriceText}>{roundedAmount}</Text>
                  </View>
                </View>
                <View style={styles.priceRightPart}>
                  <Text style={styles.strikePriceText}>
                    AED {strikethroughPrice}
                  </Text>
                  <View style={styles.savingsBoxTag}>
                    <Text style={styles.savingsTagText}>
                      Save {savingsPercent}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Key Coverage</Text>
          </View>

          <View style={styles.coverageCard}>
            {coverageRows.map((row, index) => (
              <View key={index} style={styles.coverageItem}>
                <View style={styles.coverageLabelContainer}>
                  <View style={styles.dot} />
                  <Text style={styles.coverageLabel}>{row.label}</Text>
                </View>
                <Text style={styles.coverageValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Plan Benefits</Text>
            <View style={styles.benefitCountBadge}>
              <Text style={styles.benefitCountText}>
                {benefitsArray.length} Items
              </Text>
            </View>
          </View>

          <View style={styles.benefitsGridContainer}>
            {benefitsArray.length > 0 ? (
              benefitsArray.map((item, index) => (
                <View key={index} style={styles.benefitItemGrid}>
                  <View style={styles.benefitTextWrapper}>
                    <Text style={styles.benefitTextGrid}>
                      {item.cover ||
                        item.name ||
                        item.benefit?.name ||
                        item.description}
                    </Text>
                    {item.amount || item.value || item.benefit?.limit ? (
                      <Text style={styles.benefitLimitGrid}>
                        up to {item.amount || item.value || item.benefit?.limit}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="info" size={24} color={theme.colors.description} />
                <Text style={styles.noBenefits}>
                  No specific benefits details available.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footerContainer}>
          <View style={styles.secondaryActionsBox}>
            <TouchableOpacity
              style={styles.squareActionBtn}
              onPress={onDownload}
              disabled={isDownloading}
              activeOpacity={0.7}
            >
              {isDownloading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <MIcon
                  name="description"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>

            {showPolicyWording && (
              <TouchableOpacity
                style={styles.squareActionBtn}
                onPress={handlePolicyWording}
                activeOpacity={0.7}
              >
                <MIcon name="policy" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryCheckoutBtn}
            onPress={onBuyNow}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.linear1, theme.colors.linear2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Text style={styles.checkoutText}>Buy Now</Text>
              <Icon
                name="arrow-right"
                size={18}
                color={theme.colors.textSecondary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    handle: {
      width: 40,
      height: verticalScale(4),
      backgroundColor: theme.colors.border,
      borderRadius: verticalScale(2),
      alignSelf: 'center',
      marginTop: verticalScale(10),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: verticalScale(15),
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    closeBtn: {
      width: 40,
      height: verticalScale(40),
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(17),
      color: theme.colors.text,
    },
    scroll: {
      flexGrow: 1,
      padding: verticalScale(20),
      paddingBottom: verticalScale(80),
      gap: verticalScale(15),
    },
    mainCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(10),
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(10),
    },
    logo: {
      width: 60,
      height: verticalScale(60),
      borderRadius: verticalScale(12),
      backgroundColor: theme.colors.bgSecondary,
    },
    logoPlaceholder: {
      width: 60,
      height: verticalScale(60),
      borderRadius: verticalScale(12),
      backgroundColor: theme.colors.bgSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoPlaceholderText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(24),
      color: theme.colors.primary,
    },
    planInfo: {
      flex: 1,
    },
    planNameText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(20),
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    companyNameText: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(14),
      color: theme.colors.description,
    },
    mainInfoBox: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: verticalScale(10),
      overflow: 'hidden',
    },
    infoTopRow: {
      flexDirection: 'row',
      padding: verticalScale(12),
      alignItems: 'center',
    },
    infoBoxItem: {
      flex: 1,
      alignItems: 'center',
    },
    infoBoxLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: verticalScale(4),
    },
    scoreValueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 6,
      height: verticalScale(6),
      borderRadius: verticalScale(3),
      marginRight: 6,
    },
    scoreValueText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(15),
    },
    scoreLabelText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginLeft: 4,
    },
    typeBadgeWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.infoBanner[0],
      paddingHorizontal: 8,
      paddingVertical: verticalScale(3),
      borderRadius: verticalScale(6),
    },
    typeLabelText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(11),
      color: theme.colors.primary,
      marginLeft: 4,
    },
    verticalSeparator: {
      width: 1,
      height: verticalScale(24),
      backgroundColor: theme.colors.border,
    },
    horizontalSeparator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    priceBottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: verticalScale(12),
      backgroundColor: theme.colors.bgSecondary,
    },
    priceLeftPart: {
      flex: 1,
    },
    priceSecondaryLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginBottom: verticalScale(1),
    },
    mainPriceWrapper: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    aedText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(11),
      color: theme.colors.primary,
      marginRight: 3,
    },
    mainPriceText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(24),
      color: theme.colors.text,
    },
    priceRightPart: {
      alignItems: 'flex-end',
    },
    strikePriceText: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(14),
      color: theme.colors.text,
      textDecorationLine: 'line-through',
    },
    savingsBoxTag: {
      backgroundColor: theme.colors.lableBg,
      paddingHorizontal: 8,
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(10),
      marginTop: verticalScale(2),
    },
    savingsTagText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(14),
      color: theme.colors.lableText,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(18),
      color: theme.colors.text,
    },
    benefitCountBadge: {
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: 8,
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(6),
    },
    benefitCountText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(11),
      color: theme.colors.description,
    },
    coverageCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: verticalScale(15),
      gap: verticalScale(8),
    },
    coverageItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    coverageLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    dot: {
      width: 4,
      height: verticalScale(4),
      borderRadius: verticalScale(2),
      backgroundColor: theme.colors.border,
      marginRight: 10,
    },
    coverageLabel: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(14),
      color: theme.colors.description,
      width: '80%',
    },
    coverageValue: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(14),
      color: theme.colors.text,
      textAlign: 'right',
    },
    benefitsGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      borderColor: theme.colors.bgSecondary,
      justifyContent: 'space-between',
      gap: verticalScale(10),
    },
    benefitItemGrid: {
      width: (Dimensions.get('screen').width - verticalScale(60)) / 3,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: verticalScale(10),
      borderRadius: verticalScale(10),
    },
    checkIconWrapper: {
      width: 18,
      height: verticalScale(18),
      borderRadius: verticalScale(9),
      backgroundColor: theme.colors.infoBanner[0],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(2),
    },
    benefitTextWrapper: {
      flex: 1,
    },
    benefitTextGrid: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(12),
      color: theme.colors.text,
      lineHeight: verticalScale(16),
    },
    benefitLimitGrid: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(10),
      color: theme.colors.description,
      marginTop: verticalScale(2),
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: verticalScale(40),
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: verticalScale(20),
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: '100%',
    },
    noBenefits: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(14),
      color: theme.colors.description,
      marginTop: verticalScale(8),
    },
    footerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: verticalScale(16),
      paddingBottom:
        Platform.OS === 'ios' ? verticalScale(34) : verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: theme.colors.bgSecondary,
      gap: 12,
    },
    secondaryActionsBox: {
      flexDirection: 'row',
      gap: 10,
    },
    squareActionBtn: {
      width: 48,
      height: verticalScale(48),
      borderRadius: verticalScale(14),
      backgroundColor: theme.colors.bgSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryCheckoutBtn: {
      flex: 1,
      height: verticalScale(48),
    },
    gradientBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: verticalScale(14),
      gap: 8,
    },
    checkoutText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.textSecondary,
    },
  });

export default TravelDetailsModal;
