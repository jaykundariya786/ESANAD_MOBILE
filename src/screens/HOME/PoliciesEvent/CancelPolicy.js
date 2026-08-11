import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import Header from '@components/ui/Header';
import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import CustomButton from '@components/ui/CustomButton';
import FloatingButton from '@components/ui/FloatingButton';
import { useGetPolicyBySearch } from '@hooks/policy/useMotorPolicy';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Insurance } from '@assets/index';
import moment from 'moment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CancelPolicy = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const [policyNumber, setPolicyNumber] = useState('');
  const [policyDetails, setPolicyDetails] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isDocked, setIsDocked] = useState(false);

  const { mutate: searchPolicy, isLoading: searchLoading } =
    useGetPolicyBySearch();

  const handleSearch = () => {
    if (!policyNumber.trim()) return;

    setErrorVisible(false);
    setPolicyDetails(null);

    searchPolicy(policyNumber, {
      onSuccess: response => {
        if (response && response.data && response.data.data) {
          const resData = response.data.data;
          setPolicyDetails(resData);
          setIsDocked(true);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } else {
          setErrorVisible(true);
          setIsDocked(false);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      },
      onError: error => {
        console.error('Search Policy Error:', error);
        setErrorVisible(true);
        setIsDocked(false);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      },
    });
  };

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.policyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.accentBar} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );

  const formatDate = date => (date ? moment(date).format('DD/MM/YYYY') : '-');

  const renderPolicyContent = () => {
    if (!policyDetails) return null;

    return (
      <View style={styles.resultsWrapper}>
        <Section title="Policy Overview">
          <DetailRow
            label="Insurance Company"
            value={
              policyDetails.quoteId?.company?.companyName ||
              policyDetails.quote?.company?.companyName
            }
          />
          <DetailRow
            label="Policy Number"
            value={
              policyDetails.policyNumber ||
              policyDetails.companyResponse?.Data?.PolicyNo
            }
          />
          <DetailRow
            label="Insurance Type"
            value={
              policyDetails.quoteId?.insuranceType === 'thirdparty'
                ? 'Third Party'
                : 'Comprehensive'
            }
          />
          <DetailRow
            label="Expiry Date"
            value={formatDate(
              policyDetails.EXPIRYDATE || policyDetails.policyExpiryDate,
            )}
          />
        </Section>

        <Section title="Vehicle Details">
          <DetailRow
            label="Vehicle"
            value={`${policyDetails.carId?.make || ''} ${
              policyDetails.carId?.model || ''
            }`}
          />
          <DetailRow
            label="Plate Number"
            value={policyDetails.carId?.plateNumber}
          />
        </Section>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={Insurance.FetchPolicy}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <Header
            title="Motor Cancellation"
            onBack={() => navigation.goBack()}
            transparent
            noShadow
            text2
            textSecondarytyle={styles.headerBar}
          />

          <View style={styles.heroContent}>
            <View style={styles.secureBadge}>
              <Icon
                name="shield"
                size={scale(14)}
                color={theme.colors.highlight}
              />
              <Text style={styles.secureText}>Protected Request</Text>
            </View>
            <Text style={styles.heroTitle}>Cancel Policy</Text>
            <Text style={styles.heroSubtitle}>
              Securely initiate your insurance cancellation
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verification</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your policy number to verify your identity and start the
              cancellation process.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <FloatingLabelInput
              label="Policy Number"
              value={policyNumber}
              onChangeText={text => {
                setPolicyNumber(text);
                if (errorVisible || policyDetails) {
                  setErrorVisible(false);
                  setPolicyDetails(null);
                  setIsDocked(false);
                }
              }}
              style={styles.searchInput}
            />
            {!policyDetails && (
              <CustomButton
                title="Search Policy"
                onPress={handleSearch}
                disabled={!policyNumber.trim() || searchLoading}
                buttonStyle={styles.searchButton}
                loading={searchLoading}
              />
            )}
          </View>

          {errorVisible && (
            <View style={styles.securityNote}>
              <Icon name="search" size={scale(14)} color={theme.colors.red} />
              <Text style={styles.securityText}>
                We couldn't find a policy with this number. Please check and try
                again.
              </Text>
            </View>
          )}

          {policyDetails && renderPolicyContent()}
        </View>
      </ScrollView>

      {policyDetails && (
        <FloatingButton
          title="Proceed to Cancel"
          onPress={() => {
            navigation.navigate(SCREEN_NAMES.CANCELLATION_POLICY, {
              policyData: policyDetails,
            });
          }}
          isShowIcon
        />
      )}
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(100),
    },
    heroContainer: {
      height: SCREEN_WIDTH,
      width: SCREEN_WIDTH,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
    },
    heroContent: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: scale(24),
      right: scale(24),
    },
    secureBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '70',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: verticalScale(20),
      marginBottom: verticalScale(5),
      gap: scale(6),
    },
    secureText: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
    },
    headerBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    heroTitle: {
      color: theme.colors.textSecondary,
      fontSize: fontScale(30),
      fontFamily: 'Lato-Black',
      lineHeight: fontScale(36),
      marginBottom: verticalScale(8),
    },
    heroSubtitle: {
      color: theme.colors.textSecondary + '99',
      fontSize: fontScale(15),
      fontFamily: 'Lato-Regular',
    },
    body: {
      flex: 1,
      padding: verticalScale(20),
    },
    sectionHeader: {
      marginBottom: verticalScale(20),
      gap: verticalScale(4),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: fontScale(20),
      fontFamily: 'Lato-Bold',
    },
    sectionSubtitle: {
      color: theme.colors.description,
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      lineHeight: fontScale(20),
    },
    inputWrapper: {
      marginBottom: verticalScale(15),
      gap: verticalScale(12),
    },
    searchInput: {
      backgroundColor: theme.colors.bgSecondary,
    },
    searchButton: {
      height: verticalScale(52),
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      backgroundColor: theme.colors.bgSecondary,
      padding: scale(14),
      borderRadius: scale(12),
    },
    securityText: {
      flex: 1,
      fontSize: fontScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(16),
    },
    resultsWrapper: {
      gap: verticalScale(15),
      marginTop: verticalScale(10),
    },
    policyCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(12),
      backgroundColor: theme.colors.bgSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: scale(8),
    },
    accentBar: {
      width: scale(3),
      height: verticalScale(14),
      backgroundColor: theme.colors.primary,
      borderRadius: scale(2),
    },
    cardTitle: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardContent: {
      padding: scale(15),
      gap: verticalScale(10),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      flex: 1,
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(13),
      color: theme.colors.description,
    },
    detailValue: {
      flex: 1.5,
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
      textAlign: 'right',
    },
  });

export default CancelPolicy;
