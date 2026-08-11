import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Controller } from 'react-hook-form';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';

import { fontScale, moderateScale, verticalScale } from '@constants/metrics';
import { HEALTH_CONSTANTS } from '@constants/Static/healthJson';

import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import DatePickerModal from '@components/ui/CustomDatePicker';
import { CustomDropDownList } from '@components/ui/CustomDropDownList';
import CustomOptionList from '@components/ui/CustomOptionList';
import CustomRadioGroup from '@components/ui/CustomRadioGroup';
import CustomRadioIcon from '@components/ui/CustomRadioIcon';

import { useGetNationalList } from '@hooks/motorflow/useMotorFlowTop';
import { useCreateManualUser } from '@hooks/HEALTH/healthFlow/useHealthFlow';

import { useAuthStore } from '@store/authStore';
import { useHealthStore } from '@store/HEALTH/healthStore';

import { ageCalculator } from '@utils/ageCalculator';
import { useThemeContext } from '@theme/ThemeProvider';

import Calender from '@assets/icons/Calender';
import Male from '@assets/svg/Male';
import Female from '@assets/svg/Female';
import Married from '@assets/svg/Married';
import PersonalDetailsCard from '@components/ui/PersonalDetailsCard';
import FloatingButton from '@components/ui/FloatingButton';
import InlineSelect from '@components/ui/InlineSelect';
import DobAgePicker from '@components/ui/DobAgePicker';
import SegmentedToggle from '@components/ui/SegmentedToggle';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

