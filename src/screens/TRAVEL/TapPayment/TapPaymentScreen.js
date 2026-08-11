import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, fontScale } from '@constants/metrics';
import { Icons } from '@assets';
import Header from '@components/ui/Header';
import CustomButton from '@components/ui/CustomButton';
import {
  useGetTapPaymentDetails,
  useProcessTapPayment,
} from '@hooks/travelflow/useTravelFlow';
import { SCREEN_NAMES } from '@constants/screenNames';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import TapCardView, {
  TapCurrencyCode,
  Scope,
  Locale,
  Theme,
  Edges,
  Direction,
  ColorStyle,
  Purpose,
  SupportedSchemes,
  SupportedFundSource,
  SupportedPaymentAuthentications,
} from 'card-react-native';

const { width } = Dimensions.get('window');

const TapPaymentScreen = ({ navigation, route }) => {
  const { quoteId, productType = 'travel' } = route.params || {};
  const { theme } = useThemeContext();
  const styles = style(theme);
  const cardSdkRef = useRef(null);

  const [isCardVisible, setIsCardVisible] = useState(false);
  const paymentLink = `https://dev.esanad.com/tap-payment?quoteId=${quoteId}&productType=${productType}`;

  const { data: responseData, isLoading: isDetailsLoading } =
    useGetTapPaymentDetails(quoteId);
  const quoteDetails = responseData?.quote || responseData;
  const processPayment = useProcessTapPayment();

  const companyConfig = {
    motor: {
      logo: 'https://esanad.com/assets/images/raklogo.png',
      companyName: 'RAK Insurance',
      merchantId: '67675307',
      primaryColor: theme.colors.primary,
    },
    travel: {
      logo: 'https://esanad.com/assets/images/watanialogo.png',
      companyName: 'Watania Travel Insurance',
      merchantId: '67964676',
      primaryColor: theme.colors.primary,
    },
  };

  const config = companyConfig[productType] || companyConfig.motor;

  const totalAmount = useMemo(() => {
    if (!quoteDetails) return 0;
    if (productType === 'travel') {
      return (
        quoteDetails.totalPrice ||
        quoteDetails.price ||
        quoteDetails.amount ||
        0
      );
    }
    return quoteDetails.totalPrice || quoteDetails.amount || 0;
  }, [quoteDetails, productType]);

  const customerData = useMemo(() => {
    const user = quoteDetails?.user || quoteDetails?.userId || {};
    const nameParts = (user?.fullName || '').split(' ');
    return {
      first: nameParts[0] || '',
      last: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || user?.mobileNumber || '1000000000',
    };
  }, [quoteDetails]);

  const tapConfig = useMemo(() => {
    return {
      operator: {
        publicKey: 'pk_test_h3qpz2GcA8S60MsZ75Wmulyi',
      },
      merchant: {
        id: config.merchantId,
      },
      order: {
        amount: totalAmount,
        currency: TapCurrencyCode.AED,
        description: `Insurance Payment for ${quoteId}`,
        reference: quoteId,
      },
      transaction: {
        id: '',
        metadata: {},
      },
      customer: {
        id: '',
        name: [
          {
            lang: Locale.en,
            first: customerData.first,
            last: customerData.last,
            middle: '',
          },
        ],
        nameOnCard: `${(customerData.first + ' ' + customerData.last).trim()}`,
        editable: true,
        contact: {
          email: customerData.email,
          phone: {
            countryCode: '971',
            number: customerData.phone.replace(/[^0-9]/g, '').slice(-9),
          },
        },
      },
      acceptance: {
        supportedSchemes: [
          SupportedSchemes.VISA,
          SupportedSchemes.MASTERCARD,
          SupportedSchemes.AMEX,
          SupportedSchemes.MADA,
        ],
        supportedFundSource: [
          SupportedFundSource.Credit,
          SupportedFundSource.Debit,
        ],
        supportedPaymentAuthentications: [
          SupportedPaymentAuthentications.secured,
        ],
      },
      fieldsVisibility: {
        card: { cardHolder: true, cvv: true },
      },
      interface: {
        locale: Locale.en,
        theme: theme.dark ? Theme.dark : Theme.light,
        edges: Edges.curved,
        cardDirection: Direction.ltr,
        colorStyle: ColorStyle.colored,
        powered: true,
        loader: true,
      },
      features: {
        alternativeCardInputs: {
          cardNFC: true,
          cardScanner: true,
        },
        customerCards: {
          saveCard: true,
          autoSaveCard: true,
        },
        acceptanceBadge: true,
      },
    };
  }, [config.merchantId, totalAmount, quoteId, customerData, theme.dark]);

  const onTokenSuccess = tokenData => {
    console.log('Tap Card Token Success:', tokenData);
    handleProcessPayment(tokenData);
  };

  const onSdkError = error => {
    console.error('Tap Card SDK Error:', error);
    Alert.alert(
      'Payment Error',
      typeof error === 'string' ? error : 'Payment initiation failed',
    );
  };

  const handleProcessPayment = data => {
    // Ensure data is an object (it might come as a string from the native bridge)
    let tokenData = data;
    if (typeof data === 'string') {
      try {
        tokenData = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse token data:', e);
      }
    }

    console.log('Processed Token Data:', tokenData);

    const paymentData = {
      id: tokenData?.id,
      card: {
        name: tokenData?.card?.name || '',
      },
      amount: totalAmount,
      productType: productType,
    };

    const effectiveQuoteId = quoteId || quoteDetails?._id || quoteDetails?.id;

    if (!effectiveQuoteId || effectiveQuoteId === 'undefined') {
      console.error('Missing quoteId:', { quoteId, quoteDetails });
      Alert.alert(
        'Error',
        'Payment session invalid. Please go back and try again.',
      );
      setLoading(false);
      return;
    }

    processPayment.mutate(
      { quoteId: effectiveQuoteId, data: paymentData },
      {
        onSuccess: res => {
          console.log('Process Payment Success:', res);

          const redirectUrl = res?.data?.redirect_url || res?.data?.url;
          if (redirectUrl) {
            Linking.openURL(redirectUrl);
          } else if (res?.data?.success) {
            navigation.navigate(SCREEN_NAMES.THANKYOU_SCREEN, {
              message: 'Your payment was successful!',
            });
          } else {
            Alert.alert(
              'Payment Failed',
              res.data?.message || 'Something went wrong',
            );
          }
        },
        onError: err => {
          console.error('Payment API Error:', err?.response?.data || err);
          Alert.alert(
            'Payment Error',
            err?.response?.data?.message ||
              err?.message ||
              'Payment processing failed',
          );
        },
      },
    );
  };

  const handlePayPress = () => {
    if (!isCardVisible) {
      setIsCardVisible(true);
      return;
    }
    cardSdkRef.current?.generateToken();
  };

  return (
    <View style={styles.container}>
      <Header title="Secure Payment" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketContainer}>
          <View style={styles.ticketTop}>
            <View style={styles.confettiContainer}>
              <Text style={styles.confettiEmoji}>🎉</Text>
            </View>
            <Text style={styles.thankYouTitle}>Order Summary</Text>
            <Text style={styles.thankYouSub}>
              Please review your insurance details before payment.
            </Text>
          </View>

          <View style={styles.ticketDividerContainer}>
            <View style={styles.ticketLeftCutout} />
            <View style={styles.ticketDashedLine} />
            <View style={styles.ticketRightCutout} />
          </View>

          <View style={styles.ticketBody}>
            <View
              style={{
                marginTop: verticalScale(5),
                paddingHorizontal: verticalScale(20),
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ width: '50%' }}>
                <Image
                  source={{ uri: config.logo }}
                  style={{
                    width: 100,
                    height: 50,
                  }}
                  resizeMode="contain"
                />
                <Text style={styles.planValue}>
                  {responseData?.quote?.planName}
                </Text>
              </View>
              <View style={{}}>
                <QRCode
                  value={paymentLink}
                  size={verticalScale(120)}
                  color={theme.colors.text}
                  backgroundColor={theme.colors.backgroundColor}
                />
              </View>
            </View>

            <View style={styles.ticketRow}>
              <View style={styles.ticketCol}>
                <Text style={styles.ticketLabel}>DATE & TIME</Text>
                <Text style={styles.ticketValue}>
                  {new Date()
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .toUpperCase()}{' '}
                  |{' '}
                  {new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </Text>
              </View>
              <View style={[styles.ticketCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.ticketLabel}>AMOUNT</Text>
                <Text style={styles.ticketValueLarge}>
                  AED{' '}
                  {Number(totalAmount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>

            {/* Customer Information Block - Styled like BuyTravelPolicy.js contactDetailsCard */}
            <View style={styles.contactDetailsCard}>
              <View style={styles.contactDetailRow}>
                <View style={styles.contactIconCircle}>
                  <Image source={Icons.Email} style={styles.contactMiniIcon} />
                </View>
                <View style={styles.contactInfoBox}>
                  <Text style={styles.contactLabelSmall}>EMAIL ADDRESS</Text>
                  <Text style={styles.contactValueMain}>
                    {quoteDetails?.user?.email ||
                      quoteDetails?.userId?.email ||
                      '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.contactDetailRow}>
                <View style={styles.contactIconCircle}>
                  <Image
                    source={Icons.Support}
                    style={styles.contactMiniIcon}
                  />
                </View>
                <View style={styles.contactInfoBox}>
                  <Text style={styles.contactLabelSmall}>PHONE NUMBER</Text>
                  <Text style={styles.contactValueMain}>
                    {quoteDetails?.user?.phone ||
                      quoteDetails?.user?.mobileNumber ||
                      quoteDetails?.userId?.phone ||
                      quoteDetails?.userId?.mobileNumber ||
                      '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Plan Details & Guarantee Section */}
            <View style={styles.guaranteeBoxInline}>
              <Text style={styles.guaranteeIconSmall}>🛡️</Text>
              <Text style={styles.guaranteeTextSmall}>
                Instant Policy Issuance after payment.
              </Text>
            </View>

            {/* QR Code Section */}
          </View>

          <View style={styles.ticketBottomCutouts}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.ticketBottomCutout} />
            ))}
          </View>
        </View>

        {/* Payment Card Section */}
        {isCardVisible && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>Card Details</Text>
              <Text style={styles.paymentSub}>
                Complete your transaction securely via Tap Payments
              </Text>
            </View>
            <View style={styles.cardSdkWrapper}>
              <TapCardView
                ref={cardSdkRef}
                config={tapConfig}
                style={{ width: '100%' }}
                onSuccess={onTokenSuccess}
                onError={onSdkError}
                onReady={() => console.log('SDK Ready')}
                onFocus={() => console.log('SDK Focused')}
                onHeightChange={h => console.log('SDK Height Change:', h)}
                onBinIdentification={b => console.log('SDK Bin:', b)}
                onInvalidInput={i => console.log('SDK Invalid Input:', i)}
              />
            </View>
          </View>
        )}

        <CustomButton
          title={`${
            isCardVisible ? 'Confirm Payment' : 'Proceed to Payment'
          } (AED ${Number(totalAmount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })})`}
          onPress={handlePayPress}
          disabled={!totalAmount}
          buttonStyle={{
            backgroundColor: config.primaryColor,
            marginTop: isCardVisible ? verticalScale(10) : verticalScale(24),
            borderRadius: verticalScale(16),
            height: verticalScale(60),
            shadowColor: config.primaryColor,
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
          }}
          textStyle={{
            fontSize: fontScale(16),
            color: theme.colors.backgroundColor,
          }}
          iconRight={
            <Ionicons
              name={isCardVisible ? 'shield-checkmark' : 'arrow-forward'}
              size={22}
              color={theme.colors.backgroundColor}
            />
          }
        />

        {isCardVisible && (
          <View style={styles.trustFooter}>
            <View style={styles.secureTag}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={theme.colors.lableText}
              />
              <Text style={styles.secureTagText}>PCI-DSS Compliant</Text>
            </View>
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>Securely powered by Tap</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TapPaymentScreen;

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    ticketContainer: {
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ticketTop: {
      padding: verticalScale(15),
      alignItems: 'center',
    },
    confettiContainer: {
      width: verticalScale(60),
      height: verticalScale(60),
      borderRadius: verticalScale(30),
      backgroundColor: theme.colors.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confettiEmoji: {
      fontSize: fontScale(40),
    },
    thankYouTitle: {
      fontSize: fontScale(22),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(5),
    },
    thankYouSub: {
      fontSize: fontScale(14),
      color: theme.colors.description,
      textAlign: 'center',
      paddingHorizontal: verticalScale(20),
    },
    ticketDividerContainer: {
      height: verticalScale(30),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1,
    },
    ticketLeftCutout: {
      width: verticalScale(30),
      height: verticalScale(30),
      borderRadius: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      marginLeft: -verticalScale(15),
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    ticketRightCutout: {
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
      marginHorizontal: verticalScale(10),
    },
    ticketBody: { flex: 1, paddingBottom: verticalScale(20) },
    ticketRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(15),
    },
    ticketCol: {
      flex: 1,
      paddingTop: verticalScale(15),
      paddingHorizontal: verticalScale(20),
    },
    ticketLabel: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      marginBottom: verticalScale(4),
    },
    ticketValue: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    ticketValueLarge: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    contactDetailsCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(15),
      padding: verticalScale(15),
      marginBottom: verticalScale(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(20),
    },
    contactDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactIconCircle: {
      width: verticalScale(32),
      height: verticalScale(32),
      borderRadius: verticalScale(16),
      backgroundColor: theme.colors.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
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
      marginBottom: verticalScale(2),
    },
    contactValueMain: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(14),
      color: theme.colors.text,
    },
    planSection: {
      marginBottom: verticalScale(24),
    },
    planLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      marginBottom: verticalScale(4),
    },
    planValue: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textTertiary,
    },
    guaranteeBoxInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(6),
      paddingHorizontal: verticalScale(20),
    },
    guaranteeIconSmall: {
      fontSize: fontScale(16),
    },
    guaranteeTextSmall: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.lableText,
    },
    qrContainer: {
      alignItems: 'center',
      marginTop: verticalScale(15),
      marginBottom: verticalScale(15),
    },
    qrWrapper: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(12),
      marginBottom: verticalScale(8),
    },
    barcodeNumber: {
      fontSize: fontScale(10),
      color: theme.colors.description,
      letterSpacing: 1,
      marginTop: verticalScale(2),
    },
    ticketBottomCutouts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: verticalScale(5),
      marginBottom: -verticalScale(15),
    },
    ticketBottomCutout: {
      backgroundColor: theme.colors.backgroundColor,
      width: verticalScale(30),
      height: verticalScale(30),
      backgroundColor: theme.colors.backgroundColor,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderColor: theme.colors.border,
      transform: [{ rotate: '45deg' }],
    },
    /* Payment Card */
    paymentCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      marginTop: verticalScale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    paymentHeader: {
      paddingTop: verticalScale(20),
      paddingHorizontal: verticalScale(20),
      marginBottom: verticalScale(20),
    },
    paymentTitle: {
      fontSize: fontScale(24),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    paymentSub: {
      fontSize: fontScale(14),
      color: theme.colors.description,
    },
    cardSdkWrapper: {
      marginBottom: verticalScale(20),
    },
    trustFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: verticalScale(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    secureTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(6),
    },
    secureTagText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.lableText,
    },
    poweredBy: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    poweredByText: {
      fontSize: fontScale(11),
      color: theme.colors.description,
    },
  });
