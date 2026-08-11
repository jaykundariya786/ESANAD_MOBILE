import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '@store/authStore';
import { fontScale, scale, verticalScale } from '@constants/metrics';
import { useMotorDetalisStore } from '@store/MOTOR/motorStore';
import { useThemeContext } from '@theme/ThemeProvider';
import { useReviewMotor } from '@hooks/motorflow/useMotorFlowTop';
import moment from 'moment';
import { useGetMotorQuotes } from '@hooks/motorflow/useMotorFlow';
import { useLottieLoader } from '@provider/LottieLoaderProvider';
import { Images } from '@assets/index';
import FloatingButton from '@components/ui/FloatingButton';

const { width } = Dimensions.get('window');

const FinalReviewScreen = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const { user } = useAuthStore();
  const { calculateCarValue, manulUesrDetails, updateCarDeatils } =
    useMotorDetalisStore();
  const { mutate: getMotorQuotes } = useGetMotorQuotes();
  const { data: reviewMotor = [] } = useReviewMotor({
    carId: calculateCarValue?._id,
    userId: user?._id,
  });
  const { showLoader, hideLoader } = useLottieLoader();

  const carInfo = [
    { label: 'Year', value: reviewMotor?.carData?.year },
    { label: 'Make', value: reviewMotor?.carData?.make },
    { label: 'Model', value: reviewMotor?.carData?.model },
    { label: 'Spec', value: reviewMotor?.carData?.regionalSpec },
    { label: 'Trim', value: reviewMotor?.carData?.trim },
    { label: 'Body', value: reviewMotor?.carData?.bodyType },
    { label: 'Cylinders', value: reviewMotor?.carData?.cylinders },
    { label: 'Doors', value: reviewMotor?.carData?.noOfDoors },
    { label: 'Seats', value: reviewMotor?.carData?.noOfPassengers },
    { label: 'Chassis', value: reviewMotor?.carData?.chassisNo },
    { label: 'TC No', value: reviewMotor?.carData?.tcNumber },
    { label: 'Reg Date', value: reviewMotor?.carData?.registrationDate },
    { label: 'Expiry', value: reviewMotor?.carData?.registrationExpiry },
  ];

  const userInfo = [
    { label: 'Name', value: reviewMotor?.userDetails?.fullName },
    {
      label: 'Phone',
      value: reviewMotor?.userDetails?.mobileNumber
        ? `+${reviewMotor?.userDetails?.countryCode} ${reviewMotor?.userDetails?.mobileNumber}`
        : null,
    },
    {
      label: 'DOB',
      value: reviewMotor?.userDetails?.dateOfBirth
        ? moment(reviewMotor?.userDetails?.dateOfBirth).format('DD/MM/YYYY')
        : null,
    },
    { label: 'Age', value: reviewMotor?.userDetails?.age },
    { label: 'Nationality', value: reviewMotor?.userDetails?.nationality },
    { label: 'Email', value: reviewMotor?.userDetails?.email },
    {
      label: 'Policy Issue',
      value: reviewMotor?.carData?.policyEffectiveDate
        ? moment(reviewMotor?.carData?.policyEffectiveDate).format(
            'DD MMM YYYY',
          )
        : null,
    },
    { label: 'No Claim', value: reviewMotor?.carData?.yearOfNoClaim },
  ];

  const handleGetQuotes = () => {
    updateCarDeatils(reviewMotor);
    const userDetails = reviewMotor?.userDetails || manulUesrDetails;
    const carDetails = reviewMotor?.carData;
    const payload = {
      ...userDetails,
      carId: carDetails?._id,
      motorInfoId: manulUesrDetails?.motorInfoId,
      proposalId: manulUesrDetails?.proposalId,
    };

    showLoader('motor');

    getMotorQuotes(
      { data: payload },
      {
        onError: () => {
          hideLoader();
        },
      },
    );
  };

  const renderGrid = (data, cols = 2) => (
    <View style={styles.grid}>
      {data.map((item, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            { width: (width - scale(40) - (cols - 1) * scale(10)) / cols },
          ]}
        >
          <Text style={styles.gridLabel}>{item.label}</Text>
          <Text style={styles.gridValue} numberOfLines={1}>
            {item.value || '-'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={{ gap: verticalScale(5) }}>
          <Text style={styles.heading}>Final Review</Text>
          <Text style={styles.subheading}>Confirm your details to proceed</Text>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.imageContainer}>
            {/* <Image
              source={
                reviewMotor?.carData?.carImage
                  ? { uri: reviewMotor?.carData?.carImage }
                  : Images.CarPlace
              }
              resizeMode="contain"
              style={styles.carImage}
            /> */}
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceLabel}>Estimated Value</Text>
            <Text style={styles.priceValue}>
              {reviewMotor?.carData?.price
                ? `AED ${Number(reviewMotor?.carData?.price).toLocaleString()}`
                : '-'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automobile Details</Text>
          {/* Main Car Details in 2 col */}
          {renderGrid(carInfo.slice(0, 3), 3)}
          {renderGrid(carInfo.slice(3, 6), 3)}
          {/* Technical Specs in 3 col */}
          {renderGrid(carInfo.slice(6, 9), 3)}
          {/* Registration Details in 2 col */}
          {renderGrid(carInfo.slice(9), 2)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy Holder</Text>
          {/* Contact Details in 2 col */}
          {renderGrid(userInfo.slice(0, 2), 2)}
          {/* Personal Info in 3 col */}
          {renderGrid(userInfo.slice(2, 5), 3)}
          {/* Policy Info in 2 col */}
          {renderGrid(userInfo.slice(5), 2)}
        </View>
      </ScrollView>

      <FloatingButton onPress={handleGetQuotes} title="Get Quotes" isShowIcon />
    </View>
  );
};

export default FinalReviewScreen;

const getStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: scale(20),
      paddingBottom: verticalScale(100),
      gap: verticalScale(15),
    },
    heading: {
      fontSize: fontScale(26),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheading: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: scale(15),
      paddingHorizontal: scale(15),
      overflow: 'hidden',
      alignSelf: 'flex-start',
      // gap: scale(15),
    },
    imageContainer: {
      // width: scale(160),
      // height: scale(115),
      height: scale(70),
      justifyContent: 'center',
    },
    carImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    priceTag: {
      // flex: 1,
      gap: verticalScale(2),
    },
    priceLabel: {
      fontSize: fontScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
    },
    priceValue: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.primary,
    },
    section: {
      gap: verticalScale(12),
    },
    sectionTitle: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
    },
    gridItem: {
      backgroundColor: theme.colors.backgroundColor,
      padding: scale(12),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    gridLabel: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      marginBottom: verticalScale(2),
    },
    gridValue: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.text,
    },
  });
