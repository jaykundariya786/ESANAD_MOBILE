import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@components/ui/Header';
import { verticalScale } from '@constants/metrics';
import { useGetBlog } from '@hooks/home/useHomeFlow';
import { useThemeContext } from '@theme/ThemeProvider';
import { getBottomMargin } from '@utils/paddingBottom';
import LinearGradient from 'react-native-linear-gradient';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { env } from '@config/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const InsuranceBlogs = () => {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = useStyles(theme);

  const { data: blogsResponse, isLoading } = useGetBlog();
  const blogs = blogsResponse?.data ?? [];

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => blog?.platform !== 'insurancetimes');
  }, [blogs]);

  const carouselData = useMemo(
    () => filteredBlogs.slice(0, 3),
    [filteredBlogs],
  );
  const listData = useMemo(() => filteredBlogs.slice(3, 10), [filteredBlogs]);

  const handleBlogPress = blog => {
    Linking.openURL(`${env?.URL}/blog/${blog?.slugUrl}`);
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.carouselCard}
      onPress={() => handleBlogPress(item)}
    >
      <Image
        source={{ uri: item?.heroImage?.url }}
        style={styles.carouselImage}
      />
      <View style={styles.carouselMeta}>
        <Icon name="event" size={14} color={theme.colors.text} />
        <Text style={styles.carouselDate}>
          {new Date(item?.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.carouselOverlay}
      >
        <View
          style={{ padding: verticalScale(24), justifyContent: 'flex-end' }}
        >
          <Text style={styles.carouselTitle} numberOfLines={2}>
            {item?.title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.archiveCard}
      activeOpacity={0.8}
      onPress={() => handleBlogPress(item)}
    >
      <View style={styles.archiveImageWrapper}>
        <Image
          source={{ uri: item?.heroImage?.url }}
          style={styles.archiveImage}
        />
        {/* <View style={styles.archiveBadge}>
          <Text style={styles.archiveBadgeText}>{item?.blogType}</Text>
        </View> */}
      </View>
      <View style={styles.archiveContent}>
        <Text style={styles.archiveTitle} numberOfLines={2}>
          {item?.title}
        </Text>
        <View style={styles.archiveMeta}>
          <Icon name="event" size={14} color={theme.colors.description} />
          <Text style={styles.archiveDate}>
            {new Date(item?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      {carouselData.length > 0 && (
        <View style={styles.carouselWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LATEST ARTICLES</Text>
            <View style={styles.indicator} />
          </View>

          <Carousel
            data={carouselData}
            renderItem={renderCarouselItem}
            sliderWidth={SCREEN_WIDTH}
            itemWidth={SCREEN_WIDTH - 40}
            inactiveSlideScale={1}
            inactiveSlideOpacity={1}
            loop
            autoplay
            autoplayDelay={500}
            autoplayInterval={3000}
            activeSlideAlignment="center"
          />
        </View>
      )}

      {listData.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BLOGS & ARTICLES</Text>
          <View style={styles.indicator} />
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerComponent}>
      <TouchableOpacity
        style={styles.viewMoreBtn}
        onPress={() => Linking.openURL(`${env?.URL}/blog`)}
      >
        <Text style={styles.viewMoreText}>View More Articles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Header
        title="Insurance Hub"
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={listData}
        renderItem={renderBlogItem}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={!isLoading && renderFooter}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No articles found.</Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default InsuranceBlogs;

const useStyles = theme =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.backgroundColor,
    },
    listContainer: {
      paddingBottom: verticalScale(40),
    },
    headerComponent: {},
    carouselWrapper: {
      marginBottom: verticalScale(8),
    },
    sectionHeader: {
      paddingHorizontal: verticalScale(20),
      paddingVertical: verticalScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(12),
    },
    sectionTitle: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      letterSpacing: 2,
    },
    indicator: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    carouselCard: {
      height: verticalScale(230),
      borderRadius: verticalScale(28),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: verticalScale(5),
    },
    carouselImage: {
      width: '100%',
      height: '100%',
    },
    carouselOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    carouselBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: verticalScale(12),
      paddingVertical: verticalScale(4),
      borderRadius: verticalScale(8),
    },
    badgeText: {
      color: theme.colors.textSecondary,
      fontSize: verticalScale(10),
      fontFamily: 'Lato-Bold',
    },
    carouselTitle: {
      fontSize: verticalScale(20),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textSecondary,
      lineHeight: verticalScale(26),
    },
    carouselMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(6),
      backgroundColor: theme.colors.backgroundColor,
      padding: verticalScale(4),
      borderRadius: verticalScale(8),
      position: 'absolute',
      top: verticalScale(16),
      right: verticalScale(16),
    },
    carouselDate: {
      color: theme.colors.text,
      fontSize: verticalScale(12),
      fontFamily: 'Lato-Regular',
    },
    archiveCard: {
      flexDirection: 'row',
      marginHorizontal: verticalScale(20),
      backgroundColor: theme.colors.backgroundColor,
      borderRadius: verticalScale(24),
      padding: verticalScale(10),
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    archiveImageWrapper: {
      width: verticalScale(80),
      height: verticalScale(80),
      borderRadius: verticalScale(16),
      overflow: 'hidden',
    },
    archiveImage: {
      width: '100%',
      height: '100%',
    },
    archiveBadge: {
      position: 'absolute',
      top: verticalScale(4),
      left: verticalScale(4),
      backgroundColor: theme.colors.backgroundColor,
      paddingHorizontal: verticalScale(6),
      paddingVertical: verticalScale(2),
      borderRadius: verticalScale(4),
    },
    archiveBadgeText: {
      fontSize: verticalScale(8),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    archiveContent: {
      flex: 1,
      paddingHorizontal: verticalScale(12),
      gap: verticalScale(4),
    },
    archiveTitle: {
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
      lineHeight: verticalScale(18),
    },
    archiveMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(4),
    },
    archiveDate: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    paginationContainer: {
      paddingVertical: verticalScale(12),
    },
    dot: {
      width: verticalScale(16),
      height: verticalScale(8),
      borderRadius: verticalScale(4),
      backgroundColor: theme.colors.primary,
      marginHorizontal: verticalScale(-4),
    },
    inactiveDot: {
      width: verticalScale(8),
      height: verticalScale(8),
    },
    footerComponent: {
      marginTop: verticalScale(24),
      alignItems: 'center',
    },
    viewMoreBtn: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: verticalScale(10),
      paddingHorizontal: verticalScale(32),
      paddingVertical: verticalScale(14),
      borderRadius: verticalScale(50),
      marginBottom: verticalScale(32),
    },
    viewMoreText: {
      color: theme.colors.textSecondary,
      fontSize: verticalScale(14),
      fontFamily: 'Lato-Bold',
    },
    endMessage: {
      paddingHorizontal: verticalScale(40),
    },
    endText: {
      fontSize: verticalScale(11),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
      textAlign: 'center',
    },
    emptyContainer: {
      marginTop: verticalScale(100),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: verticalScale(16),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
  });
