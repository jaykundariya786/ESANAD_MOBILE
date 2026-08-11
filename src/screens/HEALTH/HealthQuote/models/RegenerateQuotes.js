import Header from '@components/ui/Header';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Controller, set, useForm } from 'react-hook-form';
import moment from 'moment';

import { moderateScale, verticalScale } from '@constants/metrics';
import { HEALTH_CONSTANTS } from '@constants/Static/healthJson';

import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import CustomButton from '@components/ui/CustomButton';
import CustomDependentOption from '@components/ui/CustomDependentOption';
import InlineSelect from '@components/ui/InlineSelect';
import SegmentedToggle from '@components/ui/SegmentedToggle';
import FloatingButton from '@components/ui/FloatingButton';
import DobAgePicker from '@components/ui/DobAgePicker';

import { useGetNationalList } from '@hooks/motorflow/useMotorFlowTop';
import {
  useGetHealthInsuranceInfo,
  useRegenerateQuotes,
  useUpdateHealthInsurance,
} from '@hooks/HEALTH/healthFlow/useHealthFlow';

import { ageCalculator } from '@utils/ageCalculator';
import { useThemeContext } from '@theme/ThemeProvider';

import Male from '@assets/svg/Male';
import Female from '@assets/svg/Female';
import Married from '@assets/svg/Married';
import { useHealthStore } from '@store/HEALTH/healthStore';

