import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { useForm, Controller } from 'react-hook-form';
import { fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import {
  useCreateUser,
  useGetNationalList,
} from '@hooks/motorflow/useMotorFlowTop';
import { useAuthStore } from '@store/authStore';
import { useMotorDetalisStore } from '@store/MOTOR/motorStore';
import { ageCalculator } from '@utils/ageCalculator';
import axios from 'axios';

import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import DatePickerModal from '@components/ui/CustomDatePicker';
import CustomCheckBox from '@components/ui/CustomCheckBox';
import moment from 'moment';
import { CONSTANTS } from '@constants/staticJson';
import CustomSingleSlider from '@components/ui/CustomSingleSlider';
import PersonalDetailsCard from '@components/ui/PersonalDetailsCard';
import InlineSelect from '@components/ui/InlineSelect';
import DobAgePicker from '@components/ui/DobAgePicker';
import SegmentedToggle from '@components/ui/SegmentedToggle';
import ModernDatePicker from '@components/ui/ModernDatePicker';
import FloatingButton from '@components/ui/FloatingButton';

const claimOptions = Object.entries(CONSTANTS.CLAIM_OPTIONS).map(
  ([, label]) => ({ label, value: label }),
);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - verticalScale(70);

const MotorInsuranceWizard = () => {
  const { theme } = useThemeContext();
  const styles = style(theme);

  const [personalModalOpen, setPersonalModalOpen] = useState(false);
  const [policyIssueDateModalOpen, setPolicyIssueDateModalOpen] =
    useState(false);
  const [dob, setDob] = useState(null);
  const [policyIssueDate, setPolicyIssueDate] = useState(null);

  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyStartDate, setPolicyStartDate] = useState(
    new Date(Date.now() + 86400000),
  );
  const [isComprehensive, setIsComprehensive] = useState(true);
  const [isCurrentInsuranceActive, setIsCurrentInsuranceActive] =
    useState(true);
  const [isDrivingLicenseValid, setIsDrivingLicenseValid] = useState(true);
  const [personalEditOpen, setPersonalEditOpen] = useState(false);

  const { data: nationalList = [] } = useGetNationalList();
  const { token, user } = useAuthStore();
  const { mutate: createUser, isPending } = useCreateUser();
  const {
    calculateCarValue,
    updateIsComprehensiveInsurance,
    updateIsActiveInsurance,
    updatePolicyDetails,
    updateClaimDetails,
  } = useMotorDetalisStore();

  const nationalities = useMemo(
    () => nationalList.map(y => ({ label: y, value: y })),
    [nationalList],
  );

  const minVal = calculateCarValue?.valuation?.Low || 1000;
  const maxVal = calculateCarValue?.valuation?.High || 500000;
  const minCarValue = Math.ceil(minVal / 100) * 100;
  const maxCarValue = Math.ceil(maxVal / 100) * 100;
  const defaultCarValue = calculateCarValue?.price || minCarValue;

  const {
    control: personalControl,
    handleSubmit: handlePersonalSubmit,
    setValue,
    watch,
    formState: { errors: personalErrors },
  } = useForm({
    defaultValues: {
      name: user?.fullName,
      mobileNumber: user?.mobileNumber
        ? { phone: user?.mobileNumber, isValid: true }
        : { phone: '', isValid: false },
      email: user?.email,
      nationality: user?.nationality,
      dateOfBirth: user?.dateOfBirth,
      age: user?.dateOfBirth ? ageCalculator(user?.dateOfBirth) : '',
      country: user?.countryCode,
      carValue: defaultCarValue || calculateCarValue?.price,
      yearOfNoClaim: claimOptions[claimOptions.length - 1]?.value || '',
      confirmDeclaration: true,
      dateOfIssue: moment().format(),
      drivingLicenseValid: true,
      isComprehensive: true,
      isCurrentInsuranceActive: true,
    },
  });
  const watchAll = watch();
  const watchIsComprehensive = watch('isComprehensive');
  const watchIsCurrentInsuranceActive = watch('isCurrentInsuranceActive');
  const watchNationality = watch('nationality');
  const watchYearOfNoClaim = watch('yearOfNoClaim');
  const watchCarValue = watch('carValue');

  useEffect(() => {
    if (calculateCarValue) {
      setValue('carValue', calculateCarValue?.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateCarValue]);

  const handlePersonalDobConfirm = selectedDate => {
    setDob(selectedDate);
    const dobISO = selectedDate.toISOString();
    setValue('dateOfBirth', dobISO, { shouldValidate: true });
    setValue('age', ageCalculator(dobISO), { shouldValidate: true });
    setPersonalModalOpen(false);
  };

  const handlePolicyIssueDateConfirm = selectedDate => {
    setPolicyIssueDate(selectedDate);
    const dateISO = selectedDate.toISOString();
    setValue('dateOfIssue', dateISO, { shouldValidate: true });
    setPolicyIssueDateModalOpen(false);
  };

  const updateClamDetails = claimValue => {
    // Call the store method if it exists, otherwise handle locally
    if (updateClaimDetails) {
      updateClaimDetails(claimValue);
    }
  };

  const onSubmitPersonalDetails = data => {
    const phoneString =
      (data.mobileNumber && data.mobileNumber.phone) || data.mobileNumber || '';

    const payload = {
      fullName: data.name,
      email: data.email,
      mobileNumber: phoneString,
      nationality: data.nationality,
      dob: data.dateOfBirth,
      age: parseInt(data.age),
      policyStartDate: data.dateOfIssue,
      yearsOfNoClaim: data.yearOfNoClaim,
      oneYearLicence: data.drivingLicenseValid,
      insureType: data.isComprehensive,
      isCurrentInsuranceActive: data.isCurrentInsuranceActive,
      countryCode: data.country,
    };

    const chatbot = {
      customer_name: data.name,
      to: `${data.country}${phoneString}`,
      source: 'web',
      template: {
        name: 'welcome_to_esanad',
        previous_category: 'UTILITY',
        parameter_format: 'POSITIONAL',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Hello and welcome to eSanad Insurance!',
          },
          {
            type: 'BODY',
            text: "We're glad to have you here. Whether you're looking for the best insurance options, need support with your existing policy, or just have a quick question we're here to help.",
          },
          {
            type: 'FOOTER',
            text: 'eSanad Team!',
          },
        ],
        language: 'en',
        status: 'APPROVED',
        category: 'MARKETING',
        id: '24306832118900637',
      },
    };

    const userToken = token;

    if (!__DEV__) {
      axios
        .post(
          `https://api.aibot.esanad.com/api/public/chat/add-customer-to-chatbot`,
          chatbot,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json',
              'x-stack-token':
                'IGAA6YRYASZAeBBZAE9zRUp1YWFmNEdZAN2ctMlhoU1BCWG1fWH',
            },
          },
        )
        .then(res => {
          console.log('Chatbot response:', res);
          createUser({ id: calculateCarValue?._id, data: payload });
        })
        .catch(err => {
          console.error('Chatbot error:', err);
          createUser({ id: calculateCarValue?._id, data: payload });
        });
    } else {
      createUser({ id: calculateCarValue?._id, data: payload });
    }
  };

  const onDobSelect = selectedDate => {
    const dobISO = selectedDate.toISOString();
    setValue('dateOfBirth', dobISO, { shouldValidate: true });
    setValue('age', ageCalculator(dobISO), { shouldValidate: true });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Review & Quote</Text>
          <Text style={styles.subheading}>
            Double check your details and finalize car valuation.
          </Text>
        </View>

        <PersonalDetailsCard
          data={watchAll}
          onEdit={() => setPersonalEditOpen(true)}
        />

        {/* <View style={{ gap: verticalScale(20), marginTop: verticalScale(15) }}> */}
        <InlineSelect
          label="Year of No Claim"
          value={watchYearOfNoClaim}
          items={claimOptions}
          onSelect={val => {
            setValue('yearOfNoClaim', val, { shouldValidate: true });
            updateClamDetails(val);
          }}
        />

        <SegmentedToggle
          label="Is current insurance Comprehensive?"
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]}
          value={watchIsComprehensive}
          onSelect={val => {
            setValue('isComprehensive', val);
            updateIsComprehensiveInsurance(val);
          }}
        />

        <SegmentedToggle
          label="Is current insurance still active?"
          options={[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]}
          value={watchIsCurrentInsuranceActive}
          onSelect={val => {
            setValue('isCurrentInsuranceActive', val);
            updateIsActiveInsurance(val);
          }}
        />

        <Controller
          control={personalControl}
          name="dateOfIssue"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ModernDatePicker
              label="Policy Issue Date"
              value={value}
              onSelectDate={onChange}
              error={error?.message}
              maxDate={new Date()}
            />
          )}
        />

        <View style={styles.valuationBox}>
          <Text style={styles.sectionTitle}>Car Valuation (AED)</Text>
          <CustomSingleSlider
            sliderWidth={SLIDER_WIDTH}
            min={minCarValue}
            max={maxCarValue}
            step={100}
            initialValue={watchCarValue || defaultCarValue}
            onValueChange={newValue =>
              setValue('carValue', newValue, { shouldValidate: true })
            }
            theme={theme}
          />
        </View>

        <Controller
          control={personalControl}
          name="drivingLicenseValid"
          rules={{
            validate: value =>
              isDrivingLicenseValid ||
              'You must confirm your driving license is valid',
          }}
          render={({ field: { value } }) => (
            <View>
              <CustomCheckBox
                label="My Driving licence is above 1 year old and issued in UAE."
                value={isDrivingLicenseValid}
                onChange={checked => {
                  setIsDrivingLicenseValid(checked);
                  setValue('drivingLicenseValid', checked, {
                    shouldValidate: true,
                  });
                }}
              />
              {personalErrors.drivingLicenseValid && (
                <Text style={styles.errorText}>
                  {personalErrors.drivingLicenseValid.message}
                </Text>
              )}
            </View>
          )}
        />
        <Controller
          control={personalControl}
          name="confirmDeclaration"
          rules={{
            validate: value =>
              value === true || 'You must confirm the declaration',
          }}
          render={({ field: { value }, fieldState: { error } }) => (
            <View>
              <CustomCheckBox
                label="I hereby confirm that my declaration of no claim is accurate, and I can provide written proof upon request."
                onChange={checked => {
                  setValue('confirmDeclaration', checked, {
                    shouldValidate: true,
                  });
                }}
                value={value}
              />
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />
        {/* </View> */}

        <DatePickerModal
          visible={personalModalOpen}
          maxDate={new Date()}
          initialDate={
            dob ||
            (personalControl._formValues.dateOfBirth
              ? new Date(personalControl._formValues.dateOfBirth)
              : new Date(new Date().setFullYear(new Date().getFullYear() - 25)))
          }
          onClose={() => setPersonalModalOpen(false)}
          onConfirm={handlePersonalDobConfirm}
        />

        <DatePickerModal
          visible={policyIssueDateModalOpen}
          maxDate={new Date()}
          initialDate={
            policyIssueDate ||
            (personalControl._formValues.dateOfIssue
              ? new Date(personalControl._formValues.dateOfIssue)
              : new Date())
          }
          onClose={() => setPolicyIssueDateModalOpen(false)}
          onConfirm={handlePolicyIssueDateConfirm}
        />

        <Modal
          visible={personalEditOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPersonalEditOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Information</Text>
                <TouchableOpacity onPress={() => setPersonalEditOpen(false)}>
                  <Icon name="x" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <View style={styles.modalFields}>
                  <Controller
                    control={personalControl}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <FloatingLabelInput
                        label="Full Name"
                        value={value}
                        onChangeText={onChange}
                        error={personalErrors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    control={personalControl}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <FloatingLabelInput
                        label="Email Address"
                        value={value}
                        onChangeText={onChange}
                        error={personalErrors.email?.message}
                        autoCapitalize="none"
                      />
                    )}
                  />

                  <Controller
                    control={personalControl}
                    name="dateOfBirth"
                    render={({ field: { value }, fieldState: { error } }) => (
                      <DobAgePicker
                        value={value}
                        age={watch('age')}
                        onSelectDate={onDobSelect}
                        error={error?.message}
                      />
                    )}
                  />

                  <InlineSelect
                    label="Nationality"
                    value={watchNationality}
                    items={nationalities}
                    onSelect={val =>
                      setValue('nationality', val, { shouldValidate: true })
                    }
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setPersonalEditOpen(false)}
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <DatePickerModal
          visible={policyModalOpen}
          initialDate={policyStartDate}
          onClose={() => setPolicyModalOpen(false)}
          minDate={new Date()}
          onConfirm={selectedDate => {
            setPolicyStartDate(selectedDate);
            updatePolicyDetails(selectedDate);
            setPolicyModalOpen(false);
          }}
        />
      </ScrollView>
      <FloatingButton
        onPress={handlePersonalSubmit(onSubmitPersonalDetails)}
        isLoading={isPending}
        isShowIcon
      />
    </View>
  );
};

