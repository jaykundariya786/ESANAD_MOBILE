import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '@theme/ThemeProvider';
import { fontScale, verticalScale } from '@constants/metrics';
import Icon from 'react-native-vector-icons/Feather';
import Header from '@components/ui/Header';
import {
  useGetFilteredTravelQuotes,
  useGetTravelInsuranceFilters,
  useGetTravelInsuranceCompanyList,
  useDownloadTravelQuote,
  useSendEmailQuote,
  useSendSMSQuote,
} from '@hooks/travelflow/useTravelFlow';
import { SCREEN_NAMES } from '@constants/screenNames';
import TravelDetailsModal from './components/TravelDetailsModal';
import TravelProposalCard from './components/TravelProposalCard';
import QuoteCard from './components/QuoteCard';
import FilterSheet from './modal/FilterSheet';
import SortSheet from './modal/SortSheet';
import TravelSeeMoreModal from './modal/TravelSeeMoreModal';
import TravelCompareModal from './components/TravelCompareModal';
import { useToast } from '@components/ui/Toast';
import { getBottomMargin } from '@utils/paddingBottom';
import Compare from '@assets/icons/Compare';
import NoData from '@components/ui/NoData';
import LottieLoader from '@components/ui/LottieLoader';
import { useLottieLoader } from '@provider/LottieLoaderProvider';

