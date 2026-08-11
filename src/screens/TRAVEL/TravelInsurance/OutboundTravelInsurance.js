import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, fontScale } from '@constants/metrics';
import Icon from 'react-native-vector-icons/Feather';
import Header from '@components/ui/Header';
import ModernDatePicker from '@components/ui/ModernDatePicker';
import FloatingLabelInput from '@components/ui/FloatingLabelInput';
import CountryPhoneInput from '@components/ui/CountryPhoneInput';
import { useAuthStore } from '@store/authStore';
import { createId } from '@utils/randomIdCreate';
import moment from 'moment';
import { SCREEN_NAMES } from '@constants/screenNames';
import { useToast } from '@components/ui/Toast';
import InlineSelect from '@components/ui/InlineSelect';
import SegmentedToggle from '@components/ui/SegmentedToggle';
import FloatingButton from '@components/ui/FloatingButton';
import { useGetNationalList } from '@hooks/motorflow/useMotorFlowTop';
import {
  COUNTRY_INSURANCE_DATA,
  QUICK_DESTINATIONS,
  getCountryCategory,
  SCHENGEN_COUNTRIES,
  ASIA_COUNTRIES,
  OCEANIA_COUNTRIES,
} from '@constants/countryData';
import {
  useGetDestinations,
  useCreateTravelProposal,
} from '@hooks/travelflow/useTravelFlow';

