// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Dimensions,
//   Image,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Feather';

// import { useThemeContext } from '@theme/ThemeProvider';
// import { fontScale, scale, verticalScale } from '@constants/metrics';
// import Header from '@components/ui/Header';
// import FloatingLabelInput from '@components/ui/FloatingLabelInput';
// import CustomButton from '@components/ui/CustomButton';
// import FloatingButton from '@components/ui/FloatingButton';
// import { useGetPolicyBySearch } from '@hooks/policy/useMotorPolicy';
// import { useGetGarageList } from '@hooks/policy/useMotorClaim';
// import { SCREEN_NAMES } from '@constants/screenNames';
// import { Insurance } from '@assets/index';
// import moment from 'moment';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // Enable LayoutAnimation for Android
// if (
//   Platform.OS === 'android' &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const ClaimPolicy = () => {
//   const { theme } = useThemeContext();
//   const styles = getStyles(theme);
//   const navigation = useNavigation();

//   const [policyNumber, setPolicyNumber] = useState('');
//   const [policyDetails, setPolicyDetails] = useState(null);
//   const [errorType, setErrorType] = useState(null);
//   const [isDocked, setIsDocked] = useState(false);

//   const { mutate: searchPolicy, isLoading: searchLoading } =
//     useGetPolicyBySearch();
//   const { mutate: fetchGarages, isLoading: garageLoading } = useGetGarageList();

//   const handleNextPage = () => {
//     const companyId =
//       policyDetails?.quote?.companyId?._id ||
//       policyDetails?.quote?.companyId ||
//       policyDetails?.COMPANYID ||
//       policyDetails?.quoteId?.company?._id;

//     if (!companyId) {
//       navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
//         policyData: policyDetails,
//         garageList: [],
//       });
//       return;
//     }

//     fetchGarages(
//       { companyId },
//       {
//         onSuccess: res => {
//           const garageData = res?.data?.data || res?.data || [];
//           const garageNames = Array.isArray(garageData)
//             ? garageData.map(g => g?.garageId?.garageName || g?.garageName || g)
//             : [];

//           console.log('-=-=--=-=-=-=-==-=->>>>');

//           navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
//             policyData: policyDetails,
//             garageList: garageNames,
//           });
//         },
//         onError: () => {
//           navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
//             policyData: policyDetails,
//             garageList: [],
//           });
//         },
//       },
//     );
//   };

//   const handleSearch = async () => {
//     if (!policyNumber.trim()) return;
//     setErrorType(null);
//     setPolicyDetails(null);

//     searchPolicy(policyNumber, {
//       onSuccess: response => {
//         if (response?.data?.data) {
//           const resData = response.data.data;
//           if (resData.category === 'TPL') {
//             setErrorType('third-party');
//             setIsDocked(false);
//             LayoutAnimation.configureNext(
//               LayoutAnimation.Presets.easeInEaseOut,
//             );
//           } else {
//             setPolicyDetails(resData);
//             setIsDocked(true);
//             LayoutAnimation.configureNext(
//               LayoutAnimation.Presets.easeInEaseOut,
//             );
//           }
//         } else {
//           setErrorType('not-found');
//           setIsDocked(false);
//           LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         }
//       },
//       onError: () => {
//         setErrorType('not-found');
//         setIsDocked(false);
//       },
//     });
//   };

//   const DetailRow = ({ label, value }) => (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{value || '-'}</Text>
//     </View>
//   );

//   const Section = ({ title, children }) => (
//     <View style={styles.policyCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.accentBar} />
//         <Text style={styles.cardTitle}>{title}</Text>
//       </View>
//       <View style={styles.cardContent}>{children}</View>
//     </View>
//   );

//   const formatDate = date => (date ? moment(date).format('DD/MM/YYYY') : '-');

