import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@theme/ThemeProvider';
import style from './InsuranceListScreen.styles';
import { fontScale, verticalScale } from '@constants/metrics';
import { useMotorDetalisStore } from '@store/MOTOR/motorStore';
import { useGetBenifitList } from '@hooks/motorflow/useMotorFlowTop';
import { formatNumber } from '@utils/formateNumber';
import Header from '@components/ui/Header';
import NoData from '@components/ui/NoData';
import ProposalCard from './Models/ProposalCard';
import FilterModel from './Models/FilterModel';
import CompareModel from './Models/CompareModel';
import { Card } from './Models/Card';
import SortModel from './Models/SortModel';
import Compare from '@assets/icons/Compare';
import { useToast } from '@components/ui/Toast';
import { SCREEN_NAMES } from '@constants/screenNames';
import { getBottomMargin } from '@utils/paddingBottom';

const INSURANCE_TYPES = {
  THIRD_PARTY: 'thirdparty',
  COMPREHENSIVE: 'comprehensive',
};

const INSURANCE_TYPE_LABELS = {
  [INSURANCE_TYPES.THIRD_PARTY]: 'Third Party',
  [INSURANCE_TYPES.COMPREHENSIVE]: 'Comprehensive',
};

const InsuranceListScreen = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const styles = style(theme);
  const localStyles = useMemo(() => getStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [toggle, setToggle] = useState('filter');

  // Store data
  const { filterData, quotesList, carDeatils, manulUesrDetails } =
    useMotorDetalisStore();

  const referenceId = route?.params?.data?.referenceId;

  const { data: benifitList = [] } = useGetBenifitList({ referenceId });

  // Modal states
  const [showSortModel, setShowSortModel] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [comparePolicy, setComparePolicy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [comparePolicyArray, setComparePolicyArray] = useState([]);

  // Computed values
  const displayList = useMemo(
    () => (filterData ? filterData : quotesList),
    [filterData, quotesList],
  );

  const companyNameArray = useMemo(() => {
    const companyMap = new Map();

    quotesList.forEach(item => {
      const companyId = item?.quoteInfo?.company?._id;
      const companyName = item?.QuatationCompanyName;

      if (companyId && companyName && !companyMap.has(companyId)) {
        companyMap.set(companyId, {
          _id: companyId,
          name: companyName,
          company: item?.company?.logoImg,
        });
      }
    });

    return Array.from(companyMap.values());
  }, [quotesList]);

  const maxAmount = useMemo(() => {
    return quotesList.reduce((max, offer) => {
      const rawPrice =
        offer?.quoteInfo?.price ?? offer?.IncludedFeatures?.[0]?.Amount ?? 0;
      const amount = Math.floor(Number(rawPrice) * 100) / 100;
      return Math.max(amount, max);
    }, 0);
  }, [quotesList]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // Handlers
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleSortModal = useCallback(() => {
    setShowSortModel(prev => !prev);
  }, []);

  const toggleFilterModal = () => {
    setShowFilterModal(prev => !prev);
  };

  const toggleCompareModal = () => {
    if (comparePolicy === true) {
      setComparePolicy(false);
      return;
    }
    if (comparePolicyArray.length < 2) {
      showToast('Please select at least 2 policies to compare.', 'error');
      return;
    }
    setComparePolicy(prev => !prev);
  };

  // Helper functions
  const getInsuranceTypeLabel = insuranceType => {
    console.log('insuranceType', insuranceType);

    return insuranceType === INSURANCE_TYPES.THIRD_PARTY
      ? INSURANCE_TYPE_LABELS[INSURANCE_TYPES.THIRD_PARTY]
      : INSURANCE_TYPE_LABELS[INSURANCE_TYPES.COMPREHENSIVE];
  };

  const renderCardItem = ({ item }) => {
    return (
      <Card
        id={item?._id}
        companyId={item?.company?._id}
        companyName={item?.QuatationCompanyName}
        insuranceType={getInsuranceTypeLabel(item?.insuranceType)}
        logoUrl={item?.quoteInfo?.company?.logoImg?.path}
        item={item}
        isCompare={comparePolicyArray.some(policy => policy?._id === item?._id)}
        onUpdate={item => {
          if (
            comparePolicyArray.length === 4 &&
            !comparePolicyArray.some(policy => policy?._id === item?._id)
          ) {
            showToast('You can only compare up to 4 policies.', 'error');
            return;
          }
          setComparePolicyArray(prev =>
            prev.some(policy => policy?._id === item?._id)
              ? prev.filter(policy => policy?._id !== item?._id)
              : [...prev, item],
          );
        }}
      />
    );
  };

  const renderListHeader = useCallback(
    () => (
      <ProposalCard
        proposalId={manulUesrDetails?.proposalId}
        reviewDetails={carDeatils}
        theme={theme}
      />
    ),
    [manulUesrDetails?.proposalId, carDeatils, theme],
  );

  const renderListEmpty = useCallback(() => <NoData />, []);

  const renderFloatingActionPanel = () => (
    <View
      style={[
        localStyles.floatingPanelContainer,
        { bottom: getBottomMargin() },
      ]}
    >
      <View style={localStyles.floatingPill}>
        {/* Sort Action */}
        <TouchableOpacity
          style={localStyles.actionButton}
          activeOpacity={0.7}
          onPress={() => {
            setShowFilterModal(prev => !prev);
            setToggle('sort');
          }}
        >
          <Icon name="sort-amount-down" size={14} color={theme.colors.text} />
          <Text style={localStyles.actionText}>Sort</Text>
        </TouchableOpacity>

        <View style={localStyles.pillDivider} />

        {/* Compare Action */}
        <TouchableOpacity
          style={localStyles.actionButtonPrimary}
          activeOpacity={0.8}
          onPress={toggleCompareModal}
        >
          <View style={localStyles.compareIconWrapper}>
            <View style={{ transform: [{ scale: 0.8 }] }}>
              <Compare />
            </View>
            {comparePolicyArray.length > 0 && (
              <View style={localStyles.compareBadge}>
                <Text style={localStyles.compareBadgeText}>
                  {comparePolicyArray.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={localStyles.actionTextPrimary}>Compare</Text>
        </TouchableOpacity>

        <View style={localStyles.pillDivider} />

        {/* Filter Action */}
        <TouchableOpacity
          style={localStyles.actionButton}
          activeOpacity={0.7}
          onPress={() => {
            setShowFilterModal(prev => !prev);
            setToggle('filter');
          }}
        >
          <Icon name="sliders-h" size={14} color={theme.colors.text} />
          <Text style={localStyles.actionText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.bgLinear1, theme.colors.bgLinear2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 2 }}
      locations={[0.1, 0.2]}
      style={localStyles.flex}
    >
      <Header
        title="Car Quotes"
        onBack={handleGoBack}
        home={true}
        onHome={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.BOTTOM_TABS }],
          })
        }
      />

      <View style={styles.container}>
        <FlatList
          data={displayList}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderCardItem}
          bounces={displayList.length > 0}
          contentContainerStyle={localStyles.listContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderListEmpty}
        />
      </View>

      {renderFloatingActionPanel()}

      <FilterModel
        benifitList={benifitList}
        companyName={companyNameArray}
        referenceId={referenceId}
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        maxAmount={maxAmount}
        focused={focused}
        quotesList={filterData}
        toggle={toggle}
      />

      {/* <SortModel
        benifitList={benifitList}
        companyName={companyNameArray}
        referenceId={referenceId}
        showFilterModal={showSortModel}
        setShowFilterModal={setShowSortModel}
        maxAmount={maxAmount}
        focused={focused}
        quotesList={filterData}
      /> */}

      <CompareModel
        showCompareModal={comparePolicy}
        setShowCompareModal={setComparePolicy}
        quotesList={comparePolicyArray}
        referenceId={referenceId}
        onUpdate={item => {
          setComparePolicyArray(prev =>
            prev.filter(policy => policy?._id !== item?._id),
          );
        }}
      />
    </LinearGradient>
  );
};