const OutboundTravelInsurance = () => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const { data: nationalList = [] } = useGetNationalList();
  const { data: destinations = [] } = useGetDestinations();
  const { mutateAsync: createTravelProposal, isPending: creatingProposal } =
    useCreateTravelProposal();

  const loading = creatingProposal;

  const [activeCategory, setActiveCategory] = useState(null);
  const [showWorldwideOptions, setShowWorldwideOptions] = useState(false);

  const filteredNationalities = useMemo(() => {
    if (!nationalList) return [];
    const list = nationalList.filter(c => c !== 'United Arab Emirates');
    let filtered = list;

    if (activeCategory && activeCategory !== 'Worldwide') {
      if (activeCategory === 'Schengen')
        filtered = list.filter(c => SCHENGEN_COUNTRIES.includes(c));
      else if (activeCategory === 'Asia')
        filtered = list.filter(c => ASIA_COUNTRIES.includes(c));
      else if (activeCategory === 'Oceania')
        filtered = list.filter(c => OCEANIA_COUNTRIES.includes(c));
      else if (activeCategory === 'USA')
        filtered = list.filter(c => c === 'United States');
    }

    return filtered.map(item => ({ label: item, value: item }));
  }, [nationalList, activeCategory]);

  const allNationalitiesOptions = useMemo(
    () => nationalList.map(item => ({ label: item, value: item })),
    [nationalList],
  );

  const [formData, setFormData] = useState({
    destination: null,
    originCountry: 'United Arab Emirates',
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
        nationality:
          prev[i]?.nationality ||
          (i === 0
            ? user?.nationality || 'United Arab Emirates'
            : 'United Arab Emirates'),
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
    if (!formData.destination)
      return showToast('Select a destination', 'error'), false;
    if (!formData.startDate)
      return showToast('Select start date', 'error'), false;
    if (formData.coverageType === 'Single Trip' && !formData.endDate)
      return showToast('Select end date', 'error'), false;
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
        bound: 'travelling from uae',
        tripStarted: formData.tripStarted,
        insuranceType: formData.travellerType,
        travelCoverage: 'Singletrip',
        DepartureCountry: 'United Arab Emirates',
        DestinationCountry: formData.destination,
        StartDate: moment(formData.startDate).format('YYYY-MM-DD'),
        EndDate: moment(formData.endDate).format('YYYY-MM-DD'),
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
        reqId: reqId,
      };

      console.log(payload);

      await createTravelProposal(payload);
    } catch (err) {
      console.log('Submission issue:', err);
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Leaving UAE"
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
          <View style={{ gap: verticalScale(15) }}>
            <View style={styles.headerTitle}>
              <Text style={styles.heading}>Trip Details</Text>
              <Text style={styles.subheading}>
                Where & when are you travelling?
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where are you going?</Text>
              <View style={styles.quickDestContainer}>
                {QUICK_DESTINATIONS.map(item => {
                  const isSelected = activeCategory === item.category;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.quickDestBtn,
                        isSelected && styles.quickDestBtnSelected,
                      ]}
                      onPress={() => {
                        if (item.category === 'Worldwide') {
                          setShowWorldwideOptions(true);
                          setActiveCategory('Worldwide');
                          return;
                        }
                        setActiveCategory(item.category);
                        setShowWorldwideOptions(false);

                        if (item.country === 'United States') {
                          updateFormData('destination', 'United States');
                        } else {
                          // Filter list and let user pick if not USA
                          const currentCat = getCountryCategory(
                            formData.destination,
                          );
                          if (currentCat !== item.category) {
                            updateFormData('destination', null);
                          }
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.quickDestIconWrapper,
                          isSelected && styles.quickDestIconWrapperSelected,
                        ]}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(96, 23, 111, 0.05)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.label === 'Worldwide' ? (
                            <Icon
                              name="globe"
                              size={10}
                              color={
                                isSelected
                                  ? theme.colors.backgroundColor
                                  : theme.colors.primary
                              }
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 8,
                                fontWeight: '900',
                                color: isSelected
                                  ? theme.colors.backgroundColor
                                  : theme.colors.primary,
                              }}
                            >
                              {item.code}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.quickDestText,
                          isSelected && styles.quickDestTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showWorldwideOptions && (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 4,
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: 'rgba(96, 23, 111, 0.04)',
                    borderWidth: 1,
                    borderColor: 'rgba(96, 23, 111, 0.1)',
                    borderStyle: 'dashed',
                  }}
                >
                  {[
                    { label: 'Incl. USA & Canada', value: 'Worldwide' },
                    {
                      label: 'Excl. USA & Canada',
                      value: 'Worldwide (Excl. USA & Canada)',
                    },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        updateFormData('destination', opt.value);
                        setActiveCategory(getCountryCategory(opt.value));
                        setShowWorldwideOptions(false);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 100,
                        backgroundColor:
                          formData.destination === opt.value
                            ? theme.colors.primary
                            : theme.colors.backgroundColor,
                        borderColor: theme.colors.primary,
                        borderWidth: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Lato-Bold',
                          color:
                            formData.destination === opt.value
                              ? theme.colors.backgroundColor
                              : theme.colors.primary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!showWorldwideOptions && (
                <InlineSelect
                  label="Search Country"
                  value={formData.destination}
                  items={filteredNationalities}
                  onSelect={val => {
                    updateFormData('destination', val);
                    setActiveCategory(getCountryCategory(val));
                  }}
                />
              )}

              {(() => {
                const aliasMap = {
                  USA: 'United States',
                  UK: 'United Kingdom',
                };
                const searchName =
                  aliasMap[formData.destination] || formData.destination;
                const advisor = COUNTRY_INSURANCE_DATA?.find(
                  c => c.country === searchName,
                );
                if (!advisor) return null;

                const riskColors = {
                  High: {
                    bg: theme.colors.redLight,
                    text: theme.colors.red,
                    border: theme.colors.red + '50',
                  },
                  Medium: {
                    bg: theme.colors.highlight + '10',
                    text: theme.colors.highlight,
                    border: theme.colors.highlight + '50',
                  },
                  Low: {
                    bg: theme.colors.lableBg,
                    text: theme.colors.lableText,
                    border: theme.colors.lableText + '50',
                  },
                };
                const style = riskColors[advisor.risk] || riskColors.Low;

                return (
                  <View
                    style={[
                      styles.advisoryBox,
                      {
                        backgroundColor: style.bg,
                        borderColor: style.border,
                      },
                    ]}
                  >
                    <Icon
                      name="alert-circle"
                      size={16}
                      color={style.text}
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.advisoryText, { color: style.text }]}
                      >
                        <Text style={{ fontFamily: 'Lato-Bold' }}>
                          {advisor.risk} Risk
                        </Text>
                        {advisor.schengenRequirement
                          ? ' • Schengen Required'
                          : ''}
                      </Text>
                      <Text style={[styles.advisoryText, { marginTop: 4 }]}>
                        {advisor.advice}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coverage & Dates</Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ModernDatePicker
                    label="Departure"
                    value={formData.startDate}
                    onSelectDate={d => updateFormData('startDate', d)}
                    minDate={new Date()}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ModernDatePicker
                    label="Return"
                    value={formData.endDate}
                    onSelectDate={d => updateFormData('endDate', d)}
                    minDate={formData.startDate || new Date()}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Travellers</Text>
              <View style={styles.travellerQuickContainer}>
                {[1, 2, 3, '4+'].map(count => {
                  const isSelected =
                    count === '4+'
                      ? formData.adults >= 4
                      : formData.adults === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.travellerBox,
                        isSelected && styles.travellerBoxSelected,
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
                          styles.travellerText,
                          isSelected && styles.travellerTextSelected,
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
                    items={allNationalitiesOptions}
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

      {currentStep === 0 ? (
        <FloatingButton
          onPress={() => validateStep1() && setCurrentStep(1)}
          isShowIcon
        />
      ) : (
        <FloatingButton
          onPress={handleFinalSubmit}
          isLoading={loading}
          title="Get Quotes"
          isShowIcon
        />
      )}
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    progressHeader: {
      paddingBottom: verticalScale(10),
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
      gap: verticalScale(15),
      paddingTop: verticalScale(10),
      paddingHorizontal: verticalScale(20),
      paddingBottom: verticalScale(100),
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
    section: {
      gap: verticalScale(5),
    },
    sectionTitle: {
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginBottom: verticalScale(5),
    },
    quickDestContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: verticalScale(8),
      marginBottom: verticalScale(5),
    },
    quickDestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: verticalScale(10),
      paddingVertical: verticalScale(5),
      borderRadius: verticalScale(100),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: verticalScale(5),
    },
    quickDestBtnSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quickDestIconWrapper: {
      width: verticalScale(22),
      height: verticalScale(22),
      borderRadius: verticalScale(11),
      backgroundColor: 'rgba(0,0,0,0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickDestIconWrapperSelected: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    quickDestText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.description,
    },
    quickDestTextSelected: {
      color: theme.colors.textSecondary,
    },
    advisoryBox: {
      marginTop: verticalScale(10),
      padding: verticalScale(12),
      borderRadius: verticalScale(12),
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: verticalScale(8),
    },
    advisoryText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      lineHeight: fontScale(18),
    },
    policyTermContainer: {
      flexDirection: 'row',
      gap: verticalScale(12),
    },
    optionBtn: {
      flex: 1,
      paddingVertical: verticalScale(14),
      borderRadius: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
    },
    optionBtnSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(14),
      color: theme.colors.description,
    },
    optionTextSelected: {
      color: theme.colors.textSecondary,
    },
    travellerQuickContainer: {
      flexDirection: 'row',
      gap: verticalScale(8),
    },
    travellerBox: {
      flex: 1,
      paddingVertical: verticalScale(14),
      borderRadius: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
      alignItems: 'center',
    },
    travellerBoxSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    travellerText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.description,
    },
    travellerTextSelected: {
      color: theme.colors.textSecondary,
    },
    mainBtn: {
      marginTop: verticalScale(12),
      borderRadius: verticalScale(18),
      height: verticalScale(58),
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
    loader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    loaderText: {
      marginTop: verticalScale(16),
      fontSize: fontScale(15),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
  });

export default OutboundTravelInsurance;
