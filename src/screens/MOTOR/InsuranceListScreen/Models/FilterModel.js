import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';

import { useThemeContext } from '@theme/ThemeProvider';
import { CustomAccordion } from '@components/ui/CustomAccordion';
import CustomCheckBox from '@components/ui/CustomCheckBox';
import CustomRangeSlider from '@components/ui/CustomRangeSlider';
import Header from '@components/ui/Header';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { useMotorDetalisStore } from '@store/MOTOR/motorStore';
import { useFilterQuotes } from '@hooks/motorflow/useMotorFlowTop';
import { env } from '@config/index';

const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 1 },
  { label: 'Price: High to Low', value: -1 },
];
const REPAIR_OPTIONS = [
  { label: 'Agency', value: 'agency' },
  { label: 'Non Agency', value: 'nonagency' },
];
const MAX_EXCESS = 1500;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const SLIDER_WIDTH = SCREEN_WIDTH - scale(40);
const COMPANY_CARD_WIDTH = (SCREEN_WIDTH - scale(44)) / 3;

const DEFAULT_FILTER = {
  sort: -1,
  repairOption: [],
  benefitTitles: [],
  companyIds: [],
  excessMax: MAX_EXCESS,
  excessMin: 0,
  priceMax: 1000,
  priceMin: 0,
};

const buildFilterPayload = filters => ({
  companyIds: filters.companyIds,
  benefitTitles: filters.benefitTitles,
  repairTypes: filters.repairOption,
  sort: filters.sort,
  priceMin: filters.priceMin,
  priceMax: filters.priceMax,
  excessMin: filters.excessMin,
  excessMax: filters.excessMax,
});