// ─── Main Screen ─────────────────────────────────────────────────────────────
const TravelQuotes = () => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const navigation = useNavigation();
  const route = useRoute();
  const { showToast } = useToast();
  const { data: routeData } = route.params || {};
  const { referenceId } = routeData || {};

  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareModalVisible, setCompareModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [shareVisible, setShareVisible] = useState(false);

  const [filterPayload, setFilterPayload] = useState({
    plans: [],
    coverages: [],
    companyIds: [],
    sort: 'high_to_low',
    tier: '',
    priceMin: 0,
    priceMax: 2000,
    search: '',
  });
  const [dontShowMorePlansModal, setDontShowMorePlansModal] = useState(false);
  const [seeMoreModalOpen, setSeeMoreModalOpen] = useState(false);

  const { data: travelFilters } = useGetTravelInsuranceFilters();
  const { data: companyList = [], refetch } =
    useGetTravelInsuranceCompanyList(referenceId);
  const { mutate: fetchFiltered, isPending } = useGetFilteredTravelQuotes();
  const { mutate: downloadQuote, isPending: isDownloading } =
    useDownloadTravelQuote();
  const { mutate: sendEmail, isPending: isSendingEmail } = useSendEmailQuote();
  const { mutate: sendSMS, isPending: isSendingSMS } = useSendSMSQuote();

  const travelInfoData = quotes?.[0]?.travelId || routeData?.travelInfo;

  const doFetch = useCallback(
    payload => {
      if (!referenceId) return;
      const apiPayload = { ...payload };

      // Sync with web logic: map label to numeric api value
      apiPayload.sort = payload.sort === 'low_to_high' ? 1 : -1;

      if (apiPayload.tier) {
        delete apiPayload.priceMin;
        delete apiPayload.priceMax;
      } else {
        delete apiPayload.tier;
      }

      fetchFiltered(
        { internalRef: referenceId, data: apiPayload },
        {
          onSuccess: res => {
            const list = res.data?.data || res.data || [];
            setQuotes(Array.isArray(list) ? list : []);
          },
        },
      );
    },
    [referenceId, fetchFiltered],
  );

  const { showLoader, hideLoader } = useLottieLoader();

  useEffect(() => {
    if (referenceId && quotes.length === 0) {
      showLoader('travel');

      const timer = setTimeout(() => {
        fetchFiltered(
          { internalRef: referenceId, data: { sort: -1 } },
          {
            onSuccess: res => {
              const list = res.data?.data || res.data || [];
              setQuotes(Array.isArray(list) ? list : []);
              refetch();
              hideLoader();
            },
          },
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [referenceId]);

  useEffect(() => {
    let timer;
    if (
      quotes &&
      quotes.length > 0 &&
      quotes.length < 6 &&
      !dontShowMorePlansModal &&
      !isPending
    ) {
      timer = setTimeout(() => {
        setSeeMoreModalOpen(true);
      }, 10000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quotes?.length, dontShowMorePlansModal, isPending]);

  const handleSeeMoreYes = () => {
    setDontShowMorePlansModal(true);
    handleClearAll();
    setSeeMoreModalOpen(false);
  };

  const handleSeeMoreNo = () => {
    setDontShowMorePlansModal(true);
    setSeeMoreModalOpen(false);
  };

  useEffect(() => {
    if (travelFilters && companyList) {
      const plans = travelFilters.plans || [];
      const coverages = travelFilters.coverages || [];
      const companyIds = companyList.map(c => c._id) || [];

      setFilterPayload(prev => ({
        ...prev,
        plans,
        coverages,
        companyIds,
        sort: 'high_to_low',
        tier: '',
        priceMin: 0,
        priceMax: 2000,
        search: '',
      }));
    }
  }, [travelFilters, companyList]);

  const handleApplyFilter = useCallback(
    newPayload => {
      let updated = { ...filterPayload, ...newPayload };

      // Mutual Exclusivity: Tier resets Price Range
      if (newPayload.tier && newPayload.tier !== filterPayload.tier) {
        updated.priceMin = 0;
        updated.priceMax = 2000;

        // Sort Override: If tier is selected and current sort is 'recommended', switch to -1
        if (updated.sort === 'recommended') {
          updated.sort = 'high_to_low';
        }
      }

      // Mutual Exclusivity: Price Range resets Tier
      if (
        newPayload.priceMin !== undefined ||
        newPayload.priceMax !== undefined
      ) {
        if (newPayload.priceMin !== 0 || newPayload.priceMax !== 2000) {
          updated.tier = '';
        }
      }

      setFilterPayload(updated);
      doFetch(updated);
    },
    [filterPayload, doFetch],
  );

  const handleSort = useCallback(
    val => {
      const updated = { ...filterPayload, sort: val };
      setFilterPayload(updated);
      doFetch(updated);
    },
    [filterPayload, doFetch],
  );

  const handleClearAll = useCallback(() => {
    const init = {
      plans: travelFilters?.plans || [],
      coverages: travelFilters?.coverages || [],
      companyIds: companyList.map(c => c._id),
      sort: 'high_to_low',
      tier: '',
      priceMin: 0,
      priceMax: 2000,
      search: '',
    };
    setFilterPayload(init);
    setSearch('');
    doFetch(init);
  }, [travelFilters, companyList, doFetch]);

  const handleBuyNow = item => {
    setDetailsVisible(false);
    setCompareModalVisible(false);
    const travelId = item?._id || item?.travelId;
    navigation.navigate(SCREEN_NAMES.TRAVEL_BUY_POLICY, {
      travelId,
      referenceId,
    });
  };

  const handleDownload = item => {
    const id = item?._id || item?.travelId;
    downloadQuote({ travelId: id });
  };

  const handleCompareToggle = useCallback(
    item => {
      const isSelected = !!selectedForCompare.find(p => p._id === item._id);
      if (isSelected) {
        setSelectedForCompare(prev => prev.filter(p => p._id !== item._id));
      } else {
        if (selectedForCompare.length >= 4) {
          showToast('You can only compare up to 4 policies.', 'error');
          return;
        }
        setSelectedForCompare(prev => [...prev, item]);
      }
    },
    [selectedForCompare, showToast],
  );

  const toggleCompareModal = useCallback(() => {
    if (!isCompareModalVisible && selectedForCompare.length < 2) {
      showToast('Please select at least 2 policies to compare.', 'error');
      return;
    }
    setCompareModalVisible(prev => !prev);
  }, [isCompareModalVisible, selectedForCompare, showToast]);

  const handleViewDetails = useCallback(item => {
    setSelectedQuote(item);
    setDetailsVisible(true);
  }, []);

  const filteredQuotes = useMemo(() => {
    let list = [...(quotes || [])];

    // 1. Initial Filtering (Search)
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(q => {
        const companyName = (
          q?.companyId?.companyName ||
          q?.companyName ||
          ''
        ).toLowerCase();
        const planName = (q?.planType || q?.planName || '').toLowerCase();
        const destination = (q?.travelId?.destination || '').toLowerCase();
        return (
          companyName.includes(s) ||
          planName.includes(s) ||
          destination.includes(s)
        );
      });
    }

    if (list.length === 0) return [];

    // 2. Identify Most Popular (QIC preference + Highest Price)
    const mostPopularIndex = list.reduce((maxIdx, q, i, arr) => {
      const getCompName = item =>
        (
          item?.companyId?.companyName ||
          item?.companyName ||
          item?.company?.companyName ||
          ''
        ).toUpperCase();
      const isQic = getCompName(q).includes('QIC');
      const isMaxQic = getCompName(arr[maxIdx]).includes('QIC');

      if (isQic && !isMaxQic) return i;
      if (!isQic && isMaxQic) return maxIdx;
      return q.price > arr[maxIdx].price ? i : maxIdx;
    }, 0);

    const mostPopularPlan = list[mostPopularIndex];

    // 3. Sorting logic
    if (filterPayload.sort === 'protection_score') {
      list.sort((a, b) => b.price - a.price);
      const popIdx = list.findIndex(q => q?._id === mostPopularPlan?._id);
      if (popIdx > -1) {
        const [pop] = list.splice(popIdx, 1);
        list.unshift(pop);
      }
    } else if (filterPayload.sort === 'recommended') {
      if (mostPopularPlan) {
        list = [mostPopularPlan];
      }
    } else if (filterPayload.sort === 'low_to_high') {
      list.sort((a, b) => a.price - b.price);
    } else if (filterPayload.sort === 'high_to_low') {
      list.sort((a, b) => b.price - a.price);
    }

    // 4. Secondary Alphabetic Sort (if prices are equal)
    list.sort((a, b) => {
      if (a.price === b.price) {
        const nameA = (
          a.companyId?.companyName ||
          a.companyName ||
          ''
        ).toLowerCase();
        const nameB = (
          b.companyId?.companyName ||
          b.companyName ||
          ''
        ).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    // 5. Calculate Safety Score (70-94 range, 95 for popular)
    const prices = list.map(q => q.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return list.map(quote => {
      const isPopular = quote?._id === mostPopularPlan?._id;
      let safetyScore;

      if (isPopular) {
        safetyScore = 95;
      } else if (maxPrice === minPrice) {
        safetyScore = 85;
      } else {
        safetyScore = Math.floor(
          70 + ((quote.price - minPrice) / (maxPrice - minPrice)) * (94 - 70),
        );
      }

      return {
        ...quote,
        isMostPopular: isPopular,
        safetyScore: safetyScore,
      };
    });
  }, [quotes, search, filterPayload.sort]);

  return (
    <View style={styles.container}>
      <Header
        title="Travel Quotes"
        onBack={() => navigation.goBack()}
        home={true}
        onHome={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.BOTTOM_TABS }],
          })
        }
      />

      <FlatList
        data={filteredQuotes || []}
        keyExtractor={(item, i) => item?._id || String(i)}
        renderItem={({ item }) => (
          <QuoteCard
            item={item}
            theme={theme}
            styles={styles}
            onViewDetails={handleViewDetails}
            onBuyNow={handleBuyNow}
            onCompare={handleCompareToggle}
            isSelectedForCompare={
              !!selectedForCompare.find(p => p._id === item._id)
            }
          />
        )}
        ListHeaderComponent={
          <TravelProposalCard travelInfoData={travelInfoData} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NoData />}
      />

      {/* Floating Action Panel */}
      <View
        style={[
          styles.floatingPanelContainer,
          { bottom: getBottomMargin() ? getBottomMargin() : 24 },
        ]}
      >
        <View style={styles.floatingPill}>
          {/* Sort Action */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => setSortVisible(true)}
          >
            <Icon name="bar-chart-2" size={14} color={theme.colors.text} />
            <Text style={styles.actionText}>Sort</Text>
          </TouchableOpacity>

          <View style={styles.pillDivider} />

          {/* Compare Action */}
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            activeOpacity={0.8}
            onPress={toggleCompareModal}
          >
            <View style={styles.compareIconWrapper}>
              <View style={{ transform: [{ scale: 0.8 }] }}>
                <Compare />
              </View>
              {selectedForCompare.length > 0 && (
                <View style={styles.compareBadge}>
                  <Text style={styles.compareBadgeText}>
                    {selectedForCompare.length}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.actionTextPrimary}>Compare</Text>
          </TouchableOpacity>

          <View style={styles.pillDivider} />

          {/* Filter Action */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => setFilterVisible(true)}
          >
            <Icon name="sliders" size={14} color={theme.colors.text} />
            <Text style={styles.actionText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TravelDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        quote={selectedQuote}
        onBuyNow={() => handleBuyNow(selectedQuote)}
        onDownload={() => handleDownload(selectedQuote)}
        isDownloading={isDownloading}
      />

      {/* Sheets */}
      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filterPayload={filterPayload}
        travelFilters={travelFilters}
        companyList={companyList}
        quotesCount={quotes.length}
        onApply={handleApplyFilter}
        onClear={handleClearAll}
      />

      <TravelCompareModal
        visible={isCompareModalVisible}
        onClose={() => setCompareModalVisible(false)}
        selectedList={selectedForCompare}
        referenceId={referenceId}
        onRemove={handleCompareToggle}
      />
      <SortSheet
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        theme={theme}
        styles={styles}
        currentSort={filterPayload.sort}
        onSelect={handleSort}
      />
      <TravelSeeMoreModal
        visible={seeMoreModalOpen}
        onClose={() => setSeeMoreModalOpen(false)}
        onYes={handleSeeMoreYes}
        onNo={handleSeeMoreNo}
      />
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundColor },
    searchRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },

    searchInput: {
      flex: 1,
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(14),
      color: theme.colors.text,
      padding: 0,
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsCount: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(13),
      color: theme.colors.description,
    },
    actionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundColor,
    },
    actionPillActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    actionPillText: {
      fontFamily: 'Lato-Bold',
      fontSize: fontScale(12),
      color: theme.colors.text,
    },
    listContent: {
      flexGrow: 1,
      padding: verticalScale(15),
      paddingBottom: 100,
      gap: verticalScale(15),
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 30,
    },
    emptyTitle: {
      fontFamily: 'Lato-Black',
      fontSize: fontScale(18),
      color: theme.colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontFamily: 'Lato-Regular',
      fontSize: fontScale(13),
      color: theme.colors.description,
      textAlign: 'center',
    },
    clearBtn: {
      marginTop: 20,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 100,
      backgroundColor: theme.colors.primary,
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

export default TravelQuotes;
