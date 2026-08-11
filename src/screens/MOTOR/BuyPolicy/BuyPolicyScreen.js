import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { pick, types } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { formatNumber } from '@utils/formateNumber';
import { useThemeContext } from '@theme/ThemeProvider';
import {
  useContactAgent,
  useGetPolicySummary,
  useVerifyemiratesid,
  useUploademiratesid,
  useVerifydrivinglicense,
  useUploaddrivinglicense,
  useVerifycarregistrationcard,
  useUploadvehicledocuments,
} from '@hooks/policy/useMotorPolicy';
import { moderateScale, verticalScale } from '@constants/metrics';
import { CONSTANTS } from '@constants/staticJson';
import { CustomDropDownList } from '@components/ui/CustomDropDownList';
import { CustomAccordion } from '@components/ui/CustomAccordion';
import CustomCheckBox from '@components/ui/CustomCheckBox';
import CustomButton from '@components/ui/CustomButton';
import {
  policyCartStyle,
  style,
  documentStyles as docStyles,
} from './BuyPolicyScreen.styles';
import { PolicyInfoRow, FeatureItem } from './components/SupportComp';
import LinearGradient from 'react-native-linear-gradient';
import Header from '@components/ui/Header';
import moment from 'moment';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Images } from '@assets/index';
import { ageCalculator } from '@utils/ageCalculator';

const SELECT_OPTIONS = [
  {
    label: 'Registration card',
    value: 'Registration card',
    isNew: false,
    requiredDoc: ['emiratesId', 'drivingLicense', 'registrationCard'],
  },
  {
    label: 'Transfer Certificate',
    value: 'Transfer Certificate',
    requiredDoc: ['emiratesId', 'drivingLicense', 'ownershipProofDocument'],
  },
  {
    label: 'Possession Certificate',
    value: 'Possession Certificate',
    requiredDoc: ['emiratesId', 'drivingLicense', 'ownershipProofDocument'],
  },
  {
    label: 'VCC Certificate',
    value: 'VCC Certificate',
    isNew: false,
    requiredDoc: [
      'emiratesId',
      'drivingLicense',
      'vehicleClearanceCertificate',
    ],
  },
  {
    label: 'VCC Certificate & New Car Document',
    value: 'VCC Certificate & New Car Document',
    isNew: false,
    requiredDoc: [
      'emiratesId',
      'drivingLicense',
      'newCarCard',
      'vehicleClearanceCertificate',
    ],
  },
];

const ALL_DOC_TYPES = {
  emiratesId: {
    label: 'Emirates ID',
    type: [types.pdf, types.images],
  },
  drivingLicense: {
    label: 'Driving License',
    type: [types.pdf, types.images],
  },
  registrationCard: {
    label: 'Registration Card',
    type: [types.pdf, types.images],
  },
  ownershipProofDocument: {
    label: 'Ownership Proof',
    type: [types.pdf, types.images],
  },
  vehicleClearanceCertificate: {
    label: 'VCC Certificate',
    type: [types.pdf, types.images],
  },
  newCarCard: {
    label: 'New Car Document',
    type: [types.pdf, types.images],
  },
};