//   const renderPolicyContent = () => (
//     <View style={styles.resultsWrapper}>
//       <Section title="Policy Details">
//         <DetailRow
//           label="Insurance Company"
//           value={
//             policyDetails.quoteId?.company?.companyName ||
//             policyDetails.quote?.company?.companyName
//           }
//         />
//         <DetailRow
//           label="Policy Number"
//           value={
//             policyDetails.policyNumber ||
//             policyDetails.companyResponse?.Data?.PolicyNo
//           }
//         />
//         <DetailRow
//           label="Expiry Date"
//           value={formatDate(
//             policyDetails.EXPIRYDATE || policyDetails.policyExpiryDate,
//           )}
//         />
//       </Section>

//       <Section title="Vehicle Details">
//         <DetailRow
//           label="Vehicle"
//           value={`${policyDetails.carId?.make || ''} ${
//             policyDetails.carId?.model || ''
//           }`}
//         />
//         <DetailRow
//           label="Plate Number"
//           value={policyDetails.carId?.plateNumber}
//         />
//       </Section>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         bounces={false}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.heroContainer}>
//           <Image
//             source={Insurance.PolicyClaim}
//             style={styles.heroImage}
//             resizeMode="cover"
//           />
//           <View style={styles.heroOverlay} />
//           <Header
//             title="Motor Claims"
//             onBack={() => navigation.goBack()}
//             transparent
//             noShadow
//             text2
//             textSecondarytyle={styles.headerBar}
//           />
//           <View style={styles.heroContent}>
//             <View style={styles.secureBadge}>
//               <Icon
//                 name="shield"
//                 size={scale(14)}
//                 color={theme.colors.highlight}
//               />
//               <Text style={styles.secureText}>Assisted Claims</Text>
//             </View>
//             <Text style={styles.heroTitle}>File Your Claim</Text>
//             <Text style={styles.heroSubtitle}>
//               Efficiently process your motor insurance claims
//             </Text>
//           </View>
//         </View>

//         <View style={styles.body}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Policy Verification</Text>
//             <Text style={styles.sectionSubtitle}>
//               Enter your policy number to verify your coverage details and start
//               your claim request.
//             </Text>
//           </View>

//           <View style={styles.inputWrapper}>
//             <FloatingLabelInput
//               label="Policy Number"
//               value={policyNumber}
//               onChangeText={text => {
//                 setPolicyNumber(text);
//                 if (errorType || policyDetails) {
//                   setErrorType(null);
//                   setPolicyDetails(null);
//                   setIsDocked(false);
//                 }
//               }}
//               style={styles.searchInput}
//             />
//             {!policyDetails && (
//               <CustomButton
//                 title="Search Policy"
//                 onPress={handleSearch}
//                 disabled={!policyNumber.trim() || searchLoading}
//                 buttonStyle={styles.searchButton}
//                 loading={searchLoading}
//               />
//             )}
//           </View>

//           {errorType && (
//             <View style={styles.securityNote}>
//               <Icon
//                 name={errorType === 'third-party' ? 'alert-triangle' : 'search'}
//                 size={scale(14)}
//                 color={theme.colors.description}
//               />
//               <Text style={styles.securityText}>
//                 {errorType === 'third-party'
//                   ? 'Motor claims are not available for Third Party policies.'
//                   : 'Policy number entered could not be found in our system.'}
//               </Text>
//             </View>
//           )}

//           {policyDetails && renderPolicyContent()}
//         </View>
//       </ScrollView>

//       {policyDetails && (
//         <FloatingButton
//           title="Initialize Claim"
//           onPress={handleNextPage}
//           isLoading={garageLoading}
//           isShowIcon
//         />
//       )}
//     </View>
//   );
// };