const RepairTypeSection = ({ repairOption, onRepairChange, styles }) => (
  <CustomAccordion title="Repair Hub">
    <View style={styles.pillContainer}>
      {REPAIR_OPTIONS.map(option => {
        const isActive = repairOption.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.pillCard, isActive && styles.pillCardActive]}
            onPress={() => onRepairChange(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </CustomAccordion>
);

const CompanySection = ({
  companyName,
  companyIds,
  onCompanyToggle,
  styles,
}) => {
  return (
    <CustomAccordion title="Insurance Providers">
      <View style={styles.companyGrid}>
        {companyName.map(company => {
          const isSelected = companyIds.includes(company._id);
          return (
            <TouchableOpacity
              key={company._id}
              activeOpacity={0.8}
              style={[
                styles.companyCard,
                isSelected && styles.companyCardActive,
              ]}
              onPress={() => onCompanyToggle(!isSelected, company._id)}
            >
              <Image
                source={{ uri: `${env.API_URL}${company?.company?.path}` }}
                resizeMode="contain"
                style={styles.companyLogo}
              />
              <Text
                style={[
                  styles.companyText,
                  isSelected && styles.companyTextActive,
                ]}
                numberOfLines={1}
              >
                {company.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </CustomAccordion>
  );
};

const FilterModal = ({
  showFilterModal,
  setShowFilterModal,
  benifitList,
  companyName,
  referenceId,
  maxAmount = 10000,
  toggle,
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { listQuotes } = useMotorDetalisStore();
  const { mutate: filterQuotes } = useFilterQuotes();

  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (maxAmount > 0 && filter.priceMax === 1000) {
      setFilter(prev => ({ ...prev, priceMax: maxAmount }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAmount]);

  useEffect(() => {
    if (showFilterModal && referenceId) {
      const payload = buildFilterPayload(filter);
      filterQuotes({ referenceId, data: payload });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, showFilterModal, referenceId]);

  const handleFilterChange = (type, checked, value) => {
    switch (type) {
      case 'Sort':
        setFilter(prev => ({ ...prev, sort: value }));
        break;
      case 'Repair':
        setFilter(prev => ({
          ...prev,
          repairOption: checked
            ? [...new Set([...prev.repairOption, value])]
            : prev.repairOption.filter(v => v !== value),
        }));
        break;
      case 'Company':
        setFilter(prev => ({
          ...prev,
          companyIds: checked
            ? [...new Set([...prev.companyIds, value])]
            : prev.companyIds.filter(v => v !== value),
        }));
        break;
      case 'Benefit':
        setFilter(prev => ({
          ...prev,
          benefitTitles: checked
            ? [...new Set([...prev.benefitTitles, value])]
            : prev.benefitTitles.filter(v => v !== value),
        }));
        break;
      case 'ExcessRange':
        setFilter(prev => ({
          ...prev,
          excessMin: value.min,
          excessMax: value.max,
        }));
        break;
      case 'PriceRange':
        setFilter(prev => ({
          ...prev,
          priceMin: value.min,
          priceMax: value.max,
        }));
        break;
      default:
        return;
    }
  };

  const handleReset = () => {
    setInitialized(false);
    setFilter({
      ...DEFAULT_FILTER,
      priceMax: maxAmount,
    });
    setTimeout(() => setShowFilterModal(false), 300);
  };

  return (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <GestureHandlerRootView style={styles.rootView}>
        <View style={styles.overlay}>
          {/* Dismissible empty space */}
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          />

          <View
            style={[
              styles.sheetContent,
              {
                height:
                  toggle === 'filter'
                    ? SCREEN_HEIGHT * 0.88
                    : SCREEN_HEIGHT * 0.45,
              },
            ]}
          >
            <View style={styles.grabberPill} />

            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                {toggle === 'filter' ? 'Refine Results' : 'Sort Quotes'}
              </Text>
              <View style={styles.headerActions}>
                {toggle === 'filter' && (
                  <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {toggle === 'sort' ? (
                <View style={styles.sortContainer}>
                  {SORT_OPTIONS.map(option => {
                    const isActive = filter.sort === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.sortRow}
                        onPress={() =>
                          handleFilterChange('Sort', true, option.value)
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.sortLabel,
                            isActive && styles.sortLabelActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <View
                          style={[
                            styles.radioRing,
                            isActive && styles.radioRingActive,
                          ]}
                        >
                          {isActive && <View style={styles.radioDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.filterCanvas}>
                  <RepairTypeSection
                    repairOption={filter.repairOption}
                    onRepairChange={val =>
                      handleFilterChange(
                        'Repair',
                        !filter.repairOption.includes(val),
                        val,
                      )
                    }
                    styles={styles}
                  />

                  <CustomAccordion title="Excess Matrix">
                    <View style={styles.sliderWrapper}>
                      <CustomRangeSlider
                        sliderWidth={SLIDER_WIDTH}
                        min={0}
                        max={MAX_EXCESS}
                        step={1}
                        initialMin={filter.excessMin}
                        initialMax={filter.excessMax}
                        onValueChange={val =>
                          handleFilterChange('ExcessRange', true, val)
                        }
                        theme={theme}
                      />
                    </View>
                  </CustomAccordion>

                  <CustomAccordion title="Premium Threshold">
                    <View style={styles.sliderWrapper}>
                      <CustomRangeSlider
                        sliderWidth={SLIDER_WIDTH}
                        min={0}
                        max={maxAmount}
                        step={10}
                        initialMin={filter.priceMin}
                        initialMax={filter.priceMax}
                        onValueChange={val =>
                          handleFilterChange('PriceRange', true, val)
                        }
                        theme={theme}
                      />
                    </View>
                  </CustomAccordion>

                  <CustomAccordion title="Included Benefits">
                    <View style={styles.benefitsContainer}>
                      {benifitList?.map(benefit => (
                        <CustomCheckBox
                          key={benefit}
                          label={benefit}
                          value={filter.benefitTitles.includes(benefit)}
                          onChange={checked =>
                            handleFilterChange('Benefit', checked, benefit)
                          }
                          theme={theme}
                        />
                      ))}
                    </View>
                  </CustomAccordion>

                  <CompanySection
                    companyName={companyName}
                    companyIds={filter.companyIds}
                    onCompanyToggle={(checked, id) =>
                      handleFilterChange('Company', checked, id)
                    }
                    styles={styles}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default FilterModal;

const getStyles = theme =>
  StyleSheet.create({
    rootView: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    sheetContent: {
      backgroundColor: theme.colors.backgroundColor,
      borderTopLeftRadius: scale(24),
      borderTopRightRadius: scale(24),
      paddingTop: verticalScale(10),
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    grabberPill: {
      width: scale(40),
      height: verticalScale(4),
      backgroundColor: theme.colors.border,
      borderRadius: scale(2),
      alignSelf: 'center',
      marginBottom: verticalScale(10),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(15),
    },
    resetText: {
      fontSize: fontScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    closeBtn: {
      padding: scale(4),
      backgroundColor: theme.colors.floorBgColor,
      borderRadius: scale(12),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(50),
    },

    // -- Sort Styles --
    sortContainer: {
      paddingVertical: verticalScale(10),
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(20),
    },
    sortLabel: {
      fontSize: fontScale(15),
      color: theme.colors.text,
      fontFamily: 'Lato-Regular',
    },
    sortLabelActive: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    radioRing: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      borderWidth: 1.5,
      borderColor: theme.colors.description,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioRingActive: {
      borderColor: theme.colors.primary,
    },
    radioDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: theme.colors.primary,
    },

    // -- Filter Styles --
    filterCanvas: {
      paddingVertical: verticalScale(10),
    },
    pillContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(15),
    },
    pillCard: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.floorBgColor,
    },
    pillCardActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pillText: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
    },
    pillTextActive: {
      color: theme.colors.textSecondary,
      fontFamily: 'Lato-Bold',
    },
    sliderWrapper: {
      paddingHorizontal: scale(20),
      alignItems: 'flex-start',
    },
    benefitsContainer: {
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(15),
      gap: verticalScale(14),
    },
    companyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(20),
      justifyContent: 'flex-start',
    },
    companyCard: {
      width: COMPANY_CARD_WIDTH,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(10),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(4),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundColor, // keep clean interior
      gap: verticalScale(6),
    },
    companyCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.floorBgColor,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    companyLogo: {
      width: '80%',
      height: verticalScale(28),
    },
    companyText: {
      fontSize: fontScale(10),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
    },
    companyTextActive: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
  });