// Accept renderSubmitButton prop from parent
const HealthQuotesScreen = ({
  control,
  errors,
  setValue,
  watch,
  renderSubmitButton, // Add this prop
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: nationalList = [] } = useGetNationalList();
  const { user } = useAuthStore();
  const { insuranceFor } = useHealthStore();
  const { mutate: createManualUser } = useCreateManualUser();

  const [dobModalOpen, setDobModalOpen] = useState(false);
  const [selectedDob, setSelectedDob] = useState(null);
  const [personalEditOpen, setPersonalEditOpen] = useState(false);

  const nationalityOptions = useMemo(
    () => nationalList.map(n => ({ label: n, value: n })),
    [nationalList],
  );

  const nationalityItems = useMemo(
    () => nationalList.map(n => ({ label: n, value: n })),
    [nationalList],
  );

  const cityItems = useMemo(
    () => HEALTH_CONSTANTS.CITY.map(c => ({ label: c.label, value: c.value })),
    [],
  );

  const genderOptions = useMemo(
    () => [
      { value: 'Male', label: 'Male', icon: <Male /> },
      { value: 'Female', label: 'Female', icon: <Female /> },
    ],
    [],
  );

  const gender = watch('gender');
  const maritalOptions = useMemo(
    () => [
      {
        value: 'Single',
        label: 'Single',
        icon: gender == 'Male' ? <Male /> : <Female />,
      },
      { value: 'Married', label: 'Married', icon: <Married /> },
    ],
    [gender],
  );

  const dateOfBirth = watch('dateOfBirth');

  const handleDobConfirm = useCallback(
    date => {
      const isoDate = date.toISOString();
      setSelectedDob(date);
      setValue('dateOfBirth', isoDate, { shouldValidate: true });
      setValue('age', ageCalculator(isoDate));
      setDobModalOpen(false);
    },
    [setValue],
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Personal Details</Text>
          <Text style={styles.subheading}>
            Select your health configuration to get the best quote
          </Text>
        </View>
        <View style={styles.fieldList}>
          <PersonalDetailsCard
            data={watch()}
            onEdit={() => setPersonalEditOpen(true)}
          />

          {/* City */}
          <Controller
            control={control}
            name="city"
            rules={{ required: 'City is required' }}
            render={({ field, fieldState }) => (
              <View>
                <InlineSelect
                  label="Visa Issuance City"
                  value={field.value}
                  items={cityItems}
                  onSelect={val => field.onChange(val)}
                />
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Salary */}
          <Controller
            control={control}
            name="salary"
            rules={{ required: 'Salary is required' }}
            render={({ field, fieldState }) => (
              <View>
                <SegmentedToggle
                  label="Salary (AED per month)"
                  options={[
                    { label: 'Above 4000', value: 'Above 4000' },
                    { label: 'Below 4000', value: 'Below 4000' },
                  ]}
                  value={field.value}
                  onSelect={val => field.onChange(val)}
                />
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Gender */}

          <Controller
            control={control}
            name="gender"
            rules={{ required: 'Gender is required' }}
            render={({ field, fieldState }) => (
              <View>
                <SegmentedToggle
                  label="Gender"
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                  ]}
                  value={field.value}
                  onSelect={val => field.onChange(val)}
                />
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Marital Status */}
          <Controller
            control={control}
            name="maritalStatus"
            rules={{ required: 'Marital status is required' }}
            render={({ field, fieldState }) => (
              <View>
                <SegmentedToggle
                  label="Marital Status"
                  options={[
                    { label: 'Single', value: 'Single' },
                    { label: 'Married', value: 'Married' },
                  ]}
                  value={field.value}
                  onSelect={val => field.onChange(val)}
                />
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>

      <FloatingButton onPress={() => renderSubmitButton()} />

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

            <View style={styles.modalScroll}>
              <View style={styles.modalFields}>
                <Controller
                  control={control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <CountryPhoneInput
                      value={field.value}
                      maxLength={9}
                      onChange={({ country, phone }) => {
                        setValue('mobileNumber', phone, {
                          shouldValidate: true,
                        });
                        setValue('country', country);
                      }}
                      errors={errors.mobileNumber?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <FloatingLabelInput
                      label="Full Name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <FloatingLabelInput
                      label="Email Address"
                      value={value}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      autoCapitalize="none"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field: { value }, fieldState: { error } }) => (
                    <DobAgePicker
                      value={value}
                      age={watch('age')}
                      onSelectDate={selectedDate => {
                        const dobISO = selectedDate.toISOString();
                        setValue('dateOfBirth', dobISO, {
                          shouldValidate: true,
                        });
                        setValue('age', ageCalculator(dobISO), {
                          shouldValidate: true,
                        });
                      }}
                      error={error?.message}
                    />
                  )}
                />

                <InlineSelect
                  label="Nationality"
                  value={watch('nationality')}
                  items={nationalityItems}
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
            </View>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={dobModalOpen}
        maxDate={new Date()}
        initialDate={
          selectedDob ||
          (dateOfBirth
            ? new Date(dateOfBirth)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 25)))
        }
        onClose={() => setDobModalOpen(false)}
        onConfirm={handleDobConfirm}
      />
    </View>
  );
};

export default HealthQuotesScreen;

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: moderateScale(15),
      paddingTop: verticalScale(15),
      paddingBottom: verticalScale(10),
      gap: verticalScale(20),
    },
    row: {
      flexDirection: 'row',
      gap: verticalScale(15),
    },
    header: {
      gap: verticalScale(5),
      marginBottom: verticalScale(5),
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
    flexOne: {
      flex: 1,
    },
    section: {
      gap: verticalScale(10),
    },
    sectionTitle: {
      fontSize: verticalScale(14),
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    ageInput: {
      flex: 0.5,
    },
    errorText: {
      marginTop: verticalScale(4),
      fontSize: moderateScale(13),
      color: theme.colors.red,
    },
    errorBorder: {
      borderColor: theme.colors.red,
    },
    fieldList: {
      gap: verticalScale(15),
    },
    datePickerButton: {
      height: verticalScale(50),
      borderRadius: verticalScale(10),
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: verticalScale(15),
      backgroundColor: theme.colors.backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      fontSize: verticalScale(14),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
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
      height: SCREEN_HEIGHT * 0.75,
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
      gap: verticalScale(15),
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
