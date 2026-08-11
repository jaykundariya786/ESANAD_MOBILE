import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useHealthStore } from '@store/HEALTH/healthStore';
import CustomBox from './components/CustomBox';
import { useThemeContext } from '@theme/ThemeProvider';
import HealthComparePlansModal from './models/HealthComparePlansModal';
import HealthPlans from './components/HealthPlan';
import HealthFilterModal from './models/HealthFilterModal';
import Header from '@components/ui/Header';
import LinearGradient from 'react-native-linear-gradient';
import { fontScale, verticalScale } from '@constants/metrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Compare from '@assets/icons/Compare';
import { useToast } from '@components/ui/Toast';
import HealthFetchMore from './components/HealthFetchMore';
import {
  useFilterHealthQuotes,
  useGetFilterList,
  useRegenerateQuotes,
} from '@hooks/HEALTH/healthFlow/useHealthFlow';
import RegenerateQuotes from './models/RegenerateQuotes';
import { SCREEN_NAMES } from '@constants/screenNames';
import { getBottomMargin } from '@utils/paddingBottom';
// import { arrayOfQuotes } from 'Dummy';

const HealthQuoteScreen = ({ navigation, route }) => {
  const { theme } = useThemeContext();

  const quoteSPlans = route?.params?.data;
  const { showToast } = useToast();

  const styles = style(theme);
  const insets = useSafeAreaInsets();
  const [morePlan, setMorePlans] = useState([]);
  const [healthApiCall, setHealthApiCall] = useState(false);

  const [openHint, setOpenHint] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [comparePolicy, setComparePolicy] = useState(false);
  const [comparePolicyArray, setComparePolicyArray] = useState([]);
  const [openMemberHint, setOpenMemberHint] = useState([]);
  const [showFetchMore, setShowFetchMore] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const {
    healthQuotesList,
    internalRef,
    regeneratedata,
    updateHealthQuotesList,
  } = useHealthStore();

  const { data: filterLists = {}, refetch } = useGetFilterList({
    reqId: internalRef,
  });
  const { mutate: regenerateQuotes } = useRegenerateQuotes();
  const { mutate: filterHealthQuotes } = useFilterHealthQuotes();

  const [arrayOfQuotes, setArrayOfQuotes] = useState([]);
  // console.log('arrayOfQuotes', arrayOfQuotes);

  const healthQuotesLists =
    healthQuotesList.length > 0 ? healthQuotesList : quoteSPlans;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFetchMore(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const companiesMap = new Map();
    if (healthQuotesLists) {
      healthQuotesLists?.forEach(quote => {
        const { company, ...data } = quote;
        const companyId = company?._id;
        if (!companiesMap.has(companyId)) {
          companiesMap.set(companyId, {
            plans: [{ ...data }],
            company: company,
          });
        } else {
          const resultArray = Array.from(companiesMap.values());
          resultArray?.forEach(item => {
            if (item?.company?._id === companyId) {
              const aa = companiesMap.get(companyId);
              companiesMap.set(companyId, {
                plans: [...aa?.plans, { ...data }],
                company: company,
              });
            }
          });
        }
      });
    }
    const resultArray = Array.from(companiesMap.values());
    if (!healthApiCall) {
      const array = [];
      resultArray?.forEach(company => {
        array?.push({
          ...company,
          plans: company?.plans?.sort((a, b) => a?.price - b?.price),
        });
      });
      setArrayOfQuotes(array);
    } else {
      setArrayOfQuotes(resultArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthQuotesList]);

  const setMorePlansHandler = id => {
    const match = morePlan?.find(i => i?.id === id);
    const nonMatch = morePlan?.filter(i => i?.id !== id);
    let aa = { id: id, value: !match?.value };
    setMorePlans([...nonMatch, aa]);
  };

  const handleTooltipClose = id => {
    const nonMatch = openMemberHint?.filter(i => i?.id !== id);
    let aa = { id: id, value: false };
    setOpenMemberHint([...nonMatch, aa]);
  };

  const handleTooltipOpen = id => {
    const nonMatch = openMemberHint?.filter(i => i?.id !== id);
    let aa = { id: id, value: true };
    setOpenMemberHint([...nonMatch, aa]);
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

  const renderFloatingActionPanel = () => (
    <View
      style={[styles.floatingPanelContainer, { bottom: getBottomMargin() }]}
    >
      <View style={styles.floatingPill}>
        {/* Sort Action */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => {
            setShowFilterModal(prev => !prev);
            setToggle('sort');
          }}
        >
          <Icon name="sort-amount-down" size={14} color={theme.colors.text} />
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
            {comparePolicyArray.length > 0 && (
              <View style={styles.compareBadge}>
                <Text style={styles.compareBadgeText}>
                  {comparePolicyArray.length}
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
          onPress={() => {
            setShowFilterModal(prev => !prev);
            setToggle('filter');
          }}
        >
          <Icon name="sliders-h" size={14} color={theme.colors.text} />
          <Text style={styles.actionText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const applyFilters = data => {
    console.log({
      data: { coPays: '0' },
      reqId: data?.internalRef || internalRef,
    });

    filterHealthQuotes(
      {
        data: { coPays: '0' },
        reqId: data?.internalRef || internalRef,
      },
      {
        onSuccess: res => {
          console.log('res applying filters', res);
          updateHealthQuotesList(res?.data?.data);
          refetch();
          if (showFetchMore === true) {
            setShowFetchMore(false);
          } else {
            setShowFetchMore(true);
          }
        },
        onError: error => {
          console.log('error applying filters', error);
        },
      },
    );
  };

  const handleRegenerate = () => {
    regenerateQuotes(
      {
        refId: regeneratedata?.internalRef,
        healthInfoId: regeneratedata?.healthInfo?._id,
        proposalNo: regeneratedata?.proposal?.proposalId,
        reqId: regeneratedata?.reqId,
      },
      {
        onSuccess: res => {
          console.log('res regenerate', res?.data?.data);
          applyFilters(res?.data?.data);
        },
      },
    );
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 2 }}
      locations={[0.1, 0.2]}
      colors={[theme.colors.bgLinear1, theme.colors.bgLinear2]}
      style={[styles.container]}
    >
      <Header
        title="Health Quotes"
        onBack={() => navigation.goBack()}
        home={true}
        onHome={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.BOTTOM_TABS }],
          })
        }
      />

      <View style={{ flex: 1 }}>
        <FlatList
          data={arrayOfQuotes}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          bounces={arrayOfQuotes.length > 0}
          contentContainerStyle={{
            flexGrow: 1,
            gap: verticalScale(15),
            paddingBottom: getBottomMargin() + verticalScale(60),
          }}
          ListHeaderComponent={
            <CustomBox
              proposalId={healthQuotesLists?.[0]?.proposalNo}
              onShare={() => setRegenerate(true)}
            />
          }
          renderItem={({ item, index }) =>
            item?.plans?.map((plan, idx) => {
              let match = false;
              let openMemberHintMatch = false;

              const aa = morePlan?.find(i => i?.id === item?.company?._id);
              if (aa?.value) {
                match = true;
              }
              const bb = openMemberHint?.find(i => i?.id === `${index}-${idx}`);
              if (bb?.value) {
                openMemberHintMatch = true;
              }
              if (!match && idx > 0) {
                return null;
              }

              return (
                <HealthPlans
                  key={`${index}-${idx}`}
                  setMorePlansHandler={setMorePlansHandler}
                  openMemberHintMatch={openMemberHintMatch}
                  index={index}
                  idx={idx}
                  match={match}
                  company={item}
                  plan={plan}
                  handleTooltipClose={handleTooltipClose}
                  handleTooltipOpen={handleTooltipOpen}
                  setOpenHint={setOpenHint}
                  navigation={navigation}
                  openHint={openHint}
                  isCompare={comparePolicyArray.some(
                    policy => policy?._id === plan?._id,
                  )}
                  onUpdate={item => {
                    if (
                      comparePolicyArray.length === 4 &&
                      !comparePolicyArray.some(
                        policy => policy?._id === item?._id,
                      )
                    ) {
                      showToast(
                        'You can only compare up to 4 policies.',
                        'error',
                      );
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
            })
          }
        />
      </View>

      {renderFloatingActionPanel()}

      <HealthComparePlansModal
        showCompareModal={comparePolicy}
        setShowCompareModal={setComparePolicy}
        quotesList={comparePolicyArray}
        onUpdate={item => {
          setComparePolicyArray(prev =>
            prev.filter(policy => policy?._id !== item?._id),
          );
        }}
      />

      {showFetchMore && <HealthFetchMore applyFilters={applyFilters} />}

      <RegenerateQuotes
        internalRef={healthQuotesLists?.[0]?.healthInfo}
        open={regenerate}
        setOpen={setRegenerate}
        handleRegenerate={handleRegenerate}
      />

      <HealthFilterModal
        toggle={toggle}
        open={showFilterModal}
        setOpen={setShowFilterModal}
        filterLists={filterLists}
        refetch={refetch}
      />
    </LinearGradient>
  );
};

export default HealthQuoteScreen;

const style = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    listContent: {
      flexGrow: 1,
      gap: verticalScale(15),
      paddingVertical: verticalScale(10),
      paddingBottom: verticalScale(20),
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
