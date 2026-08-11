import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scale, fontScale, verticalScale } from '@constants/metrics';
import { useThemeContext } from '@theme/ThemeProvider';
import { useCompareHealthQuotes } from '@hooks/HEALTH/healthFlow/useHealthFlow';
import { useHealthStore } from '@store/HEALTH/healthStore';
import NoData from '@components/ui/NoData';
import { env } from '@config/index';

const MAX_PLANS = 4;
const MIN_PLANS = 2;

const QuoteRow = React.memo(({ item, theme, styles, onRemove }) => {
  const logoUri = `${env.API_URL}/${
    item?.company?.logoImg?.path || item?.companyData?.logoImg?.path
  }`;

  const companyName =
    item?.company?.companyName ||
    item?.company?.name ||
    item?.company?.praktoraCompanyName ||
    item?.companyData?.companyName ||
    'Health Insurance';

  const planName = item?.plan?.planName || 'Health Plan';
  const coverAmount = 'AED 10,00,000';

  return (
    <View style={styles.quoteRow}>
      <View style={styles.logoRing}>
        <Image source={{ uri: logoUri }} style={styles.companyLogo} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.companyName} numberOfLines={1}>
          {companyName}
        </Text>
        <View style={styles.microTagRail}>
          <View style={styles.microTag}>
            <Text style={styles.microTagText} numberOfLines={1}>
              {planName}
            </Text>
          </View>
          <View style={styles.coverTag}>
            <Text style={styles.coverTagText}>Cover: {coverAmount}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeCircle}>
        <Feather name="minus" size={12} color={theme.colors.red} />
      </TouchableOpacity>
    </View>
  );
});

const HealthComparePlansModal = ({
  showCompareModal,
  setShowCompareModal,
  quotesList = [],
  onUpdate,
}) => {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { mutate: compareHealthQuotes } = useCompareHealthQuotes();
  const [isVisible, setIsVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const { internalRef } = useHealthStore();
  console.log('internalRef', internalRef);

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showCompareModal) {
      setIsVisible(true);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 300 }, finished => {
        finished && runOnJS(setIsVisible)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCompareModal]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(showCompareModal ? 0 : 50) }],
  }));

  const handleCompare = useCallback(() => {
    if (quotesList.length < MIN_PLANS) {
      Alert.alert(
        'Selection Required',
        `Please select at least ${MIN_PLANS} plans to compare!`,
      );
      return;
    }

    if (quotesList.length > MAX_PLANS) {
      Alert.alert(
        'Too Many Plans',
        `You can select up to ${MAX_PLANS} plans only!`,
      );
      return;
    }

    compareHealthQuotes({
      reqId: internalRef,
      data: { ids: quotesList.map(q => q._id) },
    });

    setShowCompareModal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotesList]);

  const renderPlans = useMemo(
    () =>
      quotesList.map(item => (
        <QuoteRow
          key={item._id}
          item={item}
          theme={theme}
          styles={styles}
          onRemove={() => onUpdate(item)}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quotesList, styles],
  );

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.backdrop, backdropStyle]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => setShowCompareModal(false)}
      />

      <Animated.View
        style={[
          styles.container,
          containerStyle,
          { bottom: Math.max(insets.bottom, 10) + verticalScale(75) },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTextStack}>
            <Text style={styles.headerTitle}>Comparison Deck</Text>
            <Text style={styles.headerSubtitle}>
              {quotesList.length} / {MAX_PLANS} policies queued
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCompareModal(false)}
            style={styles.closeCircle}
          >
            <Feather name="x" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {quotesList.length === 0 ? (
          <View style={styles.noDataContainer}>
            <NoData />
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
            quotesList.length < MIN_PLANS && styles.primaryCheckoutDisabled,
          ]}
          onPress={handleCompare}
          activeOpacity={0.8}
          disabled={quotesList.length < MIN_PLANS}
        >
          <Text style={styles.primaryCheckoutText}>
            {quotesList.length < MIN_PLANS
              ? `Select ${MIN_PLANS - quotesList.length} more to compare`
              : 'Analyze Plans'}
          </Text>
          {quotesList.length >= MIN_PLANS && (
            <Feather
              name="arrow-right"
              size={16}
              color={theme.colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default HealthComparePlansModal;

const createStyles = theme =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      zIndex: 100,
    },
    container: {
      position: 'absolute',
      left: scale(20),
      right: scale(20),
      borderRadius: scale(24),
      padding: scale(16),
      backgroundColor: theme.colors.backgroundColor,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 15,
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
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      backgroundColor: theme.colors.floorBgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataContainer: {
      paddingBottom: verticalScale(20),
    },
    scrollBlock: {
      maxHeight: verticalScale(280),
    },
    scrollContent: {
      gap: verticalScale(8),
    },

    // -- Quote Row Design --
    quoteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(14),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(12),
      backgroundColor: theme.colors.floorBgColor,
      gap: scale(12),
    },
    logoRing: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(8),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    companyLogo: {
      width: '75%',
      height: '75%',
      resizeMode: 'contain',
    },
    cardInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: verticalScale(4),
    },
    companyName: {
      fontSize: fontScale(13),
      fontFamily: 'Lato-Bold',
      color: theme.colors.text,
    },
    microTagRail: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: scale(6),
    },
    microTag: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: scale(6),
      paddingVertical: verticalScale(2),
      borderRadius: scale(4),
      maxWidth: '65%',
    },
    microTagText: {
      fontSize: fontScale(9),
      fontFamily: 'Lato-Bold',
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
    },
    coverTag: {
      justifyContent: 'center',
    },
    coverTagText: {
      fontSize: fontScale(10),
      fontFamily: 'Lato-Regular',
      color: theme.colors.description,
    },
    removeCircle: {
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      backgroundColor: theme.colors.backgroundColor,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // -- Primary Pill Action --
    primaryCheckout: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(12),
      borderRadius: scale(40), // deep pill
      justifyContent: 'center',
      alignItems: 'center',
      gap: scale(10),
      marginTop: verticalScale(16),
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    primaryCheckoutDisabled: {
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
    },
    primaryCheckoutText: {
      color: theme.colors.textSecondary,
      fontFamily: 'Lato-Black',
      fontSize: fontScale(14),
    },
  });