export default MotorInsuranceWizard;

const style = theme =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      gap: verticalScale(15),
      padding: verticalScale(20),
      paddingBottom: verticalScale(120),
    },
    title: {
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
      fontSize: verticalScale(16),
    },
    header: {
      gap: verticalScale(5),
    },
    heading: {
      fontSize: fontScale(26),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    subheading: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(18),
    },
    valuationBox: {
      backgroundColor: theme.colors.backgroundColor,
      padding: verticalScale(20),
      borderRadius: verticalScale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(10),
    },
    subtitle: {
      color: theme.colors.description,
      textAlign: 'center',
      fontSize: verticalScale(14),
      marginVertical: verticalScale(10),
    },
    errorText: {
      fontSize: verticalScale(12),
      marginTop: verticalScale(5),
      color: theme.colors.red,
      marginLeft: verticalScale(5),
    },
    errorBorder: {
      borderColor: theme.colors.red,
    },
    optionBox: {
      gap: verticalScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      padding: verticalScale(14),
      borderColor: theme.colors.border,
      borderRadius: verticalScale(5),
      backgroundColor: theme.colors.backgroundColor,
      marginVertical: verticalScale(5),
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.lightPrimary,
    },
    optionTitle: {
      fontWeight: '700',
      fontSize: verticalScale(15),
      fontFamily: 'Inter',
      color: theme.colors.primary,
      flex: 1,
    },
    optionText: {
      fontWeight: '400',
      fontSize: verticalScale(15),
      fontFamily: 'Inter',
      color: theme.colors.text,
    },
    orText: {
      fontWeight: '700',
      fontSize: verticalScale(15),
      fontFamily: 'Inter',
      color: theme.colors.primary,
      textAlign: 'center',
      marginVertical: verticalScale(10),
    },
    nextButton: {
      marginTop: verticalScale(30),
      width: '50%',
      alignSelf: 'center',
    },
    dateAgeContainer: {
      flexDirection: 'row',
      gap: verticalScale(15),
      alignItems: 'flex-start',
    },
    datePickerButton: {
      height: verticalScale(50),
      flex: 1,
      borderRadius: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: verticalScale(15),
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundColor,
    },
    datePickerLabel: {
      position: 'absolute',
      top: -verticalScale(7),
      left: verticalScale(13),
      backgroundColor: theme.colors.backgroundColor,
      paddingHorizontal: verticalScale(5),
      fontSize: verticalScale(12),
      color: theme.colors.textTertiary,
      fontFamily: 'Lato-Regular',
    },
    datePickerText: {
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
      fontSize: verticalScale(14),
    },
    placeholderText: {
      color: theme.colors.description,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundColor,
      borderTopLeftRadius: verticalScale(30),
      borderTopRightRadius: verticalScale(30),
      height: SCREEN_HEIGHT * 0.65,
      paddingTop: verticalScale(20),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: verticalScale(24),
      marginBottom: verticalScale(20),
    },
    modalTitle: {
      fontSize: fontScale(20),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    modalScroll: {
      padding: verticalScale(20),
      paddingBottom: verticalScale(40),
    },
    modalFields: {
      gap: verticalScale(16),
      marginBottom: verticalScale(30),
    },
    saveBtn: {
      backgroundColor: theme.colors.primary,
      height: verticalScale(54),
      borderRadius: verticalScale(16),
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveBtnText: {
      color: theme.colors.backgroundColor,
      fontSize: fontScale(16),
      fontFamily: 'Lato-Bold',
    },
  });
