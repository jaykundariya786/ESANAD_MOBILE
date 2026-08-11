import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { scale, fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { formatNumber } from '@utils/formateNumber';
import NoData from '@components/ui/NoData';
import { env } from '@config/index';
import { SCREEN_NAMES } from '@constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_PLANS = 4;
const MIN_PLANS = 2;

const QuoteRow = React.memo(({ item, theme, styles, onRemove }) => {
  const logoUri = `${env.API_URL}${
    item?.companyId?.logoImg?.path || item?.company?.logoImg?.path
  }`;

  console.log(item);

  return (
    <View style={styles.quoteRow}>
      <View style={styles.logoRing}>
        <Image source={{ uri: logoUri }} style={styles.companyLogo} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.companyName} numberOfLines={1}>
          {item?.planName || item?.planId?.name}
        </Text>
        <View style={styles.microTagRail}>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>
              AED {formatNumber(item?.price)}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeCircle}>
        <Feather name="minus" size={12} color={theme.colors.red} />
      </TouchableOpacity>
    </View>
  );
});

const TravelCompareModal = ({
  visible,
  onClose,
  selectedList = [],
  referenceId,
  onRemove,
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      opacity.value = withTiming(0, { duration: 250 }, finished => {
        finished && runOnJS(setShouldRender)(false);
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(visible ? 0 : 30) }],
  }));

  const handleAnalyze = useCallback(() => {
    if (selectedList.length < MIN_PLANS) return;

    if (selectedList.length > MAX_PLANS) {
      Alert.alert(
        'Comparison Limit',
        `You can select up to ${MAX_PLANS} plans exclusively.`,
      );
      return;
    }

    onClose();
    navigation.navigate(SCREEN_NAMES.TRAVEL_COMPARE, {
      referenceId,
      companyIds: selectedList.map(q => q?._id),
      selectedPlans: selectedList,
    });
  }, [selectedList, referenceId, navigation, onClose]);

  const renderPlans = useMemo(
    () =>
      selectedList.map(item => (
        <QuoteRow
          key={item?._id}
          item={item}
          theme={theme}
          styles={styles}
          onRemove={() => onRemove(item)}
        />
      )),
    [selectedList, styles, theme, onRemove],
  );

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.backdrop, backdropStyle]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.container,
          containerStyle,
          { bottom: Math.max(insets.bottom, 10) + verticalScale(70) },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTextStack}>
            <Text style={styles.headerTitle}>Comparison Deck</Text>
            <Text style={styles.headerSubtitle}>
              {selectedList.length} / {MAX_PLANS} policies queued
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
            <Feather name="x" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {selectedList.length === 0 ? (
          <View style={styles.noDataContainer}>
            <NoData message="No plans selected for comparison" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollBlock}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {renderPlans}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[
            styles.primaryCheckout,
            selectedList.length < MIN_PLANS && styles.primaryCheckoutDisabled,
          ]}
          onPress={handleAnalyze}
          activeOpacity={0.8}
          disabled={selectedList.length < MIN_PLANS}
        >
          <Text style={styles.primaryCheckoutText}>
            {selectedList.length < MIN_PLANS
              ? `Select ${MIN_PLANS - selectedList.length} more to compare`
              : 'Analyze Plans'}
          </Text>
          {selectedList.length >= MIN_PLANS && (
            <Feather name="arrow-right" size={16} color={theme.colors.text} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default React.memo(TravelCompareModal);

const createStyles = theme =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
    },
    container: {
      position: 'absolute',
      left: scale(16),
      right: scale(16),
      borderRadius: scale(20),
      padding: scale(16),
      backgroundColor: theme.colors.backgroundColor,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    headerTextStack: {
      gap: verticalScale(2),
    },
    headerTitle: {
      fontSize: fontScale(18),
      fontFamily: 'Lato-Black',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: fontScale(12),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    closeCircle: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: theme.colors.floorBgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataContainer: {
      paddingBottom: verticalScale(10),
      alignItems: 'center',
    },
    scrollBlock: {
      maxHeight: verticalScale(280),
    },
    scrollContent: {
      gap: verticalScale(10),
    },
    quoteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(12),
      padding: scale(10),
      backgroundColor: theme.colors.floorBgColor,
      gap: scale(10),
    },
    logoRing: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(6),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    companyLogo: {
      width: '70%',
      height: '70%',
      resizeMode: 'contain',
    },
    cardInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: verticalScale(2),
    },
    companyName: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    microTagRail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    microTag: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: scale(6),
      paddingVertical: verticalScale(2),
      borderRadius: scale(4),
    },
    microTagText: {
      fontSize: fontScale(9),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
    },
    priceTagText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Bold',
      color: theme.colors.primary,
    },
    removeCircle: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryCheckout: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(12),
      borderRadius: scale(30),
      justifyContent: 'center',
      alignItems: 'center',
      gap: scale(10),
      marginTop: verticalScale(16),
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryCheckoutDisabled: {
      backgroundColor: theme.colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    primaryCheckoutText: {
      color: theme.colors.text,
      fontFamily: 'Lato-Black',
      fontSize: fontScale(14),
    },
  });