// const getStyles = theme =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.colors.backgroundColor,
//     },
//     scrollContent: {
//       flexGrow: 1,
//       paddingBottom: verticalScale(100),
//     },
//     heroContainer: {
//       height: SCREEN_WIDTH,
//       width: SCREEN_WIDTH,
//     },
//     heroImage: {
//       width: '100%',
//       height: '100%',
//     },
//     heroOverlay: {
//       ...StyleSheet.absoluteFillObject,
//       backgroundColor: theme.colors.modalOverlay,
//     },
//     heroContent: {
//       position: 'absolute',
//       bottom: verticalScale(28),
//       left: scale(24),
//       right: scale(24),
//     },
//     secureBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       alignSelf: 'flex-start',
//       backgroundColor: theme.colors.primary + '70',
//       paddingHorizontal: scale(12),
//       paddingVertical: verticalScale(6),
//       borderRadius: verticalScale(20),
//       marginBottom: verticalScale(5),
//       gap: scale(6),
//     },
//     secureText: {
//       color: theme.colors.textSecondary,
//       fontSize: fontScale(13),
//       fontFamily: 'Lato-Bold',
//     },
//     headerBar: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       zIndex: 10,
//     },
//     heroTitle: {
//       color: theme.colors.textSecondary,
//       fontSize: fontScale(30),
//       fontFamily: 'Lato-Black',
//       lineHeight: fontScale(36),
//       marginBottom: verticalScale(8),
//     },
//     heroSubtitle: {
//       color: theme.colors.textSecondary + '99',
//       fontSize: fontScale(15),
//       fontFamily: 'Lato-Regular',
//     },
//     body: {
//       flex: 1,
//       padding: verticalScale(20),
//     },
//     sectionHeader: {
//       marginBottom: verticalScale(20),
//       gap: verticalScale(4),
//     },
//     sectionTitle: {
//       color: theme.colors.text,
//       fontSize: fontScale(20),
//       fontFamily: 'Lato-Bold',
//     },
//     sectionSubtitle: {
//       color: theme.colors.description,
//       fontSize: fontScale(14),
//       fontFamily: 'Lato-Regular',
//       lineHeight: fontScale(20),
//     },
//     inputWrapper: {
//       marginBottom: verticalScale(15),
//       gap: verticalScale(12),
//     },
//     searchInput: {
//       backgroundColor: theme.colors.bgSecondary,
//     },
//     searchButton: {
//       height: verticalScale(52),
//     },
//     securityNote: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: scale(10),
//       backgroundColor: theme.colors.bgSecondary,
//       padding: scale(14),
//       borderRadius: scale(12),
//     },
//     securityText: {
//       flex: 1,
//       fontSize: fontScale(11),
//       fontFamily: 'Lato-Regular',
//       color: theme.colors.description,
//       lineHeight: fontScale(16),
//     },
//     resultsWrapper: {
//       gap: verticalScale(15),
//       marginTop: verticalScale(10),
//     },
//     policyCard: {
//       backgroundColor: theme.colors.backgroundColor,
//       borderRadius: verticalScale(16),
//       borderWidth: 1,
//       borderColor: theme.colors.border,
//       overflow: 'hidden',
//     },
//     cardHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: scale(12),
//       backgroundColor: theme.colors.bgSecondary,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.colors.border,
//       gap: scale(8),
//     },
//     accentBar: {
//       width: scale(3),
//       height: verticalScale(14),
//       backgroundColor: theme.colors.primary,
//       borderRadius: scale(2),
//     },
//     cardTitle: {
//       fontSize: fontScale(14),
//       fontFamily: 'Lato-Bold',
//       color: theme.colors.text,
//       textTransform: 'uppercase',
//       letterSpacing: 0.5,
//     },
//     cardContent: {
//       padding: scale(15),
//       gap: verticalScale(10),
//     },
//     detailRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },
//     detailLabel: {
//       flex: 1,
//       fontFamily: 'Lato-Regular',
//       fontSize: fontScale(13),
//       color: theme.colors.description,
//     },
//     detailValue: {
//       flex: 1.5,
//       fontFamily: 'Lato-Bold',
//       fontSize: fontScale(13),
//       color: theme.colors.text,
//       textAlign: 'right',
//     },
//   });

