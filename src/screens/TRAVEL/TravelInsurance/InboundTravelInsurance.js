import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, fontScale } from '@constants/metrics';
import Icon from 'react-native-vector-icons/Feather';
import Header from '@components/ui/Header';
import StepIndicator from '@components/ui/StepIndicator';
import ModernDatePicker from '@components/ui/ModernDatePicker';
import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import { useAuthStore } from '@store/authStore';
import { createId } from '@utils/randomIdCreate';
import moment from 'moment';
import { useToast } from '@components/ui/Toast';
import InlineSelect from '@components/ui/InlineSelect';
import SegmentedToggle from '@components/ui/SegmentedToggle';
import FloatingButton from '@components/ui/FloatingButton';
import { useGetNationalList } from '@hooks/motorflow/useMotorFlowTop';
import { useCreateTravelProposal } from '@hooks/travelflow/useTravelFlow';
import { SCREEN_NAMES } from '@constants/screenNames';

const InboundTravelInsurance = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [socialProof, setSocialProof] = useState({ travellers: 0, buyers: 0 });

  const { data: nationalList = [] } = useGetNationalList();
  const { mutateAsync: createTravelProposal, isPending: creatingProposal } =
    useCreateTravelProposal();

  const loading = creatingProposal;

  // Social Proof Logic matching Web index.js
  useEffect(() => {
    const hour = moment().hour();
    let t, b;
    if (hour >= 0 && hour < 8) {
      b = Math.floor(Math.random() * 4) + 1;
      t = Math.floor(Math.random() * 5) + (b + 1);
    } else if (hour >= 8 && hour < 16) {
      b = Math.floor(Math.random() * 5) + 4;
      t = Math.floor(Math.random() * 6) + (b + 1);
    } else {
      b = Math.floor(Math.random() * 5) + 8;
      t = Math.floor(Math.random() * 7) + (b + 1);
    }
    setSocialProof({ travellers: t, buyers: b });
  }, []);

  const countryOptions = useMemo(
    () => nationalList.map(y => ({ label: y, value: y })),
    [nationalList],
  );

  const [formData, setFormData] = useState({
    originCountry: null,
    destination: 'United Arab Emirates',
    coverageType: 'Single Trip',
    startDate: null,
    endDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    travellerType: 'individual',
    tripStarted: 'No',
  });

  const [travellerDetails, setTravellerDetails] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    email: user?.email || '',
    phone: user?.mobileNumber,
  });

  useEffect(() => {
    const total = formData.adults + formData.children + formData.infants;
    setTravellerDetails(prev => {
      const newDetails = Array.from({ length: total }).map((_, i) => ({
        fullName: prev[i]?.fullName || (i === 0 ? user?.fullName || '' : ''),
        dob:
          prev[i]?.dob ||
          (i === 0 && user?.dateOfBirth ? new Date(user.dateOfBirth) : null),
        passportNumber: prev[i]?.passportNumber || '',
        gender: prev[i]?.gender || (i === 0 ? user?.gender || 'Male' : 'Male'),
        nationality: prev[i]?.nationality || '',
      }));
      return newDetails;
    });
  }, [formData.adults, formData.children, formData.infants, user]);

  const updateFormData = (key, value) => {
    setFormData(prev => {
      let updated = { ...prev, [key]: value };
      if (['adults', 'children', 'infants'].includes(key)) {
        const total =
          (key === 'adults' ? value : prev.adults) +
          (key === 'children' ? value : prev.children) +
          (key === 'infants' ? value : prev.infants);
        updated.travellerType = total > 1 ? 'family' : 'individual';
      }
      return updated;
    });
  };

  const validateStep1 = () => {
    if (!formData.originCountry)
      return showToast('Select origin country', 'error'), false;
    if (!formData.startDate)
      return showToast('Select arrival date', 'error'), false;
    if (formData.coverageType === 'Single Trip' && !formData.endDate)
      return showToast('Select departure date', 'error'), false;
    return true;
  };

  const handleFinalSubmit = async () => {
    for (let i = 0; i < travellerDetails.length; i++) {
      const t = travellerDetails[i];
      if (!t.fullName || !t.dob || !t.passportNumber || !t.nationality)
        return showToast(`Complete Traveller ${i + 1} details`, 'error'), false;
    }
    if (!contactDetails.email || !contactDetails.phone)
      return showToast('Provide contact details', 'error'), false;

    try {
      const reqId = createId(20);
      const payload = {
        bound: 'travelling to uae',
        tripStarted: formData.tripStarted,
        insuranceType: formData.travellerType,
        travelCoverage:
          formData.coverageType === 'Single Trip'
            ? 'Singletrip'
            : 'MultipleTrip',
        DepartureCountry: formData.originCountry,
        DestinationCountry: 'United Arab Emirates',
        StartDate: moment(formData.startDate).format('YYYY-MM-DD'),
        EndDate: formData.endDate
          ? moment(formData.endDate).format('YYYY-MM-DD')
          : null,
        Name: travellerDetails[0].fullName,
        email: contactDetails.email,
        countryCode: '971',
        mobileNumber: contactDetails.phone.replace('971', ''),
        DOB: moment(travellerDetails[0].dob).format('YYYY-MM-DD'),
        Nationality: travellerDetails[0].nationality,
        Gender: travellerDetails[0].gender,
        passportNumber: travellerDetails[0].passportNumber,
        travellers: travellerDetails.map(t => ({
          Name: t.fullName,
          DOB: moment(t.dob).format('YYYY-MM-DD'),
          Nationality: t.nationality,
          Gender: t.gender,
          passportNumber: t.passportNumber,
        })),
        period:
          formData.endDate && formData.startDate
            ? String(moment(formData.endDate).diff(formData.startDate, 'days'))
            : '0',
        reqId,
      };

      await createTravelProposal(payload);
    } catch (err) {
      console.log('Submission issue:', err);
    }
  };

  const dayCount =
    formData.startDate && formData.endDate
      ? moment(formData.endDate).diff(formData.startDate, 'days')
      : 0;

  return (
    <View style={styles.screen}>
      <Header
        title="Visiting UAE"
        onBack={() =>
          currentStep > 0 ? setCurrentStep(0) : navigation.goBack()
        }
        home={true}
        onHome={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.BOTTOM_TABS }],
          })
        }
      />

      {/* Step Context Title */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepContext}>
          Step {currentStep + 1} of 2 —{' '}
          {currentStep === 0 ? 'Where & When' : "Who's Travelling"}
        </Text>
        <View style={styles.miniProgress}>
          <View
            style={[styles.miniBar, { backgroundColor: theme.colors.primary }]}
          />
          <View
            style={[
              styles.miniBar,
              {
                backgroundColor:
                  currentStep > 0 ? theme.colors.primary : theme.colors.border,
              },
            ]}
          />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 0 ? (
          <View style={{ gap: verticalScale(18) }}>
            <View style={styles.headerTitle}>
              <Text style={styles.heading}>Visiting UAE</Text>
              <Text style={styles.subheading}>
                Get your insurance in 60 seconds.
              </Text>
            </View>

            {/* Trip Context Card */}
            <View style={styles.tripContextCard}>
              <View style={styles.selectionCard}>
                <View style={styles.selectionIconBox}>
                  <Icon name="map-pin" size={24} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.selectionTitle}>Destination</Text>
                  <Text style={styles.selectionValue}>
                    United Arab Emirates
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Origin Country</Text>
              <InlineSelect
                label="Country of Departure"
                value={formData.originCountry}
                items={countryOptions}
                onSelect={val => updateFormData('originCountry', val)}
              />
            </View>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <ModernDatePicker
                  label="Arrival"
                  value={formData.startDate}
                  onSelectDate={d => updateFormData('startDate', d)}
                  minDate={new Date()}
                />
              </View>
              {formData.coverageType === 'Single Trip' && (
                <View style={{ flex: 1 }}>
                  <ModernDatePicker
                    label="Departure"
                    value={formData.endDate}
                    onSelectDate={d => updateFormData('endDate', d)}
                    minDate={formData.startDate || new Date()}
                  />
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How many travellers?</Text>
              <View style={styles.travellerGrid}>
                {[1, 2, 3, '4+'].map(count => {
                  const isSelected =
                    count === '4+'
                      ? formData.adults >= 4
                      : formData.adults === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      activeOpacity={0.8}
                      style={[
                        styles.gridBox,
                        isSelected && styles.gridBoxSelected,
                      ]}
                      onPress={() => {
                        const num = count === '4+' ? 4 : count;
                        updateFormData('adults', num);
                        updateFormData('children', 0);
                        updateFormData('infants', 0);
                      }}
                    >
                      <Text
                        style={[
                          styles.gridText,
                          isSelected && styles.gridTextSelected,
                        ]}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View style={{ gap: verticalScale(15) }}>
            <View style={styles.headerTitle}>
              <Text style={styles.heading}>Traveller Details</Text>
              <Text style={styles.subheading}>Who's travelling?</Text>
            </View>

            {travellerDetails.map((t, i) => (
              <View key={i} style={styles.formGroup}>
                <Text style={styles.formGroupTitle}>
                  {i === 0 ? 'Primary Traveller' : `Traveller ${i + 1}`}
                </Text>

                <View style={styles.formFields}>
                  <FloatingLabelInput
                    label="Full Name"
                    value={t.fullName}
                    onChangeText={v => {
                      const n = [...travellerDetails];
                      n[i].fullName = v;
                      setTravellerDetails(n);
                    }}
                  />

                  <View
                    style={{ flexDirection: 'row', gap: verticalScale(12) }}
                  >
                    <View style={{ flex: 1 }}>
                      <ModernDatePicker
                        label="DOB"
                        value={t.dob}
                        onSelectDate={d => {
                          const n = [...travellerDetails];
                          n[i].dob = d;
                          setTravellerDetails(n);
                        }}
                        maxDate={
                          i === 0
                            ? moment().subtract(18, 'year').toDate()
                            : new Date()
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FloatingLabelInput
                        label="Passport No."
                        value={t.passportNumber}
                        onChangeText={v => {
                          const n = [...travellerDetails];
                          n[i].passportNumber = v;
                          setTravellerDetails(n);
                        }}
                      />
                    </View>
                  </View>

                  <SegmentedToggle
                    label="Gender"
                    options={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                    ]}
                    value={t.gender}
                    onSelect={v => {
                      const n = [...travellerDetails];
                      n[i].gender = v;
                      setTravellerDetails(n);
                    }}
                  />

                  <InlineSelect
                    label="Nationality"
                    value={t.nationality}
                    items={countryOptions}
                    onSelect={v => {
                      const n = [...travellerDetails];
                      n[i].nationality = v;
                      setTravellerDetails(n);
                    }}
                  />
                </View>
              </View>
            ))}

            <View style={styles.formGroup}>
              <Text style={styles.formGroupTitle}>Contact Information</Text>
              <View style={styles.formFields}>
                <FloatingLabelInput
                  label="Email"
                  value={contactDetails.email}
                  onChangeText={v =>
                    setContactDetails(p => ({ ...p, email: v }))
                  }
                />
                <CountryPhoneInput
                  label="Mobile"
                  value={contactDetails.phone}
                  onChange={r =>
                    setContactDetails(p => ({ ...p, phone: r.phone }))
                  }
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <FloatingButton
        onPress={() => {
          if (currentStep === 0) {
            validateStep1() && setCurrentStep(1);
          } else {
            handleFinalSubmit();
          }
        }}
        isLoading={loading}
        title={currentStep === 0 ? null : 'Get Quotes'}
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
    scrollContent: {
      flexGrow: 1,
      gap: verticalScale(15),
      paddingTop: verticalScale(10),
      paddingHorizontal: verticalScale(20),
      paddingBottom: verticalScale(120),
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(15),
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: verticalScale(10),
      paddingHorizontal: verticalScale(20),
    },
    stepContext: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    miniProgress: {
      flexDirection: 'row',
      gap: 4,
    },
    miniBar: {
      width: 24,
      height: 4,
      borderRadius: 10,
    },
    headerTitle: {
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
    tripContextCard: {
      backgroundColor: 'rgba(96, 23, 111, 0.03)',
      borderRadius: verticalScale(16),
      padding: verticalScale(16),
      borderWidth: 1,
      borderColor: 'rgba(96, 23, 111, 0.08)',
    },
    selectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    selectionIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    selectionTitle: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
      textTransform: 'uppercase',
    },
    selectionValue: {
      fontSize: fontScale(16),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    section: {
      gap: verticalScale(5),
    },
    sectionTitle: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(5),
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: verticalScale(4),
    },
    travellerGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    gridBox: {
      flex: 1,
      paddingVertical: verticalScale(16),
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
    },
    gridBoxSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    gridText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(18),
      color: theme.colors.text,
    },
    gridTextSelected: {
      color: theme.colors.textSecondary,
    },
    formGroup: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: verticalScale(20),
      padding: verticalScale(10),
    },
    formGroupTitle: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(12),
      textAlign: 'center',
    },
    formFields: {
      gap: verticalScale(10),
    },
  });

export default InboundTravelInsurance;
