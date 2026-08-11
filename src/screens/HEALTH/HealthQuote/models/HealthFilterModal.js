import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { verticalScale, scale, fontScale } from '@constants/metrics';
import { useHealthStore } from '@store/HEALTH/healthStore';
import { useThemeContext } from '@theme/ThemeProvider';
import CustomCheckBox from '@components/ui/CustomCheckBox';
import OrDivider from '@components/ui/OrDivider';
import { CustomAccordion } from '@components/ui/CustomAccordion';
import { useFilterHealthQuotes } from '@hooks/HEALTH/healthFlow/useHealthFlow';
import Header from '@components/ui/Header';
import { env } from '@config/index';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const COMPANY_CARD_WIDTH = (SCREEN_WIDTH - scale(44)) / 3;

const PRICE_OPTIONS = ['Price low to high', 'Price high to low'];

const SORT_OPTIONS = [
  'Cover Low to High',
  'Cover High to Low',
  'Pharmacy Limit Low to High',
  'Pharmacy Limit High to Low',
];

const DEFAULT_FILTER = {
  coPays: '0',
  networkNames: [],
  companyNames: [],
  planType: [],
  tpaNames: [],
  sort: 1,
  clinicOptions: [],
};

const CheckBoxGroup = React.memo(
  ({
    options = [],
    selected,
    onChange,
    multichoice,
    theme,
    keyExtractor,
    labelExtractor,
  }) => (
    <View style={styles(theme).section}>
      {options.length === 0 ? (
        <Text
          style={[
            styles(theme).noDataText,
            { color: theme.colors.description },
          ]}
        >
          No options available
        </Text>
      ) : (
        options.map((item, index) => {
          const key = keyExtractor?.(item, index) ?? index;
          const label = labelExtractor?.(item) ?? item;
          const value = keyExtractor?.(item, index) ?? item;

          const checked = multichoice
            ? Array.isArray(selected) && selected.includes(value)
            : selected === value;

          return (
            <CustomCheckBox
              key={key}
              label={label}
              value={checked}
              onChange={v => onChange(v, value)}
              theme={theme}
            />
          );
        })
      )}
    </View>
  ),
);