const RegenerateQuotes = ({ open, setOpen, internalRef, handleRegenerate }) => {
  const { theme } = useThemeContext();
  const styles = style(theme);

  const { data: nationalList = [] } = useGetNationalList();
  const { data: healthInsuranceInfo = {} } = useGetHealthInsuranceInfo({
    reqId: internalRef,
  });

  const { mutate: updateHealthInsurance } = useUpdateHealthInsurance();
  const isSelfInsurance = healthInsuranceInfo?.insurerType === 'Self';

  const [dependentError, setDependentError] = useState('');
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      mobileNumber: '',
      email: '',
      nationality: '',
      dateOfBirth: '',
      age: '',
      country: '',
      city: '',
      salary: 'Above 4000',
      gender: 'Male',
      maritalStatus: 'Single',
      visaStatus: 'New',
      visaType: null,
      currentInsurer: '',
      expiryDate: '',
      preExistingCondition: 'No',
      pregnantOrMaternity: 'No',
      hasKids: false,
      hasSpouse: false,
      kids: [],
      spouse: [],
    },
  });

  useEffect(() => {
    if (healthInsuranceInfo && Object.keys(healthInsuranceInfo).length > 0) {
      const formData = {
        name: healthInsuranceInfo.fullName || '',
        mobileNumber: healthInsuranceInfo.mobileNumber || '',
        email: healthInsuranceInfo.email || '',
        nationality: healthInsuranceInfo.nationality || '',
        dateOfBirth: healthInsuranceInfo.dateOfBirth || '',
        age: healthInsuranceInfo.dateOfBirth
          ? ageCalculator(healthInsuranceInfo.dateOfBirth)
          : '',
        country: healthInsuranceInfo.countryCode || '',
        city: healthInsuranceInfo.city || '',
        salary: healthInsuranceInfo.salary || 'Above 4000',
        gender: healthInsuranceInfo.gender || 'Male',
        maritalStatus: healthInsuranceInfo.maritalStatus || 'Single',
        visaStatus: healthInsuranceInfo.visaStatus || 'New',
        visaType: healthInsuranceInfo.visaType || null,
        currentInsurer: healthInsuranceInfo.currentInsurer || '',
        expiryDate: healthInsuranceInfo.expiryDate || '',
        preExistingCondition: healthInsuranceInfo.preExistingCondition || 'No',
        pregnantOrMaternity: healthInsuranceInfo.pregnantOrMaternity || 'No',
        hasKids: healthInsuranceInfo.hasKids || false,
        hasSpouse: healthInsuranceInfo.hasSpouse || false,
        kids: healthInsuranceInfo.kids || [],
        spouse: healthInsuranceInfo.spouse || [],
      };

      reset(formData);
    }
  }, [healthInsuranceInfo, reset]);

  const nationalityOptions = useMemo(
    () => nationalList.map(n => ({ label: n, value: n })),
    [nationalList],
  );

  const genderOptions = useMemo(
    () => [
      { value: 'Male', label: 'Male', icon: <Male /> },
      { value: 'Female', label: 'Female', icon: <Female /> },
    ],
    [],
  );

  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');

  const maritalOptions = useMemo(
    () => [
      {
        value: 'Single',
        label: 'Single',
        icon: gender === 'Male' ? <Male /> : <Female />,
      },
      { value: 'Married', label: 'Married', icon: <Married /> },
    ],
    [gender],
  );

  const isMarried = maritalStatus === 'Married';
  const showDependentsSection = !isSelfInsurance;

  const DATA = useMemo(() => {
    return isMarried
      ? [
          { label: 'Spouse', value: 'spouse' },
          { label: 'Kids', value: 'kids' },
        ]
      : [{ label: 'Kids', value: 'kids' }];
  }, [isMarried]);

  const [selectedIndex, setSelectedIndex] = useState(DATA[0].value);

  useEffect(() => {
    if (!isMarried && selectedIndex === 'spouse') {
      setSelectedIndex('kids');
    }
  }, [isMarried, selectedIndex]);

  useEffect(() => {
    if (!isMarried) {
      setValue('spouse', []);
      setValue('hasSpouse', false);
    }
  }, [isMarried, setValue]);

  useEffect(() => {
    if (isSelfInsurance) {
      setValue('spouse', []);
      setValue('kids', []);
      setValue('hasSpouse', false);
      setValue('hasKids', false);
      setDependentError('');
    }
  }, [isSelfInsurance, setValue]);

  const onDetailsChange = useCallback(
    (type, list) => {
      setDependentError('');

      if (type === 'spouse') {
        setValue('spouse', list, { shouldValidate: true });
        setValue('hasSpouse', list.length > 0);
      } else if (type === 'kids') {
        setValue('kids', list, { shouldValidate: true });
        setValue('hasKids', list.length > 0);
      }
    },
    [setValue],
  );

  const isValidDependent = dependent => {
    return (
      dependent.name &&
      dependent.name.trim() !== '' &&
      dependent.dateOfBirth &&
      dependent.gender
    );
  };

  const onSubmit = data => {
    setLoading(true);
    setDependentError('');

    if (!isSelfInsurance) {
      if (isMarried) {
        if (data.spouse.length === 0) {
          setDependentError('Please add spouse details');
          return;
        }
        if (!data.spouse.every(isValidDependent)) {
          setDependentError('Please complete all spouse details');
          return;
        }
      }

      if (data.kids.length === 0) {
        setDependentError('Please add at least one child');
        return;
      }
      if (!data.kids.every(isValidDependent)) {
        setDependentError('Please complete all child details');
        return;
      }
    }

    const submitData = {
      city: data.city,
      countryCode: '971',
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      fullName: data.name,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      mobile: `971${data.mobileNumber}`,
      mobileNumber: data.mobileNumber,
      nationality: data.nationality,
      salary: data.salary,
      spouse: !isSelfInsurance && isMarried ? data.spouse : [],
      kids: !isSelfInsurance ? data.kids : [],
    };

    updateHealthInsurance(
      {
        reqId: internalRef,
        data: submitData,
      },
      {
        onSuccess: () => {
          setChange(true);
          setLoading(false);
        },
      },
    );
  };

  const handleSegmentChange = useCallback(
    value => {
      if (DATA.length === 2) {
        setSelectedIndex(value === 0 ? 'spouse' : 'kids');
      } else if (DATA.length === 1) {
        setSelectedIndex('kids');
      }
    },
    [DATA.length],
  );

  const getSelectedSegmentIndex = useMemo(() => {
    if (DATA.length === 2) {
      return selectedIndex === 'spouse' ? 0 : 1;
    }
    return 0;
  }, [DATA.length, selectedIndex]);

  return (
    <Modal
      visible={open}
      animationType="slide"
      onRequestClose={() => {
        setOpen(false);
        setChange(false);
      }}
      presentationStyle={'fullScreen'}
    >
      <View style={styles.backdrop}>
        <Header
          title="Edit Details"
          onBack={() => {
            setOpen(false);
            setChange(false);
          }}
        />

        {change == true ? (
          <View style={styles.regenerateContainer}>
            <View style={styles.regenerateCard}>
              <Text style={styles.regenerateTitle}>Confirm Changes</Text>
              <Text style={styles.regenerateText}>
                Your updated details require a fresh set of health quotes.
                Regenerate them now?
              </Text>
              <View style={styles.regenerateActions}>
                <CustomButton
                  title="Cancel"
                  onPress={() => setChange(false)}
                  type={'secondary'}
                  buttonStyle={styles.halfBtn}
                />
                <CustomButton
                  title="Regenerate"
                  onPress={() => {
                    setOpen(false);
                    setChange(false);
                    handleRegenerate();
                  }}
                  buttonStyle={styles.halfBtn}
                />
              </View>
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.container}>
                <View style={styles.fieldList}>
                  {/* Mobile Number */}
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

                  {/* Name & Email */}
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <FloatingLabelInput
                        label="Your Full Name"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={errors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <FloatingLabelInput
                        label="Email Address"
                        value={field.value}
                        onChangeText={field.onChange}
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

                  <Controller
                    control={control}
                    name="nationality"
                    rules={{ required: 'Nationality is required' }}
                    render={({ field, fieldState }) => (
                      <View>
                        <InlineSelect
                          label="Nationality"
                          value={field.value}
                          items={nationalityOptions}
                          onSelect={v => field.onChange(v)}
                        />
                        {fieldState.error && (
                          <Text style={styles.errorText}>
                            {fieldState.error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="city"
                    rules={{ required: 'City is required' }}
                    render={({ field, fieldState }) => (
                      <View>
                        <InlineSelect
                          label="Visa Issuance City"
                          value={field.value}
                          items={HEALTH_CONSTANTS.CITY}
                          onSelect={v => field.onChange(v)}
                        />
                        {fieldState.error && (
                          <Text style={styles.errorText}>
                            {fieldState.error.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="salary"
                    render={({ field }) => (
                      <SegmentedToggle
                        label="Salary (AED per month)"
                        options={[
                          { label: 'Above 4000', value: 'Above 4000' },
                          { label: 'Below 4000', value: 'Below 4000' },
                        ]}
                        value={field.value}
                        onSelect={val => field.onChange(val)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <SegmentedToggle
                        label="Gender"
                        options={[
                          { label: 'Male', value: 'Male' },
                          { label: 'Female', value: 'Female' },
                        ]}
                        value={field.value}
                        onSelect={val => field.onChange(val)}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <SegmentedToggle
                        label="Marital Status"
                        options={[
                          { label: 'Single', value: 'Single' },
                          { label: 'Married', value: 'Married' },
                        ]}
                        value={field.value}
                        onSelect={val => field.onChange(val)}
                      />
                    )}
                  />

                  {showDependentsSection && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        Add Dependents
                        {!isSelfInsurance && (
                          <Text style={styles.requiredText}> *</Text>
                        )}
                      </Text>

                      {isMarried && (
                        <SegmentedToggle
                          options={[
                            { label: 'Spouse', value: 'spouse' },
                            { label: 'Kids', value: 'kids' },
                          ]}
                          value={selectedIndex}
                          onSelect={val => setSelectedIndex(val)}
                        />
                      )}

                      <View style={{ marginTop: verticalScale(12) }}>
                        {isMarried && selectedIndex === 'spouse' && (
                          <CustomDependentOption
                            type="Spouse"
                            initialData={watch('spouse')}
                            onDependentsChange={list =>
                              onDetailsChange('spouse', list)
                            }
                            insurerType={healthInsuranceInfo?.insurerType}
                            error={!!dependentError}
                            showErrorMessage={false}
                          />
                        )}

                        {(selectedIndex === 'kids' || !isMarried) && (
                          <CustomDependentOption
                            type="Kids"
                            initialData={watch('kids')}
                            onDependentsChange={list =>
                              onDetailsChange('kids', list)
                            }
                            insurerType={healthInsuranceInfo?.insurerType}
                            error={!!dependentError}
                            showErrorMessage={false}
                          />
                        )}
                      </View>

                      {dependentError && (
                        <Text style={styles.errorText}>{dependentError}</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <FloatingButton
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              isShowIcon
            />
          </>
        )}
      </View>
    </Modal>
  );
};

export default RegenerateQuotes;

const style = theme =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      paddingBottom: verticalScale(100),
    },
    container: {
      flexGrow: 1,
      padding: verticalScale(20),
      gap: verticalScale(12),
    },
    fieldList: {
      gap: verticalScale(12),
    },
    row: {
      flexDirection: 'row',
      gap: verticalScale(12),
    },
    flexOne: {
      flex: 1,
    },
    section: {
      gap: verticalScale(10),
    },
    sectionTitle: {
      fontSize: verticalScale(13),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      marginBottom: verticalScale(-4),
    },
    requiredText: {
      color: theme.colors.red,
    },
    ageInput: {
      flex: 0.5,
    },
    errorText: {
      marginTop: verticalScale(2),
      fontSize: verticalScale(12),
      color: theme.colors.red,
      fontFamily: 'Lato-Regular',
    },
    errorBorder: {
      borderColor: theme.colors.red,
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

    // ── Regenerate Confirmation ──
    regenerateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: verticalScale(24),
    },
    regenerateCard: {
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(20),
      padding: verticalScale(20),
      width: '100%',
      gap: verticalScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 5,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    regenerateTitle: {
      fontSize: verticalScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    regenerateText: {
      fontSize: verticalScale(14),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
      lineHeight: verticalScale(20),
    },
    regenerateActions: {
      flexDirection: 'row',
      gap: verticalScale(12),
      marginTop: verticalScale(8),
    },
    halfBtn: {
      flex: 1,
    },
  });
