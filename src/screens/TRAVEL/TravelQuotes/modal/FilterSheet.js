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
import CustomRangeSlider from '@components/ui/CustomRangeSlider';
import { scale, verticalScale, fontScale } from '@constants/metrics';
import { env } from '@config/index';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const SLIDER_WIDTH = SCREEN_WIDTH - scale(40);
const COMPANY_CARD_WIDTH = (SCREEN_WIDTH - scale(44)) / 3;

const TIER_OPTIONS = [
  { label: 'Basic', value: 'base' },
  { label: 'Mid-Range', value: 'medium' },
  { label: 'Premium', value: 'premium' },
];

const FilterSheet = ({
  visible,
  onClose,
  filterPayload,
  travelFilters,
  companyList,
  onApply,
  onClear,
  quotesCount,
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [local, setLocal] = useState(filterPayload);

  useEffect(() => {
    if (visible) {
      setLocal(filterPayload);
    }
  }, [visible, filterPayload]);

  const toggle = (type, id) => {
    setLocal(prev => {
      const arr = prev[type] || [];
      return {
        ...prev,
        [type]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id],
      };
    });
  };

  const handleReset = () => {
    onClear();
    onClose();
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.rootView}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={[styles.sheetContent, { height: SCREEN_HEIGHT * 0.88 }]}>
            <View style={styles.grabberPill} />

            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Refine Results</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.filterCanvas}>
                {/* Coverage Tier */}
                <CustomAccordion title="COVERAGE TIER">
                  <View style={styles.webSectionContainerInside}>
                    {[
                      { label: 'Basic', value: 'base' },
                      { label: 'Mid-Range', value: 'medium' },
                      { label: 'Premium', value: 'premium' },
                    ].map(item => {
                      const isSelected = local.tier === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          activeOpacity={0.7}
                          style={styles.webCheckboxRow}
                          onPress={() =>
                            setLocal(p => ({
                              ...p,
                              tier: p.tier === item.value ? '' : item.value,
                              priceMin: 0,
                              priceMax: 2000,
                            }))
                          }
                        >
                          <View
                            style={[
                              styles.webCheckbox,
                              isSelected && styles.webCheckboxActive,
                            ]}
                          >
                            {isSelected && (
                              <Feather
                                name="check"
                                size={12}
                                color={theme.colors.backgroundColor}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.webCheckboxLabel,
                              isSelected && styles.webCheckboxLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </CustomAccordion>

                {/* Insurer (Companies) - Web Fidelity Style */}
                <CustomAccordion title="INSURER">
                  <View style={styles.webSectionContainerInside}>
                    {companyList?.length > 0 ? (
                      companyList.map(company => {
                        const isSelected = local.companyIds?.includes(
                          company._id,
                        );
                        return (
                          <TouchableOpacity
                            key={company._id}
                            activeOpacity={0.7}
                            style={styles.webCheckboxRow}
                            onPress={() => toggle('companyIds', company._id)}
                          >
                            <View
                              style={[
                                styles.webCheckbox,
                                isSelected && styles.webCheckboxActive,
                              ]}
                            >
                              {isSelected && (
                                <Feather
                                  name="check"
                                  size={12}
                                  color={theme.colors.backgroundColor}
                                />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.webCheckboxLabel,
                                isSelected && styles.webCheckboxLabelActive,
                              ]}
                            >
                              {company.companyName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <Text style={styles.noDataText}>
                        No insurers available
                      </Text>
                    )}
                  </View>
                </CustomAccordion>

                {/* Insurance Type / Plans */}
                {travelFilters?.plans?.length > 0 && (
                  <CustomAccordion title="INSURANCE TYPE">
                    <View style={styles.pillContainer}>
                      {travelFilters.plans.map(plan => {
                        const isActive = local.plans?.includes(plan);
                        return (
                          <TouchableOpacity
                            key={plan}
                            style={[
                              styles.pillCard,
                              isActive && styles.pillCardActive,
                            ]}
                            onPress={() => toggle('plans', plan)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                isActive && styles.pillTextActive,
                              ]}
                            >
                              {plan}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </CustomAccordion>
                )}

                {/* Coverages */}
                {travelFilters?.coverages?.length > 0 && (
                  <CustomAccordion title="COVERAGES">
                    <View style={styles.pillContainer}>
                      {travelFilters.coverages.map(cov => {
                        const isActive = local.coverages?.includes(cov);
                        return (
                          <TouchableOpacity
                            key={cov}
                            style={[
                              styles.pillCard,
                              isActive && styles.pillCardActive,
                            ]}
                            onPress={() => toggle('coverages', cov)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                isActive && styles.pillTextActive,
                              ]}
                            >
                              {cov}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </CustomAccordion>
                )}

                {/* Price Range */}
                <CustomAccordion title="PRICE RANGE (AED)">
                  <View style={styles.sliderWrapper}>
                    <CustomRangeSlider
                      sliderWidth={SLIDER_WIDTH}
                      min={0}
                      max={2000}
                      step={10}
                      initialMin={local.priceMin || 0}
                      initialMax={local.priceMax || 2000}
                      onValueChange={val =>
                        setLocal(prev => ({
                          ...prev,
                          priceMin: val.min,
                          priceMax: val.max,
                          tier: '',
                        }))
                      }
                      theme={theme}
                    />
                  </View>
                </CustomAccordion>
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>
                  Show {quotesCount || 0} Plans
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default FilterSheet;

const getStyles = theme =>
  StyleSheet.create({
    rootView: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
      paddingBottom: verticalScale(20),
    },
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
      paddingBottom: verticalScale(20),
    },
    webSectionContainer: {
      paddingHorizontal: scale(20),
      marginBottom: verticalScale(20),
      paddingTop: verticalScale(10),
    },
    webSectionContainerInside: {
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(15),
      gap: verticalScale(12),
    },
    webSectionHeader: {
      fontWeight: '800',
      color: theme.colors.textTertiary,
      fontSize: fontScale(12),
      marginBottom: verticalScale(15),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: 'Lato-Bold',
    },
    companyWebList: {
      gap: verticalScale(12),
      maxHeight: verticalScale(200), // matches web's maxHeight 300 approximately
    },
    webCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingVertical: verticalScale(2),
    },
    webCheckbox: {
      width: scale(18),
      height: scale(18),
      borderRadius: scale(4),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundColor,
    },
    webCheckboxActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    webCheckboxLabel: {
      fontSize: fontScale(14),
      color: theme.colors.textTertiary,
      fontWeight: '500',
      fontFamily: 'Lato-Regular',
    },
    webCheckboxLabelActive: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontFamily: 'Lato-Bold',
    },
    noDataText: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
      paddingVertical: verticalScale(10),
    },
    sheetFooter: {
      padding: scale(20),
      paddingBottom: verticalScale(30),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
    },
    applyBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: scale(16),
      paddingVertical: verticalScale(14),
      alignItems: 'center',
    },
    applyBtnText: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(16),
      color: theme.colors.textSecondary,
    },
  });