const CompanySection = React.memo(
  ({ companies = [], selectedIds = [], onToggle, theme }) => (
    <CustomAccordion title="Insurance Providers">
      <View style={styles(theme).companyGrid}>
        {companies.map(company => {
          const isSelected = selectedIds.includes(company._id);
          return (
            <TouchableOpacity
              key={company._id}
              activeOpacity={0.8}
              onPress={() => onToggle(!isSelected, company._id)}
              style={[
                styles(theme).companyCard,
                isSelected && styles(theme).companyCardSelected,
              ]}
            >
              <Image
                source={{ uri: `${env.API_URL}${company?.logoImg?.path}` }}
                resizeMode="contain"
                style={styles(theme).companyLogo}
              />
              <Text
                style={[
                  styles(theme).companyName,
                  isSelected && styles(theme).companyNameSelected,
                ]}
                numberOfLines={1}
              >
                {company.companyName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </CustomAccordion>
  ),
);

const HealthFilterModal = ({ open, setOpen, toggle, filterLists = {} }) => {
  const { theme } = useThemeContext();
  const { internalRef, updateHealthQuotesList } = useHealthStore();

  const { mutate: filterHealthQuotes } = useFilterHealthQuotes();

  const [priceOption, setPriceOption] = useState(PRICE_OPTIONS[0]);
  const [sortOption, setSortOption] = useState([]);
  const [filter, setFilter] = useState(DEFAULT_FILTER);

  useEffect(() => {
    if (Object.keys(filterLists).length) {
      const uniq = arr => [...new Set(arr.map(i => i?._id).filter(Boolean))];

      setFilter({
        ...DEFAULT_FILTER,
        companyNames: uniq(filterLists.companies || []),
        networkNames: uniq(filterLists.networks || []),
        tpaNames: uniq(filterLists.tpas || []),
        coPays: '0',
      });
    }
  }, [filterLists]);

  const updateMulti = useCallback(
    (key, checked, value) => {
      let newData = {};

      if (key === 'coPays' || key == 'filters' || key == 'sort') {
        setFilter(prev => ({ ...prev, [key]: value }));
        newData = {
          ...filter,
          [key]: value,
        };
      } else {
        setFilter(prev => ({
          ...prev,
          [key]: checked
            ? [...new Set([...prev[key], value])]
            : prev[key].filter(v => v !== value),
        }));
        newData = {
          ...filter,
          [key]: checked
            ? [...new Set([...filter[key], value])]
            : filter[key].filter(v => v !== value),
        };
      }

      console.log('filter', newData);

      filterHealthQuotes(
        {
          data: newData,
          reqId: internalRef,
        },
        {
          onSuccess: res => {
            console.log('res applying filters', res);

            updateHealthQuotesList(res?.data?.data);
          },
          onError: error => {
            console.log('error applying filters', error);
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, filterHealthQuotes, internalRef],
  );

  const handleFilterChange = useCallback(
    (type, checked, value) => {
      switch (type) {
        case 'Company':
          updateMulti('companyNames', checked, value);
          break;
        case 'Network':
          updateMulti('networkNames', checked, value);
          break;
        case 'TPA':
          updateMulti('tpaNames', checked, value);
          break;
        case 'Plan':
          updateMulti('planType', checked, value);
          break;
        case 'Co-Pay':
          updateMulti('coPays', true, value);
          break;
        case 'Price':
          updateMulti('sort', true, value);
          break;
        case 'Sort':
          updateMulti('filters', true, [value]);
          break;
        default:
          return;
      }
    },
    [updateMulti],
  );

  const handlePriceChange = (_, option) => {
    setPriceOption(option);
    handleFilterChange('Price', true, option === PRICE_OPTIONS[0] ? 1 : -1);
  };

  const handleSortChange = (_, option) => {
    setSortOption(option);
    handleFilterChange('Sort', true, option);
  };

  const handleReset = () => {
    filterHealthQuotes(
      {
        data: {},
        reqId: internalRef,
      },
      {
        onSuccess: res => {
          console.log('res reset filters', res);
          updateHealthQuotesList(res?.data?.data);
        },
        onError: error => {
          console.log('error reset filters', error);
        },
      },
    );
    setOpen(false);
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles(theme).overlay}>
        {/* Dismissible Empty Space */}
        <TouchableOpacity
          style={styles(theme).dismissArea}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        <View
          style={[
            styles(theme).sheetContent,
            {
              height:
                toggle === 'filter'
                  ? SCREEN_HEIGHT * 0.88
                  : SCREEN_HEIGHT * 0.45,
            },
          ]}
        >
          <View style={styles(theme).grabberPill} />

          <View style={styles(theme).headerContainer}>
            <Text style={styles(theme).headerTitle}>
              {toggle === 'filter' ? 'Refine Results' : 'Sort Quotes'}
            </Text>
            <View style={styles(theme).headerActions}>
              {toggle === 'filter' && (
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles(theme).resetText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles(theme).closeBtn}
              >
                <Feather name="x" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles(theme).scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {toggle === 'sort' && (
              <>
                <OrDivider simple />

                <CustomAccordion title="Price">
                  <CheckBoxGroup
                    options={PRICE_OPTIONS}
                    selected={priceOption}
                    onChange={handlePriceChange}
                    theme={theme}
                  />
                </CustomAccordion>

                <OrDivider simple />

                <CustomAccordion title="Sort">
                  <CheckBoxGroup
                    options={SORT_OPTIONS}
                    selected={sortOption}
                    onChange={handleSortChange}
                    theme={theme}
                  />
                </CustomAccordion>

                <OrDivider simple />
              </>
            )}

            {toggle === 'filter' && (
              <>
                <OrDivider simple />

                <CustomAccordion title="Co-Pay">
                  <View style={styles(theme).copayRow}>
                    {(filterLists.allCoPays || []).map(item => {
                      const isActive = filter.coPays === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          activeOpacity={0.8}
                          onPress={() =>
                            handleFilterChange('Co-Pay', true, item)
                          }
                          style={[
                            styles(theme).pillCard,
                            isActive && styles(theme).pillCardActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles(theme).pillText,
                              isActive && styles(theme).pillTextActive,
                            ]}
                          >
                            {item}%
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </CustomAccordion>

                <OrDivider simple />

                <CompanySection
                  companies={filterLists.companies}
                  selectedIds={filter.companyNames}
                  onToggle={(c, v) => handleFilterChange('Company', c, v)}
                  theme={theme}
                />

                <OrDivider simple />

                <CustomAccordion title="Network">
                  <CheckBoxGroup
                    multichoice
                    options={filterLists.networks}
                    selected={filter.networkNames}
                    onChange={(c, v) => handleFilterChange('Network', c, v)}
                    keyExtractor={i => i._id}
                    labelExtractor={i => i.networkName}
                    theme={theme}
                  />
                </CustomAccordion>

                <OrDivider simple />

                <CustomAccordion title="TPA">
                  <CheckBoxGroup
                    multichoice
                    options={filterLists.tpas}
                    selected={filter.tpaNames}
                    onChange={(c, v) => handleFilterChange('TPA', c, v)}
                    keyExtractor={i => i._id}
                    labelExtractor={i => i.TPAName}
                    theme={theme}
                  />
                </CustomAccordion>

                <OrDivider simple />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default HealthFilterModal;

const styles = theme =>
  StyleSheet.create({
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
    section: {
      gap: verticalScale(10),
      paddingHorizontal: verticalScale(20),
      paddingBottom: verticalScale(20),
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
      backgroundColor: theme.colors.backgroundColor,
      gap: verticalScale(6),
    },
    companyCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.floorBgColor,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    companyLogo: { width: '80%', height: verticalScale(28) },
    companyName: {
      fontSize: fontScale(10),
      color: theme.colors.description,
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
    },
    companyNameSelected: {
      color: theme.colors.text,
      fontFamily: 'Lato-Bold',
    },
    copayRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      paddingHorizontal: scale(20),
      paddingBottom: verticalScale(15),
    },
    pillCard: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(10),
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
    noDataText: { textAlign: 'center', paddingVertical: 10 },
  });