export default InsuranceListScreen;

const getStyles = theme =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    listContent: {
      flexGrow: 1,
      gap: verticalScale(10),
      paddingBottom: getBottomMargin() + verticalScale(50),
    },
    headerGap: {
      gap: verticalScale(15),
    },
    floatingPanelContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1000,
    },
    floatingPill: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(30),
      paddingVertical: verticalScale(6),
      paddingHorizontal: verticalScale(10),
      alignItems: 'center',
      elevation: 8,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.border}80`,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
      paddingHorizontal: verticalScale(16),
      gap: verticalScale(8),
    },
    actionButtonPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(8),
      paddingHorizontal: verticalScale(20),
      borderRadius: verticalScale(24),
      gap: verticalScale(8),
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    pillDivider: {
      width: 1,
      height: '60%',
      backgroundColor: theme.colors.border,
      marginHorizontal: verticalScale(4),
    },
    actionText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.text,
    },
    actionTextPrimary: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(13),
      color: theme.colors.textSecondary,
    },
    compareIconWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    compareBadge: {
      position: 'absolute',
      top: -verticalScale(4),
      right: -verticalScale(6),
      backgroundColor: theme.colors.highlight,
      borderRadius: verticalScale(10),
      minWidth: verticalScale(16),
      paddingHorizontal: verticalScale(4),
      height: verticalScale(16),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    compareBadgeText: {
      color: theme.colors.text,
      fontSize: fontScale(9),
      fontFamily: 'Lato-Black',
    },
  });