// export default ClaimPolicy;

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
import { useGetGarageList } from '@hooks/policy/useMotorClaim';
import { SCREEN_NAMES } from '@constants/screenNames';
import { Insurance } from '@assets/index';
import moment from 'moment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ClaimPolicy = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const [policyNumber, setPolicyNumber] = useState('');
  const [policyDetails, setPolicyDetails] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [isDocked, setIsDocked] = useState(false);

  const { mutate: searchPolicy, isLoading: searchLoading } =
    useGetPolicyBySearch();
  const { mutate: fetchGarages, isLoading: garageLoading } = useGetGarageList();

  const handleNextPage = () => {
    const companyId =
      policyDetails?.quote?.companyId?._id ||
      policyDetails?.quote?.companyId ||
      policyDetails?.COMPANYID ||
      policyDetails?.quoteId?.company?._id;

    if (!companyId) {
      navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
        policyData: policyDetails,
        garageList: [],
      });
      return;
    }

    fetchGarages(
      { companyId },
      {
        onSuccess: res => {
          const garageData = res?.data?.data || res?.data || [];
          const garageNames = Array.isArray(garageData)
            ? garageData.map(g => g?.garageId?.garageName || g?.garageName || g)
            : [];

          navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
            policyData: policyDetails,
            garageList: garageNames,
          });
        },
        onError: () => {
          navigation.navigate(SCREEN_NAMES.CLAIM_USER_DETAILS, {
            policyData: policyDetails,
            garageList: [],
          });
        },
      },
    );
  };

  const handleSearch = async () => {
    if (!policyNumber.trim()) return;
    setErrorType(null);
    setPolicyDetails(null);

    searchPolicy(policyNumber, {
      onSuccess: response => {
        if (response?.data?.data) {
          const resData = response.data.data;
          if (resData.category === 'TPL') {
            setErrorType('third-party');
            setIsDocked(false);
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
          } else {
            setPolicyDetails(resData);
            setIsDocked(true);
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
          }
        } else {
          setErrorType('not-found');
          setIsDocked(false);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      },
      onError: () => {
        setErrorType('not-found');
        setIsDocked(false);
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

  // ─── renderPolicyContent: full pattern-based logic from old code ───────────
  const renderPolicyContent = () => {
    if (!policyDetails) return null;

    // Pattern A: Standard/Global Structure
    if (policyDetails.POLICYNO) {
      return (
        <View style={styles.resultsWrapper}>
          <Section title="Policy Details">
            <DetailRow label="Company ID" value={policyDetails.COMPANYID} />
            <DetailRow
              label="Customer Name"
              value={policyDetails.CUSTOMERNAME}
            />
            <DetailRow
              label="Customer Type"
              value={policyDetails.CUSTOMERTYPE}
            />
            <DetailRow label="Insurance Code" value={policyDetails.INSCODE} />
            <DetailRow label="Insurance Name" value={policyDetails.INSNAME} />
            <DetailRow
              label="Policy Sub Group"
              value={policyDetails.POLICYSUBGROUP}
            />
            <DetailRow
              label="Policy Date"
              value={formatDate(policyDetails.POLICYDATE)}
            />
            <DetailRow label="Policy Group" value={policyDetails.POLICYGROUP} />
            <DetailRow
              label="Policy Type ID"
              value={policyDetails.POLICYTYPEID}
            />
            <DetailRow
              label="Start Date"
              value={formatDate(policyDetails.STARTDATE)}
            />
            <DetailRow
              label="Created At"
              value={formatDate(policyDetails.CREATEDATE)}
            />
            <DetailRow label="Insured" value={policyDetails.INSURED} />
            <DetailRow label="Discount" value={policyDetails.DISCOUNT} />
            <DetailRow
              label="Insurance Commission VAT"
              value={policyDetails.INSCOMMVAT}
            />
            <DetailRow
              label="Company Policy Number"
              value={policyDetails.companyPolicyNumber}
            />
            <DetailRow label="Policy Class" value={policyDetails.POLICYCLASS} />
            <DetailRow label="Policy Fee" value={policyDetails.POLICYFEE} />
            <DetailRow label="Policy Type" value={policyDetails.POLICYTYPE} />
            <DetailRow label="Premium" value={policyDetails.PREMIUM} />
            <DetailRow
              label="Expiry Date"
              value={formatDate(policyDetails.EXPIRYDATE)}
            />
          </Section>
        </View>
      );
    }

    // Pattern B: Praktora Structure
    if (policyDetails.isPraktora) {
      return (
        <View style={styles.resultsWrapper}>
          <Section title="Policy Details">
            <DetailRow
              label="Customer Name"
              value={policyDetails.adminId?.fullName}
            />
            <DetailRow label="Email" value={policyDetails.adminId?.email} />
            <DetailRow
              label="Company Policy Number"
              value={policyDetails.companyPolicyNumber}
            />
            <DetailRow
              label="Insurance Type"
              value={policyDetails.quote?.insuranceType}
            />
            <DetailRow
              label="Policy Expiry Date"
              value={formatDate(policyDetails.policyExpiryDate)}
            />
            <DetailRow
              label="Marital Status"
              value={policyDetails.adminId?.maritalStatus}
            />
            <DetailRow
              label="Created At"
              value={formatDate(policyDetails.createdAt)}
            />
            <DetailRow
              label="Company Name"
              value={policyDetails.quote?.company?.companyName}
            />
            <DetailRow
              label="Mobile Number"
              value={policyDetails.adminId?.mobileNumber}
            />
            <DetailRow
              label="Policy Issue Date"
              value={formatDate(policyDetails.policyIssueDate)}
            />
            <DetailRow
              label="Occupation"
              value={policyDetails.adminId?.occupation}
            />
            <DetailRow
              label="Total Price"
              value={policyDetails.quote?.totalPrice}
            />
          </Section>
        </View>
      );
    }

    // Pattern C: Generic/Other Structure (most detailed)
    return (
      <View style={styles.resultsWrapper}>
        <Section title="Policy Overview">
          <DetailRow
            label="Company Name"
            value={
              policyDetails.quoteId?.company?.companyName ||
              policyDetails.quote?.company?.companyName
            }
          />
          <DetailRow
            label="Proposals Number"
            value={policyDetails.quote?.proposalId}
          />
          <DetailRow label="Policy Number" value={policyDetails.policyNumber} />
          <DetailRow
            label="Company Policy Number"
            value={
              policyDetails.companyPolicyNumber ||
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
            label="Start Date"
            value={formatDate(policyDetails.response?.PolicyEffectiveDate)}
          />
          <DetailRow
            label="End Date"
            value={formatDate(policyDetails.response?.PolicyExpiryDate)}
          />
          <DetailRow
            label="Policy Holder"
            value={policyDetails.motorInfoId?.fullName || 'Policy holder name'}
          />
          <DetailRow
            label="Insured Declared Value"
            value={
              policyDetails.carId?.price || policyDetails.quoteId?.carValue
                ? `AED ${
                    policyDetails.carId?.price ||
                    policyDetails.quoteId?.carValue
                  }`
                : '-'
            }
          />
          <DetailRow
            label="Car Details"
            value={`${policyDetails.carId?.make || ''} ${
              policyDetails.carId?.model || ''
            }`}
          />
        </Section>

        <Section title="Car Details">
          <DetailRow label="Brand" value={policyDetails.carId?.make} />
          <DetailRow label="Model" value={policyDetails.carId?.model} />
          <DetailRow label="Year" value={policyDetails.carId?.year} />
          <DetailRow
            label="No. of Cylinders"
            value={policyDetails.carId?.cylinders}
          />
          <DetailRow
            label="Regional Spec"
            value={policyDetails.carId?.regionalSpec}
          />
          <DetailRow label="Body Type" value={policyDetails.carId?.bodyType} />
          <DetailRow
            label="Insure Type"
            value={policyDetails.carId?.insureType}
          />
          <DetailRow
            label="Policy Start Date"
            value={formatDate(policyDetails.carId?.policyEffectiveDate)}
          />
          <DetailRow
            label="Insurance Expiry Date"
            value={formatDate(policyDetails.carId?.insuranceExpiryDate)}
          />
          <DetailRow
            label="Registration Date"
            value={formatDate(policyDetails.carId?.registrationDate)}
          />
          <DetailRow
            label="Registration Emirate"
            value={policyDetails.carId?.registrationEmirate}
          />
          <DetailRow
            label="Plate Number"
            value={policyDetails.carId?.plateNumber}
          />
          <DetailRow
            label="Plate Code"
            value={policyDetails.carId?.plateCode}
          />
          <DetailRow
            label="Chassis No."
            value={
              policyDetails.carId?.chesisNo ||
              policyDetails.carId?.chassisNumber
            }
          />
          <DetailRow
            label="Engine Number"
            value={policyDetails.carId?.engineNumber}
          />
          <DetailRow label="Color" value={policyDetails.carId?.color} />
          <DetailRow
            label="No. of Passengers"
            value={policyDetails.carId?.noOfPassengers}
          />
          <DetailRow
            label="Reg. Card TC No."
            value={policyDetails.carId?.tcNo}
          />
          <DetailRow
            label="Use of Vehicle"
            value={policyDetails.carId?.useOfVehicle}
          />
        </Section>

        <Section title="Customer Details">
          <DetailRow
            label="Insured Name"
            value={
              policyDetails.motorInfoId?.fullName ||
              policyDetails.userId?.fullName
            }
          />
          <DetailRow
            label="Arabic Name"
            value={
              policyDetails.motorInfoId?.arabicName ||
              policyDetails.userId?.arabicName
            }
          />
          <DetailRow
            label="Insured Email"
            value={
              policyDetails.motorInfoId?.email || policyDetails.userId?.email
            }
          />
          <DetailRow
            label="Mobile No."
            value={
              policyDetails.motorInfoId?.mobileNumber ||
              policyDetails.userId?.mobileNumber
            }
          />
          <DetailRow
            label="Date of Birth"
            value={formatDate(
              policyDetails.motorInfoId?.dateOfBirth ||
                policyDetails.userId?.dateOfBirth,
            )}
          />
          <DetailRow
            label="Age"
            value={policyDetails.motorInfoId?.age || policyDetails.userId?.age}
          />
          <DetailRow
            label="Gender"
            value={
              policyDetails.motorInfoId?.gender || policyDetails.userId?.gender
            }
          />
          <DetailRow
            label="Nationality"
            value={
              policyDetails.motorInfoId?.nationality ||
              policyDetails.userId?.nationality
            }
          />
          <DetailRow
            label="Occupation"
            value={
              policyDetails.motorInfoId?.occupation ||
              policyDetails.userId?.occupation
            }
          />
          <DetailRow
            label="ID Number"
            value={
              policyDetails.motorInfoId?.emiratesId ||
              policyDetails.userId?.emiratesId
            }
          />
          <DetailRow
            label="ID Expiry"
            value={formatDate(
              policyDetails.motorInfoId?.emiratesIdExpiryDate ||
                policyDetails.userId?.emiratesIdExpiryDate,
            )}
          />
          <DetailRow
            label="Driving License No."
            value={
              policyDetails.motorInfoId?.licenceNo ||
              policyDetails.userId?.licenceNo
            }
          />
          <DetailRow
            label="Driving License Issue"
            value={formatDate(
              policyDetails.motorInfoId?.licenceIssueDate ||
                policyDetails.userId?.licenceIssueDate,
            )}
          />
          <DetailRow
            label="Driving License Expiry"
            value={formatDate(
              policyDetails.motorInfoId?.licenceExpiryDate ||
                policyDetails.userId?.licenceExpiryDate,
            )}
          />
          <DetailRow
            label="Driving License Source"
            value={
              policyDetails.motorInfoId?.placeOfIssueDL ||
              policyDetails.userId?.placeOfIssueDL
            }
          />
        </Section>

        <Section title="Additional Policy Details">
          <DetailRow
            label="Insurance Company"
            value={
              policyDetails.quoteId?.company?.companyName ||
              policyDetails.quote?.company?.companyName
            }
          />
          <DetailRow
            label="Policy Expiry"
            value={formatDate(policyDetails.response?.PolicyExpiryDate)}
          />
          <DetailRow
            label="Type"
            value={`${
              policyDetails.quote?.insuranceType === 'thirdparty'
                ? 'Third Party'
                : 'Comprehensive'
            }${policyDetails.quote?.basicQuote ? ' (Basic)' : ''}`}
          />
          <DetailRow
            label="Repair Type"
            value={
              policyDetails.quoteId?.basicQuote
                ? '-'
                : policyDetails.quoteId?.repairType
                ? policyDetails.quoteId?.repairType === 'nonagency'
                  ? 'Non Agency'
                  : 'Agency'
                : policyDetails.quoteId?.insuranceType === 'thirdparty'
                ? 'Third Party'
                : 'Non Agency'
            }
          />
          <DetailRow
            label="Policy Issue"
            value={formatDate(policyDetails.response?.PolicyEffectiveDate)}
          />
          <DetailRow
            label="Ref No"
            value={
              policyDetails.policyNumber || policyDetails.response?.PolicyNumber
            }
          />
          <DetailRow
            label="Source"
            value={policyDetails.quoteId?.source || policyDetails.quote?.source}
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
        <View style={styles.heroContainer}>
          <Image
            source={Insurance.PolicyClaim}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <Header
            title="Motor Claims"
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
              <Text style={styles.secureText}>Assisted Claims</Text>
            </View>
            <Text style={styles.heroTitle}>File Your Claim</Text>
            <Text style={styles.heroSubtitle}>
              Efficiently process your motor insurance claims
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Policy Verification</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your policy number to verify your coverage details and start
              your claim request.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <FloatingLabelInput
              label="Policy Number"
              value={policyNumber}
              onChangeText={text => {
                setPolicyNumber(text);
                if (errorType || policyDetails) {
                  setErrorType(null);
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

          {/* ── Error Cards (full styled version from old code) ── */}
          {errorType === 'third-party' && (
            <View style={styles.errorCard}>
              <View style={styles.errorIconBox}>
                <Icon
                  name="alert-triangle"
                  size={scale(24)}
                  color={theme.colors.red}
                />
              </View>
              <Text style={styles.errorHeaderText}>Third Party Insurance</Text>
              <Text style={styles.errorBodyText}>
                Motor claims are not available for Third Party insurance
                policies. Please contact your insurance provider directly for
                assistance.
              </Text>
            </View>
          )}

          {errorType === 'not-found' && (
            <View style={styles.errorCard}>
              <View style={styles.errorIconBox}>
                <Icon name="search" size={scale(24)} color={theme.colors.red} />
              </View>
              <Text style={styles.errorHeaderText}>Policy Not Found</Text>
              <Text style={styles.errorBodyText}>
                The policy number you entered could not be found. Please verify
                and try again.
              </Text>
            </View>
          )}

          {policyDetails && renderPolicyContent()}
        </View>
      </ScrollView>

      {policyDetails && (
        <FloatingButton
          title="Initialize Claim"
          onPress={handleNextPage}
          isLoading={garageLoading}
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

    // ── Error Cards ──
    errorCard: {
      padding: scale(20),
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(16),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.red + '30',
      gap: verticalScale(10),
    },
    errorIconBox: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      backgroundColor: theme.colors.red + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(5),
    },
    errorHeaderText: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    errorBodyText: {
      fontSize: fontScale(13),
      color: theme.colors.description,
      textAlign: 'center',
      lineHeight: fontScale(18),
      fontFamily: 'Lato-Regular',
    },

    // ── Results ──
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

export default ClaimPolicy;