const BuyPolicyScreen = ({ route, navigation }) => {
  const { theme } = useThemeContext();
  const styles = style(theme);
  const policyStyle = policyCartStyle(theme);
  const documentStyles = docStyles(theme);

  const { policy_id } = route?.params || {};

  const { data: policySummaryData = {}, refetch } = useGetPolicySummary({
    id: policy_id,
  });

  console.log('policySummaryData', policySummaryData);

  const { mutate: contactAgent } = useContactAgent();
  const { mutate: verifyemiratesid } = useVerifyemiratesid();
  const { mutate: uploademiratesid } = useUploademiratesid();
  const { mutate: uploaddrivinglicense } = useUploaddrivinglicense();
  const { mutate: uploadvehicledocuments } = useUploadvehicledocuments();
  const { mutate: verifydrivinglicense } = useVerifydrivinglicense();
  const { mutate: verifycarregistrationcard } = useVerifycarregistrationcard();

  const [carSelectedOption, setCarSelectedOption] = useState('Renewal');
  const [docsArray, setDocsArray] = useState(CONSTANTS.RENEWAL_LIST);

  const [carSelectorValue, setCarSelectorValue] = useState('Renewal');
  const [carSelectorItems, setCarSelectorItems] = useState(
    CONSTANTS.NEW_OR_RENEWAL,
  );

  const [isCheckBoxSelected, setIsCheckBoxSelected] = useState(false);
  const [discountAmount, setDiscountAmount] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [vatValue, setVatValue] = useState();

  const [selectedFiles, setSelectedFiles] = useState({});
  const [validationLoader, setValidationLoader] = useState({});
  const [documentStatus, setDocumentStatus] = useState({});
  const [registrationType, setRegistrationType] = useState('Registration card');

  const handleCarOptionChange = value => {
    setCarSelectedOption(value);
    if (value === 'Pre-Owned') {
      setDocsArray(CONSTANTS.PRE_OWNED_LIST);
    } else if (value === 'Renewal') {
      setDocsArray(CONSTANTS.RENEWAL_LIST);
    } else if (value === 'Brand New') {
      setDocsArray(CONSTANTS.BRAND_NEW_LIST);
    }
  };

  const getRequiredDocuments = () => {
    const option = SELECT_OPTIONS.find(opt => opt.value === registrationType);
    const requiredKeys = option
      ? option.requiredDoc
      : SELECT_OPTIONS[0].requiredDoc;

    return requiredKeys.map(key => ({
      key,
      label: ALL_DOC_TYPES[key]?.label || key,
      type: ALL_DOC_TYPES[key]?.type || [types.pdf, types.images],
    }));
  };

  const requiredDocuments = getRequiredDocuments();

  const isScanAllEnabled = () => {
    // Enable if no documents are uploaded yet
    return Object.keys(documentStatus).length === 0;
  };

  const scanAllDocuments = () => {
    // Placeholder for "Scan all" functionality
    Alert.alert('Scan All', 'Feature coming soon!');
  };

  const handleDocumentPick = async (docKey, type) => {
    try {
      const result = await pick({
        type: type,
        allowMultiSelection: true,
      });

      const file = result[0];
      // Update local state to show chosen file
      console.log('Final file object:', file);

      // setSelectedFiles(prev => ({ ...prev, [docKey]: file }));
      handleValidationCheck(docKey, [file]);
    } catch (err) {
      if (err.code !== 'RNDocumentPickerCanceled') {
        console.error('Picker error:', err);
      }
    }
  };

  const renderDocumentUpload = (docType, index) => {
    const status = documentStatus[docType.key];
    const isLoading = validationLoader[docType.key] || false;
    const error = documentStatus[docType.key] === 'error'; // Simplified error check or from sideValidation if used
    const file = selectedFiles[docType.key];
    const files = file ? [file] : [];

    return (
      <View
        key={index}
        style={{ width: '48%', marginBottom: moderateScale(10) }}
      >
        <Text
          style={{
            fontFamily: 'Lato-Bold',
            fontSize: moderateScale(11),
            color: theme.colors.textTertiary,
            marginBottom: moderateScale(6),
          }}
          numberOfLines={1}
        >
          {docType.label}
        </Text>

        <TouchableOpacity
          style={[
            {
              borderWidth: 1,
              borderStyle: 'dashed',
              borderRadius: moderateScale(10),
              height: verticalScale(85),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.floorBgColor,
              overflow: 'hidden',
            },
            {
              borderColor: error
                ? theme.colors.red
                : status === 'uploaded'
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          onPress={() => handleDocumentPick(docType.key, docType.type)}
          disabled={isLoading || status === 'uploaded'}
          activeOpacity={0.8}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {files.length > 0 ? (
              files[0]?.type?.includes('pdf') ||
              files[0]?.name?.toLowerCase().endsWith('.pdf') ? (
                <View style={{ width: '100%', height: '100%' }}>
                  <Pdf
                    source={{
                      uri: files[0]?.uri,
                      cache: true,
                    }}
                    trustAllCerts={false}
                    style={{ width: '100%', height: '100%' }}
                    singlePage={true}
                  />
                </View>
              ) : (
                <View style={{ width: '100%', height: '100%' }}>
                  <Image
                    source={{
                      uri: files[0]?.uri,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              )
            ) : (
              <>
                <Feather
                  name="upload-cloud"
                  size={20}
                  color={
                    isLoading ? theme.colors.primary : theme.colors.textTertiary
                  }
                  style={{ marginBottom: moderateScale(4) }}
                />
                <Text
                  style={{
                    fontFamily: 'Lato-Regular',
                    fontSize: moderateScale(9),
                    color: theme.colors.description,
                    textAlign: 'center',
                    paddingHorizontal: moderateScale(4),
                  }}
                >
                  {isLoading ? 'Uploading...' : 'Tap or Drop'}
                </Text>
              </>
            )}
          </View>

          {status === 'uploaded' && !isLoading && (
            <View
              style={{
                position: 'absolute',
                top: moderateScale(4),
                right: moderateScale(4),
                backgroundColor: theme.colors.backgroundColor,
                borderRadius: moderateScale(8),
                paddingHorizontal: moderateScale(4),
                paddingVertical: moderateScale(2),
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(2),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Lato-Bold',
                  fontSize: moderateScale(8),
                  color: theme.colors.primary,
                }}
              >
                Done
              </Text>
              <Feather
                name="check-circle"
                size={10}
                color={theme.colors.primary}
              />
            </View>
          )}
          {error && !isLoading && (
            <View
              style={{
                position: 'absolute',
                top: moderateScale(4),
                right: moderateScale(4),
                backgroundColor: theme.colors.backgroundColor,
                borderRadius: moderateScale(8),
                paddingHorizontal: moderateScale(4),
                paddingVertical: moderateScale(2),
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(2),
              }}
            >
              <Text
                style={{
                  fontFamily: 'Lato-Bold',
                  fontSize: moderateScale(8),
                  color: theme.colors.red,
                }}
              >
                Error
              </Text>
              <Feather name="alert-circle" size={10} color={theme.colors.red} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const getQuoteData = {
    addOn: policySummaryData?.quote?.addOns,
    features: policySummaryData?.quote?.extraFeatures,
  };

  useEffect(() => {
    let result;
    let taxValue;
    if (policySummaryData?.quote?.voucher) {
      taxValue = (policySummaryData?.quote?.discountPrice * 5) / 100;
      result =
        policySummaryData?.quote?.discountPrice +
        parseInt(taxValue * 100) / 100 +
        policySummaryData?.quote?.adminFees;
    } else {
      taxValue = (policySummaryData?.quote?.totalPrice * 5) / 100;
      result =
        policySummaryData?.quote?.totalPrice +
        parseInt(taxValue * 100) / 100 +
        policySummaryData?.quote?.adminFees;
    }

    setVatValue(taxValue);
    setTotalAmount(result);
  }, [policySummaryData?.quote]);

  useEffect(() => {
    if (
      policySummaryData?.quote?.voucher &&
      policySummaryData?.quote?.discountPrice &&
      policySummaryData?.quote?.totalPrice
    ) {
      setDiscountAmount(
        +policySummaryData?.quote?.totalPrice -
          +policySummaryData?.quote?.discountPrice,
      );
    }
  }, [
    policySummaryData?.quote?.voucher,
    policySummaryData?.quote?.totalPrice,
    policySummaryData?.quote?.discountPrice,
  ]);

  useEffect(() => {
    let benefitsAmount = 0;
    let addonsAmount = 0;
    if (policySummaryData?.quote?.extraFeatures?.length > 0) {
      policySummaryData?.quote?.extraFeatures.map(item => {
        benefitsAmount += +item.Amount;
      });
    }
    if (policySummaryData?.quote?.addOns?.length > 0) {
      policySummaryData?.quote?.addOns.map(item => {
        addonsAmount += +item.price;
      });
    }
  }, [
    policySummaryData?.quote?.price,
    policySummaryData?.quote?.addOns,
    policySummaryData?.quote?.extraFeatures,
  ]);

  const USER_DATA = [
    {
      label: 'Name:',
      value: policySummaryData?.quote?.userId?.fullName,
    },
    {
      label: 'Mobile:',
      value: `+${policySummaryData?.quote?.userId?.countryCode} ${policySummaryData?.quote?.userId?.mobileNumber}`,
    },
    {
      label: 'Email:',
      value: policySummaryData?.quote?.userId?.email,
    },
    {
      label: 'Date of Birth:',
      value: moment(policySummaryData?.quote?.userId?.dateOfBirth).format(
        'DD/MM/YYYY',
      ),
    },
    {
      label: 'Age:',
      value:
        policySummaryData?.quote?.userId?.age ||
        ageCalculator(
          moment(policySummaryData?.quote?.userId?.dateOfBirth).format(),
        ) ||
        20,
    },
    {
      label: 'Nationality:',
      value: policySummaryData?.quote?.userId?.nationality,
    },
    {
      label: 'Policy Issue Date:',
      value: moment(
        policySummaryData?.quote?.carId?.policyEffectiveDate,
      ).format('DD/MM/YYYY'),
    },
    {
      label: 'Car Value:',
      value: policySummaryData?.quote?.carValue,
    },
    {
      label: 'Year of No. Claim:',
      value: policySummaryData?.quote?.carId?.yearOfNoClaim,
    },
  ];

  const CAR_DATA = [
    {
      label: 'Year:',
      value: policySummaryData?.quote?.carId?.year,
    },
    {
      label: 'No. of Seat:',
      value: policySummaryData?.quote?.carId?.noOfPassengers,
    },
    {
      label: 'Brand:',
      value: policySummaryData?.quote?.carId?.make,
    },
    {
      label: 'Cylinders:',
      value: policySummaryData?.quote?.carId?.cylinders,
    },
    {
      label: 'Model:',
      value: policySummaryData?.quote?.carId?.model,
    },
    {
      label: 'Value:',
      value:
        policySummaryData?.quote?.carId?.originalPrice &&
        `${policySummaryData?.quote?.carId?.originalPrice} AED`,
    },
    {
      label: 'Trim:',
      value: policySummaryData?.quote?.carId?.trim,
    },
    {
      label: 'Chassis No:',
      value:
        policySummaryData?.quote?.carId?.chassisNumber ||
        policySummaryData?.quote?.carId?.chesisNo ||
        '-',
    },
    {
      label: 'Regional Spec:',
      value: policySummaryData?.quote?.carId?.regionalSpec,
    },
    {
      label: 'Reg. Card TC No:',
      value: policySummaryData?.quote?.carId?.tcNo || '-',
    },
    {
      label: 'Body Type:',
      value: policySummaryData?.quote?.carId?.bodyType,
    },
    {
      label: 'Car Reg. Date:',
      value: moment(
        policySummaryData?.quote?.carId?.dateOfFirstRegister,
      ).format('DD/MM/YYYY'),
    },
    {
      label: 'No. of Doors:',
      value: policySummaryData?.quote?.carId?.noOfDoors,
    },
    {
      label: 'Reg. Card Expiry:',
      value: moment(policySummaryData?.quote?.carId?.regCardExpiryDate).format(
        'DD/MM/YYYY',
      ),
    },
  ];

  const POLICY_USER = [
    {
      label: 'Effective Date:',
      value: moment(
        policySummaryData?.quote?.carId?.policyEffectiveDate,
      ).format('DD/MM/YYYY'),
    },
    {
      label: 'Insurance Company:',
      value: policySummaryData?.quote?.company?.companyName,
    },
    {
      label: 'Current Insurance Type:',
      value:
        policySummaryData?.quote?.insuranceType == 'comprehensive'
          ? 'Comprehensive'
          : 'Third Party',
    },
    {
      label: 'Emirates:',
      value:
        policySummaryData?.quote?.carId?.emirate ||
        policySummaryData?.quote?.carId?.registrationEmirate ||
        '-',
    },
    {
      label: 'Nationality:',
      value: policySummaryData?.quote?.userId?.nationality,
    },
    {
      label: 'Excess:',
      value: policySummaryData?.quote?.isWithoutMatrixOrApi
        ? '---'
        : `AED ${policySummaryData?.quote?.excessPrice}`,
    },
  ];

  const handleContactAgent = () => {
    if (!isCheckBoxSelected) {
      Alert.alert(
        'Agreement Required',
        'Please agree to submit a Self-Declaration of Never Claim.',
      );
      return;
    }

    const payload = {
      isContact: true,
    };

    contactAgent(
      {
        id: policySummaryData?.quote?._id,
        data: payload,
      },
      {
        onSuccess: () => {
          navigation.navigate(SCREEN_NAMES.THANKYOU_SCREEN);
        },
        onError: error => {
          console.error('Contact agent error:', error);
          Alert.alert(
            'Error',
            'Failed to contact agent. Please try again later.',
          );
        },
      },
    );
  };

  const handleValidationCheck = async (imageKey, files = []) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', {
        uri: file.uri || file.fileCopyUri,
        type: file.type || 'image/jpeg',
        name: file.name || `file_${Date.now()}.jpg`,
      });
    });

    setValidationLoader(prev => ({ ...prev, [imageKey]: true }));

    const docConfig = {
      emiratesId: {
        verifyFn: verifyemiratesid,
        uploadFn: uploademiratesid,
        uploadKey: 'emiratesId',
        getCarId: () => policySummaryData?.quote?.motorInfoId?._id,
        extraFormData: null,
      },
      drivingLicense: {
        verifyFn: verifydrivinglicense,
        uploadFn: uploaddrivinglicense,
        uploadKey: 'drivingLicense',
        getCarId: () =>
          policySummaryData?.quote?.motorInfoId?._id ||
          policySummaryData?.quote?.carId?._id,
        extraFormData: null,
      },
      registrationCard: {
        verifyFn: verifycarregistrationcard,
        uploadFn: uploadvehicledocuments,
        uploadKey: 'registrationCard',
        getCarId: () => policySummaryData?.quote?.carId?._id,
        extraFormData: { documentType: 'registrationCard' },
      },
    };

    const currentDoc = docConfig[imageKey];

    if (!currentDoc) {
      setValidationLoader(prev => ({ ...prev, [imageKey]: false }));
      return;
    }

    currentDoc.verifyFn(formData, {
      onSuccess: res => {
        console.log(`data ${imageKey}`, res?.data?.data?.text);

        const uploadFormData = new FormData();
        uploadFormData.append('text', JSON.stringify(res?.data?.data?.text));

        if (currentDoc.extraFormData) {
          Object.entries(currentDoc.extraFormData).forEach(([k, v]) =>
            uploadFormData.append(k, v),
          );
        }

        files.forEach(file => {
          uploadFormData.append(currentDoc.uploadKey, {
            uri: file.uri || file.fileCopyUri,
            type: file.type || 'image/jpeg',
            name: file.name || `file_${Date.now()}.jpg`,
          });
        });

        const targetCarId = currentDoc.getCarId();

        currentDoc.uploadFn(
          {
            carId: targetCarId,
            data: uploadFormData,
          },
          {
            onSuccess: res => {
              console.log('Upload success', res);
              setDocumentStatus(prev => ({ ...prev, [imageKey]: 'uploaded' }));
              if (imageKey === 'registrationCard') {
                const url = res?.data?.data?.registrationCardP?.path;
                const file = {
                  uri: url,
                  name: 'registrationCard',
                  type: 'application/pdf',
                };
                setSelectedFiles(prev => ({ ...prev, [imageKey]: file }));
              }
              if (imageKey === 'emiratesId') {
                const url = res?.data?.data?.emiratesIdP?.path;
                const file = {
                  uri: url,
                  name: 'emiratesId',
                  type: 'application/pdf',
                };
                setSelectedFiles(prev => ({ ...prev, [imageKey]: file }));
              }
              if (imageKey === 'drivingLicense') {
                const url = res?.data?.data?.drivingLicenseP?.path;
                const file = {
                  uri: url,
                  name: 'drivingLicense',
                  type: 'application/pdf',
                };
                setSelectedFiles(prev => ({ ...prev, [imageKey]: file }));
              }
              // setSelectedFiles(prev => ({ ...prev, [imageKey]: files[0] }));
              setValidationLoader(prev => ({ ...prev, [imageKey]: false }));
            },
            onError: err => {
              console.log('Upload error', err);
              Alert.alert('Error', `Failed to upload ${imageKey}`);
              // setDocumentStatus(prev => ({ ...prev, [imageKey]: 'error' }));
              setValidationLoader(prev => ({ ...prev, [imageKey]: false }));
            },
          },
        );
      },
      onError: error => {
        console.log(error);
        Alert.alert('Error', 'Verification failed');
        setDocumentStatus(prev => ({ ...prev, [imageKey]: 'error' }));
        setValidationLoader(prev => ({ ...prev, [imageKey]: false }));
      },
    });
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 2 }}
      locations={[0.1, 0.2]}
      colors={[theme.colors.bgLinear1, theme.colors.bgLinear2]}
      style={styles.container}
    >
      <Header title="Plan Review Detail" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        <View
          style={{
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.floorBgColor,
              padding: moderateScale(12),
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(13),
                color: theme.colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Personal Information
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(8),
            }}
          >
            {USER_DATA.map(({ label, value }, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: moderateScale(4),
                  borderBottomWidth:
                    index === USER_DATA.length - 1
                      ? 0
                      : StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Lato-Regular',
                    fontSize: moderateScale(12),
                    color: theme.colors.textTertiary,
                    flex: 1,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Lato-Bold',
                    fontSize: moderateScale(12),
                    color: theme.colors.text,
                    flex: 1.5,
                    textAlign: 'right',
                  }}
                  numberOfLines={2}
                >
                  {value ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.floorBgColor,
              padding: moderateScale(12),
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(13),
                color: theme.colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Identity Verification (KYC)
            </Text>
          </View>
          <View style={{ padding: moderateScale(12) }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {requiredDocuments.map((docType, index) =>
                renderDocumentUpload(docType, index),
              )}
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.floorBgColor,
              padding: moderateScale(12),
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(13),
                color: theme.colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Vehicle Specifications
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(8),
            }}
          >
            {CAR_DATA.map(({ label, value }, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: moderateScale(4),
                  borderBottomWidth:
                    index === CAR_DATA.length - 1
                      ? 0
                      : StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Lato-Regular',
                    fontSize: moderateScale(12),
                    color: theme.colors.textTertiary,
                    flex: 1,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Lato-Bold',
                    fontSize: moderateScale(12),
                    color: theme.colors.text,
                    flex: 1.5,
                    textAlign: 'right',
                  }}
                  numberOfLines={2}
                >
                  {value ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.floorBgColor,
              padding: moderateScale(12),
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(13),
                color: theme.colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Policy Configuration
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(8),
            }}
          >
            {POLICY_USER.map(({ label, value }, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: moderateScale(4),
                  borderBottomWidth:
                    index === POLICY_USER.length - 1
                      ? 0
                      : StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Lato-Regular',
                    fontSize: moderateScale(12),
                    color: theme.colors.textTertiary,
                    flex: 1,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Lato-Bold',
                    fontSize: moderateScale(12),
                    color: theme.colors.text,
                    flex: 1.5,
                    textAlign: 'right',
                  }}
                  numberOfLines={2}
                >
                  {value ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!policySummaryData?.quote?.isUaePass && (
          <View
            style={{
              backgroundColor: theme.colors.backgroundColor,
              borderRadius: moderateScale(10),
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.floorBgColor,
                padding: moderateScale(12),
                borderTopLeftRadius: moderateScale(10),
                borderTopRightRadius: moderateScale(10),
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Lato-Black',
                  fontSize: moderateScale(13),
                  color: theme.colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Configuration Requirements
              </Text>
            </View>

            <View
              style={{ padding: moderateScale(12), gap: moderateScale(12) }}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontFamily: 'Lato-Regular',
                  color: theme.colors.description,
                  lineHeight: moderateScale(16),
                }}
              >
                To seamlessly finalize your coverage map, select the current
                condition of your transit asset. Our team will dynamically pull
                all corresponding requirements.
              </Text>

              <View
                style={{
                  gap: moderateScale(8),
                  marginBottom: moderateScale(6),
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontFamily: 'Lato-Bold',
                    color: theme.colors.textTertiary,
                  }}
                >
                  Vehicle Classification
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: moderateScale(10) }}
                >
                  {carSelectorItems?.map((item, index) => {
                    const isSelected = carSelectorValue === item.value;
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => {
                          setCarSelectorValue(item.value);
                          handleCarOptionChange(item.value);
                        }}
                        style={{
                          paddingHorizontal: moderateScale(16),
                          paddingVertical: moderateScale(8),
                          borderRadius: moderateScale(20),
                          borderWidth: 1,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          backgroundColor: isSelected
                            ? `${theme.colors.primary}15`
                            : theme.colors.floorBgColor,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: isSelected
                              ? 'Lato-Bold'
                              : 'Lato-Regular',
                            fontSize: moderateScale(12),
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.textTertiary,
                          }}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.floorBgColor,
                  borderRadius: moderateScale(8),
                  padding: moderateScale(10),
                  gap: moderateScale(6),
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontFamily: 'Lato-Bold',
                    color: theme.colors.textTertiary,
                  }}
                >
                  Mandatory For {carSelectedOption}:
                </Text>
                {docsArray?.map((doc, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: moderateScale(6),
                    }}
                  >
                    <Feather
                      name="check"
                      size={12}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        fontFamily: 'Lato-Regular',
                        color: theme.colors.description,
                        flex: 1,
                      }}
                    >
                      {doc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {(policySummaryData?.quote?.response?.IncludedFeatures?.length > 0 ||
          getQuoteData?.features?.length > 0 ||
          policySummaryData?.quote?.addOns?.length > 0) && (
          <View
            style={{
              backgroundColor: theme.colors.backgroundColor,
              borderRadius: moderateScale(10),
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: 'hidden',
            }}
          >
            <CustomAccordion
              title="Coverage Benefits"
              containerStyle={{ borderWidth: 0, marginBottom: 0 }}
            >
              <View
                style={{
                  paddingHorizontal: moderateScale(12),
                  paddingVertical: moderateScale(8),
                }}
              >
                {policySummaryData?.quote?.response?.IncludedFeatures?.map(
                  (feature, idx) => (
                    <FeatureItem
                      key={idx}
                      title={feature.Title}
                      isIncluded={true}
                      styles={policyStyle}
                    />
                  ),
                )}
                {getQuoteData?.features?.map((feature, idx) => (
                  <FeatureItem
                    key={idx}
                    title={feature.Title}
                    amount={feature.Amount}
                    isIncluded={feature.Amount === 0}
                    styles={policyStyle}
                  />
                ))}
                {policySummaryData?.quote?.addOns?.map((feature, idx) => (
                  <FeatureItem
                    key={idx}
                    title={feature?.productName}
                    amount={+feature.price}
                    styles={policyStyle}
                  />
                ))}
              </View>
            </CustomAccordion>
          </View>
        )}

        <View
          style={{
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: moderateScale(16),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(8),
              marginBottom: moderateScale(12),
            }}
          >
            <Feather name="file-text" size={16} color={theme.colors.text} />
            <Text
              style={{
                fontSize: moderateScale(14),
                fontFamily: 'Lato-Black',
                color: theme.colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Invoice Summary
            </Text>
          </View>

          {!policySummaryData?.quote?.isWithoutMatrixOrApi && (
            <View style={{ gap: moderateScale(6) }}>
              <PolicyInfoRow
                label="Base Premium"
                value={`AED ${formatNumber(
                  parseInt(policySummaryData?.quote?.totalPrice * 100) / 100,
                )}`}
                labelColor={theme.colors.description}
                valueColor={theme.colors.text}
                styles={policyStyle}
              />

              {policySummaryData?.quote?.voucher && (
                <PolicyInfoRow
                  label={`Discount Applied ${
                    policySummaryData?.quote?.voucher?.discountType ===
                    'percentage'
                      ? `(${policySummaryData?.quote?.voucher?.discountValue}%)`
                      : ''
                  }`}
                  value={`- AED ${formatNumber(
                    Math.floor(parseInt(discountAmount * 100) / 100),
                  )}`}
                  labelColor={theme.colors.description}
                  valueColor={theme.colors.red}
                  styles={policyStyle}
                />
              )}

              <PolicyInfoRow
                label="Value Added Tax (5%)"
                value={`AED ${formatNumber(
                  Math.floor(parseInt(vatValue * 100) / 100),
                )}`}
                labelColor={theme.colors.description}
                valueColor={theme.colors.text}
                styles={policyStyle}
              />
              <PolicyInfoRow
                label="Admin Processing"
                value={`AED ${formatNumber(
                  policySummaryData?.quote?.adminFees,
                )}`}
                labelColor={theme.colors.description}
                valueColor={theme.colors.text}
                styles={policyStyle}
              />

              <PolicyInfoRow
                label="eSanad Club Tier"
                value="Included (AED 0)"
                labelColor={theme.colors.description}
                valueColor={theme.colors.primary}
                styles={policyStyle}
              />
            </View>
          )}

          <View
            style={{
              height: 1,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderStyle: 'dashed',
              marginVertical: moderateScale(16),
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(13),
                color: theme.colors.textTertiary,
              }}
            >
              Total Payable
            </Text>
            <Text
              style={{
                fontFamily: 'Lato-Black',
                fontSize: moderateScale(18),
                color: theme.colors.primary,
              }}
            >
              {policySummaryData?.quote?.isWithoutMatrixOrApi
                ? 'Price via Agent'
                : `AED ${formatNumber(
                    Math.floor(parseInt(totalAmount * 100) / 100),
                  )}`}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: moderateScale(10),
            paddingHorizontal: moderateScale(4),
            gap: moderateScale(16),
          }}
        >
          <Text
            style={{
              color: theme.colors.description,
              fontSize: moderateScale(11),
              fontFamily: 'Lato-Regular',
              lineHeight: moderateScale(16),
              textAlign: 'center',
            }}
          >
            By proceeding, you agree to our{' '}
            <Text
              style={{ color: theme.colors.primary, fontFamily: 'Lato-Bold' }}
              onPress={() => console.log('terms')}
            >
              Terms & Conditions
            </Text>{' '}
            and provide your consent to process your personal data as per the{' '}
            <Text
              style={{ color: theme.colors.primary, fontFamily: 'Lato-Bold' }}
              onPress={() => console.log('privacy')}
            >
              Privacy Policy
            </Text>
            .
          </Text>

          <View style={{ alignSelf: 'center' }}>
            <CustomCheckBox
              label={'I agree to submit a Self-Declaration of Never Claim.'}
              onChange={checked => setIsCheckBoxSelected(checked)}
              value={isCheckBoxSelected}
              checkedColor={theme.colors.primary}
              disabledColor={theme.colors.border}
            />
          </View>

          {policySummaryData?.quote?.source !== 'Web UAE PASS' && (
            <CustomButton
              type={'secondary'}
              onPress={handleContactAgent}
              disabled={!isCheckBoxSelected}
              title={
                !policySummaryData?.quote?.isWithoutMatrixOrApi
                  ? totalAmount?.toFixed(2) > 0
                    ? 'Contact To Agent'
                    : 'Ask for'
                  : 'Pay with cards'
              }
              buttonColor={theme.colors.primary}
              textColor={theme.colors.textSecondary}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default BuyPolicyScreen;
