import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, verticalScale } from '@constants/metrics';
import Header from '@components/ui/Header';
import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import FloatingButton from '@components/ui/FloatingButton';
import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import InlineSelect from '@components/ui/InlineSelect';
import WrapKeyboardAwareScrollView from '@components/ui/WrapKeyboardAwareScrollView';
import { SCREEN_NAMES } from '@constants/screenNames';

const UAE_STATES = [
  'Abu Dhabi',
  'Ajman',
  'Dubai',
  'Fujairah',
  'Ras Al Khaimah',
  'Sharjah',
  'Umm Al Quwain',
];

const PLATE_CODES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '50',
  'A',
  'AA',
  'B',
  'C',
  'D',
  'DC',
  'DU',
  'DXB',
  'E',
  'EX',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'RN',
  'S',
  'T',
  'TC',
  'TL',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const ClaimUserDetails = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const route = useRoute();
  const { policyData, garageList = [] } = route.params || {};

  const [formData, setFormData] = useState({
    policyId: policyData?._id || '',
    customerName:
      policyData?.motorInfoId?.fullName || policyData?.userId?.fullName || '',
    customerEmail:
      policyData?.motorInfoId?.email || policyData?.userId?.email || '',
    customerMobileNo:
      policyData?.motorInfoId?.mobileNumber ||
      policyData?.userId?.mobileNumber ||
      '',
    plateCode: policyData?.carId?.plateCode || '',
    plateNumber: policyData?.carId?.plateNumber || '',
    policeReportNumber: '',
    policyNumber: policyData?.policyNumber || '',
    preferredGarageLocation: '',
    selectedGarage: '',
  });

  const plateCodeItems = useMemo(
    () => PLATE_CODES.map(c => ({ label: c, value: c })),
    [],
  );
  const uaeStatesItems = useMemo(
    () => UAE_STATES.map(s => ({ label: s, value: s })),
    [],
  );
  const garageItems = useMemo(
    () =>
      (garageList || []).map(g => ({ label: g.name || g, value: g._id || g })),
    [garageList],
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = location => {
    handleInputChange('preferredGarageLocation', location);
    handleInputChange('selectedGarage', ''); // Reset garage selection
  };

  const isFormValid = () => {
    return (
      formData.customerName &&
      formData.customerEmail &&
      formData.customerMobileNo &&
      formData.plateCode &&
      formData.plateNumber &&
      formData.policeReportNumber &&
      formData.policyNumber &&
      formData.preferredGarageLocation &&
      formData.selectedGarage
    );
  };

  const handleNext = () => {
    navigation.navigate(SCREEN_NAMES.MOTOR_DOCUMENT_UPLOAD, {
      claimData: formData,
    });
  };

  return (
    <View style={styles.screen}>
      <Header title="Customer Details" onBack={() => navigation.goBack()} />

      <WrapKeyboardAwareScrollView>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.heading}>Customer Details</Text>
            <Text style={styles.subheading}>
              Please fill all the fields related to you and your loss.
            </Text>
          </View>

          <View style={styles.fieldList}>
            <FloatingLabelInput
              label="Customer Name"
              value={formData.customerName}
              onChangeText={val => handleInputChange('customerName', val)}
              editable={false}
            />

            <FloatingLabelInput
              label="Customer Email"
              value={formData.customerEmail}
              onChangeText={val => handleInputChange('customerEmail', val)}
            />

            <CountryPhoneInput
              value={formData.customerMobileNo}
              onChange={data =>
                handleInputChange('customerMobileNo', data.phone)
              }
            />

            <InlineSelect
              label="Plate Code"
              value={formData.plateCode}
              items={plateCodeItems}
              onSelect={val => handleInputChange('plateCode', val)}
            />

            <FloatingLabelInput
              label="Plate Number"
              value={formData.plateNumber}
              onChangeText={val => handleInputChange('plateNumber', val)}
            />

            <FloatingLabelInput
              label="Police Report Number"
              value={formData.policeReportNumber}
              onChangeText={val => handleInputChange('policeReportNumber', val)}
            />

            <FloatingLabelInput
              label="Policy Number"
              value={formData.policyNumber}
              onChangeText={val => handleInputChange('policyNumber', val)}
            />

            <InlineSelect
              label="Preferred Repair location"
              value={formData.preferredGarageLocation}
              items={uaeStatesItems}
              onSelect={handleLocationChange}
            />

            <InlineSelect
              label="Garage Selection"
              value={formData.selectedGarage}
              items={garageItems}
              onSelect={val => handleInputChange('selectedGarage', val)}
            />
          </View>
        </ScrollView>
      </WrapKeyboardAwareScrollView>

      <FloatingButton
        disabled={!isFormValid()}
        onPress={handleNext}
        isShowIcon
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    container: {
      flexGrow: 1,
      gap: verticalScale(15),
      padding: verticalScale(20),
      paddingBottom: verticalScale(90), // Space for floating button
    },
    header: {
      gap: verticalScale(5),
    },
    heading: {
      fontSize: fontScale(24),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheading: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    fieldList: {
      gap: verticalScale(10),
    },
  });

export default ClaimUserDetails;
