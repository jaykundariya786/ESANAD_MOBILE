import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeContext } from '@theme/ThemeProvider';
import { verticalScale, moderateScale } from '@constants/metrics';
import { debounce } from '@utils/debounce';
import {
  useGetPartnersByCategory,
  useListPartnersCategories,
} from '@hooks/profile/useProfile';

// UI Components
import NoData from '@components/ui/NoData';
import CustomSearchInput from '@components/ui/CustomSearchInput';
import HomeHeader from '@screens/HOME/components/HomeHeader';
import PartnerCard from './components/PartnerCard';
import { getBottomMargin } from '@utils/paddingBottom';

import { Icons } from '@assets/index';

const EsanadClub = () => {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const navigation = useNavigation();

  // API Hooks
  const { data: offersList = [] } = useListPartnersCategories();
  const { mutate: getPartnersByCategory } = useGetPartnersByCategory();

  // State
  const [category, setCategory] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [clubAllOffersDetails, setClubAllOffersDetails] = useState([]);

  // Track component lifecycle
  const isMountedRef = useRef(true);

  // Data Fetching
  const fetchOffers = useCallback(
    (searchValue, categoryValue) => {
      const payload = { category: categoryValue };

      getPartnersByCategory(
        { search: searchValue, data: payload },
        {
          onSuccess: res => {
            if (isMountedRef.current) {
              setClubAllOffersDetails(res?.data?.data || []);
            }
          },
          onError: err => {
            if (isMountedRef.current) {
              console.error('Fetch Partners Error:', err);
            }
          },
        },
      );
    },
    [getPartnersByCategory],
  );

  // Debounced Search Handler
  const debouncedFetchRef = useRef(
    debounce((searchValue, categoryValue) => {
      fetchOffers(searchValue, categoryValue);
    }, 1000),
  );

  const handleCategoryChange = value => {
    const newValue = category === value ? '' : value;
    setCategory(newValue);
    fetchOffers(searchFilter, newValue);
  };

  const searchOffersHandler = value => {
    setSearchFilter(value);
    debouncedFetchRef.current(value, category);
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchOffers('', '');

    return () => {
      isMountedRef.current = false;
      if (debouncedFetchRef.current?.cancel) {
        debouncedFetchRef.current.cancel();
      }
    };
  }, [fetchOffers]);

  // Category Icon Mapping
  const categoryOptions = useMemo(() => {
    const getCategoryImage = title => {
      const lowerT = title.toLowerCase();
      let iconSource = null;

      if (lowerT.includes('dining')) iconSource = Icons.Dining;
      else if (lowerT.includes('health')) iconSource = Icons.Health;
      else if (lowerT.includes('travel')) iconSource = Icons.Travel;
      else if (lowerT.includes('entertainment'))
        iconSource = Icons.Entertainment;
      else if (lowerT.includes('home')) iconSource = Icons.Home;
      else if (lowerT.includes('transportation'))
        iconSource = Icons.Transportation;
      else if (lowerT.includes('sports')) iconSource = Icons.Sports;
      else if (lowerT.includes('grocery')) iconSource = Icons.Grocery;
      else if (lowerT.includes('shopping')) iconSource = Icons.Shopping;
      else if (lowerT.includes('service')) iconSource = Icons.Service;
      else if (lowerT.includes('pet')) iconSource = Icons.Pet;

      if (!iconSource) return null;

      return (
        <Image
          source={iconSource}
          style={styles.pillIcon}
          resizeMode="contain"
        />
      );
    };

    return (offersList || []).map(ele => ({
      label: ele?.title,
      value: ele?.title,
      image: getCategoryImage(ele?.title || ''),
    }));
  }, [offersList]);

  const renderItem = ({ item }) => {
    if (!item) return null;
    return <PartnerCard item={item} />;
  };

  return (
    <View style={styles.container}>
      <HomeHeader title="eSanad Privilege Club" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <CustomSearchInput
            value={searchFilter}
            onChange={searchOffersHandler}
            title="Search partners..."
            container={styles.searchInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryOptions.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCategoryChange(item.value)}
                  style={[
                    styles.categoryCard,
                    category === item.value && styles.activeCategoryCard,
                  ]}
                >
                  {item.image}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.categoryText,
                    category === item.value && styles.activeCategoryText,
                  ]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Latest Offers</Text>
          <FlatList
            data={clubAllOffersDetails}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?._id || `partner-${index}`}
            ListEmptyComponent={() => <NoData />}
            scrollEnabled={false}
            numColumns={2}
            removeClippedSubviews={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: getBottomMargin() + verticalScale(20),
    },
    searchContainer: {
      paddingHorizontal: verticalScale(20),
      marginTop: verticalScale(16),
    },
    searchInput: {
      width: '100%',
    },
    section: {
      marginTop: verticalScale(15),
    },
    sectionTitle: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      marginHorizontal: verticalScale(20),
      marginBottom: verticalScale(12),
    },
    categoryScroll: {
      paddingHorizontal: moderateScale(20),
      gap: moderateScale(10),
    },
    categoryItem: {
      alignItems: 'center',
      width: verticalScale(80),
      gap: verticalScale(5),
    },
    categoryCard: {
      height: verticalScale(75),
      width: verticalScale(75),
      borderRadius: verticalScale(80),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeCategoryCard: {
      borderColor: theme.colors.primary,
    },
    pillIcon: {
      width: verticalScale(35),
      height: verticalScale(35),
    },
    categoryText: {
      fontSize: moderateScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: verticalScale(12),
    },
    activeCategoryText: {
      color: theme.colors.primary,
      fontFamily: 'Lato-Bold',
    },
    listContent: {
      paddingHorizontal: verticalScale(20),
      paddingBottom: verticalScale(20),
      gap: verticalScale(10),
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
  });

export default EsanadClub;
